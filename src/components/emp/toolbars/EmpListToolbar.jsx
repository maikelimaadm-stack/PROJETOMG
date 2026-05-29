import React from "react";
import { Filter, List, Table, Plus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash2, Copy, Search, Paperclip, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EMP_TOOLBAR_BTN, EMP_TOOLBAR_COUNTER, EMP_TOOLBAR_SEARCH_INPUT, EMP_TOOLBAR_SEARCH_WRAP } from "@/components/emp/toolbars/empToolbarStyles";

const titleCase = (value) => String(value || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

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
    <div className="bg-white emp-toolbar px-2 py-1.5 border-b border-sky-100">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 shrink-0">
          {onBack && (
            <ToolbarBtn onClick={onBack} title="Voltar">
              <ChevronLeft className="w-4 h-4" />
            </ToolbarBtn>
          )}
          <ToolbarBtn
            onClick={onToggleView}
            disabled={toggleViewDisabled}
            title={toggleViewDisabled ? "Selecione apenas um registro" : viewMode === "table" ? "Visualizar registro" : "Visualizar tabela"}
          >
            {viewMode === "table" ? <List className="w-4 h-4" /> : <Table className="w-4 h-4" />}
          </ToolbarBtn>
          <ToolbarBtn onClick={onNew} title="Novo registro">
            <Plus className="w-4 h-4" />
          </ToolbarBtn>
          {onToggleFilter && (
            <ToolbarBtn onClick={onToggleFilter} className="relative w-9" title="Filtros">
              <Filter className="w-4 h-4" />
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
            <>
              <ToolbarBtn onClick={onFirst} disabled={!canNavigate} title="Primeiro"><ChevronsLeft className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn onClick={onPrevious} disabled={!canNavigate} title="Anterior"><ChevronLeft className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn onClick={onNext} disabled={!canNavigate} title="Próximo"><ChevronRight className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn onClick={onLast} disabled={!canNavigate} title="Último"><ChevronsRight className="w-4 h-4" /></ToolbarBtn>
            </>
          )}
          {showDeleteSelectionAction && (
            <ToolbarBtn onClick={onDelete} title="Excluir selecionados"><Trash2 className="w-4 h-4" /></ToolbarBtn>
          )}
          {showDuplicateSelectionAction && (
            <ToolbarBtn onClick={onDuplicate} title="Duplicar"><Copy className="w-4 h-4" /></ToolbarBtn>
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
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#082e54] pointer-events-none" />
            </div>
          )}
          {showUtilityActions && (
            <ToolbarBtn onClick={onAttachClick} disabled={attachDisabled} title={attachDisabled ? "Selecione apenas um registro" : "Anexos"}>
              <Paperclip className="w-4 h-4" />
            </ToolbarBtn>
          )}
          {showUtilityActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={EMP_TOOLBAR_BTN} title="Mais opções">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md p-1">
                <DropdownMenuItem onClick={onConfigColumns} disabled={!onConfigColumns} className="h-8 cursor-pointer gap-2 text-xs px-2">Configurar colunas</DropdownMenuItem>
                <div className="flex items-center">
                  <DropdownMenuItem onClick={onExportExcel} disabled={!onExportExcel} className="h-8 flex-1 cursor-pointer gap-2 text-xs px-2">Exportar Excel</DropdownMenuItem>
                  <button type="button" onClick={onConfigExportExcel} disabled={!onConfigExportExcel} className="h-8 w-8 flex items-center justify-center text-[#082e54] hover:bg-sky-50 rounded-md disabled:opacity-40" title="Configurar Excel"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center">
                  <DropdownMenuItem onClick={onExportPdf} disabled={!onExportPdf} className="h-8 flex-1 cursor-pointer gap-2 text-xs px-2">Exportar PDF</DropdownMenuItem>
                  <button type="button" onClick={onConfigExportPdf} disabled={!onConfigExportPdf} className="h-8 w-8 flex items-center justify-center text-[#082e54] hover:bg-sky-50 rounded-md disabled:opacity-40" title="Configurar PDF"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className={EMP_TOOLBAR_COUNTER}>
            {viewMode === "record" && total > 0 ? `${currentIndex + 1}/${total}` : selectedCount > 0 ? `${selectedCount}/${total}` : total}
          </div>
        </div>
      </div>

      {viewMode === "record" && (
        <div className="h-8 flex items-center gap-2 bg-white border-b border-sky-100 px-1 mt-1">
          {recordLabel && (
            <span className="px-2 py-0.5 rounded-md border border-sky-200 bg-white text-[#082e54] text-xs font-semibold">{titleCase(recordLabel)}</span>
          )}
          <span className="text-xs font-semibold text-slate-700 truncate min-w-0 flex-1">{title}</span>
          <span className="ml-auto text-[11px] font-bold text-slate-600 whitespace-nowrap">{titleCase(operationLabel || "Visualização de Registro")}</span>
        </div>
      )}
    </div>
  );
}
