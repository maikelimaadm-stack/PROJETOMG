/**
 * Contrato HTTP da History Engine — aguardando backend.
 * Endpoint esperado:
 *   GET /api/audit/:entityName/:recordId
 */
import { createMakHistoryNoopBackendAdapter } from "@/framework/mak/history/index.js";

export function createMakHistoryHttpAdapter({ basePath = "/api/audit" } = {}) {
  const noop = createMakHistoryNoopBackendAdapter();
  return Object.freeze({
    ...noop,
    adapterId: "http",
    basePath,
    isAvailable: () => false,
  });
}

export default createMakHistoryHttpAdapter;
