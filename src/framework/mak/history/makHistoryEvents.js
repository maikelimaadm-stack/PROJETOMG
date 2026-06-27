import { getModuleEventName } from "@/framework/mak/events/makModuleEvents.js";
import { MAK_HISTORY_EVENTS } from "./makHistory.constants.js";

export function getMakHistoryEventName(moduleId, suffix) {
  return getModuleEventName(moduleId, suffix);
}

export function dispatchMakHistoryEvent(moduleId, suffix, detail = undefined) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(getMakHistoryEventName(moduleId, suffix), { detail }));
}

export function subscribeMakHistoryEvent(moduleId, suffix, handler) {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};
  const eventName = getMakHistoryEventName(moduleId, suffix);
  const listener = (event) => handler(event?.detail);
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}

export { MAK_HISTORY_EVENTS };
