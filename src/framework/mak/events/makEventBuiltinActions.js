/**
 * Eventos oficiais e ações built-in da Events Configuration Engine.
 */
import { emitMakEvent } from "./makEventBus.js";
import { dispatchModuleEvent } from "./makModuleEvents.js";
import { evaluateMakFormulaNode } from "@/framework/mak/formula/makFormulaBuiltinFunctions.js";

export const MAK_EVENT_NAMES = Object.freeze([
  "onLoad",
  "onBeforeLoad",
  "onAfterLoad",
  "onInit",
  "onReady",
  "onMount",
  "onUnmount",
  "onOpen",
  "onClose",
  "onSearch",
  "onLookup",
  "onFocus",
  "onBlur",
  "onChange",
  "onInput",
  "onClick",
  "onSelect",
  "onCreate",
  "onSave",
  "onBeforeSave",
  "onAfterSave",
  "onDelete",
  "onBeforeDelete",
  "onAfterDelete",
  "onDuplicate",
  "onValidate",
  "onSubmit",
  "onRefresh",
  "onImport",
  "onExport",
  "onLogin",
  "onLogout",
  "onCompanyChange",
  "onPreferencesLoaded",
  "onPreferencesSaved",
  "onLayoutChanged",
  "onFormulaCalculated",
  "onValidationCompleted",
]);

export const MAK_EVENT_ACTION_NAMES = Object.freeze([
  "log",
  "emit",
  "dispatch",
  "setField",
  "clearField",
  "computeField",
  "chain",
  "noop",
  "preventDefault",
  "stopPropagation",
]);

function resolveFieldValue(formData, field) {
  if (!field) return undefined;
  if (field.startsWith("campos_personalizados.")) {
    const key = field.replace("campos_personalizados.", "");
    return formData?.campos_personalizados?.[key];
  }
  return formData?.[field];
}

export function evaluateMakEventCondition(condition, context = {}) {
  if (!condition) return true;
  const { formData = {} } = context;

  if (typeof condition === "boolean") return condition;
  if (typeof condition === "function") {
    try {
      return Boolean(condition(context));
    } catch {
      return false;
    }
  }

  if (condition.fn || condition.expression) {
    try {
      const node = condition.fn ? condition : condition.expression;
      return Boolean(evaluateMakFormulaNode(node, formData));
    } catch {
      return false;
    }
  }

  const { field, equals, notEquals, gt, lt, in: inList, empty, notEmpty } = condition;
  const value = resolveFieldValue(formData, field);

  if (empty === true) return value == null || value === "";
  if (notEmpty === true) return value != null && value !== "";
  if (equals !== undefined) return value === equals;
  if (notEquals !== undefined) return value !== notEquals;
  if (gt !== undefined) return Number(value) > Number(gt);
  if (lt !== undefined) return Number(value) < Number(lt);
  if (Array.isArray(inList)) return inList.includes(value);

  return true;
}

export async function executeMakEventAction(actionDef, context = {}) {
  if (!actionDef) return { ok: true };

  const action = actionDef.action ?? actionDef.type ?? "noop";
  const {
    moduleId,
    formData = {},
    setFormData,
    patch = {},
    signal = {},
  } = context;

  switch (action) {
    case "log": {
      const level = actionDef.level ?? "info";
      const message = actionDef.message ?? `[${moduleId}] event`;
      if (typeof console[level] === "function") {
        console[level](message, actionDef.payload ?? context.meta ?? {});
      }
      return { ok: true };
    }
    case "emit": {
      const eventName = actionDef.event ?? actionDef.name;
      if (eventName) {
        emitMakEvent(eventName, {
          moduleId,
          formData,
          ...(actionDef.payload ?? {}),
          ...(context.meta ?? {}),
        });
      }
      return { ok: true };
    }
    case "dispatch": {
      const suffix = actionDef.suffix ?? actionDef.event ?? "event-fired";
      dispatchModuleEvent(moduleId, suffix, {
        formData,
        ...(actionDef.payload ?? {}),
        ...(context.meta ?? {}),
      });
      return { ok: true };
    }
    case "setField": {
      const field = actionDef.field;
      if (!field) return { ok: false, reason: "missing-field" };
      const value =
        actionDef.value !== undefined
          ? actionDef.value
          : actionDef.fromField
            ? resolveFieldValue(formData, actionDef.fromField)
            : actionDef.expression
              ? evaluateMakFormulaNode(actionDef.expression, formData)
              : "";
      if (field.startsWith("campos_personalizados.")) {
        const key = field.replace("campos_personalizados.", "");
        patch.campos_personalizados = {
          ...(patch.campos_personalizados ?? formData.campos_personalizados ?? {}),
          [key]: value,
        };
      } else {
        patch[field] = value;
      }
      if (typeof setFormData === "function" && actionDef.applyImmediately) {
        setFormData((prev) => ({
          ...prev,
          ...patch,
          campos_personalizados: {
            ...(prev.campos_personalizados || {}),
            ...(patch.campos_personalizados || {}),
          },
        }));
      }
      return { ok: true, patch: { ...patch } };
    }
    case "clearField": {
      return executeMakEventAction(
        { action: "setField", field: actionDef.field, value: actionDef.value ?? "" },
        context
      );
    }
    case "computeField": {
      return executeMakEventAction(
        {
          action: "setField",
          field: actionDef.field,
          expression: actionDef.expression,
          applyImmediately: actionDef.applyImmediately,
        },
        context
      );
    }
    case "chain": {
      const nested = actionDef.handlers ?? actionDef.actions ?? [];
      const results = [];
      for (const nestedAction of nested) {
        if (signal.cancelled || signal.stopped) break;
        const result = await executeMakEventAction(nestedAction, context);
        results.push(result);
      }
      return { ok: true, results };
    }
    case "preventDefault": {
      signal.cancelled = true;
      return { ok: true, cancelled: true };
    }
    case "stopPropagation": {
      signal.stopped = true;
      return { ok: true, stopped: true };
    }
    case "noop":
    default:
      return { ok: true };
  }
}

export default {
  MAK_EVENT_NAMES,
  MAK_EVENT_ACTION_NAMES,
  evaluateMakEventCondition,
  executeMakEventAction,
};
