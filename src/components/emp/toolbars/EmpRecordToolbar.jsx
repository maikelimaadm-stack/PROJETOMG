import React from "react";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  Paperclip,
  Search,
  List,
  Filter,
  Check,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EmpToolbarButton from "@/components/emp/toolbars/EmpToolbarButton";
import { ERP_TOOLBAR_COUNTER, ERP_TOOLBAR_SEARCH_INPUT, ERP_TOOLBAR_SEARCH_WRAP } from "@/components/emp/toolbars/empToolbarStyles";

const titleCase = (value) => String(value || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

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
  onRefresh,
  filterOpen = false,
  filterActive = false,
  onToggleFilter,
  onClearFilter,
  searchValue = "",
  onSearchChange,
  showSearch = false,
}) {
  const canNavigate = total > 0;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="bg-white erp-toolbar shadow-none overflow-hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-2 py-1.5 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EmpToolbarButton variant="icon" icon={Menu} title="Menu" aria-label="Menu" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-md p-1">
              {onBack && (
                <DropdownMenuItem onClick={onBack} className="h-9 cursor-pointer gap-2 text-sm px-3">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </DropdownMenuItem>
              )}
              {onToggleView && (
                <DropdownMenuItem onClick={onToggleView} className="h-9 cursor-pointer gap-2 text-sm px-3">
                  <List className="w-4 h-4" /> Visualizar tabela
                </DropdownMenuItem>
              )}
              {onToggleFilter && (
                <DropdownMenuItem onClick={onToggleFilter} className="h-9 cursor-pointer gap-2 text-sm px-3">
                  <Filter className="w-4 h-4" /> Filtros
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFirst} disabled={!canNavigate || isFirst} className="h-9 cursor-pointer gap-2 text-sm px-3">
                <ChevronsLeft className="w-4 h-4" /> Primeiro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPrevious} disabled={!canNavigate || isFirst} className="h-9 cursor-pointer gap-2 text-sm px-3">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNext} disabled={!canNavigate || isLast} className="h-9 cursor-pointer gap-2 text-sm px-3">
                <ChevronRight className="w-4 h-4" /> Próximo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLast} disabled={!canNavigate || isLast} className="h-9 cursor-pointer gap-2 text-sm px-3">
                <ChevronsRight className="w-4 h-4" /> Último
              </DropdownMenuItem>
              {showUtilityActions && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLayoutConfigClick} disabled={!onLayoutConfigClick} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    Layout do formulário
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick} disabled={!onSettingsClick} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    Campos personalizados
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <EmpToolbarButton variant="primary" icon={Plus} onClick={onNew} title="Novo registro">
            Novo
          </EmpToolbarButton>
          {showEditAction && (
            <EmpToolbarButton variant="default" icon={Pencil} onClick={onEditRecord} title="Editar">
              Editar
            </EmpToolbarButton>
          )}
          {showDeleteDuplicateActions && (
            <>
              <EmpToolbarButton variant="danger" icon={Trash2} onClick={onDelete} disabled={!canNavigate} title="Excluir">
                Excluir
              </EmpToolbarButton>
              <EmpToolbarButton variant="default" icon={Copy} onClick={onDuplicate} disabled={!canNavigate} title="Duplicar">
                Duplicar
              </EmpToolbarButton>
            </>
          )}
          {onRefresh && (
            <EmpToolbarButton variant="default" icon={RefreshCw} onClick={onRefresh} title="Atualizar">
              Atualizar
            </EmpToolbarButton>
          )}
          {showUtilityActions && (
            <EmpToolbarButton
              variant="default"
              icon={Paperclip}
              onClick={onAttachClick}
              disabled={attachDisabled}
              title={attachDisabled ? "Salve o registro antes de anexar" : "Anexos"}
            >
              Anexos
            </EmpToolbarButton>
          )}
          {showSaveActions && (
            <>
              <EmpToolbarButton variant="default" icon={Check} onClick={onSave} title="Salvar" active>
                Salvar
              </EmpToolbarButton>
              <EmpToolbarButton variant="default" icon={X} onClick={onCancel} title="Descartar">
                Cancelar
              </EmpToolbarButton>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {showSearch && (
            <div className={ERP_TOOLBAR_SEARCH_WRAP}>
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Pesquisar registros..."
                className={ERP_TOOLBAR_SEARCH_INPUT}
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#667085] pointer-events-none" strokeWidth={1.75} />
            </div>
          )}
          <div className={ERP_TOOLBAR_COUNTER}>{total > 0 ? `${currentIndex + 1}/${total}` : total}</div>
        </div>
      </div>

      <div className="h-8 flex items-center gap-2 bg-white border-b border-[#E4E7EC] px-2">
        <span className="max-w-[150px] h-6 px-2 rounded border border-[#D0D5DD] text-[#344054] text-xs font-medium text-center truncate inline-flex items-center justify-center">
          {titleCase(badgeLabel)}
        </span>
        <span className="text-sm font-medium text-[#344054] truncate min-w-0 flex-1">{title}</span>
        {operationLabel && (
          <span className="ml-auto text-xs font-medium text-[#667085] whitespace-nowrap">{titleCase(operationLabel)}</span>
        )}
      </div>
    </div>
  );
}
