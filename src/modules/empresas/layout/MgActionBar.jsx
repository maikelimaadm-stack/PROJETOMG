import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Filter,
  History,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import MgViewSeg from "@/modules/empresas/layout/MgViewSeg";

export default function MgActionBar({
  viewMode = "tabela",
  onViewModeChange,
  searchValue = "",
  onSearchChange,
  onToggleFilter,
  onNew,
  onSave,
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
  showEdit = false,
  showDelete = false,
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
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-green tb-btn-icon"
            onClick={onNew}
            disabled={actionsLocked}
            title="Novo"
            aria-label="Novo"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {showSave && onSave ? (
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-blue tb-btn-icon"
            onClick={onSave}
            disabled={actionsLocked}
            title="Salvar"
            aria-label="Salvar"
          >
            <Save className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {showEdit && onEdit ? (
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-gray tb-btn-icon"
            onClick={onEdit}
            disabled={actionsLocked}
            title="Editar"
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {showDelete && onDelete ? (
          <button
            type="button"
            className="ios-btn tb-btn tb-btn-red tb-btn-icon"
            onClick={onDelete}
            disabled={actionsLocked}
            title="Excluir"
            aria-label="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
            {onDuplicate ? (
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
