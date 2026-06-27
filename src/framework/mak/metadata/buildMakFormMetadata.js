import { createMakLaunchPanelStyleStorage } from "@/framework/mak/preferences/createMakLaunchPanelStyleStorage.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";

/**
 * Constrói metadata declarativa de formulário MAK.
 */
export function buildMakFormMetadata({
  basePanels,
  defaultLayout,
  buildEmptyRecord,
  buildDefaultConfig,
  requiredFields = [],
  upperFields = [],
  nativeFields = [],
  inputClass = "border-0 shadow-none focus-visible:ring-0 bg-white w-full",
  applyDuplicateFieldClears,
  buildDynamicFields = null,
  mapRecordToForm = null,
  prepareSubmitPayload = null,
  validateFormExtra = null,
  useFormResourcesHook = null,
  useRecordFieldsHook = null,
  useCustomFieldsHook = null,
  fieldDefinitions = null,
  storage = null,
  keyPrefix = null,
  moduleId = null,
}) {
  const launchPanelStorage =
    storage?.readStoredLaunchPanelStyle && storage?.writeStoredLaunchPanelStyle
      ? storage
      : keyPrefix
        ? createMakLaunchPanelStyleStorage({ keyPrefix, moduleId: moduleId ?? keyPrefix })
        : null;

  return {
    basePanels,
    defaultLayout,
    buildEmptyRecord,
    buildDefaultConfig,
    requiredFields,
    upperFields,
    nativeFields: nativeFields instanceof Set ? nativeFields : new Set(nativeFields),
    inputClass,
    estados: [],
    applyDuplicateFieldClears: applyDuplicateFieldClears ?? ((data) => data),
    fieldDefinitions: Array.isArray(fieldDefinitions) ? fieldDefinitions : [],
    buildDynamicFields:
      buildDynamicFields ??
      (Array.isArray(fieldDefinitions) && fieldDefinitions.length
        ? buildMakDynamicFieldsFromMetadata(fieldDefinitions)
        : null),
    mapRecordToForm,
    prepareSubmitPayload,
    validateFormExtra,
    useFormResourcesHook: useFormResourcesHook ?? (() => ({})),
    useRecordFieldsHook: useRecordFieldsHook ?? (() => ({ data: [], isFetched: true })),
    useCustomFieldsHook: useCustomFieldsHook ?? (() => ({ renderCampoPersonalizado: () => null })),
    storage: launchPanelStorage ?? {
      readStoredLaunchPanelStyle: () => null,
      writeStoredLaunchPanelStyle: () => {},
    },
  };
}
