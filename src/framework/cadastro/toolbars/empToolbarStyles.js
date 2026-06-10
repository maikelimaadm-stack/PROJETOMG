/** MakGestão UI — dimensões e cores via tokens CSS (--mg-*, --erp-*) */
export const EMP_TOOLBAR_FIELD_BORDER = "border-0";

export const EMP_TOOLBAR_BTN_SHAPE = "rounded-[var(--mg-radius-control,8px)]";

export const EMP_TOOLBAR_BTN_BG = "bg-[var(--mg-gray-fill,#f3f4f6)]";

export const EMP_TOOLBAR_BTN =
  `emp-toolbar-btn inline-flex h-[var(--mg-toolbar-height,34px)] w-[var(--mg-toolbar-height,34px)] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[12px] font-semibold text-[var(--mg-text-2,#6b7280)] shadow-none hover:bg-[var(--mg-gray-fill2,#e5e7eb)] disabled:opacity-40 disabled:pointer-events-none transition-all duration-100 focus-visible:outline-none focus-visible:ring-0`;

export const EMP_TOOLBAR_SEARCH_WRAP =
  `emp-toolbar-search relative flex h-[var(--mg-toolbar-height,34px)] w-full min-w-0 max-w-[13rem] sm:max-w-[10rem] md:max-w-[13rem] shrink-0 items-center ${EMP_TOOLBAR_FIELD_BORDER} bg-[var(--mg-gray-fill,#f3f4f6)] overflow-hidden rounded-full`;

export const EMP_TOOLBAR_SEARCH_INPUT =
  "emp-toolbar-search-input h-full w-full min-w-0 flex-1 px-3 pr-7 text-[12px] leading-[34px] text-[var(--mg-text-1,#111827)] bg-transparent outline-none placeholder:text-[var(--mg-text-3,#9ca3af)]";

export const EMP_TOOLBAR_COUNTER =
  `emp-toolbar-counter inline-flex h-[var(--mg-toolbar-height,34px)] w-auto min-w-[2rem] shrink-0 items-center justify-center border-0 bg-[var(--mg-gray-fill,#f3f4f6)] px-2 text-[11px] font-medium tabular-nums text-[var(--mg-text-2,#6b7280)] rounded-[var(--mg-radius-control,8px)]`;

export const EMP_TOOLBAR_ICON_CLASS = "emp-toolbar-action-icon shrink-0";

export const EMP_TOOLBAR_NAV_ICON_CLASS = "emp-toolbar-nav-icon shrink-0";

export const EMP_HEADER_CTRL_BTN =
  `emp-toolbar-btn emp-header-ctrl inline-flex h-[var(--mg-toolbar-height,34px)] w-[var(--mg-toolbar-height,34px)] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[var(--mg-text-2,#6b7280)] shadow-none hover:bg-[var(--mg-gray-fill2,#e5e7eb)] transition-all duration-100 focus-visible:outline-none focus-visible:ring-0`;
