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
    applyDuplicateFieldClears: (data) => data,
    useRecordFieldsHook: () => ({ data: [], isFetched: true }),
    useCustomFieldsHook: () => ({ renderCampoPersonalizado: () => null }),
    storage: {
      readStoredLaunchPanelStyle: () => null,
      writeStoredLaunchPanelStyle: () => {},
    },
  };
}
