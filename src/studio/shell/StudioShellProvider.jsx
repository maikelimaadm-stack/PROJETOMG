import { useCallback, useEffect, useMemo } from "react";
import {
  createStudioSdk,
  getStudioEventHub,
  wireHistoryToEventHub,
  resolveTokenValue,
} from "@/studio/index.js";
import {
  StudioDomainProvider,
  StudioUniversalBridge,
  createInitialStudioDomainState,
  useWorkspace,
  useDock,
  useNotifications,
  useProperties,
  useStudioDomain,
} from "@/studio/domain/index.js";
import {
  MOCK_MODULES,
  MOCK_DESIGNERS,
  MOCK_EXPLORER_TREE,
  MOCK_COMMANDS,
  MOCK_NOTIFICATIONS,
  MOCK_PROPERTY_SCHEMA,
} from "../mock/studioMockData.js";

import { StudioShellContextProvider } from "./StudioShellContext.jsx";

function DomainInitializer({ designers }) {
  const { setExplorerTree, setDesignerLabel } = useWorkspace();
  const { setFields } = useProperties();

  useEffect(() => {
    setExplorerTree(MOCK_EXPLORER_TREE);
    setFields(MOCK_PROPERTY_SCHEMA);
    const designer = designers.find((d) => d.designerId === "layout");
    if (designer) setDesignerLabel(designer.label);
  }, [setExplorerTree, setFields, setDesignerLabel, designers]);

  return null;
}

function ShellBridge({ children, token, commands, extraCommandGroups }) {
  return (
    <StudioUniversalBridge token={token} commands={commands} extraCommandGroups={extraCommandGroups}>
      {children}
    </StudioUniversalBridge>
  );
}

function ShellContextProvider({ children, sdk, hub, token }) {
  const { setModule, setDesigner, workspace } = useWorkspace();
  const { toggle: toggleDock } = useDock();
  const { add: addNotification } = useNotifications();
  const { actions, state } = useStudioDomain();

  const shellValue = useMemo(
    () => ({
      sdk,
      hub,
      token,
      modules: MOCK_MODULES,
      designers: MOCK_DESIGNERS,
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
      isPrototype: true,
    }),
    [sdk, hub, token, workspace.moduleId, workspace.designerId, setModule, setDesigner, addNotification, state, actions, toggleDock]
  );

  return <StudioShellContextProvider value={shellValue}>{children}</StudioShellContextProvider>;
}

export function StudioShellProvider({ children }) {
  const hub = useMemo(() => getStudioEventHub(), []);

  const initialDomainState = useMemo(
    () =>
      createInitialStudioDomainState({
        workspace: {
          moduleId: "empresas",
          designerId: "layout",
          explorerTree: [],
          designerLabel: "Layout Studio",
        },
        notifications: { items: MOCK_NOTIFICATIONS },
        properties: { fields: MOCK_PROPERTY_SCHEMA, entryId: null },
      }),
    []
  );

  const sdk = useMemo(() => {
    const instance = createStudioSdk({
      session: {
        moduleId: initialDomainState.workspace.moduleId,
        designerId: initialDomainState.workspace.designerId,
      },
      deps: {
        fetchRegistryEntries: async () => MOCK_EXPLORER_TREE,
      },
    });
    return instance;
  }, [initialDomainState.workspace.moduleId, initialDomainState.workspace.designerId]);

  useEffect(() => {
    wireHistoryToEventHub(hub, sdk.history);
  }, [hub, sdk.history]);

  const token = useCallback((tokenId, themeId = "light") => resolveTokenValue(tokenId, themeId), []);

  const commands = useMemo(
    () => MOCK_COMMANDS.map((c) => ({ id: c.id, label: c.label, category: c.category })),
    []
  );

  const extraCommandGroups = useMemo(
    () => [
      {
        heading: "Entradas (mock)",
        items: [
          { id: "layout-main", label: "layout-main — Layout Principal" },
          { id: "panel-form", label: "panel-form — Formulário" },
        ],
        onSelect: () => {},
      },
    ],
    []
  );

  return (
    <StudioDomainProvider initialState={initialDomainState} hub={hub} sdk={sdk}>
      <DomainInitializer designers={MOCK_DESIGNERS} />
      <DomainCommandRegistrar sdk={sdk} />
      <ShellBridge token={token} commands={commands} extraCommandGroups={extraCommandGroups}>
        <ShellContextProvider sdk={sdk} hub={hub} token={token}>
          {children}
        </ShellContextProvider>
      </ShellBridge>
    </StudioDomainProvider>
  );
}

function DomainCommandRegistrar({ sdk }) {
  const { toggle: toggleDock } = useDock();

  useEffect(() => {
    MOCK_COMMANDS.forEach((cmd) => {
      sdk.command.register({
        ...cmd,
        run: () => {
          if (cmd.id === "view.toggleLeftDock") toggleDock("left");
          if (cmd.id === "view.toggleRightDock") toggleDock("right");
          if (cmd.id === "view.toggleBottomDock") toggleDock("bottom");
        },
      });
    });
  }, [sdk, toggleDock]);

  return null;
}

export { useStudioShell } from "./StudioShellContext.jsx";

export default StudioShellProvider;
