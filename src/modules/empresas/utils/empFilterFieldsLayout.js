import {
  readEmpPreferencesJson,
  writeEmpPreferencesJson,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import { dispatchModuleEvent } from "@/framework/mak/events/makModuleEvents.js";
import { createMakFilterFieldsLayoutStorage } from "@/framework/mak/filters/createMakFilterFieldsLayoutStorage.js";

export const EMP_FILTER_FIELDS_LAYOUT_KEY = "emp_filter_fields_layout_v1";

const empFilterFieldsLayout = createMakFilterFieldsLayoutStorage({
  storageKey: EMP_FILTER_FIELDS_LAYOUT_KEY,
  moduleId: "empresas",
  readJson: readEmpPreferencesJson,
  writeJson: writeEmpPreferencesJson,
  dispatchEvent: dispatchModuleEvent,
});

export const mergeSavedFilterFieldOrder = empFilterFieldsLayout.mergeSavedFilterFieldOrder;
export const mergeSavedVisibleFilterFields = empFilterFieldsLayout.mergeSavedVisibleFilterFields;
export const mergeVisibleFilterFieldsWithCatalog = empFilterFieldsLayout.mergeVisibleFilterFieldsWithCatalog;
export const loadFilterFieldsLayout = empFilterFieldsLayout.loadFilterFieldsLayout;
export const saveFilterFieldsLayout = empFilterFieldsLayout.saveFilterFieldsLayout;
export const applyFilterFieldsLayout = empFilterFieldsLayout.applyFilterFieldsLayout;
export const getDefaultFilterFieldsLayout = empFilterFieldsLayout.getDefaultFilterFieldsLayout;
