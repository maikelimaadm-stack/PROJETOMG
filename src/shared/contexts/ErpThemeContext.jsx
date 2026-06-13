import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const ERP_TEMA_STORAGE_KEY = "erp-tema";
export const ERP_TEMA_CLARO = "claro";
export const ERP_TEMA_ESCURO = "escuro";

const ErpThemeContext = createContext(null);

export function readStoredErpTema() {
  if (typeof window === "undefined") return ERP_TEMA_CLARO;
  const stored = window.localStorage.getItem(ERP_TEMA_STORAGE_KEY);
  return stored === ERP_TEMA_ESCURO ? ERP_TEMA_ESCURO : ERP_TEMA_CLARO;
}

export function applyErpTemaToDocument(tema) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("tema-claro", "tema-escuro", "escuro", "dark");
  root.removeAttribute("data-tema");

  if (tema === ERP_TEMA_ESCURO) {
    root.classList.add("tema-escuro", "escuro", "dark");
    root.setAttribute("data-tema", ERP_TEMA_ESCURO);
    return;
  }

  root.classList.add("tema-claro");
  root.setAttribute("data-tema", ERP_TEMA_CLARO);
}

export function ErpThemeProvider({ children }) {
  const [tema, setTemaState] = useState(() => readStoredErpTema());

  useEffect(() => {
    applyErpTemaToDocument(tema);
    window.localStorage.setItem(ERP_TEMA_STORAGE_KEY, tema);
  }, [tema]);

  const setTema = useCallback((nextTema) => {
    setTemaState(nextTema === ERP_TEMA_ESCURO ? ERP_TEMA_ESCURO : ERP_TEMA_CLARO);
  }, []);

  const toggleTema = useCallback(() => {
    setTemaState((current) =>
      current === ERP_TEMA_ESCURO ? ERP_TEMA_CLARO : ERP_TEMA_ESCURO
    );
  }, []);

  const value = useMemo(
    () => ({
      tema,
      isEscuro: tema === ERP_TEMA_ESCURO,
      isClaro: tema === ERP_TEMA_CLARO,
      setTema,
      toggleTema,
    }),
    [tema, setTema, toggleTema]
  );

  return <ErpThemeContext.Provider value={value}>{children}</ErpThemeContext.Provider>;
}

export function useErpTheme() {
  const context = useContext(ErpThemeContext);
  if (!context) {
    throw new Error("useErpTheme deve ser usado dentro de ErpThemeProvider.");
  }
  return context;
}
