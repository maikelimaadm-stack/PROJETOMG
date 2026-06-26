/**
 * Cross-tab sync genérico de preferências por módulo.
 */
import {
  getActiveUserPreferencesScope,
  preferenceEventMatchesScope,
} from "@/shared/preferences/userPreferencesScope.js";

export const MAK_PREFERENCES_CROSS_TAB_CHANNEL = "mg-mak-preferences-v1";

const createTabId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const tabIds = new Map();

export const getMakPreferencesTabId = (moduleId = "global") => {
  const key = String(moduleId || "global");
  if (typeof window === "undefined") return "server";
  if (!tabIds.has(key)) {
    tabIds.set(key, createTabId());
  }
  return tabIds.get(key);
};

const channels = new Map();

const getBroadcastChannel = (moduleId) => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  const key = String(moduleId || "global");
  if (!channels.has(key)) {
    try {
      channels.set(key, new BroadcastChannel(`${MAK_PREFERENCES_CROSS_TAB_CHANNEL}:${key}`));
    } catch {
      channels.set(key, null);
    }
  }
  return channels.get(key);
};

export const broadcastMakPreferencesCrossTab = ({
  moduleId = "cadastro",
  modulo = null,
  tela = null,
  clienteId = null,
  userId = null,
  revision = null,
  sectionsChanged = [],
  reason = "remote-tab",
} = {}) => {
  const scope = getActiveUserPreferencesScope();
  const remoteTabEvent = `${moduleId}-preferences-remote-tab`;
  const payload = {
    moduleId,
    clienteId: clienteId || scope.clienteId,
    userId: userId || scope.userId,
    modulo: modulo || moduleId,
    tela: tela || "listagem",
    revision,
    sectionsChanged: Array.isArray(sectionsChanged) ? sectionsChanged : [],
    originTabId: getMakPreferencesTabId(moduleId),
    timestamp: new Date().toISOString(),
    reason,
  };

  const channel = getBroadcastChannel(moduleId);
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // ignore
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(remoteTabEvent, { detail: payload }));
  }
};

export const subscribeMakPreferencesCrossTab = (moduleId, listener) => {
  if (typeof window === "undefined" || typeof listener !== "function") {
    return () => {};
  }

  const remoteTabEvent = `${moduleId}-preferences-remote-tab`;

  const handlePayload = (payload = {}) => {
    if (!preferenceEventMatchesScope(payload)) return;
    if (payload.originTabId && payload.originTabId === getMakPreferencesTabId(moduleId)) return;
    listener(payload);
  };

  const onCustomEvent = (event) => handlePayload(event?.detail || {});
  window.addEventListener(remoteTabEvent, onCustomEvent);

  const channel = getBroadcastChannel(moduleId);
  const onChannelMessage = (event) => handlePayload(event?.data || {});
  if (channel) {
    channel.addEventListener("message", onChannelMessage);
  }

  return () => {
    window.removeEventListener(remoteTabEvent, onCustomEvent);
    if (channel) {
      channel.removeEventListener("message", onChannelMessage);
    }
  };
};

export const isRemoteTabPreferenceEvent = (detail = {}) => {
  const reason = String(detail?.reason || "").toLowerCase();
  return reason.includes("remote-tab") || reason.includes("remote-sync");
};
