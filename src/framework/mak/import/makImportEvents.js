import { getModuleEventName } from "@/framework/mak/events/makModuleEvents.js";
import { MAK_IMPORT_EVENTS } from "./makImport.constants.js";

export function getMakImportEventName(moduleId, suffix) {
  return getModuleEventName(moduleId, suffix);
}

export function dispatchMakImportEvent(moduleId, suffix, detail = undefined) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(getMakImportEventName(moduleId, suffix), { detail }));
}

export function subscribeMakImportEvent(moduleId, suffix, handler) {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};
  const eventName = getMakImportEventName(moduleId, suffix);
  const listener = (event) => handler(event?.detail);
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}

export { MAK_IMPORT_EVENTS };
