/**
 * Contrato HTTP da Import Engine — aguardando backend.
 * Endpoints esperados:
 *   POST /api/cadastro/:moduleId/import/preview
 *   POST /api/cadastro/:moduleId/import/execute
 *   GET  /api/cadastro/:moduleId/import/jobs/:jobId
 */
import { createMakImportNoopBackendAdapter } from "@/framework/mak/import/index.js";

export function createMakImportHttpAdapter({ basePath = "/api/cadastro" } = {}) {
  const noop = createMakImportNoopBackendAdapter();
  return Object.freeze({
    ...noop,
    adapterId: "http",
    basePath,
    isAvailable: () => false,
  });
}

export default createMakImportHttpAdapter;
