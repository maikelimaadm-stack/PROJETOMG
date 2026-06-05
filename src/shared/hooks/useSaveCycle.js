import { useCallback, useState } from "react";
import { showError } from "@/shared/feedback";

export function useSaveCycle() {
  const [state, setState] = useState({
    active: false,
    message: "Salvando registro...",
  });

  const begin = useCallback((message = "Salvando registro...") => {
    setState({ active: true, message });
  }, []);

  const end = useCallback(() => {
    setState({ active: false, message: "Salvando registro..." });
  }, []);

  const guardAction = useCallback(
    (blockedMessage = "Aguarde o salvamento terminar.") => {
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
    end,
    guardAction,
  };
}
