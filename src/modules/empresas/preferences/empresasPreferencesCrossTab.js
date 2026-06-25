import { isEmpresasPreferencesV2Enabled } from "@/modules/empresas/preferences/empresasPreferencesFeatureFlags";
import {
  EMPRESAS_LISTAGEM_MODULO,
  EMPRESAS_LISTAGEM_TELA,
  getActiveUserPreferencesScope,
  preferenceEventMatchesScope,
} from "@/shared/preferences/userPreferencesScope.js";

export const EMP_PREFERENCES_CROSS_TAB_CHANNEL = "mg-emp-preferences-v2";
export const EMP_PREFERENCES_REMOTE_TAB_EVENT = "emp-preferences-remote-tab";

const createTabId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getEmpPreferencesTabId = () => {
  if (typeof window === "undefined") return "server";
  if (!window.__mgEmpPreferencesTabId) {
    window.__mgEmpPreferencesTabId = createTabId();
  }
  return window.__mgEmpPreferencesTabId;
};

let broadcastChannel = null;

const getBroadcastChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(EMP_PREFERENCES_CROSS_TAB_CHANNEL);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
};

export const broadcastEmpPreferencesCrossTab = ({
  clienteId,
  userId,
  revision = null,
  sectionsChanged = [],
  reason = "remote-tab",
} = {}) => {
  if (!isEmpresasPreferencesV2Enabled()) return;
  const scope = getActiveUserPreferencesScope();
  const payload = {
    clienteId: clienteId || scope.clienteId,
    userId: userId || scope.userId,
    modulo: EMPRESAS_LISTAGEM_MODULO,
    tela: EMPRESAS_LISTAGEM_TELA,
    revision,
    sectionsChanged: Array.isArray(sectionsChanged) ? sectionsChanged : [],
    originTabId: getEmpPreferencesTabId(),
    timestamp: new Date().toISOString(),
    reason,
  };

  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // ignore broadcast failures
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EMP_PREFERENCES_REMOTE_TAB_EVENT, { detail: payload }));
  }
};

export const subscribeEmpPreferencesCrossTab = (listener) => {
  if (
    !isEmpresasPreferencesV2Enabled() ||
    typeof window === "undefined" ||
    typeof listener !== "function"
  ) {
    return () => {};
  }

  const handlePayload = (payload = {}) => {
    if (!preferenceEventMatchesScope(payload)) return;
    if (payload.originTabId && payload.originTabId === getEmpPreferencesTabId()) return;
    listener(payload);
  };

  const onCustomEvent = (event) => handlePayload(event?.detail || {});
  window.addEventListener(EMP_PREFERENCES_REMOTE_TAB_EVENT, onCustomEvent);

  const channel = getBroadcastChannel();
  const onChannelMessage = (event) => handlePayload(event?.data || {});
  if (channel) {
    channel.addEventListener("message", onChannelMessage);
  }

  return () => {
    window.removeEventListener(EMP_PREFERENCES_REMOTE_TAB_EVENT, onCustomEvent);
    if (channel) {
      channel.removeEventListener("message", onChannelMessage);
    }
  };
};

export const isRemoteTabPreferenceEvent = (detail = {}) => {
  const reason = String(detail?.reason || "").toLowerCase();
  return reason.includes("remote-tab") || reason.includes("remote-sync");
};
