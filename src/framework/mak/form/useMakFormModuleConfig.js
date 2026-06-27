import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";

/**
 * Config declarativa de formulário via runtime do módulo (sem imports Empresas na Foundation).
 */
export function useMakFormModuleConfig() {
  const module = useMakModuleRequired();
  const form = module.metadata?.form ?? {};
  const prefs = module.preferences;

  if (!prefs) {
    throw new Error("useMakFormModuleConfig: module.preferences engine is required");
  }

  return {
    moduleId: module.moduleId,
    repository: module.repository,
    schema: module.schema,
    cadastroConfig: module.cadastroConfig,
    form,
    prefs,
    readJson: prefs.readJson.bind(prefs),
    readText: prefs.readText.bind(prefs),
    writeJson: prefs.writeJson.bind(prefs),
    writeText: prefs.writeText.bind(prefs),
    estados: form.estados ?? [],
    upperFields: form.upperFields ?? [],
    requiredFields: form.requiredFields ?? [],
    nativeFields: form.nativeFields ?? new Set(),
    inputClass: form.inputClass ?? "",
    basePanels: form.basePanels ?? [],
    defaultLayout: form.defaultLayout ?? {},
    buildDefaultConfig: form.buildDefaultConfig ?? (() => ({})),
    buildEmptyRecord: form.buildEmptyRecord ?? (() => ({})),
    applyDuplicateFieldClears: form.applyDuplicateFieldClears ?? ((data) => data),
    buildDynamicFields: form.buildDynamicFields ?? null,
    mapRecordToForm: form.mapRecordToForm ?? null,
    prepareSubmitPayload: form.prepareSubmitPayload ?? null,
    validateFormExtra: form.validateFormExtra ?? null,
    useFormResourcesHook: form.useFormResourcesHook ?? (() => ({})),
    useRecordFieldsHook: form.useRecordFieldsHook ?? (() => ({ data: [], isFetched: true })),
    useCustomFieldsHook: form.useCustomFieldsHook ?? (() => ({ renderCampoPersonalizado: () => null })),
    readStoredLaunchPanelStyle: form.storage?.readStoredLaunchPanelStyle ?? (() => null),
    writeStoredLaunchPanelStyle: form.storage?.writeStoredLaunchPanelStyle ?? (() => {}),
  };
}
