import React from "react";
import { Filter, List, Check, X, Paperclip, MoreHorizontal, Plus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash2, Copy, Pencil, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EMP_TOOLBAR_BTN, EMP_TOOLBAR_COUNTER, EMP_TOOLBAR_SEARCH_INPUT, EMP_TOOLBAR_SEARCH_WRAP } from "@/components/emp/toolbars/empToolbarStyles";

const titleCase = (value) => String(value || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LABELED_BTN_CLASS = "w-auto px-2 gap-1 text-[11px] font-medium";

export default function EmpRecordToolbar({
  title,
  operationLabel,
  badgeLabel = "EMPRESA",
  showSaveActions = false,
  showEditAction = false,
  showDeleteDuplicateActions = true,
  showUtilityActions = true,
  onCancel,
  onSave,
  onEditRecord,
  onSettingsClick,
  onLayoutConfigClick,
  onAttachClick,
  attachDisabled = false,
  onToggleView,
  onBack,
  total = 0,
  currentIndex = 0,
  onNew,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onDelete,
  onDuplicate,
  filterOpen = false,
  filterActive = false,
  onToggleFilter,
  onClearFilter,
  searchValue = "",
  onSearchChange,
  showSearch = false
}) {
  const canNavigate = total > 0;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="bg-white emp-toolbar shadow-none overflow-hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-2 py-1.5 border-b border-sky-100">
        {onBack && (
          <ToolbarBtn onClick={onBack} title="Voltar"><ChevronLeft className="w-3.5 h-3.5" /></ToolbarBtn>
        )}
        <ToolbarBtn onClick={onToggleView} title="Visualizar tabela"><List className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={onNew} className={LABELED_BTN_CLASS} title="Novo registro">
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </ToolbarBtn>
        {onToggleFilter && (
          <ToolbarBtn onClick={onToggleFilter} className="relative w-9" title="Filtros">
            <Filter className="w-3.5 h-3.5" />
            {filterActive && (
              <span onClick={(e) => { e.stopPropagation(); onClearFilter?.(); }} className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-white text-red-600 border border-red-500 text-[10px] leading-[12px] font-bold">×</span>
            )}
          </ToolbarBtn>
        )}
        {showEditAction && (
          <ToolbarBtn onClick={onEditRecord} className={LABELED_BTN_CLASS} title="Editar">
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </ToolbarBtn>
        )}
        {showDeleteDuplicateActions && (
          <ToolbarBtn onClick={onDelete} className={LABELED_BTN_CLASS} disabled={!canNavigate} title="Excluir">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </ToolbarBtn>
        )}
        {showDeleteDuplicateActions && (
          <ToolbarBtn onClick={onDuplicate} className={LABELED_BTN_CLASS} disabled={!canNavigate} title="Duplicar">
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicar</span>
          </ToolbarBtn>
        )}
        <div className="flex items-center gap-0 shrink-0">
          <ToolbarBtn onClick={onFirst} disabled={!canNavigate || isFirst} className="rounded-r-none border-r-0" title="Primeiro"><ChevronsLeft className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={onPrevious} disabled={!canNavigate || isFirst} className="rounded-none border-r-0" title="Anterior"><ChevronLeft className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={onNext} disabled={!canNavigate || isLast} className="rounded-none border-r-0" title="Próximo"><ChevronRight className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={onLast} disabled={!canNavigate || isLast} className="rounded-l-none" title="Último"><ChevronsRight className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
        {showSaveActions && (
          <>
            <ToolbarBtn onClick={onSave} className={LABELED_BTN_CLASS} title="Salvar">
              <Check className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={onCancel} className={LABELED_BTN_CLASS} title="Descartar">
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </ToolbarBtn>
          </>
        )}

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {showSearch && (
            <div className={EMP_TOOLBAR_SEARCH_WRAP}>
              <input value={searchValue} onChange={(e) => onSearchChange?.(e.target.value)} placeholder="Pesquisar registros..." className={EMP_TOOLBAR_SEARCH_INPUT} />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#082e54] pointer-events-none" />
            </div>
          )}
          {showUtilityActions && (
            <ToolbarBtn onClick={onAttachClick} disabled={attachDisabled} title={attachDisabled ? "Salve o registro antes de anexar" : "Anexos"}>
              <Paperclip className="w-3.5 h-3.5" />
            </ToolbarBtn>
          )}
          {showUtilityActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={EMP_TOOLBAR_BTN} title="Mais opções"><MoreHorizontal className="w-3.5 h-3.5" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md p-1">
                <DropdownMenuItem onClick={onLayoutConfigClick} disabled={!onLayoutConfigClick} className="h-8 cursor-pointer gap-2 text-xs px-2">Layout do formulário</DropdownMenuItem>
                <DropdownMenuItem onClick={onSettingsClick} disabled={!onSettingsClick} className="h-8 cursor-pointer gap-2 text-xs px-2">Campos personalizados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className={EMP_TOOLBAR_COUNTER}>{total > 0 ? `${currentIndex + 1}/${total}` : total}</div>
        </div>
      </div>

      <div className="h-8 flex items-center gap-2 bg-white border-b border-sky-100 px-2">
        <span className="max-w-[150px] h-6 px-2 rounded-md border border-sky-200 text-[#082e54] text-xs font-semibold text-center truncate inline-flex items-center justify-center">{titleCase(badgeLabel)}</span>
        <span className="text-xs font-semibold text-slate-700 truncate min-w-0 flex-1">{title}</span>
        {operationLabel && <span className="ml-auto text-[11px] font-bold text-slate-600 whitespace-nowrap">{titleCase(operationLabel)}</span>}
      </div>
    </div>
  );
}
