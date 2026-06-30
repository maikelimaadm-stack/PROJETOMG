import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  createStudioSdk,
  getStudioEventHub,
  wireHistoryToEventHub,
  wirePreviewToEventHub,
  resolveTokenValue,
  createStudioEditor,
} from "@/studio/index.js";
import { StudioEditorShellBridge } from "@/studio/editor/StudioEditorShellBridge.jsx";
import {
  StudioDomainProvider,
  createInitialStudioDomainState,
  useWorkspace,
  useDock,
  useNotifications,
  useProperties,
  useStudioDomain,
  useSelection,
  usePreview,
} from "@/studio/domain/index.js";
import { createStudioSelection } from "@/studio/domain/contracts/selectionModel.js";
import { createWorkspaceSession } from "@/studio/domain/contracts/workspaceSession.js";
import { createProductionDomainAdapters, loadMdpWorkspaceData, resolvePropertyFieldsForSelection } from "../domain/adapters/createProductionDomainAdapters.js";
import {
  buildPersistenceKey,
  loadStudioPersistence,
  saveStudioPersistence,
  extractPersistableState,
  mergePersistedIntoInitialState,
} from "@/studio/services/studioPersistence.js";
import {
  mdpIntrospect,
  mdpCompile,
  mdpPublish,
} from "@/studio/services/index.js";
import { StudioShellContextProvider } from "./StudioShellContext.jsx";
import {
  STUDIO_MODULES,
  STUDIO_DESIGNERS,
  resolveDesignerLabel,
} from "./studioShellConfig.js";
import { registerLayoutDesigner } from "@/studio/designers/layout/registerLayoutDesigner.js";
import { registerLayoutEditor } from "@/studio/designers/layout/editor/layoutEditorRegistration.jsx";
import { registerFieldDesigner } from "@/studio/designers/field/registerFieldDesigner.js";
import { registerFieldEditor } from "@/studio/designers/field/editor/fieldEditorRegistration.jsx";
import { registerFormulaDesigner } from "@/studio/designers/formula/registerFormulaDesigner.js";
import { registerFormulaEditor } from "@/studio/designers/formula/editor/formulaEditorRegistration.jsx";

const DEFAULT_COMMANDS = [
  { id: "view.toggleLeftDock", label: "Alternar dock esquerdo", category: "View" },
  { id: "view.toggleRightDock", label: "Alternar dock direito", category: "View" },
  { id: "view.toggleBottomDock", label: "Alternar dock inferior", category: "View" },
  { id: "preview.refresh", label: "Atualizar Preview", category: "Preview" },
  { id: "history.undo", label: "Desfazer", category: "Edit" },
  { id: "history.redo", label: "Refazer", category: "Edit" },
];

function ProductionDomainLoader({ moduleId, designerId }) {
  const { setExplorerTree, setDesignerLabel } = useWorkspace();
  const { setFields } = useProperties();
  const { add: addNotification } = useNotifications();
  const fieldsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    setDesignerLabel(resolveDesignerLabel(designerId));

    (async () => {
      try {
        const { tree, fields } = await loadMdpWorkspaceData(moduleId);
        if (cancelled) return;
        fieldsRef.current = fields;
        setExplorerTree(tree);
        setFields([], null);
        addNotification({
          severity: "success",
          title: "MDP conectado",
          message: `${tree.length} raiz(es) · ${fields.length} campos`,
        });
      } catch (err) {
        if (cancelled) return;
        addNotification({
          severity: "error",
          title: "Falha ao carregar MDP",
          message: err?.message ?? "Erro de introspect",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId, designerId, setExplorerTree, setDesignerLabel, setFields, addNotification]);

  return null;
}

function SelectionPropertySync({ moduleId, designerId }) {
  const { selection } = useSelection();
  const { setFields } = useProperties();
  const introspectFieldsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const intro = await mdpIntrospect(moduleId);
        if (!cancelled) introspectFieldsRef.current = intro?.fields ?? [];
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  useEffect(() => {
    if (designerId === "field") return;
    if (!selection.entryId) {
      setFields([], null);
      return;
    }
    const fields = resolvePropertyFieldsForSelection(introspectFieldsRef.current, selection.entryId);
    setFields(fields.length ? fields : [{ propertyId: "entryId", label: "Entry ID", type: "string", value: selection.entryId, group: "Meta" }], selection.entryId);
  }, [designerId, selection.entryId, selection.entryType, setFields]);

  return null;
}

function SessionSync({ moduleId, designerId }) {
  const { state } = useStudioDomain();
  const sessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = createWorkspaceSession({
      sessionId: `ws-${moduleId}-${designerId}`,
      moduleId,
      designerId,
      activeEditorId: designerId,
      editors: [{ editorId: designerId, designerId, moduleId, dirty: state.preview.status === "ready" }],
      selection: createStudioSelection(state.selection),
      dirty: state.preview.status === "ready",
      tabs: state.tabs,
      preview: state.preview,
      history: { canUndo: state.history.canUndo, canRedo: state.history.canRedo },
    });
  }, [moduleId, designerId, state]);

  return null;
}

function PersistenceSync({ persistenceKey }) {
  const { state } = useStudioDomain();

  useEffect(() => {
    if (!persistenceKey) return undefined;
    const timer = setTimeout(() => {
      saveStudioPersistence(persistenceKey, extractPersistableState(state));
    }, 400);
    return () => clearTimeout(timer);
  }, [persistenceKey, state.dock, state.tabs, state.workspace.moduleId, state.workspace.designerId]);

  return null;
}

function ShellContextProvider({ children, sdk, hub, token, moduleId, designerId }) {
  const { setModule, setDesigner, workspace } = useWorkspace();
  const { toggle: toggleDock } = useDock();
  const { add: addNotification } = useNotifications();
  const { actions, state } = useStudioDomain();
  const { compile: compilePreview } = usePreview();

  const shellValue = useMemo(
    () => ({
      sdk,
      hub,
      token,
      modules: STUDIO_MODULES,
      designers: STUDIO_DESIGNERS,
      activeModuleId: workspace.moduleId,
      activeDesignerId: workspace.designerId,
      setModule,
      setDesigner,
      addNotification,
      commandOpen: state.commandPalette.open,
      setCommandOpen: actions.commandPalette.setOpen,
      dockState: state.dock,
      setDockState: actions.dock.setVisibility,
      leftTab: state.tabs.left,
      setLeftTab: (tabId) => actions.tabs.setTab("left", tabId),
      rightTab: state.tabs.right,
      setRightTab: (tabId) => actions.tabs.setTab("right", tabId),
      bottomTab: state.tabs.bottom,
      setBottomTab: (tabId) => actions.tabs.setTab("bottom", tabId),
      toggleDock,
      isPrototype: false,
      mode: "production",
      compilePreview,
    }),
    [sdk, hub, token, workspace.moduleId, workspace.designerId, setModule, setDesigner, addNotification, state, actions, toggleDock, compilePreview]
  );

  return <StudioShellContextProvider value={shellValue}>{children}</StudioShellContextProvider>;
}

function DomainCommandRegistrar({ sdk }) {
  const { toggle: toggleDock } = useDock();
  const { actions } = useStudioDomain();
  const { compile: compilePreview } = usePreview();

  useEffect(() => {
    DEFAULT_COMMANDS.forEach((cmd) => {
      sdk.command.register({
        ...cmd,
        run: () => {
          if (cmd.id === "view.toggleLeftDock") toggleDock("left");
          if (cmd.id === "view.toggleRightDock") toggleDock("right");
          if (cmd.id === "view.toggleBottomDock") toggleDock("bottom");
          if (cmd.id === "preview.refresh") compilePreview();
          if (cmd.id === "history.undo") actions.history.undo();
          if (cmd.id === "history.redo") actions.history.redo();
        },
      });
    });
  }, [sdk, toggleDock, actions.history, compilePreview]);

  return null;
}

export function StudioProductionShellProvider({ children, moduleId: moduleIdProp, designerId: designerIdProp }) {
  const params = useParams();
  const { user, cliente } = useAuth();
  const moduleId = moduleIdProp ?? params.moduleId ?? "empresas";
  const designerId = designerIdProp ?? params.designerId ?? "layout";
  const scopeId = cliente?.id ?? user?.id ?? "default";
  const persistenceKey = buildPersistenceKey(moduleId, scopeId);

  const hub = useMemo(() => getStudioEventHub(), []);

  const initialDomainState = useMemo(() => {
    const persisted = loadStudioPersistence(persistenceKey);
    return createInitialStudioDomainState(
      mergePersistedIntoInitialState(persisted, {
        workspace: {
          moduleId,
          designerId,
          explorerTree: [],
          designerLabel: resolveDesignerLabel(designerId),
        },
        selection: createStudioSelection({ moduleId, designerId }),
        session: createWorkspaceSession({ moduleId, designerId }),
      })
    );
  }, [moduleId, designerId, persistenceKey]);

  const productionServices = useMemo(
    () => createProductionDomainAdapters({ moduleId }),
    [moduleId]
  );

  const sdk = useMemo(() => {
    return createStudioSdk({
      session: { moduleId, designerId },
      deps: {
        fetchRegistryEntries: async () => {
          const intro = await mdpIntrospect(moduleId);
          return intro?.registryEntries ?? [];
        },
        compileDraft: async (params) => mdpCompile(moduleId, { draft: true, ...params }),
        publish: async (payload) => mdpPublish({ moduleId, ...payload }),
        validatePublish: async () => productionServices.validationService.validate(),
      },
    });
  }, [moduleId, designerId, productionServices]);

  const editor = useMemo(() => createStudioEditor({ sdk, hub }), [sdk, hub]);

  useEffect(() => {
    wireHistoryToEventHub(hub, sdk.history);
    wirePreviewToEventHub(hub, sdk.preview);
  }, [hub, sdk.history, sdk.preview]);

  useEffect(() => {
    if (designerId === "layout") {
      registerLayoutDesigner();
      registerLayoutEditor(editor.registry);
    }
    if (designerId === "field") {
      registerFieldDesigner();
      registerFieldEditor(editor.registry);
    }
    if (designerId === "formula") {
      registerFormulaDesigner();
      registerFormulaEditor(editor.registry);
    }
  }, [designerId, editor.registry]);

  const token = useCallback((tokenId, themeId = "light") => resolveTokenValue(tokenId, themeId), []);

  const commands = useMemo(() => DEFAULT_COMMANDS.map((c) => ({ id: c.id, label: c.label, category: c.category })), []);

  const extraCommandGroups = useMemo(
    () => [
      {
        heading: "Navegação",
        items: STUDIO_MODULES.flatMap((m) =>
          listDesignersForNav(m).map((d) => ({
            id: `${m.moduleId}-${d.designerId}`,
            label: `${m.label} · ${d.label}`,
          }))
        ),
        onSelect: (id) => {
          const [mod, des] = String(id).split("-");
          if (mod && des) {
            window.location.assign(`/studio/${mod}/${des}`);
          }
        },
      },
    ],
    []
  );

  return (
    <StudioDomainProvider initialState={initialDomainState} services={productionServices} hub={hub} sdk={sdk}>
      <ProductionDomainLoader moduleId={moduleId} designerId={designerId} />
      <SelectionPropertySync moduleId={moduleId} designerId={designerId} />
      <SessionSync moduleId={moduleId} designerId={designerId} />
      <PersistenceSync persistenceKey={persistenceKey} />
      <DomainCommandRegistrar sdk={sdk} />
      <StudioEditorShellBridge
        mode="production"
        token={token}
        commands={commands}
        extraCommandGroups={extraCommandGroups}
        editor={editor}
      >
        <ShellContextProvider sdk={sdk} hub={hub} token={token} moduleId={moduleId} designerId={designerId}>
          {children}
        </ShellContextProvider>
      </StudioEditorShellBridge>
    </StudioDomainProvider>
  );
}

function listDesignersForNav(module) {
  return STUDIO_DESIGNERS.filter((d) => d.moduleId === module.moduleId);
}

export default StudioProductionShellProvider;
