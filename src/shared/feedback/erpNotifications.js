import { toast } from "sonner";

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

/** @param {string} message */
export function showSuccess(message, options) {
  return toast.success(message, baseOptions("success", options));
}

/** @param {string} message */
export function showInfo(message, options) {
  return toast(message, {
    ...baseOptions("info", options),
    icon: null,
    className: `erp-toast erp-toast-info ${options?.className || ""}`.trim(),
  });
}

/** @param {string} message */
export function showWarning(message, options) {
  return toast.warning(message, baseOptions("warning", options));
}

/** @param {string} message */
export function showError(message, options) {
  return toast.error(message, baseOptions("error", options));
}

export const REQUIRED_FIELDS_MESSAGE =
  "Existem campos obrigatórios que precisam ser preenchidos.";
