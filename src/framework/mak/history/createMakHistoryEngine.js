import { MAK_HISTORY_BACKEND_PENDING_CODE } from "./makHistory.constants.js";
import { dispatchMakHistoryEvent, MAK_HISTORY_EVENTS } from "./makHistoryEvents.js";
import { getMakHistoryModuleConfig } from "./makHistoryRegistry.js";
import { createMakHistoryNoopBackendAdapter } from "./createMakHistoryBackendAdapter.js";

const normalizeEntry = (entry = {}) => ({
  id: entry.id ?? entry.audit_id ?? null,
  action: entry.action ?? entry.event ?? "update",
  timestamp: entry.timestamp ?? entry.created_at ?? entry.createdAt ?? null,
  userName: entry.userName ?? entry.usuario ?? entry.user ?? null,
  summary: entry.summary ?? entry.description ?? entry.message ?? "",
  payload: entry.payload ?? null,
});

/**
 * History Engine — Foundation MAK.
 * Escrita de auditoria permanece no backend; leitura isolada em adapter.
 */
export function createMakHistoryEngine({
  moduleId,
  entityName = null,
  metadata = {},
  backendAdapter = null,
} = {}) {
  const id = String(moduleId || "cadastro").trim();
  const adapter = backendAdapter ?? createMakHistoryNoopBackendAdapter();
  const config = { moduleId: id, entityName, ...metadata };

  return Object.freeze({
    moduleId: id,
    entityName,
    metadata: config,
    adapter,
    isBackendAvailable: () => Boolean(adapter?.isAvailable?.()),

    async fetchHistory(params = {}) {
      const query = {
        moduleId: id,
        entityName: params.entityName ?? entityName,
        recordId: params.recordId ?? null,
        recordCode: params.recordCode ?? null,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? config.pageSize ?? 50,
      };

      dispatchMakHistoryEvent(id, MAK_HISTORY_EVENTS.OPENED, query);

      if (!adapter.isAvailable()) {
        const error = new Error("Backend de histórico indisponível.");
        error.code = MAK_HISTORY_BACKEND_PENDING_CODE;
        dispatchMakHistoryEvent(id, MAK_HISTORY_EVENTS.FAILED, { error: error.message, query });
        return {
          entries: [],
          backendPending: true,
          meta: { reason: "backend_pending", query },
        };
      }

      try {
        const response = await adapter.fetchHistory(query);
        const entries = (response?.entries ?? []).map(normalizeEntry);
        dispatchMakHistoryEvent(id, MAK_HISTORY_EVENTS.LOADED, { count: entries.length, query });
        return {
          entries,
          backendPending: false,
          meta: response?.meta ?? { query },
        };
      } catch (error) {
        dispatchMakHistoryEvent(id, MAK_HISTORY_EVENTS.FAILED, { error: error?.message, query });
        throw error;
      }
    },

    resolveModuleConfig: () => getMakHistoryModuleConfig(id) ?? config,
  });
}

export default createMakHistoryEngine;
