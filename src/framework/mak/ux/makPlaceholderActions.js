export const MAK_PRINT_PLACEHOLDER_MESSAGE =
  "Selecione um registro ou use Exportar PDF para imprimir a listagem.";

export const MAK_HISTORY_PLACEHOLDER_MESSAGE =
  "Abra o histórico a partir de um registro em edição.";

/** @returns {() => void} */
export function createMakPrintPlaceholder(onPrint, notify = null) {
  if (typeof onPrint === "function") return onPrint;
  return () => {
    if (typeof notify === "function") {
      notify(MAK_PRINT_PLACEHOLDER_MESSAGE);
    }
  };
}

/** @returns {() => void} */
export function createMakHistoryPlaceholder(onHistory, notify = null) {
  if (typeof onHistory === "function") return onHistory;
  return () => {
    if (typeof notify === "function") {
      notify(MAK_HISTORY_PLACEHOLDER_MESSAGE);
    }
  };
}
