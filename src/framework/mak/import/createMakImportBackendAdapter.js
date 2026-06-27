import { MAK_IMPORT_BACKEND_PENDING_CODE } from "./makImport.constants.js";

const backendPendingError = () => {
  const error = new Error("Integração de importação aguardando backend.");
  error.code = MAK_IMPORT_BACKEND_PENDING_CODE;
  error.status = 501;
  return error;
};

/**
 * Adapter noop — isolamento da dependência de backend.
 * Substituir por adapter HTTP quando API estiver disponível.
 */
export function createMakImportNoopBackendAdapter() {
  return Object.freeze({
    adapterId: "noop",
    isAvailable: () => false,
    async previewImport() {
      throw backendPendingError();
    },
    async executeImport() {
      throw backendPendingError();
    },
    async getImportJobStatus() {
      throw backendPendingError();
    },
  });
}

export default createMakImportNoopBackendAdapter;
