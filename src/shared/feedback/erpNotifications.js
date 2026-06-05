import { createElement } from "react";
import { toast } from "sonner";
import { ErpToastPanel } from "@/shared/feedback/ErpToastPanel";

export const TOAST_DURATION_MS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const baseOptions = (type, options = {}) => ({
  duration: TOAST_DURATION_MS[type],
  className: `erp-toast erp-toast-${type}`,
  ...options,
});

function showTypedToast(type, message, options) {
  return toast.custom(
    (id) => createElement(ErpToastPanel, { toastId: id, type, message }),
    baseOptions(type, options)
  );
}

/** @param {string} message */
export function showSuccess(message, options) {
  return showTypedToast("success", message, options);
}

/** @param {string} message */
export function showInfo(message, options) {
  return showTypedToast("info", message, options);
}

/** @param {string} message */
export function showWarning(message, options) {
  return showTypedToast("warning", message, options);
}

/** @param {string} message */
export function showError(message, options) {
  return showTypedToast("error", message, options);
}

export const REQUIRED_FIELDS_MESSAGE =
  "Existem campos obrigatórios que precisam ser preenchidos.";
