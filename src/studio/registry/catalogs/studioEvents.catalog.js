/** Official Studio Event catalog. */
export const STUDIO_EVENT_CATALOG = [
  { eventId: "onLoad", label: "On Load", category: "lifecycle", description: "Fired when component mounts or data loads." },
  { eventId: "onClick", label: "On Click", category: "interaction", description: "User click interaction." },
  { eventId: "onSave", label: "On Save", category: "lifecycle", description: "Record save completed." },
  { eventId: "onDelete", label: "On Delete", category: "lifecycle", description: "Record delete completed." },
  { eventId: "onChange", label: "On Change", category: "data", description: "Value or structure changed." },
  { eventId: "onValidate", label: "On Validate", category: "validation", description: "Validation pass/fail." },
  { eventId: "onPublish", label: "On Publish", category: "platform", description: "MDP publish completed." },
  { eventId: "onWorkflow", label: "On Workflow", category: "workflow", description: "Workflow step executed." },
  { eventId: "onCompile", label: "On Compile", category: "platform", description: "CRB compile completed." },
];

export default STUDIO_EVENT_CATALOG;
