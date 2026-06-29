import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createStudioSdk,
  getStudioEventHub,
  wireHistoryToEventHub,
  resolveTokenValue,
} from "@/studio/index.js";
import {
  ExplorerProvider,
  InspectorProvider,
  PropertyProvider,
  WorkspaceProvider,
  DockProvider,
  NotificationProvider,
  BreadcrumbProvider,
  CommandPaletteProvider,
  StatusBarProvider,
  UniversalExplorer,
  UniversalInspector,
  UniversalPropertyGrid,
  UniversalWorkspace,
} from "@/studio/components/index.js";
import {
  MOCK_MODULES,
  MOCK_DESIGNERS,
  MOCK_EXPLORER_TREE,
  MOCK_COMMANDS,
  MOCK_NOTIFICATIONS,
  MOCK_PROPERTY_SCHEMA,
} from "../mock/studioMockData.js";

const StudioShellContext = createContext(null);

function flattenExplorerTree(nodes, depth = 0) {
  const result = [];
  nodes.forEach((node) => {
    result.push({ ...node, depth });
    if (node.children?.length) result.push(...flattenExplorerTree(node.children, depth + 1));
  });
  return result;
}

export function StudioShellProvider({ children }) {
  const [activeModuleId, setActiveModuleId] = useState("empresas");
  const [activeDesignerId, setActiveDesignerId] = useState("layout");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [commandOpen, setCommandOpen] = useState(false);
  const [dockState, setDockState] = useState({ left: true, right: true, bottom: true });
  const [leftTab, setLeftTab] = useState("explorer");
  const [rightTab, setRightTab] = useState("inspector");
  const [bottomTab, setBottomTab] = useState("preview");
  const [selectedId, setSelectedId] = useState(null);
  const [propertyFields, setPropertyFields] = useState(MOCK_PROPERTY_SCHEMA);

  const hub = useMemo(() => getStudioEventHub(), []);

  const sdk = useMemo(() => {
    const instance = createStudioSdk({
      session: { moduleId: activeModuleId, designerId: activeDesignerId },
      deps: {
        fetchRegistryEntries: async () => MOCK_EXPLORER_TREE,
      },
    });
    MOCK_COMMANDS.forEach((cmd) => {
      instance.command.register({
        ...cmd,
        run: () => {
          if (cmd.id === "view.toggleLeftDock") setDockState((s) => ({ ...s, left: !s.left }));
          if (cmd.id === "view.toggleRightDock") setDockState((s) => ({ ...s, right: !s.right }));
          if (cmd.id === "view.toggleBottomDock") setDockState((s) => ({ ...s, bottom: !s.bottom }));
        },
      });
    });
    return instance;
  }, [activeModuleId, activeDesignerId]);

  useEffect(() => {
    wireHistoryToEventHub(hub, sdk.history);
  }, [hub, sdk.history]);

  useEffect(() => sdk.selection.subscribe((sel) => setSelectedId(sel.entryId)), [sdk.selection]);

  const publishSelection = useCallback(
    (entry) => {
      sdk.selection.setSelection({
        entryId: entry?.entryId ?? null,
        entryType: entry?.entryType ?? null,
        moduleId: activeModuleId,
        designerId: activeDesignerId,
      });
      hub.publish("selection.changed", {
        selectionId: entry?.entryId ?? null,
        entryId: entry?.entryId ?? null,
        entryType: entry?.entryType ?? null,
        source: "explorer",
      });
    },
    [sdk.selection, hub, activeModuleId, activeDesignerId]
  );

  const setModule = useCallback(
    (moduleId) => {
      setActiveModuleId(moduleId);
      hub.publish("workspace.changed", {
        workspaceId: `ws-${moduleId}`,
        moduleId,
        source: "shell",
      });
    },
    [hub]
  );

  const setDesigner = useCallback(
    (designerId) => {
      const prev = activeDesignerId;
      setActiveDesignerId(designerId);
      hub.publish("designer.active.changed", {
        designerId,
        previousDesignerId: prev,
        source: "shell",
      });
    },
    [hub, activeDesignerId]
  );

  const addNotification = useCallback((notification) => {
    setNotifications((prev) =>
      [
        { id: `n-${Date.now()}`, timestamp: new Date().toISOString(), ...notification },
        ...prev,
      ].slice(0, 5)
    );
  }, []);

  const token = useCallback((tokenId, themeId = "light") => resolveTokenValue(tokenId, themeId), []);

  const selection = sdk.selection.getSelection();
  const designer = MOCK_DESIGNERS.find((d) => d.designerId === activeDesignerId);
  const flatExplorer = flattenExplorerTree(MOCK_EXPLORER_TREE);

  const onFieldChange = useCallback(
    (propertyId, nextValue) => {
      setPropertyFields((prev) =>
        prev.map((f) => (f.propertyId === propertyId ? { ...f, value: nextValue } : f))
      );
      hub.publish("property.changed", {
        propertyId,
        entryId: selection.entryId,
        previousValue: null,
        nextValue,
        source: "property-grid",
      });
    },
    [hub, selection.entryId]
  );

  const explorerValue = useMemo(
    () => ({
      tree: MOCK_EXPLORER_TREE,
      selectedId,
      onSelect: publishSelection,
      footerLabel: `${flatExplorer.length} entradas (mock)`,
    }),
    [selectedId, publishSelection, flatExplorer.length]
  );

  const inspectorValue = useMemo(() => {
    if (!selection.entryId) {
      return {
        fields: [],
        emptyState: "Selecione uma entrada no Explorer ou Workspace",
      };
    }
    return {
      fields: [
        { label: "Entry ID", value: <span className="font-mono">{selection.entryId}</span> },
        { label: "Tipo", value: selection.entryType },
        { label: "Status", value: "draft · mock" },
        { label: "Bindings", value: <span className="text-muted-foreground">Nenhum (protótipo)</span> },
      ],
    };
  }, [selection.entryId, selection.entryType]);

  const propertyValue = useMemo(
    () => ({
      hasSelection: Boolean(selection.entryId),
      fields: propertyFields,
      onFieldChange,
      emptyState: "Property Grid — selecione uma entrada",
    }),
    [selection.entryId, propertyFields, onFieldChange]
  );

  const workspaceValue = useMemo(
    () => ({
      title: designer?.label ?? "Designer",
      subtitle:
        "Workspace do protótipo — canvas do designer será montado aqui na próxima fase de integração.",
      placeholder: (
        <>
          <p className="text-xs text-muted-foreground">Dados simulados · sem MDP · sem Preview real</p>
          <div
            className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2 opacity-60"
            style={{ gap: token("spacing.sm") }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded border border-dashed border-border bg-muted/50"
              />
            ))}
          </div>
        </>
      ),
    }),
    [designer?.label, token]
  );

  const dockValue = useMemo(
    () => ({
      visibility: dockState,
      left: {
        tabs: [
          { id: "explorer", label: "Explorer" },
          { id: "outline", label: "Outline" },
          { id: "assets", label: "Assets" },
        ],
        activeTab: leftTab,
        onTabChange: setLeftTab,
        renderContent: (tabId) => {
          if (tabId === "explorer") return <UniversalExplorer />;
          if (tabId === "outline") {
            return (
              <div className="p-3 text-xs text-muted-foreground">
                Outline (mock) — sincronizado com Explorer
              </div>
            );
          }
          return <div className="p-3 text-xs text-muted-foreground">Asset Manager (stub)</div>;
        },
      },
      right: {
        tabs: [
          { id: "inspector", label: "Inspector" },
          { id: "properties", label: "Property Grid" },
        ],
        activeTab: rightTab,
        onTabChange: setRightTab,
        renderContent: (tabId) =>
          tabId === "inspector" ? <UniversalInspector /> : <UniversalPropertyGrid />,
      },
      bottom: {
        tabs: [
          { id: "preview", label: "Preview" },
          { id: "console", label: "Runtime Console" },
          { id: "validation", label: "Validação" },
        ],
        activeTab: bottomTab,
        onTabChange: setBottomTab,
        renderContent: (tabId) => (
          <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
            {tabId === "preview" && "Preview simulado — compile path no Program 2.1B"}
            {tabId === "console" && "Runtime Console — logs simulados (vazio)"}
            {tabId === "validation" && "Nenhum erro de validação (mock)"}
          </div>
        ),
      },
      renderCenter: () => <UniversalWorkspace />,
    }),
    [dockState, leftTab, rightTab, bottomTab]
  );

  const notificationValue = useMemo(() => ({ notifications }), [notifications]);

  const breadcrumbValue = useMemo(
    () => ({
      segments: [activeModuleId, designer?.label ?? activeDesignerId],
    }),
    [activeModuleId, designer?.label, activeDesignerId]
  );

  const commandPaletteValue = useMemo(
    () => ({
      open: commandOpen,
      onOpenChange: setCommandOpen,
      commands: sdk.command.list().map((c) => ({ id: c.id, label: c.label, category: c.category })),
      onRunCommand: (id) => sdk.command.run(id),
      placeholder: "Buscar comandos, entradas, navegação…",
      extraGroups: [
        {
          heading: "Entradas (mock)",
          items: [
            { id: "layout-main", label: "layout-main — Layout Principal" },
            { id: "panel-form", label: "panel-form — Formulário" },
          ],
          onSelect: () => {},
        },
      ],
    }),
    [commandOpen, sdk.command]
  );

  const statusBarValue = useMemo(
    () => ({
      leftItems: [
        { id: "conn", content: "Mock · desconectado" },
        { id: "module", content: `módulo: ${activeModuleId}` },
        { id: "draft", content: "rascunho" },
      ],
      rightItems: [
        ...(selection.entryId
          ? [{ id: "sel", content: `seleção: ${selection.entryType}/${selection.entryId}` }]
          : []),
        { id: "val", content: "validação: 0" },
      ],
    }),
    [activeModuleId, selection.entryId, selection.entryType]
  );

  const shellValue = useMemo(
    () => ({
      sdk,
      hub,
      token,
      modules: MOCK_MODULES,
      designers: MOCK_DESIGNERS,
      activeModuleId,
      activeDesignerId,
      setModule,
      setDesigner,
      addNotification,
      commandOpen,
      setCommandOpen,
      dockState,
      setDockState,
      leftTab,
      setLeftTab,
      rightTab,
      setRightTab,
      bottomTab,
      setBottomTab,
      isPrototype: true,
    }),
    [
      sdk,
      hub,
      token,
      activeModuleId,
      activeDesignerId,
      setModule,
      setDesigner,
      addNotification,
      commandOpen,
      dockState,
      leftTab,
      rightTab,
      bottomTab,
    ]
  );

  return (
    <StudioShellContext.Provider value={shellValue}>
      <ExplorerProvider value={explorerValue}>
        <InspectorProvider value={inspectorValue}>
          <PropertyProvider value={propertyValue}>
            <WorkspaceProvider value={workspaceValue}>
              <DockProvider value={dockValue}>
                <NotificationProvider value={notificationValue}>
                  <BreadcrumbProvider value={breadcrumbValue}>
                    <CommandPaletteProvider value={commandPaletteValue}>
                      <StatusBarProvider value={statusBarValue}>{children}</StatusBarProvider>
                    </CommandPaletteProvider>
                  </BreadcrumbProvider>
                </NotificationProvider>
              </DockProvider>
            </WorkspaceProvider>
          </PropertyProvider>
        </InspectorProvider>
      </ExplorerProvider>
    </StudioShellContext.Provider>
  );
}

export function useStudioShell() {
  const ctx = useContext(StudioShellContext);
  if (!ctx) throw new Error("useStudioShell must be used within StudioShellProvider");
  return ctx;
}

export default StudioShellProvider;
