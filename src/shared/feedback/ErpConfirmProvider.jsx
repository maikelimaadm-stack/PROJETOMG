import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import ErpConfirmModal from "@/shared/feedback/ErpConfirmModal";
import { registerConfirmAction } from "@/shared/feedback/confirmAction";

const ErpConfirmContext = createContext(null);

const defaultState = {
  open: false,
  title: "",
  message: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  variant: "default",
  closeOnOutside: true,
};

export function ErpConfirmProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const resolverRef = useRef(null);
  const optionsRef = useRef({});

  const close = useCallback((result) => {
    setState((prev) => ({ ...prev, open: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    optionsRef.current = {};
    resolve?.(result);
  }, []);

  const confirmAction = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      optionsRef.current = options;
      setState({
        open: true,
        title: options.title || "Confirmar",
        message: options.message || options.description || "",
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        variant: options.variant || "default",
        closeOnOutside: options.closeOnOutside !== false,
      });
    });
  }, []);

  useEffect(() => {
    registerConfirmAction(confirmAction);
    return () => registerConfirmAction(null);
  }, [confirmAction]);

  const handleConfirm = async () => {
    try {
      await optionsRef.current.onConfirm?.();
      close(true);
    } catch {
      close(false);
    }
  };

  const handleCancel = () => close(false);

  return (
    <ErpConfirmContext.Provider value={{ confirmAction }}>
      {children}
      <ErpConfirmModal
        open={state.open}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        closeOnOutside={state.closeOnOutside}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ErpConfirmContext.Provider>
  );
}

export function useErpConfirm() {
  const ctx = useContext(ErpConfirmContext);
  if (!ctx) {
    throw new Error("useErpConfirm deve ser usado dentro de ErpConfirmProvider.");
  }
  return ctx;
}
