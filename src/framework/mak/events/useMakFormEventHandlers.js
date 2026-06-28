/**
 * Hook — lifecycle e handlers declarativos via Events Configuration Engine.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { runMakFormEvents, clearMakFormEventRuntimeState } from "./runMakFormEvents.js";
import { normalizeMakActionDefinitions } from "@/framework/mak/actions/buildMakActionConfigMetadata.js";

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
  actionDefinitions = [],
  actions = null,
  formData,
  setFormData,
  recordKey,
  isEditing,
  ui = {},
  services = {},
  fieldDefinitions = [],
  schema = null,
  customFields = [],
  runValidation = null,
  enabled = true,
}) {
  const loadSignatureRef = useRef("");

  const actionRegistry = useMemo(() => {
    const registry = {};
    normalizeMakActionDefinitions(
      actionDefinitions.length ? actionDefinitions : actions ?? []
    ).forEach((def) => {
      if (def?.id) registry[def.id] = def;
    });
    return registry;
  }, [actionDefinitions, actions]);

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
          ui,
          services,
          fieldDefinitions,
          schema,
          customFields,
          runValidation,
          actionRegistry,
          ...context,
        },
        options: { async: true },
      });

      if (result.patch && Object.keys(result.patch).length) {
        applyEventPatch(setFormData, result.patch);
      }

      return result;
    },
    [enabled, moduleId, eventDefinitions, events, formData, setFormData, recordKey, isEditing, ui, services, fieldDefinitions, schema, customFields, runValidation, actionRegistry]
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
