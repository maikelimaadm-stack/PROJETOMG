/** Theme registry catalog — architecture only (no full theme UI). */
export const DESIGN_THEME_CATALOG = [
  { themeId: "light", label: "Light", status: "active", description: "Default light theme" },
  { themeId: "dark", label: "Dark", status: "active", description: "Default dark theme" },
  { themeId: "corporate", label: "Corporate", status: "reserved", description: "Enterprise corporate palette" },
  { themeId: "agro", label: "Agro", status: "reserved", description: "Agricultural sector theme" },
  { themeId: "industry", label: "Industry", status: "reserved", description: "Industrial sector theme" },
  { themeId: "hospital", label: "Hospital", status: "reserved", description: "Healthcare sector theme" },
  { themeId: "custom", label: "Custom", status: "reserved", description: "Tenant-defined custom theme" },
];

export default DESIGN_THEME_CATALOG;
