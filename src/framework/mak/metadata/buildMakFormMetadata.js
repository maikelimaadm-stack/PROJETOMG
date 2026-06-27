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
  storage = null,
}) {
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
    buildDynamicFields,
    mapRecordToForm,
    prepareSubmitPayload,
    validateFormExtra,
    useFormResourcesHook: useFormResourcesHook ?? (() => ({})),
    useRecordFieldsHook: useRecordFieldsHook ?? (() => ({ data: [], isFetched: true })),
    useCustomFieldsHook: useCustomFieldsHook ?? (() => ({ renderCampoPersonalizado: () => null })),
    storage: storage ?? {
      readStoredLaunchPanelStyle: () => null,
      writeStoredLaunchPanelStyle: () => {},
    },
  };
}
