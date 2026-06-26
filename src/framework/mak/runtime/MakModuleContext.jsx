import React, { createContext, useContext, useMemo } from "react";

const MakModuleContext = createContext(null);

export function MakModuleProvider({ module, children }) {
  const value = useMemo(() => module ?? null, [module]);
  return <MakModuleContext.Provider value={value}>{children}</MakModuleContext.Provider>;
}

/** @returns {ReturnType<import('./createMakRuntime.js').createMakRuntime> | null} */
export function useMakModule() {
  return useContext(MakModuleContext);
}

export function useMakModuleRequired() {
  const module = useMakModule();
  if (!module) {
    throw new Error("useMakModuleRequired: MakModuleProvider with module is required");
  }
  return module;
}
