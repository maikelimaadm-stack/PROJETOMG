/** Design System 2030 — dimensões via CSS (--erp-toolbar-height); cores via tokens */
export const EMP_TOOLBAR_FIELD_BORDER = "border border-[var(--erp-color-border,#e4eaf2)] rounded-[10px]";

export const EMP_TOOLBAR_BTN_SHAPE = "rounded-[10px] border border-[var(--erp-color-border,#e4eaf2)]";

export const EMP_TOOLBAR_BTN_BG = "bg-white";

export const EMP_TOOLBAR_BTN =
  `emp-toolbar-btn inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[12px] font-medium text-[#1e293b] shadow-none hover:bg-[#f8fafc] disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-0`;

export const EMP_TOOLBAR_SEARCH_WRAP =
  `emp-toolbar-search relative flex h-[26px] w-full min-w-0 max-w-[13rem] sm:max-w-[10rem] md:max-w-[13rem] shrink-0 items-center ${EMP_TOOLBAR_FIELD_BORDER} bg-white overflow-hidden`;

export const EMP_TOOLBAR_SEARCH_INPUT =
  "emp-toolbar-search-input h-full w-full min-w-0 flex-1 px-2 pr-7 text-[12px] leading-[26px] text-[#1e293b] bg-white outline-none placeholder:text-[#64748b]";

export const EMP_TOOLBAR_COUNTER =
  `emp-toolbar-counter inline-flex h-[26px] w-auto min-w-[2rem] shrink-0 items-center justify-center ${EMP_TOOLBAR_FIELD_BORDER} bg-white px-2 text-[12px] font-medium tabular-nums text-[#1e293b]`;

export const EMP_TOOLBAR_ICON_CLASS = "emp-toolbar-action-icon shrink-0";

export const EMP_TOOLBAR_NAV_ICON_CLASS = "emp-toolbar-nav-icon shrink-0";

export const EMP_HEADER_CTRL_BTN =
  `emp-toolbar-btn emp-header-ctrl inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[#1e293b] shadow-none hover:bg-[#f8fafc] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-0`;
