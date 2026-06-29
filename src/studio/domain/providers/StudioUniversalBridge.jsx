import { useMemo } from "react";
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
import { useStudioDomain } from "./StudioDomainProvider.jsx";
import { useSelection } from "../hooks/useSelection.js";
import { useWorkspace } from "../hooks/useWorkspace.js";
import { useDock } from "../hooks/useDock.js";
import { useTabs } from "../hooks/useTabs.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { useProperties } from "../hooks/useProperties.js";

function flattenExplorerTree(nodes, depth = 0) {
  const result = [];
  nodes.forEach((node) => {
    result.push({ ...node, depth });
    if (node.children?.length) result.push(...flattenExplorerTree(node.children, depth + 1));
  });
  return result;
}

/**
 * Bridges official Studio Domain → Universal Component Providers.
 * Universal components consume Providers only — never domain internals.
 */
export function StudioUniversalBridge({ children, token, commands = [], extraCommandGroups = [] }) {
  const { sdk } = useStudioDomain();
  const { selection, selectEntry } = useSelection();
  const { workspace } = useWorkspace();
  const { dock } = useDock();
  const { tabs, setTab } = useTabs();
  const { notifications } = useNotifications();
  const { properties, updateField } = useProperties();
  const { actions, state } = useStudioDomain();

  const flatExplorer = flattenExplorerTree(workspace.explorerTree ?? []);

  const explorerValue = useMemo(
    () => ({
      tree: workspace.explorerTree,
      selectedId: selection.entryId,
      onSelect: selectEntry,
      footerLabel: `${flatExplorer.length} entradas (mock)`,
    }),
    [workspace.explorerTree, selection.entryId, selectEntry, flatExplorer.length]
  );

  const inspectorValue = useMemo(() => {
    if (!selection.entryId) {
      return { fields: [], emptyState: "Selecione uma entrada no Explorer ou Workspace" };
    }
    return {
      fields: [
        { label: "Entry ID", value: <span className="font-mono">{selection.entryId}</span> },
        { label: "Tipo", value: selection.entryType },
        { label: "Status", value: "draft · mock" },
        {
          label: "Bindings",
          value: <span className="text-muted-foreground">Nenhum (protótipo)</span>,
        },
      ],
    };
  }, [selection.entryId, selection.entryType]);

  const propertyValue = useMemo(
    () => ({
      hasSelection: Boolean(selection.entryId),
      fields: properties.fields,
      onFieldChange: updateField,
      emptyState: "Property Grid — selecione uma entrada",
    }),
    [selection.entryId, properties.fields, updateField]
  );

  const workspaceValue = useMemo(
    () => ({
      title: workspace.designerLabel ?? "Designer",
      subtitle:
        "Workspace do protótipo — canvas do designer será montado aqui na próxima fase de integração.",
      placeholder: (
        <>
          <p className="text-xs text-muted-foreground">Dados simulados · sem MDP · sem Preview real</p>
          <div
            className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2 opacity-60"
            style={{ gap: token?.("spacing.sm") ?? "0.5rem" }}
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
    [workspace.designerLabel, token]
  );

  const dockValue = useMemo(
    () => ({
      visibility: dock,
      left: {
        tabs: [
          { id: "explorer", label: "Explorer" },
          { id: "outline", label: "Outline" },
          { id: "assets", label: "Assets" },
        ],
        activeTab: tabs.left,
        onTabChange: (tabId) => setTab("left", tabId),
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
        activeTab: tabs.right,
        onTabChange: (tabId) => setTab("right", tabId),
        renderContent: (tabId) =>
          tabId === "inspector" ? <UniversalInspector /> : <UniversalPropertyGrid />,
      },
      bottom: {
        tabs: [
          { id: "preview", label: "Preview" },
          { id: "console", label: "Runtime Console" },
          { id: "validation", label: "Validação" },
        ],
        activeTab: tabs.bottom,
        onTabChange: (tabId) => setTab("bottom", tabId),
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
    [dock, tabs, setTab]
  );

  const notificationValue = useMemo(
    () => ({ notifications: notifications.items }),
    [notifications.items]
  );

  const breadcrumbValue = useMemo(
    () => ({
      segments: [workspace.moduleId, workspace.designerLabel ?? workspace.designerId],
    }),
    [workspace.moduleId, workspace.designerLabel, workspace.designerId]
  );

  const commandPaletteValue = useMemo(
    () => ({
      open: state.commandPalette.open,
      onOpenChange: actions.commandPalette.setOpen,
      commands,
      onRunCommand: (id) => sdk?.command?.run?.(id),
      placeholder: "Buscar comandos, entradas, navegação…",
      extraGroups: extraCommandGroups,
    }),
    [state.commandPalette.open, actions.commandPalette, commands, extraCommandGroups, sdk?.command]
  );

  const statusBarValue = useMemo(
    () => ({
      leftItems: [
        { id: "conn", content: "Mock · desconectado" },
        { id: "module", content: `módulo: ${workspace.moduleId}` },
        { id: "draft", content: "rascunho" },
      ],
      rightItems: [
        ...(selection.entryId
          ? [{ id: "sel", content: `seleção: ${selection.entryType}/${selection.entryId}` }]
          : []),
        { id: "val", content: "validação: 0" },
      ],
    }),
    [workspace.moduleId, selection.entryId, selection.entryType]
  );

  return (
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
  );
}

export default StudioUniversalBridge;
