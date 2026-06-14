import { showWarning, REQUIRED_FIELDS_MESSAGE } from "@/shared/feedback/erpNotifications";

const INVALID_CLASS = "erp-field-invalid";

const CONTROL_SELECTOR =
  ".emp-form-field-control, .emp-form-field-bare, input, textarea, select, button.emp-form-lookup-btn, button.emp-form-date-btn, .cmd-display, .mg-dp-field, .mg-tp-field, .mg-lookup-display";

const FOCUSABLE_CONTROL_SELECTOR = [
  "input:not([type='hidden']):not([disabled]):not([readonly])",
  "textarea:not([disabled]):not([readonly])",
  "select:not([disabled])",
  "button.emp-form-lookup-btn:not([disabled])",
  "button.emp-form-date-btn:not([disabled])",
  ".cmd-display[tabindex]:not([tabindex='-1'])",
  ".mg-lookup-display[tabindex]:not([tabindex='-1'])",
  ".mg-dp-field",
  ".mg-tp-field",
].join(", ");

const INTERACTIVE_DISPLAY_SELECTOR = ".cmd-display, .mg-lookup-display, .mg-dp-field, .mg-tp-field";

const resolveFocusableControl = (fieldNode) => {
  if (!fieldNode) return null;
  const controls = Array.from(fieldNode.querySelectorAll(FOCUSABLE_CONTROL_SELECTOR)).filter(
    (node) => node instanceof HTMLElement && node.getClientRects().length > 0
  );
  return controls[0] || null;
};

/**
 * Destaca apenas o controle do campo (não a linha inteira), toast lateral e foco no primeiro.
 */
export function reportRequiredFieldErrors(errorMap = {}, options = {}) {
  const keys = Object.keys(errorMap).filter((key) => errorMap[key]);
  if (keys.length === 0) return true;

  const root = options.root || document;
  keys.forEach((key) => {
    root.querySelectorAll(`[data-field="${key}"]`).forEach((node) => {
      const controls = node.querySelectorAll(CONTROL_SELECTOR);
      controls.forEach((control) => {
        control.classList.add(INVALID_CLASS);
      });
      if (controls.length === 0) {
        node.classList.add(INVALID_CLASS);
      }
    });
  });

  showWarning(options.message || REQUIRED_FIELDS_MESSAGE);

  const first = root.querySelector(`[data-field="${keys[0]}"]`);
  if (first) {
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    if (options.focus !== false) {
      const tryFocus = (attempt = 0) => {
        const focusable = resolveFocusableControl(first);
        if (focusable) {
          focusable.focus?.({ preventScroll: true });
          if (
            options.activate &&
            focusable.matches(INTERACTIVE_DISPLAY_SELECTOR)
          ) {
            focusable.click?.();
          }
          return;
        }
        if (attempt < 3) {
          requestAnimationFrame(() => tryFocus(attempt + 1));
        }
      };
      tryFocus();
    }
  }

  return false;
}

/** Remove destaque de campos obrigatórios. */
export function clearRequiredFieldErrors(root = document) {
  root.querySelectorAll(`.${INVALID_CLASS}`).forEach((node) => {
    node.classList.remove(INVALID_CLASS);
  });
}
