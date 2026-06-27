import {
  MAK_IMPORT_BACKEND_PENDING_CODE,
  MAK_IMPORT_STATUS,
} from "./makImport.constants.js";
import { dispatchMakImportEvent, MAK_IMPORT_EVENTS } from "./makImportEvents.js";
import { getMakImportModuleConfig } from "./makImportRegistry.js";
import {
  clearMakImportDraft,
  readMakImportDraft,
  writeMakImportDraft,
} from "./makImportStorage.js";
import { createMakImportNoopBackendAdapter } from "./createMakImportBackendAdapter.js";

const normalizeColumns = (columns = []) =>
  (Array.isArray(columns) ? columns : []).map((column) => String(column || "").trim()).filter(Boolean);

/**
 * Import Engine — Foundation MAK.
 * Backend isolado em adapter; engine conclui parsing/mapeamento/validação local.
 */
export function createMakImportEngine({
  moduleId,
  metadata = {},
  backendAdapter = null,
} = {}) {
  const id = String(moduleId || "cadastro").trim();
  const adapter = backendAdapter ?? createMakImportNoopBackendAdapter();
  const config = { moduleId: id, ...metadata };

  const parseCsvPreview = (text, maxRows = 5) => {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return { columns: [], rows: [] };
    const columns = lines[0].split(/[,;|\t]/).map((cell) => cell.trim());
    const rows = lines.slice(1, maxRows + 1).map((line) => {
      const cells = line.split(/[,;|\t]/);
      return columns.reduce((acc, column, index) => {
        acc[column] = cells[index]?.trim() ?? "";
        return acc;
      }, {});
    });
    return { columns, rows };
  };

  const validateMapping = (mapping = {}, requiredColumns = []) => {
    const required = normalizeColumns(requiredColumns.length ? requiredColumns : config.requiredColumns);
    const missing = required.filter((column) => !mapping[column]);
    return {
      valid: missing.length === 0,
      missing,
    };
  };

  return Object.freeze({
    moduleId: id,
    metadata: config,
    adapter,
    isBackendAvailable: () => Boolean(adapter?.isAvailable?.()),

    readDraft: () => readMakImportDraft(id),
    writeDraft: (draft) => writeMakImportDraft(id, draft),
    clearDraft: () => clearMakImportDraft(id),

    parsePreview: (fileText, options = {}) => {
      const preview = parseCsvPreview(fileText, options.maxRows ?? 5);
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.PARSED, { preview });
      return preview;
    },

    validateMapping: (mapping) => validateMapping(mapping, config.requiredColumns),

    async previewImport(payload = {}) {
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.STARTED, payload);
      if (!adapter.isAvailable()) {
        const error = new Error("Backend de importação indisponível.");
        error.code = MAK_IMPORT_BACKEND_PENDING_CODE;
        dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.FAILED, { error: error.message });
        throw error;
      }
      const result = await adapter.previewImport({ moduleId: id, ...payload });
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.VALIDATED, result);
      return result;
    },

    async executeImport(payload = {}) {
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.SUBMITTED, payload);
      if (!adapter.isAvailable()) {
        const error = new Error("Backend de importação indisponível.");
        error.code = MAK_IMPORT_BACKEND_PENDING_CODE;
        dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.FAILED, { error: error.message });
        throw error;
      }
      const result = await adapter.executeImport({ moduleId: id, ...payload });
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.COMPLETED, result);
      clearMakImportDraft(id);
      return result;
    },

    reset: () => {
      clearMakImportDraft(id);
      dispatchMakImportEvent(id, MAK_IMPORT_EVENTS.RESET);
      return { status: MAK_IMPORT_STATUS.IDLE };
    },

    resolveModuleConfig: () => getMakImportModuleConfig(id) ?? config,
  });
}

export default createMakImportEngine;
