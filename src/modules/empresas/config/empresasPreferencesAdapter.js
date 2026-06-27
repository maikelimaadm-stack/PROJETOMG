/**
 * Adapter de preferências Empresas para o MakPreferencesEngine genérico.
 */
import {
  emitEmpPreferencesCacheUpdate,
  readEmpPreferencesJson,
  readEmpPreferencesText,
  removeEmpPreferencesKey,
  subscribeEmpPreferencesCache,
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { markEmpPreferencesPerf } from "@/modules/empresas/preferences/empresasPreferencesPerfMarks";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";

export const empresasPreferencesAdapter = {
  moduleId: "empresas",
  keyPrefix: "emp",
  readJson: readEmpPreferencesJson,
  readText: readEmpPreferencesText,
  writeText: writeEmpPreferencesText,
  writeJson: writeEmpPreferencesJson,
  removeKey: removeEmpPreferencesKey,
  subscribe: subscribeEmpPreferencesCache,
  isSectionDirty: isEmpPreferencesSectionDirty,
  bootstrapAppliedEvent: EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT,
  markPerf: markEmpPreferencesPerf,
  emitCacheUpdate: emitEmpPreferencesCacheUpdate,
};
