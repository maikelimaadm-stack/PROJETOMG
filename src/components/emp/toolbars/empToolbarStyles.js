/** Botões quadrados com borda azul clara — padrão do mockup */
export const EMP_TOOLBAR_BORDER = "border border-sky-200 rounded-[5px]";

export const EMP_TOOLBAR_BTN_BG = "bg-[#eaf2ff]";

export const EMP_TOOLBAR_BTN =
  `emp-toolbar-btn inline-flex h-[24px] w-[24px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} ${EMP_TOOLBAR_BTN_BG} text-[#334155] shadow-none hover:bg-[#dde9fb] disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300`;

export const EMP_TOOLBAR_SEARCH_WRAP =
  `emp-toolbar-search relative flex h-[24px] w-40 md:w-52 shrink-0 items-center ${EMP_TOOLBAR_BORDER} bg-white overflow-hidden`;

export const EMP_TOOLBAR_SEARCH_INPUT =
  "emp-toolbar-search-input h-full w-full min-w-0 flex-1 px-2 pr-7 text-[12px] leading-[24px] text-slate-600 bg-white outline-none placeholder:text-slate-400";

export const EMP_TOOLBAR_COUNTER =
  `emp-toolbar-counter inline-flex h-[24px] w-auto min-w-[2rem] shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} bg-white px-2 text-[12px] font-normal tabular-nums text-[#1a1f26]`;

export const EMP_TOOLBAR_ICON_CLASS = "emp-toolbar-action-icon shrink-0";

export const EMP_TOOLBAR_NAV_ICON_CLASS = "emp-toolbar-nav-icon shrink-0";

/** Botões compactos do cabeçalho — mesmo visual da toolbar, tamanho 24px */
export const EMP_HEADER_CTRL_BTN =
  `emp-toolbar-btn emp-header-ctrl inline-flex h-[24px] w-[24px] shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} ${EMP_TOOLBAR_BTN_BG} text-[#082e54] shadow-none hover:bg-[#dde9fb] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300`;
