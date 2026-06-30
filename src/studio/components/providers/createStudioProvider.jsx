import { createContext, useContext } from "react";

/**
 * Factory for typed Studio universal providers.
 * @param {string} hookName
 */
export function createStudioProvider(hookName) {
  const Context = createContext(null);

  function useProvider() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`${hookName} must be used within its Provider`);
    return ctx;
  }

  function Provider({ value, children }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return { Provider, useProvider, Context };
}
