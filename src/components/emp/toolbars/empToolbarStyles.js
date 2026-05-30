/** Botões quadrados com borda azul clara — padrão do mockup */
export const EMP_TOOLBAR_BORDER = "border border-sky-200 rounded-[5px]";

export const EMP_TOOLBAR_BTN =
  `emp-toolbar-btn inline-flex h-7 w-7 shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} bg-white text-[#082e54] shadow-none hover:bg-sky-50 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300`;

export const EMP_TOOLBAR_SEARCH_WRAP =
  `emp-toolbar-search relative h-7 w-40 md:w-52 shrink-0 ${EMP_TOOLBAR_BORDER} bg-white overflow-hidden`;

export const EMP_TOOLBAR_SEARCH_INPUT =
  "h-full w-full px-2 pr-7 text-[11px] text-slate-800 bg-white outline-none placeholder:text-slate-400";

export const EMP_TOOLBAR_COUNTER =
  `emp-toolbar-counter inline-flex h-7 min-w-[6.5rem] shrink-0 items-center justify-center ${EMP_TOOLBAR_BORDER} bg-white px-2.5 text-[11px] font-medium tabular-nums text-[#082e54]`;

/** Botão de filtro no cabeçalho da coluna */
export const EMP_HEADER_FILTER_BTN =
  `emp-header-filter-btn inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center border border-sky-200 rounded-[5px] bg-white text-[#082e54] shadow-none hover:bg-sky-50 transition-colors focus-visible:outline-none`;

/** Botão de redimensionar coluna — visual neutro, sem destaque de filtro */
export const EMP_HEADER_RESIZE_BTN =
  `emp-header-resize-btn inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center border border-slate-200 rounded-[5px] bg-white text-[#082e54] shadow-none hover:bg-slate-50 transition-colors focus-visible:outline-none`;
