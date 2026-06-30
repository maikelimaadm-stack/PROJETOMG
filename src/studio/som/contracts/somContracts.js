/** Studio Object Model — official contracts (Program 2.2.6) */

export const STUDIO_OBJECT_MODEL_VERSION = "mak-studio-object-model-v1";

export const OFFICIAL_SOM_ENGINES = Object.freeze([
  "object",
  "property",
  "binding",
  "behavior",
  "identity",
  "package",
]);

export const SOM_OBJECT_KINDS = Object.freeze([
  "artifact",
  "page",
  "section",
  "container",
  "component",
  "field",
  "workflow",
  "dashboard",
  "report",
  "automation",
]);

export const BINDING_KINDS = Object.freeze([
  "field",
  "expression",
  "relationship",
  "formula",
  "dataset",
  "api",
  "ai",
  "entry",
  "reference",
]);

export const BEHAVIOR_TRIGGER_KINDS = Object.freeze([
  "onLoad",
  "onChange",
  "onClick",
  "onSubmit",
  "onValidate",
  "onFocus",
  "onBlur",
  "custom",
]);

export const BEHAVIOR_ACTION_KINDS = Object.freeze([
  "setProperty",
  "runFormula",
  "callApi",
  "navigate",
  "showMessage",
  "emitEvent",
  "runWorkflow",
  "custom",
]);

export default STUDIO_OBJECT_MODEL_VERSION;
