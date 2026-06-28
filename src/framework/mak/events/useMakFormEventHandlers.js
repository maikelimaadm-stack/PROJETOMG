/**
 * Hook — lifecycle e handlers declarativos via Events Configuration Engine.
 */
import { useCallback, useEffect, useRef } from "react";
import { runMakFormEvents, clearMakFormEventRuntimeState } from "./runMakFormEvents.js";

function applyEventPatch(setFormData, patch = {}) {
  if (!patch || !Object.keys(patch).length) return;
  setFormData((prev) => ({
    ...prev,
    ...patch,
    campos_personalizados: {
      ...(prev.campos_personalizados || {}),
      ...(patch.campos_personalizados || {}),
    },
  }));
}

export function useMakFormEventHandlers({
  moduleId,
  eventDefinitions = [],
  events = null,
  formData,
  setFormData,
  recordKey,
  isEditing,
  enabled = true,
}) {
  const loadSignatureRef = useRef("");

  const dispatchFormEvent = useCallback(
    async (event, context = {}) => {
      if (!enabled || !moduleId) {
        return { executed: 0, cancelled: false, stopped: false, results: [], patch: {} };
      }

      const result = await runMakFormEvents({
        event,
        moduleId,
        eventDefinitions,
        events,
        context: {
          formData,
          setFormData,
          recordKey,
          isEditing,
          ...context,
        },
        options: { async: true },
      });

      if (result.patch && Object.keys(result.patch).length) {
        applyEventPatch(setFormData, result.patch);
      }

      return result;
    },
    [enabled, moduleId, eventDefinitions, events, formData, setFormData, recordKey, isEditing]
  );

  useEffect(() => {
    if (!enabled || !moduleId) return undefined;

    const signature = [recordKey ?? "", isEditing ? "edit" : "new", formData?.id ?? ""].join("|");
    if (loadSignatureRef.current === signature) return undefined;
    loadSignatureRef.current = signature;

    dispatchFormEvent("onBeforeLoad", { meta: { phase: "before" } });
    dispatchFormEvent("onLoad", { meta: { phase: "load" } });
    dispatchFormEvent("onAfterLoad", { meta: { phase: "after" } });
    dispatchFormEvent("onReady", { meta: { phase: "ready" } });

    return undefined;
  }, [enabled, moduleId, recordKey, isEditing, formData?.id, dispatchFormEvent]);

  useEffect(() => {
    if (!enabled || !moduleId) return undefined;
    dispatchFormEvent("onMount", { meta: { phase: "mount" } });
    return () => {
      dispatchFormEvent("onUnmount", { meta: { phase: "unmount" } });
      clearMakFormEventRuntimeState(moduleId);
    };
  }, [enabled, moduleId, dispatchFormEvent]);

  return { dispatchFormEvent };
}

export default useMakFormEventHandlers;
