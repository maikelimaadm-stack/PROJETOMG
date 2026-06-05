import React from "react";
import { Filter, List, Check, X, Paperclip, MoreHorizontal, Plus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash2, Copy, Pencil, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { EMP_TOOLBAR_BTN, EMP_TOOLBAR_SEARCH_INPUT, EMP_TOOLBAR_SEARCH_WRAP } from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpBubbleCounter from "@/framework/cadastro/toolbars/EmpBubbleCounter";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import { formatCadastroRecordPosition } from "@/framework/cadastro/toolbars/formatCadastroRecordCount";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[12px] font-medium";
const NAV_BTN_CLASS = "emp-toolbar-nav-btn";

export default function EmpRecordToolbar({
  showSaveActions = false,
  showEditAction = false,
  showDeleteDuplicateActions = true,
  showUtilityActions = true,
  onCancel,
  onSave,
  onEditRecord,
  onSettingsClick,
  onLayoutConfigClick,
  onFieldLayoutConfigClick,
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
  filterActive = false,
  onToggleFilter,
  onClearFilter,
  searchValue = "",
  onSearchChange,
  showSearch = false,
  showRecordNavigation = true,
  actionsLocked = false,
}) {
  const canNavigate = total > 0 && !actionsLocked;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;
  const counterValue = formatCadastroRecordPosition(currentIndex, total);
  const counterTitle = `Registros: ${counterValue}`;

  return (
    <div className="emp-toolbar shadow-none">
      <div className="emp-toolbar-row flex items-center gap-1.5 whitespace-nowrap">
        <div className="emp-toolbar-actions-primary flex items-center gap-1.5 shrink-0">
          {onBack && (
            <ToolbarBtn onClick={onBack} title="Voltar">
              <EmpToolbarIcon icon={ChevronLeft} nav />
            </ToolbarBtn>
          )}
          <ToolbarBtn onClick={onToggleView} disabled={actionsLocked} title="Visualizar tabela">
            <EmpToolbarIcon icon={List} />
          </ToolbarBtn>
          {!showSaveActions && (
            <ToolbarBtn onClick={onNew} disabled={actionsLocked} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Novo registro">
              <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
              <span>Novo</span>
            </ToolbarBtn>
          )}
          {showEditAction && (
            <ToolbarBtn onClick={onEditRecord} className={LABELED_BTN_CLASS} title="Editar">
              <EmpToolbarIcon icon={Pencil} />
              <span>Editar</span>
            </ToolbarBtn>
          )}
          {showDeleteDuplicateActions && (
            <ToolbarBtn onClick={onDelete} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-delete`} disabled={!canNavigate} title="Excluir">
              <EmpToolbarIcon icon={Trash2} />
              <span>Excluir</span>
            </ToolbarBtn>
          )}
          {showDeleteDuplicateActions && (
            <ToolbarBtn onClick={onDuplicate} className={LABELED_BTN_CLASS} disabled={!canNavigate} title="Duplicar">
              <EmpToolbarIcon icon={Copy} />
              <span>Duplicar</span>
            </ToolbarBtn>
          )}
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
            <div className="emp-toolbar-actions-nav flex items-center gap-1 shrink-0">
              <ToolbarBtn onClick={onFirst} disabled={!canNavigate || isFirst} className={NAV_BTN_CLASS} title="Primeiro">
                <EmpToolbarIcon icon={ChevronsLeft} nav />
              </ToolbarBtn>
              <ToolbarBtn onClick={onPrevious} disabled={!canNavigate || isFirst} className={NAV_BTN_CLASS} title="Anterior">
                <EmpToolbarIcon icon={ChevronLeft} nav />
              </ToolbarBtn>
              <ToolbarBtn onClick={onNext} disabled={!canNavigate || isLast} className={NAV_BTN_CLASS} title="Próximo">
                <EmpToolbarIcon icon={ChevronRight} nav />
              </ToolbarBtn>
              <ToolbarBtn onClick={onLast} disabled={!canNavigate || isLast} className={NAV_BTN_CLASS} title="Último">
                <EmpToolbarIcon icon={ChevronsRight} nav />
              </ToolbarBtn>
            </div>
          )}
          {showSaveActions && (
            <div className="emp-toolbar-actions-save-mobile flex items-center gap-1.5 shrink-0">
              <ToolbarBtn onClick={onSave} disabled={actionsLocked} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new hidden md:inline-flex`} title="Salvar">
                <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
                <span>Salvar</span>
              </ToolbarBtn>
              <ToolbarBtn onClick={onCancel} disabled={actionsLocked} className={`${LABELED_BTN_CLASS} hidden md:inline-flex`} title="Descartar">
                <EmpToolbarIcon icon={X} />
                <span>Cancelar</span>
              </ToolbarBtn>
            </div>
          )}
        </div>

        <div className="emp-toolbar-actions-end ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-hidden">
          {showSearch && (
            <div className={EMP_TOOLBAR_SEARCH_WRAP} role="search" title="Pesquisar registros">
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Pesquisar registros..."
                className={EMP_TOOLBAR_SEARCH_INPUT}
                aria-label="Pesquisar registros"
              />
              <Search
                className="emp-toolbar-search-icon pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          )}
          {showUtilityActions && (
            <ToolbarBtn onClick={onAttachClick} disabled={attachDisabled} title={attachDisabled ? "Salve o registro antes de anexar" : "Anexos"}>
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
              <DropdownMenuContent align="end" className="w-56 rounded-md p-1">
                <DropdownMenuItem onClick={onLayoutConfigClick} disabled={!onLayoutConfigClick} className="h-8 cursor-pointer gap-2 text-xs px-2">
                  Layout do formulário
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onFieldLayoutConfigClick} disabled={!onFieldLayoutConfigClick} className="h-8 cursor-pointer gap-2 text-xs px-2">
                  Configurar layout de campos
                </DropdownMenuItem>
                {onSettingsClick ? (
                  <DropdownMenuItem onClick={onSettingsClick} className="h-8 cursor-pointer gap-2 text-xs px-2">
                    Campos personalizados
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <EmpBubbleCounter
            value={counterValue}
            title={counterTitle}
            variant="toolbar"
            className="emp-toolbar-bubble-counter emp-toolbar-record-counter"
          />
        </div>
      </div>
    </div>
  );
}
