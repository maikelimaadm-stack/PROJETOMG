/** Borda clara em campos; botões brancos com borda leve (Novo/Salvar mantêm azul via CSS) */
export const EMP_TOOLBAR_FIELD_BORDER = "border-[1.5px] border-[#e8ecef] rounded-[5px]";

export const EMP_TOOLBAR_BTN_SHAPE = "rounded-[5px] border-[1.5px] border-[#e8ecef]";

export const EMP_TOOLBAR_BTN_BG = "bg-white";

export const EMP_TOOLBAR_BTN =
  `emp-toolbar-btn inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[#0f172a] shadow-none hover:bg-[#f8fafc] disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-0`;

export const EMP_TOOLBAR_SEARCH_WRAP =
  `emp-toolbar-search relative flex h-[28px] w-40 md:w-52 shrink-0 items-center ${EMP_TOOLBAR_FIELD_BORDER} bg-white overflow-hidden`;

export const EMP_TOOLBAR_SEARCH_INPUT =
  "emp-toolbar-search-input h-full w-full min-w-0 flex-1 px-2 pr-7 text-[12px] leading-[28px] text-slate-900 bg-white outline-none placeholder:text-slate-500";

export const EMP_TOOLBAR_COUNTER =
  `emp-toolbar-counter inline-flex h-[28px] w-auto min-w-[2rem] shrink-0 items-center justify-center ${EMP_TOOLBAR_FIELD_BORDER} bg-white px-2 text-[12px] font-normal tabular-nums text-[#1a1f26]`;

export const EMP_TOOLBAR_ICON_CLASS = "emp-toolbar-action-icon shrink-0";

export const EMP_TOOLBAR_NAV_ICON_CLASS = "emp-toolbar-nav-icon shrink-0";

export const EMP_HEADER_CTRL_BTN =
  `emp-toolbar-btn emp-header-ctrl inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BTN_SHAPE} ${EMP_TOOLBAR_BTN_BG} text-[#0f172a] shadow-none hover:bg-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-0`;
