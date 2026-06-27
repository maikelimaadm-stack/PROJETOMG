import { readPreferencesJson, writePreferencesJson } from "@/framework/mak/preferences/userPreferencesCache.js";
import { MAK_IMPORT_STORAGE_PREFIX } from "./makImport.constants.js";

const buildStorageKey = (moduleId) => `${MAK_IMPORT_STORAGE_PREFIX}:${String(moduleId || "cadastro").trim()}`;

export function readMakImportDraft(moduleId) {
  return readPreferencesJson(buildStorageKey(moduleId), null);
}

export function writeMakImportDraft(moduleId, draft, reason = "import:draft") {
  writePreferencesJson(buildStorageKey(moduleId), draft ?? null, { reason });
}

export function clearMakImportDraft(moduleId) {
  writeMakImportDraft(moduleId, null, "import:reset");
}
