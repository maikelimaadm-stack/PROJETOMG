export const EMP_CONFIG_DIALOG_SCOPE = "cadastro-emp-scope mg-empresas-scope mg-config-dialog";

export const EMP_CONFIG_DIALOG_CONTENT =
  `${EMP_CONFIG_DIALOG_SCOPE} emp-layout-presets-dialog !gap-0 overflow-hidden !rounded-[var(--mg-radius-card,12px)] !border !border-[var(--mg-container-border,#E7EAEE)] !shadow-[var(--mg-launch-card-shadow,0_1px_2px_rgba(15,23,42,0.04))] !p-0 sm:!p-0 [&>button:last-child]:hidden focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0`;

export const EMP_CONFIG_DIALOG_TRANSFER_DIALOG = "emp-config-transfer-dialog max-w-[900px]";

export const EMP_CONFIG_DIALOG_LIST_DIALOG = "emp-config-list-dialog max-w-[760px]";

export const EMP_CONFIG_DIALOG_SHELL =
  "emp-config-dialog-shell flex min-h-0 flex-1 flex-col gap-2 p-2";

export const EMP_CONFIG_DIALOG_HEADER =
  "emp-config-dialog-header flex items-center justify-between gap-3 shrink-0 px-2 py-1.5";

export const EMP_CONFIG_DIALOG_CLOSE_BUTTON = "emp-layout-presets-close-icon";

export const EMP_CONFIG_DIALOG_TOOLBAR =
  "emp-config-dialog-toolbar flex items-center gap-1 bg-transparent px-1 py-1";

export const EMP_CONFIG_DIALOG_FOOTER =
  "emp-config-dialog-footer flex items-center justify-end gap-2 px-3";

export const EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN = "text-[12px] font-medium";

export const EMP_CONFIG_DIALOG_TABLE_WRAP =
  "emp-layout-presets-table-wrap min-h-0 overflow-hidden";

export const EMP_CONFIG_DIALOG_TABLE_SHELL =
  "emp-config-dialog-table-shell overflow-hidden rounded-[var(--mg-radius-card,12px)] !border !border-[var(--mg-container-border,#E7EAEE)] bg-white !shadow-none";

export const EMP_CONFIG_DIALOG_TABLE_SHELL_WITH_FOOTER =
  `${EMP_CONFIG_DIALOG_TABLE_SHELL} emp-config-dialog-table-shell--with-footer`;

export const EMP_CONFIG_FIELD_WRAP =
  "emp-config-dialog-field h-[var(--mg-btn-height,28px)] rounded-[var(--mg-search-pill-radius,999px)] border border-[var(--mg-container-border,#E7EAEE)] bg-[var(--gray-fill,#f1f3f4)] px-3 text-xs shadow-none focus-visible:ring-0 focus-visible:border-[var(--mg-focus-border)] focus-visible:shadow-[var(--mg-focus-ring)]";

export const EMP_CONFIG_TEXT_LABEL = "text-xs font-semibold text-[var(--text-1,#111827)]";

/** @deprecated use EMP_CONFIG_DIALOG_HEADER */
export const EMP_CONFIG_DIALOG_CLOSE_ROW = EMP_CONFIG_DIALOG_HEADER;
