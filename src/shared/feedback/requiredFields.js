import { showWarning, REQUIRED_FIELDS_MESSAGE } from "@/shared/feedback/erpNotifications";

const INVALID_CLASS = "erp-field-invalid";

const CONTROL_SELECTOR =
  ".emp-form-field-control, .emp-form-field-bare, input, textarea, select, button.emp-form-lookup-btn, button.emp-form-date-btn";

/**
 * Destaca apenas o controle do campo (não a linha inteira), toast lateral e foco no primeiro.
 */
export function reportRequiredFieldErrors(errorMap = {}, options = {}) {
  const keys = Object.keys(errorMap).filter((key) => errorMap[key]);
  if (keys.length === 0) return true;

  const root = options.root || document;
  keys.forEach((key) => {
    root.querySelectorAll(`[data-field="${key}"]`).forEach((node) => {
      const control = node.querySelector(CONTROL_SELECTOR);
      if (control) {
        control.classList.add(INVALID_CLASS);
      }
    });
  });

  showWarning(options.message || REQUIRED_FIELDS_MESSAGE);

  const first = root.querySelector(`[data-field="${keys[0]}"]`);
  if (first) {
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = first.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])"
    );
    focusable?.focus?.({ preventScroll: true });
  }

  return false;
}

/** Remove destaque de campos obrigatórios. */
export function clearRequiredFieldErrors(root = document) {
  root.querySelectorAll(`.${INVALID_CLASS}`).forEach((node) => {
    node.classList.remove(INVALID_CLASS);
  });
}
