export const MAK_HISTORY_BACKEND_PENDING_CODE = "MAK_HISTORY_BACKEND_PENDING";

export const MAK_HISTORY_EVENTS = Object.freeze({
  OPENED: "history-opened",
  LOADED: "history-loaded",
  FAILED: "history-failed",
  CLOSED: "history-closed",
});

export const MAK_HISTORY_EMPTY_BACKEND_MESSAGE =
  "Histórico disponível após integração com o backend de auditoria.";

export const MAK_HISTORY_EMPTY_RECORD_MESSAGE =
  "Nenhum evento registrado para este registro.";

export default MAK_HISTORY_EVENTS;
