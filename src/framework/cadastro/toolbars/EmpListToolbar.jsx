import React from "react";
import { Filter, List, Table, Plus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash2, Copy, Search, Paperclip, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { EMP_TOOLBAR_BTN, EMP_TOOLBAR_SEARCH_INPUT, EMP_TOOLBAR_SEARCH_WRAP } from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpBubbleCounter from "@/framework/cadastro/toolbars/EmpBubbleCounter";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";

const titleCase = (value) => String(value || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[12px] font-medium";
const NAV_BTN_CLASS = "emp-toolbar-nav-btn";

export default function EmpListToolbar({
  viewMode = "table",
  total = 0,
  currentIndex = 0,
  searchValue = "",
  onSearchChange,
  onNew,
  onToggleView,
  onBack,
  toggleViewDisabled = false,
  filterOpen = false,
  filterActive = false,
  onToggleFilter,
  onClearFilter,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onDelete,
  onDuplicate,
  onAttachClick,
  attachDisabled = false,
  onExportPdf,
  onConfigExportPdf,
  onExportExcel,
  onConfigExportExcel,
  onConfigColumns,
  selectedCount = 0,
  title = "REGISTROS",
  recordLabel = "",
  operationLabel,
  showUtilityActions = true,
  showSearch = true
}) {
  const canNavigate = viewMode === "record" && total > 0;
  const showRecordNavigation = viewMode === "record";
  const showDeleteSelectionAction = viewMode === "table" && selectedCount > 0 && !!onDelete;
  const showDuplicateSelectionAction = viewMode === "table" && selectedCount === 1 && !!onDuplicate;

  return (
    <div className="emp-toolbar px-2 py-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 shrink-0">
          {onBack && (
            <ToolbarBtn onClick={onBack} title="Voltar">
              <EmpToolbarIcon icon={ChevronLeft} nav />
            </ToolbarBtn>
          )}
          <ToolbarBtn
            onClick={onToggleView}
            disabled={toggleViewDisabled}
            title={toggleViewDisabled ? "Selecione apenas um registro" : viewMode === "table" ? "Visualizar registro" : "Visualizar tabela"}
          >
            {viewMode === "table" ? <EmpToolbarIcon icon={List} /> : <EmpToolbarIcon icon={Table} />}
          </ToolbarBtn>
          <ToolbarBtn onClick={onNew} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Novo registro">
            <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
            <span>Novo</span>
          </ToolbarBtn>
          {onToggleFilter && (
            <ToolbarBtn onClick={onToggleFilter} className="relative w-9" title="Filtros">
              <EmpToolbarIcon icon={Filter} />
              {filterActive && (
                <span
                  onClick={(e) => { e.stopPropagation(); onClearFilter?.(); }}
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-white text-red-600 border border-red-500 text-[10px] leading-[12px] font-bold"
                >
                  ×
                </span>
              )}
            </ToolbarBtn>
          )}
          {showRecordNavigation && (
            <div className="flex items-center gap-1 shrink-0">
              <ToolbarBtn onClick={onFirst} disabled={!canNavigate} className={NAV_BTN_CLASS} title="Primeiro"><EmpToolbarIcon icon={ChevronsLeft} nav /></ToolbarBtn>
              <ToolbarBtn onClick={onPrevious} disabled={!canNavigate} className={NAV_BTN_CLASS} title="Anterior"><EmpToolbarIcon icon={ChevronLeft} nav /></ToolbarBtn>
              <ToolbarBtn onClick={onNext} disabled={!canNavigate} className={NAV_BTN_CLASS} title="Próximo"><EmpToolbarIcon icon={ChevronRight} nav /></ToolbarBtn>
              <ToolbarBtn onClick={onLast} disabled={!canNavigate} className={NAV_BTN_CLASS} title="Último"><EmpToolbarIcon icon={ChevronsRight} nav /></ToolbarBtn>
            </div>
          )}
          {showDeleteSelectionAction && (
            <ToolbarBtn onClick={onDelete} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-delete`} title="Excluir selecionados">
              <EmpToolbarIcon icon={Trash2} />
              <span>Excluir</span>
            </ToolbarBtn>
          )}
          {showDuplicateSelectionAction && (
            <ToolbarBtn onClick={onDuplicate} className={LABELED_BTN_CLASS} title="Duplicar">
              <EmpToolbarIcon icon={Copy} />
              <span>Duplicar</span>
            </ToolbarBtn>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {showSearch && (
            <div className={EMP_TOOLBAR_SEARCH_WRAP}>
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Pesquisar registros..."
                className={EMP_TOOLBAR_SEARCH_INPUT}
              />
              <Search className="emp-toolbar-search-icon absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          )}
          {showUtilityActions && (
            <ToolbarBtn onClick={onAttachClick} disabled={attachDisabled} title={attachDisabled ? "Selecione apenas um registro" : "Anexos"}>
              <EmpToolbarIcon icon={Paperclip} />
            </ToolbarBtn>
          )}
          {showUtilityActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={EMP_TOOLBAR_BTN} title="Mais opções">
                  <EmpToolbarIcon icon={MoreHorizontal} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md p-1">
                <DropdownMenuItem onClick={onConfigColumns} disabled={!onConfigColumns} className="h-8 cursor-pointer gap-2 text-xs px-2">Configurar colunas</DropdownMenuItem>
                <div className="flex items-center">
                  <DropdownMenuItem onClick={onExportExcel} disabled={!onExportExcel} className="h-8 flex-1 cursor-pointer gap-2 text-xs px-2">Exportar Excel</DropdownMenuItem>
                  <button type="button" onClick={onConfigExportExcel} disabled={!onConfigExportExcel} className="h-8 w-8 flex items-center justify-center text-[#4fafff] hover:bg-sky-50 rounded-md disabled:opacity-40" title="Configurar Excel"><EmpToolbarIcon icon={MoreHorizontal} /></button>
                </div>
                <div className="flex items-center">
                  <DropdownMenuItem onClick={onExportPdf} disabled={!onExportPdf} className="h-8 flex-1 cursor-pointer gap-2 text-xs px-2">Exportar PDF</DropdownMenuItem>
                  <button type="button" onClick={onConfigExportPdf} disabled={!onConfigExportPdf} className="h-8 w-8 flex items-center justify-center text-[#4fafff] hover:bg-sky-50 rounded-md disabled:opacity-40" title="Configurar PDF"><EmpToolbarIcon icon={MoreHorizontal} /></button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <EmpBubbleCounter
            value={
              viewMode === "record" && total > 0
                ? `${currentIndex + 1}/${total}`
                : selectedCount > 0
                  ? `${selectedCount}/${total}`
                  : String(total)
            }
            title="Registros"
            className="emp-toolbar-bubble-counter"
          />
        </div>
      </div>
    </div>
  );
}
