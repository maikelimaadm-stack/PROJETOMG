import { useEffect, useMemo } from "react";
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
import { usePreview } from "../hooks/usePreview.js";

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
export function StudioUniversalBridge({
  children,
  token,
  commands = [],
  extraCommandGroups = [],
  mode = "prototype",
}) {
  const isProduction = mode === "production";
  const { sdk } = useStudioDomain();
  const { selection, selectEntry } = useSelection();
  const { workspace } = useWorkspace();
  const { dock } = useDock();
  const { tabs, setTab } = useTabs();
  const { notifications } = useNotifications();
  const { properties, updateField } = useProperties();
  const { preview, compile: compilePreview } = usePreview();
  const { actions, state, services } = useStudioDomain();

  useEffect(() => {
    if (!isProduction) return undefined;
    compilePreview().catch(() => {});
    return undefined;
  }, [isProduction, workspace.moduleId, compilePreview]);

  const flatExplorer = flattenExplorerTree(workspace.explorerTree ?? []);
  const validationCount = isProduction ? (services?.validationService?.getErrorCount?.() ?? 0) : 0;

  const explorerValue = useMemo(
    () => ({
      tree: workspace.explorerTree,
      selectedId: selection.entryId,
      onSelect: selectEntry,
      footerLabel: isProduction
        ? `${flatExplorer.length} entradas · MDP`
        : `${flatExplorer.length} entradas (mock)`,
    }),
    [workspace.explorerTree, selection.entryId, selectEntry, flatExplorer.length, isProduction]
  );

  const inspectorValue = useMemo(() => {
    if (!selection.entryId) {
      return { fields: [], emptyState: "Selecione uma entrada no Explorer ou Workspace" };
    }
    return {
      fields: [
        { label: "Entry ID", value: <span className="font-mono">{selection.entryId}</span> },
        { label: "Tipo", value: selection.entryType },
        ...(selection.selectionKind
          ? [{ label: "Selection Kind", value: selection.selectionKind }]
          : []),
        {
          label: "Status",
          value: isProduction ? "published · MDP" : "draft · mock",
        },
        {
          label: "Bindings",
          value: (
            <span className="text-muted-foreground">
              {isProduction ? "Somente leitura (Program 2.2)" : "Nenhum (protótipo)"}
            </span>
          ),
        },
      ],
    };
  }, [selection.entryId, selection.entryType, selection.selectionKind, isProduction]);

  const propertyValue = useMemo(
    () => ({
      hasSelection: Boolean(selection.entryId),
      fields: properties.fields,
      onFieldChange: isProduction ? undefined : updateField,
      readOnly: isProduction,
      emptyState: "Property Grid — selecione uma entrada",
    }),
    [selection.entryId, properties.fields, updateField, isProduction]
  );

  const workspaceValue = useMemo(
    () => ({
      title: workspace.designerLabel ?? "Designer",
      subtitle: isProduction
        ? "Workspace de produção — Layout Designer será montado no Program 2.2."
        : "Workspace do protótipo — canvas do designer será montado aqui na próxima fase de integração.",
      placeholder: (
        <>
          <p className="text-xs text-muted-foreground">
            {isProduction
              ? "MDP conectado · Preview via Runtime Bridge (CRB)"
              : "Dados simulados · sem MDP · sem Preview real"}
          </p>
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
    [workspace.designerLabel, token, isProduction]
  );

  const previewPanelContent = useMemo(() => {
    if (!isProduction) return "Preview simulado — compile path no Program 2.1B";
    if (preview.status === "loading") return "Carregando Preview CRB…";
    if (preview.status === "error") return preview.message ?? "Erro ao carregar Preview";
    if (preview.status === "ready") {
      return preview.message ?? `Preview CRB · ${preview.compileId ?? "—"}`;
    }
    return "Preview via MDP introspect (read-only · não altera Runtime)";
  }, [isProduction, preview.status, preview.message, preview.compileId]);

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
                {isProduction ? "Outline — sincronizado com Explorer (MDP)" : "Outline (mock) — sincronizado com Explorer"}
              </div>
            );
          }
          return (
            <div className="p-3 text-xs text-muted-foreground">
              {isProduction ? "Asset Manager — entradas MDP" : "Asset Manager (stub)"}
            </div>
          );
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
            {tabId === "preview" && previewPanelContent}
            {tabId === "console" && (isProduction ? "Runtime Console — somente leitura" : "Runtime Console — logs simulados (vazio)")}
            {tabId === "validation" &&
              (isProduction
                ? `Validação MDP: ${validationCount} erro(s)`
                : "Nenhum erro de validação (mock)")}
          </div>
        ),
      },
      renderCenter: () => <UniversalWorkspace />,
    }),
    [dock, tabs, setTab, isProduction, previewPanelContent, validationCount]
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
        {
          id: "conn",
          content: isProduction ? "MDP · conectado" : "Mock · desconectado",
        },
        { id: "module", content: `módulo: ${workspace.moduleId}` },
        { id: "draft", content: isProduction ? preview.status : "rascunho" },
      ],
      rightItems: [
        ...(selection.entryId
          ? [
              {
                id: "sel",
                content: `seleção: ${selection.selectionKind ?? selection.entryType}/${selection.entryId}`,
              },
            ]
          : []),
        { id: "val", content: `validação: ${validationCount}` },
      ],
    }),
    [
      workspace.moduleId,
      selection.entryId,
      selection.entryType,
      selection.selectionKind,
      isProduction,
      preview.status,
      validationCount,
    ]
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
