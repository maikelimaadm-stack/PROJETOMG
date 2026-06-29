/** Accessibility registry catalog — declarative profiles (no visual implementation). */
export const DESIGN_ACCESSIBILITY_CATALOG = [
  { a11yId: "keyboard.navigation", label: "Keyboard Navigation", category: "keyboard", requirements: ["tab-order", "arrow-keys"] },
  { a11yId: "keyboard.shortcuts", label: "Keyboard Shortcuts", category: "keyboard", requirements: ["command-palette"] },
  { a11yId: "screenReader.label", label: "Screen Reader Label", category: "screenReader", requirements: ["aria-label"] },
  { a11yId: "screenReader.description", label: "Screen Reader Description", category: "screenReader", requirements: ["aria-describedby"] },
  { a11yId: "focus.visible", label: "Visible Focus", category: "focus", requirements: ["focus-ring", "focus-trap-modal"] },
  { a11yId: "focus.order", label: "Focus Order", category: "focus", requirements: ["logical-tab-index"] },
  { a11yId: "aria.role", label: "ARIA Role", category: "aria", requirements: ["semantic-role"] },
  { a11yId: "aria.state", label: "ARIA State", category: "aria", requirements: ["aria-expanded", "aria-selected"] },
  { a11yId: "contrast.wcag-aa", label: "WCAG AA Contrast", category: "contrast", requirements: ["4.5:1-text", "3:1-ui"] },
  { a11yId: "touch.target-min", label: "Minimum Touch Target", category: "touchTargets", requirements: ["44x44px-min"] },
];

export default DESIGN_ACCESSIBILITY_CATALOG;
