import { showWarning, REQUIRED_FIELDS_MESSAGE } from "@/shared/feedback/erpNotifications";

const INVALID_CLASS = "erp-field-invalid";

/**
 * Destaca campos inválidos, exibe toast WARNING e foca o primeiro campo.
 * @param {Record<string, boolean>} errorMap - chave = data-field ou nome do campo
 * @param {{ message?: string, root?: HTMLElement | Document }} [options]
 * @returns {boolean} true se não há erros
 */
export function reportRequiredFieldErrors(errorMap = {}, options = {}) {
  const keys = Object.keys(errorMap).filter((key) => errorMap[key]);
  if (keys.length === 0) return true;

  const root = options.root || document;
  keys.forEach((key) => {
    root.querySelectorAll(`[data-field="${key}"]`).forEach((node) => {
      node.classList.add(INVALID_CLASS);
      const control = node.querySelector(
        ".erp-float-field, .emp-form-field-control, input, textarea, select, button[role='combobox']"
      );
      control?.classList.add(INVALID_CLASS);
    });
  });

  showWarning(options.message || REQUIRED_FIELDS_MESSAGE);

  const first = root.querySelector(`[data-field="${keys[0]}"]`);
  if (first) {
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = first.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button"
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
