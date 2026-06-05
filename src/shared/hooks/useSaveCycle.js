import { useCallback, useState } from "react";
import { showError } from "@/shared/feedback";

export const SAVE_PROGRESS_MESSAGE = "Salvando registros...";
export const DELETE_PROGRESS_MESSAGE = "Excluindo registros...";

export function useSaveCycle() {
  const [state, setState] = useState({
    active: false,
    message: SAVE_PROGRESS_MESSAGE,
    variant: "save",
  });

  const begin = useCallback((message = SAVE_PROGRESS_MESSAGE, variant = "save") => {
    setState({ active: true, message, variant });
  }, []);

  const beginSave = useCallback(() => {
    begin(SAVE_PROGRESS_MESSAGE, "save");
  }, [begin]);

  const beginDelete = useCallback(() => {
    begin(DELETE_PROGRESS_MESSAGE, "delete");
  }, [begin]);

  const end = useCallback(() => {
    setState({ active: false, message: SAVE_PROGRESS_MESSAGE, variant: "save" });
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
    variant: state.variant,
    begin,
    beginSave,
    beginDelete,
    end,
    guardAction,
  };
};
