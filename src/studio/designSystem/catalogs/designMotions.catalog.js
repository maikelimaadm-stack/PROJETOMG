/** Motion registry catalog — contracts only (no animation implementations). */
export const DESIGN_MOTION_CATALOG = [
  { motionId: "fade", label: "Fade", category: "enter", durationMs: 200, easing: "ease-in-out" },
  { motionId: "slide", label: "Slide", category: "enter", durationMs: 250, easing: "ease-out" },
  { motionId: "scale", label: "Scale", category: "emphasis", durationMs: 180, easing: "ease-in-out" },
  { motionId: "ripple", label: "Ripple", category: "feedback", durationMs: 400, easing: "ease-out" },
  { motionId: "bounce", label: "Bounce", category: "emphasis", durationMs: 350, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
  { motionId: "loading", label: "Loading", category: "loading", durationMs: 1000, easing: "linear" },
  { motionId: "hover", label: "Hover", category: "feedback", durationMs: 150, easing: "ease-in-out" },
  { motionId: "success", label: "Success", category: "feedback", durationMs: 300, easing: "ease-out" },
  { motionId: "error", label: "Error", category: "feedback", durationMs: 300, easing: "ease-in-out" },
];

export default DESIGN_MOTION_CATALOG;
