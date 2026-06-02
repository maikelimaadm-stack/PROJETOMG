import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ErpPageHeaderContext = createContext(null);

export function ErpPageHeaderProvider({ children }) {
  const [header, setHeader] = useState({});

  const setPageHeader = useCallback((next) => {
    setHeader((prev) => ({ ...prev, ...next }));
  }, []);

  const clearPageHeader = useCallback(() => {
    setHeader({});
  }, []);

  const value = useMemo(
    () => ({ header, setPageHeader, clearPageHeader }),
    [header, setPageHeader, clearPageHeader]
  );

  return <ErpPageHeaderContext.Provider value={value}>{children}</ErpPageHeaderContext.Provider>;
}

export function useErpPageHeader() {
  const context = useContext(ErpPageHeaderContext);
  if (!context) {
    return {
      header: {},
      setPageHeader: () => {},
      clearPageHeader: () => {},
    };
  }
  return context;
}
