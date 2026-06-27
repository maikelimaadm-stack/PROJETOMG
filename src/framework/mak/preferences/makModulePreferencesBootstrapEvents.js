export const buildMakPreferencesBootstrapAppliedEvent = (moduleId) =>
  `${moduleId}-preferences-bootstrap-applied`;

export function dispatchMakPreferencesBootstrapApplied(moduleId, detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(buildMakPreferencesBootstrapAppliedEvent(moduleId), { detail })
  );
}

export default dispatchMakPreferencesBootstrapApplied;
