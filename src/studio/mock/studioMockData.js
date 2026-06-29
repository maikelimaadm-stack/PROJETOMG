/** Mock data for Studio Shell Prototype — Program 2.1A (no MDP). */

export const MOCK_MODULES = [
  { moduleId: "empresas", label: "Empresas", icon: "building" },
  { moduleId: "cadcps", label: "Cadastro CPS", icon: "layers", disabled: true },
];

export const MOCK_DESIGNERS = [
  { designerId: "layout", label: "Layout Studio", enabled: true },
  { designerId: "field", label: "Field Studio", enabled: false },
  { designerId: "workflow", label: "Workflow Studio", enabled: false },
  { designerId: "dashboard", label: "Dashboard Studio", enabled: false },
];

export const MOCK_EXPLORER_TREE = [
  {
    entryId: "bt-1",
    entryType: "base_template",
    label: "Modelo Base",
    children: [
      {
        entryId: "layout-main",
        entryType: "layout",
        label: "Layout Principal",
        children: [
          { entryId: "section-header", entryType: "section", label: "Cabeçalho" },
          { entryId: "section-body", entryType: "section", label: "Corpo", children: [
            { entryId: "panel-form", entryType: "panel", label: "Formulário" },
            { entryId: "panel-table", entryType: "panel", label: "Tabela" },
          ]},
        ],
      },
      { entryId: "fc-1", entryType: "field_config", label: "Campos" },
      { entryId: "val-1", entryType: "validation", label: "Validações" },
    ],
  },
];

export const MOCK_PROPERTY_SCHEMA = [
  { propertyId: "label", label: "Rótulo", type: "string", value: "Layout Principal", group: "General" },
  { propertyId: "enabled", label: "Ativo", type: "boolean", value: true, group: "General" },
  { propertyId: "columns", label: "Colunas", type: "number", value: 12, group: "Layout" },
  { propertyId: "gap", label: "Espaçamento", type: "string", value: "spacing.md", group: "Layout" },
];

export const MOCK_COMMANDS = [
  { id: "nav.modules", label: "Ir para Módulos", category: "Navigation" },
  { id: "view.toggleLeftDock", label: "Alternar painel esquerdo", category: "View" },
  { id: "view.toggleRightDock", label: "Alternar painel direito", category: "View" },
  { id: "view.toggleBottomDock", label: "Alternar painel inferior", category: "View" },
  { id: "edit.undo", label: "Desfazer", category: "Edit" },
  { id: "edit.redo", label: "Refazer", category: "Edit" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "n1", severity: "info", message: "Protótipo Studio Shell — dados simulados", timestamp: new Date().toISOString() },
];

export function flattenExplorerTree(nodes, depth = 0) {
  const result = [];
  nodes.forEach((node) => {
    result.push({ ...node, depth });
    if (node.children?.length) result.push(...flattenExplorerTree(node.children, depth + 1));
  });
  return result;
}
