import React from "react";
import { toast } from "sonner";
import ErpToastContent from "./ErpToastContent";

export const TOAST_DURATION_MS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const emit = (type, message, options = {}) =>
  toast.custom(
    (t) => (
      <ErpToastContent
        toastId={t}
        type={type}
        message={message}
        description={options.description}
      />
    ),
    {
      duration: TOAST_DURATION_MS[type],
      className: `erp-toast erp-toast-${type}`,
      ...options,
    }
  );

/** @param {string} message */
export function showSuccess(message, options) {
  return emit("success", message, options);
}

/** @param {string} message */
export function showInfo(message, options) {
  return emit("info", message, options);
}

/** @param {string} message */
export function showWarning(message, options) {
  return emit("warning", message, options);
}

/** @param {string} message */
export function showError(message, options) {
  return emit("error", message, options);
}

export const REQUIRED_FIELDS_MESSAGE =
  "Existem campos obrigatórios que precisam ser preenchidos.";
