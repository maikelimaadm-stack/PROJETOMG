import { useCallback, useState } from "react";

/**
 * Estado compartilhado para floating label (foco + preenchido).
 * @param {boolean} [filled] — quando true, label permanece no topo
 */
export function useFloatingFieldState(filled = false) {
  const [focused, setFocused] = useState(false);
  const floated = focused || filled;

  const focusHandlers = useCallback(
    (existing = {}) => ({
      onFocus: (e) => {
        existing.onFocus?.(e);
        setFocused(true);
      },
      onBlur: (e) => {
        existing.onBlur?.(e);
        setFocused(false);
      },
    }),
    []
  );

  return { focused, floated, setFocused, focusHandlers };
}
