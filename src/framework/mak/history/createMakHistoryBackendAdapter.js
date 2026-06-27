import { MAK_HISTORY_BACKEND_PENDING_CODE } from "./makHistory.constants.js";

const backendPendingError = () => {
  const error = new Error("Integração de histórico aguardando backend.");
  error.code = MAK_HISTORY_BACKEND_PENDING_CODE;
  error.status = 501;
  return error;
};

/**
 * Adapter noop — backend de leitura de auditoria ainda não exposto via API.
 */
export function createMakHistoryNoopBackendAdapter() {
  return Object.freeze({
    adapterId: "noop",
    isAvailable: () => false,
    async fetchHistory() {
      throw backendPendingError();
    },
  });
}

export default createMakHistoryNoopBackendAdapter;
