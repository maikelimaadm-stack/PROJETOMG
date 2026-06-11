import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Filter,
  History,
  MoreVertical,
  Paperclip,
  Printer,
  Search,
  Settings,
} from "lucide-react";
import MgViewSeg from "@/modules/empresas/layout/MgViewSeg";

function ActionLabelBtn({ className = "", children, ...props }) {
  return (
    <button type="button" className={`ios-btn tb-btn tb-btn-labeled ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function MgActionBar({
  viewMode = "tabela",
  onViewModeChange,
  searchValue = "",
  onSearchChange,
  onToggleFilter,
  onNew,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onDuplicate,
  onAttach,
  attachDisabled = false,
  onExportExcel,
  onExportPdf,
  onConfigColumns,
  onLayoutConfig,
  showSave = false,
  showCancel = false,
  showEdit = false,
  showDelete = false,
  showDuplicate = false,
  showNew = true,
  actionsLocked = false,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  return (
    <div
      data-template-id="action-bar"
      className="mg-action-bar canva-section hidden w-full shrink-0 items-center gap-3 border-b px-5 md:flex"
      style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
    >
      <div className="flex items-center gap-1.5">
        {onToggleFilter ? (
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-ghost tb-btn-filter tb-btn-icon"
            onClick={onToggleFilter}
            disabled={actionsLocked}
            title="Filtrar"
            aria-label="Filtrar"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {showNew && onNew ? (
          <ActionLabelBtn
            className="tb-btn-blue"
            onClick={onNew}
            disabled={actionsLocked}
            title="Novo"
          >
            Novo
          </ActionLabelBtn>
        ) : null}

        {showSave && onSave ? (
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onSave}
            disabled={actionsLocked}
            title="Salvar"
          >
            Salvar
          </ActionLabelBtn>
        ) : null}

        {showCancel && onCancel ? (
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onCancel}
            disabled={actionsLocked}
            title="Cancelar"
          >
            Cancelar
          </ActionLabelBtn>
        ) : null}

        {showEdit && onEdit ? (
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onEdit}
            disabled={actionsLocked}
            title="Editar"
          >
            Editar
          </ActionLabelBtn>
        ) : null}

        {showDelete && onDelete ? (
          <ActionLabelBtn
            className="tb-btn-red"
            onClick={onDelete}
            disabled={actionsLocked}
            title="Excluir"
          >
            Excluir
          </ActionLabelBtn>
        ) : null}

        {showDuplicate && onDuplicate ? (
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onDuplicate}
            disabled={actionsLocked}
            title="Duplicar"
          >
            Duplicar
          </ActionLabelBtn>
        ) : null}
      </div>

      <div className="mg-action-bar__end">
        <div className="mg-search-pill" role="search">
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-3)", marginRight: 6 }} />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            aria-label="Pesquisar"
          />
        </div>

        <MgViewSeg value={viewMode} onChange={onViewModeChange} disabled={actionsLocked} />

        <div className="relative" ref={moreRef}>
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-ghost tb-btn-more tb-btn-icon"
            id="more-btn"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <div id="more-dd" className={`dropdown-menu${moreOpen ? " open" : ""}`}>
            {onDuplicate && !showDuplicate ? (
              <button type="button" onClick={() => { onDuplicate(); setMoreOpen(false); }}>
                <Copy className="h-4 w-4" />
                Duplicar
              </button>
            ) : null}
            <button type="button" onClick={() => setMoreOpen(false)}>
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            {onExportExcel ? (
              <button type="button" onClick={() => { onExportExcel(); setMoreOpen(false); }}>
                <Download className="h-4 w-4" />
                Exportar
              </button>
            ) : null}
            <button type="button" onClick={() => setMoreOpen(false)}>
              <History className="h-4 w-4" />
              Histórico
            </button>
            {onAttach ? (
              <button type="button" disabled={attachDisabled} onClick={() => { onAttach(); setMoreOpen(false); }}>
                <Paperclip className="h-4 w-4" />
                Anexos
              </button>
            ) : null}
            {onConfigColumns ? (
              <button type="button" onClick={() => { onConfigColumns(); setMoreOpen(false); }}>
                <Settings className="h-4 w-4" />
                Configurações
              </button>
            ) : null}
            {onLayoutConfig ? (
              <button type="button" onClick={() => { onLayoutConfig(); setMoreOpen(false); }}>
                <Settings className="h-4 w-4" />
                Layout do formulário
              </button>
            ) : null}
            {onExportPdf ? (
              <button type="button" onClick={() => { onExportPdf(); setMoreOpen(false); }}>
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
