import React from "react";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Paperclip,
  Search,
  List,
  Table,
  Filter,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EmpToolbarButton from "@/components/emp/toolbars/EmpToolbarButton";
import { ERP_TOOLBAR_COUNTER, ERP_TOOLBAR_SEARCH_INPUT, ERP_TOOLBAR_SEARCH_WRAP } from "@/components/emp/toolbars/empToolbarStyles";

const titleCase = (value) => String(value || "").toLowerCase().replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export default function EmpListToolbar({
  viewMode = "table",
  total = 0,
  currentIndex = 0,
  searchValue = "",
  onSearchChange,
  onNew,
  onEdit,
  onToggleView,
  onBack,
  toggleViewDisabled = false,
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
  showSearch = true,
}) {
  const canNavigate = viewMode === "record" && total > 0;
  const showRecordNavigation = viewMode === "record";
  const canEdit = selectedCount === 1 && !!onEdit;
  const canDelete = selectedCount > 0 && !!onDelete;
  const canDuplicate = selectedCount === 1 && !!onDuplicate;

  return (
    <div className="bg-white erp-toolbar border-b border-[#E4E7EC]">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-2 py-1.5">
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
              {onToggleFilter && (
                <DropdownMenuItem onClick={onToggleFilter} className="h-9 cursor-pointer gap-2 text-sm px-3">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {filterActive && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onClearFilter?.(); }}
                      className="ml-auto text-xs text-[#B42318]"
                    >
                      Limpar
                    </button>
                  )}
                </DropdownMenuItem>
              )}
              {showRecordNavigation && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onFirst} disabled={!canNavigate} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    <ChevronsLeft className="w-4 h-4" /> Primeiro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onPrevious} disabled={!canNavigate} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNext} disabled={!canNavigate} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    <ChevronRight className="w-4 h-4" /> Próximo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLast} disabled={!canNavigate} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    <ChevronsRight className="w-4 h-4" /> Último
                  </DropdownMenuItem>
                </>
              )}
              {showUtilityActions && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onConfigColumns} disabled={!onConfigColumns} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    Configurar colunas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportExcel} disabled={!onExportExcel} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    Exportar Excel
                  </DropdownMenuItem>
                  {onConfigExportExcel && (
                    <DropdownMenuItem onClick={onConfigExportExcel} className="h-9 cursor-pointer gap-2 text-sm px-3 pl-9">
                      Configurar Excel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onExportPdf} disabled={!onExportPdf} className="h-9 cursor-pointer gap-2 text-sm px-3">
                    Exportar PDF
                  </DropdownMenuItem>
                  {onConfigExportPdf && (
                    <DropdownMenuItem onClick={onConfigExportPdf} className="h-9 cursor-pointer gap-2 text-sm px-3 pl-9">
                      Configurar PDF
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {onToggleView && (
            <EmpToolbarButton
              variant="icon"
              icon={viewMode === "table" ? List : Table}
              onClick={onToggleView}
              disabled={toggleViewDisabled}
              title={toggleViewDisabled ? "Selecione apenas um registro" : viewMode === "table" ? "Visualizar registro" : "Visualizar tabela"}
            />
          )}

          <EmpToolbarButton variant="primary" icon={Plus} onClick={onNew} title="Novo registro">
            Novo
          </EmpToolbarButton>
          <EmpToolbarButton variant="default" icon={Pencil} onClick={onEdit} disabled={!canEdit} title="Editar">
            Editar
          </EmpToolbarButton>
          <EmpToolbarButton variant="danger" icon={Trash2} onClick={onDelete} disabled={!canDelete} title="Excluir">
            Excluir
          </EmpToolbarButton>
          <EmpToolbarButton variant="default" icon={Copy} onClick={onDuplicate} disabled={!canDuplicate} title="Duplicar">
            Duplicar
          </EmpToolbarButton>
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
          {showUtilityActions && (
            <EmpToolbarButton
              variant="icon"
              icon={Paperclip}
              onClick={onAttachClick}
              disabled={attachDisabled}
              title={attachDisabled ? "Selecione apenas um registro" : "Anexos"}
            />
          )}
          <div className={ERP_TOOLBAR_COUNTER}>
            {viewMode === "record" && total > 0 ? `${currentIndex + 1}/${total}` : selectedCount > 0 ? `${selectedCount}/${total}` : total}
          </div>
        </div>
      </div>

      {viewMode === "record" && (
        <div className="h-8 flex items-center gap-2 bg-white border-t border-[#E4E7EC] px-2">
          {recordLabel && (
            <span className="px-2 py-0.5 rounded border border-[#D0D5DD] bg-white text-[#344054] text-xs font-medium">{titleCase(recordLabel)}</span>
          )}
          <span className="text-sm font-medium text-[#344054] truncate min-w-0 flex-1">{title}</span>
          <span className="ml-auto text-xs font-medium text-[#667085] whitespace-nowrap">{titleCase(operationLabel || "Visualização de Registro")}</span>
        </div>
      )}
    </div>
  );
}
