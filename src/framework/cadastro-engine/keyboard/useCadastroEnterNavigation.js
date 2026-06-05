import { useEffect, useRef } from "react";
import { handleCadastroEnterKey } from "@/framework/cadastro-engine/keyboard/cadastroEnterNavigation.js";

export function useCadastroEnterNavigation(enabled = true) {
  const formRef = useRef(null);

  useEffect(() => {
    const root = formRef.current;
    if (!root || !enabled) return undefined;

    const onKeyDown = (event) => {
      handleCadastroEnterKey(event, formRef);
    };

    root.addEventListener("keydown", onKeyDown, true);
    return () => root.removeEventListener("keydown", onKeyDown, true);
  }, [enabled]);

  return formRef;
}
