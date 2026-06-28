/**
 * Eventos oficiais — delega execução de ações à Actions Configuration Engine.
 */
import {
  evaluateMakActionCondition,
  executeMakAction,
  MAK_ACTION_TYPE_NAMES,
} from "@/framework/mak/actions/makActionBuiltinTypes.js";

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

export const MAK_EVENT_ACTION_NAMES = MAK_ACTION_TYPE_NAMES;

export function evaluateMakEventCondition(condition, context = {}) {
  return evaluateMakActionCondition(condition, context);
}

export async function executeMakEventAction(actionDef, context = {}) {
  return executeMakAction(actionDef, context);
}

export default {
  MAK_EVENT_NAMES,
  MAK_EVENT_ACTION_NAMES,
  evaluateMakEventCondition,
  executeMakEventAction,
};
