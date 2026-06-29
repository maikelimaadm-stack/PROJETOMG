/** Official Studio Action catalog. */
export const STUDIO_ACTION_CATALOG = [
  { actionId: "create", label: "Create", category: "crud", description: "Create registry entry or record." },
  { actionId: "update", label: "Update", category: "crud", description: "Update existing entry." },
  { actionId: "delete", label: "Delete", category: "crud", description: "Delete or deprecate entry." },
  { actionId: "open", label: "Open", category: "navigation", description: "Open target entry or view." },
  { actionId: "navigate", label: "Navigate", category: "navigation", description: "Navigate within Studio or app." },
  { actionId: "export", label: "Export", category: "data", description: "Export definition or data." },
  { actionId: "import", label: "Import", category: "data", description: "Import package or definition." },
  { actionId: "publish", label: "Publish", category: "platform", description: "Publish draft to MDP-5." },
  { actionId: "compile", label: "Compile", category: "platform", description: "Compile draft CRB." },
  { actionId: "executeWorkflow", label: "Execute Workflow", category: "workflow", description: "Run workflow step." },
];

export default STUDIO_ACTION_CATALOG;
