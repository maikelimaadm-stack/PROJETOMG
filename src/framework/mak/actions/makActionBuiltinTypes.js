/**
 * Tipos de ação oficiais e executor declarativo — Actions Configuration Engine.
 */
import { emitMakEvent } from "@/framework/mak/events/makEventBus.js";
import { dispatchModuleEvent } from "@/framework/mak/events/makModuleEvents.js";
import { evaluateMakFormulaNode } from "@/framework/mak/formula/makFormulaBuiltinFunctions.js";
import { runMakFormValidation } from "@/framework/mak/validation/runMakFormValidation.js";
import { runMakFormulaEvaluation } from "@/framework/mak/formula/runMakFormulaEvaluation.js";

export const MAK_ACTION_TYPE_NAMES = Object.freeze([
  "log",
  "emit",
  "dispatch",
  "setField",
  "setFields",
  "clearField",
  "computeField",
  "save",
  "duplicate",
  "delete",
  "refresh",
  "openDialog",
  "closeDialog",
  "openDrawer",
  "closeDrawer",
  "navigate",
  "validate",
  "calculateFormula",
  "executeApi",
  "executeCallback",
  "executeService",
  "runAction",
  "sequence",
  "parallel",
  "when",
  "delay",
  "rollback",
  "chain",
  "preventDefault",
  "stopPropagation",
  "noop",
]);

function resolveFieldValue(formData, field) {
  if (!field) return undefined;
  if (field.startsWith("campos_personalizados.")) {
    const key = field.replace("campos_personalizados.", "");
    return formData?.campos_personalizados?.[key];
  }
  return formData?.[field];
}

export function evaluateMakActionCondition(condition, context = {}) {
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

function applyFieldPatch(patch, formData, field, value) {
  if (field.startsWith("campos_personalizados.")) {
    const key = field.replace("campos_personalizados.", "");
    patch.campos_personalizados = {
      ...(patch.campos_personalizados ?? formData.campos_personalizados ?? {}),
      [key]: value,
    };
  } else {
    patch[field] = value;
  }
}

export async function executeMakAction(actionDef, context = {}, executor = null) {
  if (!actionDef) return { ok: true };

  const action = actionDef.action ?? actionDef.type ?? "noop";
  const {
    moduleId,
    formData = {},
    setFormData,
    patch = {},
    signal = {},
    ui = {},
    services = {},
    actionRegistry = {},
    runNestedAction = null,
  } = context;

  const nested = executor ?? runNestedAction ?? ((def, ctx) => executeMakAction(def, ctx, executor));

  switch (action) {
    case "log": {
      const level = actionDef.level ?? "info";
      const message = actionDef.message ?? `[${moduleId}] action`;
      if (typeof console[level] === "function") {
        console[level](message, actionDef.payload ?? context.meta ?? {});
      }
      return { ok: true, telemetry: { type: "log", message } };
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
      const suffix = actionDef.suffix ?? actionDef.event ?? "action-fired";
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
      applyFieldPatch(patch, formData, field, value);
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
    case "setFields": {
      const fields = actionDef.fields ?? actionDef.updates ?? [];
      fields.forEach((entry) => {
        const field = entry.field ?? entry.name;
        if (!field) return;
        const value =
          entry.value !== undefined
            ? entry.value
            : entry.fromField
              ? resolveFieldValue(formData, entry.fromField)
              : entry.expression
                ? evaluateMakFormulaNode(entry.expression, formData)
                : "";
        applyFieldPatch(patch, formData, field, value);
      });
      return { ok: true, patch: { ...patch } };
    }
    case "clearField":
      return nested(
        { action: "setField", field: actionDef.field, value: actionDef.value ?? "" },
        context
      );
    case "computeField":
      return nested(
        {
          action: "setField",
          field: actionDef.field,
          expression: actionDef.expression,
          applyImmediately: actionDef.applyImmediately,
        },
        context
      );
    case "save": {
      if (typeof ui.submit === "function") {
        await ui.submit(actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "submit-unavailable" };
    }
    case "duplicate": {
      if (typeof ui.duplicate === "function") {
        ui.duplicate(actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "duplicate-unavailable" };
    }
    case "delete": {
      if (typeof ui.deleteRecord === "function") {
        await ui.deleteRecord(actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "delete-unavailable" };
    }
    case "refresh": {
      if (typeof ui.refresh === "function") {
        ui.refresh(actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "refresh-unavailable" };
    }
    case "openDialog": {
      const dialogId = actionDef.dialogId ?? actionDef.target ?? "default";
      if (typeof ui.openDialog === "function") {
        ui.openDialog(dialogId, actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "openDialog-unavailable" };
    }
    case "closeDialog": {
      const dialogId = actionDef.dialogId ?? actionDef.target ?? "default";
      if (typeof ui.closeDialog === "function") {
        ui.closeDialog(dialogId, actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "closeDialog-unavailable" };
    }
    case "openDrawer":
    case "closeDrawer": {
      const drawerId = actionDef.drawerId ?? actionDef.target ?? "default";
      const fn = action === "openDrawer" ? ui.openDrawer : ui.closeDrawer;
      if (typeof fn === "function") {
        fn(drawerId, actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: `${action}-unavailable` };
    }
    case "navigate": {
      if (typeof ui.navigate === "function") {
        ui.navigate(actionDef.target, actionDef.parameters ?? actionDef.payload);
        return { ok: true };
      }
      return { ok: false, reason: "navigate-unavailable" };
    }
    case "validate": {
      if (typeof context.runValidation === "function") {
        const result = context.runValidation(actionDef.parameters);
        return { ok: result?.valid !== false, result };
      }
      if (actionDef.fieldDefinitions) {
        const result = runMakFormValidation({
          formData,
          fieldDefinitions: actionDef.fieldDefinitions,
          schema: actionDef.schema ?? context.schema,
          ...actionDef.parameters,
        });
        return { ok: result.valid, result };
      }
      return { ok: true, skipped: true };
    }
    case "calculateFormula": {
      const result = runMakFormulaEvaluation({
        formData,
        fieldDefinitions: actionDef.fieldDefinitions ?? context.fieldDefinitions ?? [],
        customFields: actionDef.customFields ?? context.customFields ?? [],
        ...actionDef.parameters,
      });
      Object.entries(result.values ?? {}).forEach(([key, value]) => {
        applyFieldPatch(patch, formData, key, value);
      });
      return { ok: true, result, patch: { ...patch } };
    }
    case "executeApi": {
      if (actionDef.mock === true) {
        const response = actionDef.response ?? { ok: true, mock: true };
        if (actionDef.target) {
          applyFieldPatch(patch, formData, actionDef.target, response);
        }
        return { ok: true, response, patch: { ...patch } };
      }
      const client = services.apiClient ?? context.apiClient;
      if (typeof client !== "function" && typeof fetch !== "function") {
        return { ok: false, reason: "api-unavailable" };
      }
      const method = (actionDef.method ?? "GET").toUpperCase();
      const url = actionDef.url ?? actionDef.endpoint;
      if (!url) return { ok: false, reason: "missing-url" };
      try {
        let response;
        if (typeof client === "function") {
          response = await client({ method, url, body: actionDef.body ?? actionDef.payload });
        } else {
          const res = await fetch(url, {
            method,
            headers: actionDef.headers ?? { "Content-Type": "application/json" },
            body: method === "GET" ? undefined : JSON.stringify(actionDef.body ?? actionDef.payload ?? {}),
          });
          response = await res.json().catch(() => ({}));
        }
        if (actionDef.target) {
          applyFieldPatch(patch, formData, actionDef.target, response);
        }
        return { ok: true, response, patch: { ...patch } };
      } catch (error) {
        return { ok: false, error: error?.message ?? "api-failed" };
      }
    }
    case "executeCallback": {
      const name = actionDef.name ?? actionDef.callback;
      const fn = services[name] ?? context[name];
      if (typeof fn !== "function") return { ok: false, reason: "callback-unavailable" };
      const response = await fn(actionDef.parameters ?? actionDef.payload, context);
      return { ok: true, response };
    }
    case "executeService": {
      const name = actionDef.service ?? actionDef.name;
      const fn = services[name] ?? context.services?.[name];
      if (typeof fn !== "function") return { ok: false, reason: "service-unavailable" };
      const response = await fn(actionDef.parameters ?? actionDef.payload, context);
      return { ok: true, response };
    }
    case "runAction": {
      const actionId = actionDef.actionId ?? actionDef.id ?? actionDef.target;
      const registered = actionRegistry[actionId] ?? actionRegistry.get?.(actionId);
      if (!registered) return { ok: false, reason: "action-not-found" };
      return nested(registered, context);
    }
    case "delay": {
      const ms = Number(actionDef.delay ?? actionDef.ms ?? 0);
      if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
      return { ok: true };
    }
    case "when": {
      const branch = evaluateMakActionCondition(actionDef.when ?? actionDef.condition, context)
        ? actionDef.then ?? actionDef.actions
        : actionDef.else ?? [];
      const list = Array.isArray(branch) ? branch : [branch];
      const results = [];
      for (const item of list) {
        if (signal.cancelled || signal.stopped) break;
        results.push(await nested(item, context));
      }
      return { ok: true, results };
    }
    case "sequence":
    case "chain": {
      const list = actionDef.actions ?? actionDef.handlers ?? actionDef.sequence ?? [];
      const results = [];
      const rollbackStack = context.rollbackStack ?? [];
      for (const item of list) {
        if (signal.cancelled || signal.stopped) break;
        const result = await nested(item, context);
        results.push(result);
        if (item.rollback || actionDef.collectRollback) {
          rollbackStack.push(item.rollback ?? item);
        }
        if (result?.ok === false && !actionDef.continueOnError) {
          if (actionDef.rollback) {
            const rollbackList = Array.isArray(actionDef.rollback) ? actionDef.rollback : [actionDef.rollback];
            for (const rb of [...rollbackList].reverse()) {
              results.push(await nested(rb, context));
            }
          }
          return { ok: false, results, rollbackApplied: Boolean(actionDef.rollback) };
        }
      }
      return { ok: results.every((r) => r?.ok !== false), results, rollbackStack };
    }
    case "parallel": {
      const list = actionDef.actions ?? actionDef.parallel ?? [];
      const results = await Promise.all(
        list.map((item) => nested(item, { ...context, patch: { ...patch } }))
      );
      return { ok: results.every((r) => r?.ok !== false), results };
    }
    case "rollback": {
      const stack = context.rollbackStack ?? actionDef.rollback ?? [];
      const list = Array.isArray(stack) ? stack : [stack];
      const results = [];
      for (const item of [...list].reverse()) {
        results.push(await nested(item, context));
      }
      return { ok: true, results };
    }
    case "preventDefault":
      signal.cancelled = true;
      return { ok: true, cancelled: true };
    case "stopPropagation":
      signal.stopped = true;
      return { ok: true, stopped: true };
    case "noop":
    default:
      return { ok: true };
  }
}

export default {
  MAK_ACTION_TYPE_NAMES,
  evaluateMakActionCondition,
  executeMakAction,
};
