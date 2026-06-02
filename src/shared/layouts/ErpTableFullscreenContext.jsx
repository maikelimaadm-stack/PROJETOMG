import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ErpTableFullscreenContext = createContext(null);

const EMPTY_STATE = {
  visible: false,
  isFullscreen: false,
  onToggle: null,
};

export function ErpTableFullscreenProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE);

  const registerTableFullscreen = useCallback((next) => {
    setState((prev) => ({
      ...prev,
      ...next,
      visible: true,
    }));
  }, []);

  const updateTableFullscreen = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const unregisterTableFullscreen = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      registerTableFullscreen,
      updateTableFullscreen,
      unregisterTableFullscreen,
    }),
    [state, registerTableFullscreen, updateTableFullscreen, unregisterTableFullscreen]
  );

  return <ErpTableFullscreenContext.Provider value={value}>{children}</ErpTableFullscreenContext.Provider>;
}

export function useErpTableFullscreen() {
  const context = useContext(ErpTableFullscreenContext);
  if (!context) {
    return {
      visible: false,
      isFullscreen: false,
      onToggle: null,
      registerTableFullscreen: () => {},
      updateTableFullscreen: () => {},
      unregisterTableFullscreen: () => {},
    };
  }
  return context;
}
