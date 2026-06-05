const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  "textarea:not([disabled]):not([readonly])",
  "select:not([disabled])",
  '[contenteditable="true"]',
  "button.emp-form-toggle-switch:not([disabled])",
].join(", ");

const isVisibleElement = (element) => {
  if (!element || element.getAttribute("aria-hidden") === "true") return false;
  if (element.closest('[aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return element.getClientRects().length > 0;
};

export const getCadastroFocusableFields = (container) => {
  if (!container) return [];

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (!isVisibleElement(element)) return false;
    if (element.closest(".emp-toolbar")) return false;
    if (element.closest(".emp-form-mobile-footer")) return false;
    if (element.closest('[data-cadastro-enter-skip="true"]')) return false;
    if (element.closest(".emp-form-card-body") === null && !element.closest(".emp-form-field-corp")) {
      return false;
    }
    return true;
  });
};

export const focusNextCadastroField = (container, currentElement) => {
  const fields = getCadastroFocusableFields(container);
  const currentIndex = fields.indexOf(currentElement);
  if (currentIndex < 0) return false;

  const nextField = fields[currentIndex + 1];
  if (nextField) {
    nextField.focus({ preventScroll: false });
    if (typeof nextField.select === "function" && nextField.tagName === "INPUT") {
      nextField.select();
    }
    return true;
  }

  const scope = container.closest(".cadastro-emp-scope") || container;
  const toolbarButton = scope.querySelector(
    ".emp-toolbar-row .emp-toolbar-actions-primary .emp-toolbar-btn:not([disabled])"
  );
  if (toolbarButton) {
    toolbarButton.focus({ preventScroll: false });
    return true;
  }

  currentElement?.focus?.({ preventScroll: false });
  return true;
};

export const handleCadastroEnterKey = (event, container) => {
  if (event.key !== "Enter" || event.defaultPrevented) return false;
  if (event.isComposing) return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "TEXTAREA") return false;
  if (target.closest('[data-cadastro-enter-skip="true"]')) return false;
  if (target.closest('[data-autocomplete-open="true"]')) return false;

  const root = container?.current || target.closest("form") || target.closest(".cadastro-emp-scope");
  if (!root) return false;

  event.preventDefault();
  focusNextCadastroField(root, target);
  return true;
};
