import { useCallback, useState } from "react";
import { showError } from "@/shared/feedback";

export const SAVE_PROGRESS_MESSAGE = "Salvando registros...";
export const DELETE_PROGRESS_MESSAGE = "Excluindo registros...";

export function useSaveCycle() {
  const [state, setState] = useState({
    active: false,
    message: SAVE_PROGRESS_MESSAGE,
  });

  const begin = useCallback((message = SAVE_PROGRESS_MESSAGE) => {
    setState({ active: true, message });
  }, []);

  const beginSave = useCallback(() => {
    begin(SAVE_PROGRESS_MESSAGE);
  }, [begin]);

  const beginDelete = useCallback(() => {
    begin(DELETE_PROGRESS_MESSAGE);
  }, [begin]);

  const end = useCallback(() => {
    setState({ active: false, message: SAVE_PROGRESS_MESSAGE });
  }, []);

  const guardAction = useCallback(
    (blockedMessage = "Aguarde a operação terminar.") => {
      if (!state.active) return true;
      showError(blockedMessage);
      return false;
    },
    [state.active]
  );

  return {
    isSaving: state.active,
    saveMessage: state.message,
    begin,
    beginSave,
    beginDelete,
    end,
    guardAction,
  };
};
