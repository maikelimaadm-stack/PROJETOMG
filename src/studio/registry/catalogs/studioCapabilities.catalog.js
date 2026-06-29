/** Official Studio Capability catalog per designer. */
export const STUDIO_CAPABILITY_CATALOG = [
  {
    designerId: "layout",
    capabilityIds: ["dragDrop", "responsive", "docking", "preview", "publish", "history", "commandPalette", "clipboard"],
    label: "Layout Studio",
  },
  {
    designerId: "field",
    capabilityIds: ["preview", "publish", "history", "commandPalette", "validation"],
    label: "Field Studio",
  },
  {
    designerId: "validation",
    capabilityIds: ["preview", "publish", "history", "validation", "commandPalette"],
    label: "Validation Studio",
  },
  {
    designerId: "workflow",
    capabilityIds: ["graph", "validation", "execution", "preview", "publish", "history"],
    label: "Workflow Studio",
  },
  {
    designerId: "dashboard",
    capabilityIds: ["dragDrop", "responsive", "preview", "publish"],
    label: "Dashboard Studio",
  },
  {
    designerId: "kpi",
    capabilityIds: ["preview", "publish"],
    label: "KPI Studio",
  },
  {
    designerId: "automation",
    capabilityIds: ["graph", "execution", "publish", "validation"],
    label: "Automation Studio",
  },
  {
    designerId: "process",
    capabilityIds: ["graph", "execution", "validation", "publish"],
    label: "Process Studio",
  },
  {
    designerId: "mobile",
    capabilityIds: ["responsive", "preview", "publish"],
    label: "Mobile Studio",
  },
  {
    designerId: "desktop",
    capabilityIds: ["docking", "preview", "publish"],
    label: "Desktop Studio",
  },
  {
    designerId: "ai",
    capabilityIds: ["aiAssist", "preview", "commandPalette"],
    label: "AI Studio",
  },
];

export default STUDIO_CAPABILITY_CATALOG;
