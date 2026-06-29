import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createStudioSdk,
  getStudioEventHub,
  wireHistoryToEventHub,
  resolveTokenValue,
} from "@/studio/index.js";
import {
  MOCK_MODULES,
  MOCK_DESIGNERS,
  MOCK_EXPLORER_TREE,
  MOCK_COMMANDS,
  MOCK_NOTIFICATIONS,
} from "../mock/studioMockData.js";

const StudioShellContext = createContext(null);

export function StudioShellProvider({ children }) {
  const [activeModuleId, setActiveModuleId] = useState("empresas");
  const [activeDesignerId, setActiveDesignerId] = useState("layout");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [commandOpen, setCommandOpen] = useState(false);
  const [dockState, setDockState] = useState({ left: true, right: true, bottom: true });
  const [leftTab, setLeftTab] = useState("explorer");
  const [rightTab, setRightTab] = useState("inspector");
  const [bottomTab, setBottomTab] = useState("preview");

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
    setNotifications((prev) => [
      { id: `n-${Date.now()}`, timestamp: new Date().toISOString(), ...notification },
      ...prev,
    ].slice(0, 5));
  }, []);

  const token = useCallback((tokenId, themeId = "light") => resolveTokenValue(tokenId, themeId), []);

  const value = useMemo(
    () => ({
      sdk,
      hub,
      token,
      modules: MOCK_MODULES,
      designers: MOCK_DESIGNERS,
      explorerTree: MOCK_EXPLORER_TREE,
      activeModuleId,
      activeDesignerId,
      setModule,
      setDesigner,
      publishSelection,
      notifications,
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
      publishSelection,
      notifications,
      addNotification,
      commandOpen,
      dockState,
      leftTab,
      rightTab,
      bottomTab,
    ]
  );

  return <StudioShellContext.Provider value={value}>{children}</StudioShellContext.Provider>;
}

export function useStudioShell() {
  const ctx = useContext(StudioShellContext);
  if (!ctx) throw new Error("useStudioShell must be used within StudioShellProvider");
  return ctx;
}

export default StudioShellProvider;
