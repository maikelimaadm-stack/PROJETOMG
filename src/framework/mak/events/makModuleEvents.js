/** Eventos derivados de moduleId — SSOT ModeloBase1. */
export function getModuleEventName(moduleId, suffix) {
  const safeModule = String(moduleId || "cadastro").trim() || "cadastro";
  const safeSuffix = String(suffix || "").trim();
  return `${safeModule}-${safeSuffix}`;
}

export function dispatchModuleEvent(moduleId, suffix, detail = undefined) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(getModuleEventName(moduleId, suffix), { detail }));
}

export function subscribeModuleEvent(moduleId, suffix, handler) {
  if (typeof window === "undefined") return () => {};
  const eventName = getModuleEventName(moduleId, suffix);
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
