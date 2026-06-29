import { createContext, useContext } from "react";

const StudioShellContext = createContext(null);

export function StudioShellContextProvider({ value, children }) {
  return <StudioShellContext.Provider value={value}>{children}</StudioShellContext.Provider>;
}

export function useStudioShell() {
  const ctx = useContext(StudioShellContext);
  if (!ctx) throw new Error("useStudioShell must be used within a Studio Shell provider");
  return ctx;
}

export default StudioShellContext;
