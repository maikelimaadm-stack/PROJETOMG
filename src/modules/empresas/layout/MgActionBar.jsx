import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  Filter,
  History,
  Loader2,
  Paperclip,
  Printer,
  RotateCcw,
  Search,
  Settings,
  X,
} from "lucide-react";
import MgViewSeg from "@/modules/empresas/layout/MgViewSeg";
import MgSpeedDialMenu from "@/modules/empresas/layout/MgSpeedDialMenu";
import MgSearchResultsDropdown from "@/modules/empresas/layout/MgSearchResultsDropdown";

function ActionLabelBtn({ className = "", children, ...props }) {
  return (
    <button type="button" className={`ios-btn tb-btn tb-btn-labeled ${className}`} {...props}>
      {children}
    </button>
  );
}

function ActionSlot({ show, width = 88, children }) {
  return (
    <div
      className={`mg-action-slot${show ? " is-visible" : ""}`}
      style={{ "--slot-width": `${width}px` }}
      aria-hidden={!show}
    >
      {children}
    </div>
  );
}

export default function MgActionBar({
  viewMode = "tabela",
  onViewModeChange,
  searchInputValue = "",
  onSearchInputChange,
  searchResults = [],
  searchResultsTotal = 0,
  searchHasFavoritesInResults = false,
  searchDetailFields = [],
  searchLoading = false,
  searchHasFilter = false,
  onSearchClear,
  searchDropdownConfigFields = [],
  onSearchDropdownConfigSave,
  onSearchDropdownConfigRestore,
  onSearchResultSelect,
  onSearchApplyAll,
  onSearchApplyFavorites,
  isFavoriteRecord,
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
  secondaryToolsLocked = false,
  layoutConfigMode = false,
  layoutToolbar = null,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef(null);
  const searchRef = useRef(null);
  const toolsLocked = actionsLocked || secondaryToolsLocked;
  const lockedClass = secondaryToolsLocked ? " mg-action-bar__zone--locked" : "";

  useEffect(() => {
    if (secondaryToolsLocked) {
      setMoreOpen(false);
      setSearchOpen(false);
    }
  }, [secondaryToolsLocked]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const close = (event) => {
      if (event.target.closest?.(".mg-config-backdrop")) return;
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  const speedDialItems = useMemo(() => {
    const items = [];

    if (onDuplicate && !showDuplicate) {
      items.push({
        id: "duplicate",
        label: "Duplicar",
        icon: Copy,
        onClick: onDuplicate,
      });
    }

    items.push({
      id: "print",
      label: "Imprimir",
      icon: Printer,
      onClick: () => {},
    });

    if (onExportExcel) {
      items.push({
        id: "export",
        label: "Exportar",
        icon: Download,
        onClick: onExportExcel,
      });
    }

    items.push({
      id: "history",
      label: "Histórico",
      icon: History,
      onClick: () => {},
    });

    if (onAttach) {
      items.push({
        id: "attach",
        label: "Anexos",
        icon: Paperclip,
        onClick: onAttach,
        disabled: attachDisabled,
      });
    }

    if (onConfigColumns) {
      items.push({
        id: "config",
        label: "Configurações",
        icon: Settings,
        onClick: onConfigColumns,
      });
    }

    if (onLayoutConfig) {
      items.push({
        id: "layout",
        label: "Layout do formulário",
        icon: Settings,
        onClick: onLayoutConfig,
      });
    }

    if (onExportPdf) {
      items.push({
        id: "export-pdf",
        label: "Exportar PDF",
        icon: Download,
        onClick: onExportPdf,
      });
    }

    return items;
  }, [
    attachDisabled,
    onAttach,
    onConfigColumns,
    onDuplicate,
    onExportExcel,
    onExportPdf,
    onLayoutConfig,
    showDuplicate,
  ]);

  if (layoutConfigMode && layoutToolbar) {
    const { isEditing, onBack, onEdit, onSave, onCancel, onRestore } = layoutToolbar;

    return (
      <div
        data-template-id="action-bar"
        className="mg-action-bar canva-section hidden w-full shrink-0 items-center md:flex"
        style={{
          background: "var(--bg-card)",
        }}
      >
        <div className="mg-action-bar__actions flex min-w-0 items-center">
          <ActionSlot show={!!onBack} width={74}>
            <ActionLabelBtn className="tb-btn-ghost" onClick={onBack} disabled={actionsLocked} title="Voltar">
              Voltar
            </ActionLabelBtn>
          </ActionSlot>
          <ActionSlot show={!isEditing && !!onEdit} width={66}>
            <ActionLabelBtn className="tb-btn-ghost" onClick={onEdit} disabled={actionsLocked} title="Editar layout">
              Editar
            </ActionLabelBtn>
          </ActionSlot>
          <ActionSlot show={isEditing && !!onSave} width={68}>
            <ActionLabelBtn className="tb-btn-green" onClick={onSave} disabled={actionsLocked} title="Salvar">
              Salvar
            </ActionLabelBtn>
          </ActionSlot>
          <ActionSlot show={isEditing && !!onCancel} width={74}>
            <ActionLabelBtn className="tb-btn-ghost" onClick={onCancel} disabled={actionsLocked} title="Cancelar">
              Cancelar
            </ActionLabelBtn>
          </ActionSlot>
        </div>
        <div className="mg-action-bar__end">
          {isEditing && onRestore ? (
            <button
              type="button"
              className="ios-btn tb-btn tb-btn-ghost tb-btn-icon"
              onClick={onRestore}
              disabled={actionsLocked}
              title="Restaurar padrão"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      data-template-id="action-bar"
      className="mg-action-bar canva-section hidden w-full shrink-0 items-center md:flex"
      style={{
        background: "var(--bg-card)",
      }}
    >
      <div className="mg-action-bar__actions flex min-w-0 items-center">
        <ActionSlot show={!!onToggleFilter} width={28}>
          <div className={`mg-action-bar__filter-slot${lockedClass}`}>
            <button
              type="button"
              className="ios-btn tb-btn tb-btn-ghost tb-btn-filter tb-btn-icon"
              onClick={onToggleFilter}
              disabled={toolsLocked}
              title="Filtrar"
              aria-label="Filtrar"
              aria-disabled={toolsLocked}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </ActionSlot>

        <ActionSlot show={showNew && !!onNew} width={64}>
          <ActionLabelBtn
            className="tb-btn-green"
            onClick={onNew}
            disabled={actionsLocked}
            title="Novo"
          >
            Novo
          </ActionLabelBtn>
        </ActionSlot>

        <ActionSlot show={showSave && !!onSave} width={68}>
          <ActionLabelBtn
            className="tb-btn-green"
            onClick={onSave}
            disabled={actionsLocked}
            title="Salvar"
          >
            Salvar
          </ActionLabelBtn>
        </ActionSlot>

        <ActionSlot show={showCancel && !!onCancel} width={74}>
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onCancel}
            disabled={actionsLocked}
            title="Cancelar"
          >
            Cancelar
          </ActionLabelBtn>
        </ActionSlot>

        <ActionSlot show={showEdit && !!onEdit} width={66}>
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onEdit}
            disabled={actionsLocked}
            title="Editar"
          >
            Editar
          </ActionLabelBtn>
        </ActionSlot>

        <ActionSlot show={showDelete && !!onDelete} width={68}>
          <ActionLabelBtn
            className="tb-btn-ghost tb-btn-danger"
            onClick={onDelete}
            disabled={actionsLocked}
            title="Excluir"
          >
            Excluir
          </ActionLabelBtn>
        </ActionSlot>

        <ActionSlot show={showDuplicate && !!onDuplicate} width={78}>
          <ActionLabelBtn
            className="tb-btn-ghost"
            onClick={onDuplicate}
            disabled={actionsLocked}
            title="Duplicar"
          >
            Duplicar
          </ActionLabelBtn>
        </ActionSlot>
      </div>

      <div className={`mg-action-bar__end${lockedClass}`}>
        <div className="mg-action-bar__tools mg-action-bar__tools--visible">
          <div className="mg-search-pill-wrap" ref={searchRef}>
            <div className="mg-search-pill" role="search">
              {searchLoading ? (
                <Loader2
                  className="mg-search-pill-icon mg-search-pill-icon--loading h-3.5 w-3.5 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : searchHasFilter ? (
                <button
                  type="button"
                  className="mg-search-pill-clear"
                  aria-label="Limpar pesquisa"
                  disabled={toolsLocked}
                  onClick={() => {
                    onSearchClear?.();
                    setSearchOpen(false);
                  }}
                >
                  <X className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
              ) : (
                <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchInputValue}
                onChange={(event) => {
                  const next = event.target.value;
                  onSearchInputChange?.(next);
                  if (!toolsLocked) setSearchOpen(true);
                }}
                onFocus={() => {
                  if (!toolsLocked) setSearchOpen(true);
                }}
                onClick={() => {
                  if (!toolsLocked) setSearchOpen(true);
                }}
                aria-label="Pesquisar"
                aria-expanded={searchOpen}
                aria-haspopup="listbox"
                disabled={toolsLocked}
                tabIndex={toolsLocked ? -1 : 0}
              />
            </div>
            <MgSearchResultsDropdown
              open={searchOpen && !toolsLocked}
              items={searchResults}
              searchResultsTotal={searchResultsTotal}
              searchHasFavoritesInResults={searchHasFavoritesInResults}
              detailFields={searchDetailFields}
              loading={searchLoading}
              searchQuery={searchInputValue}
              configFields={searchDropdownConfigFields}
              onConfigSave={onSearchDropdownConfigSave}
              onConfigRestoreDefaults={onSearchDropdownConfigRestore}
              onSelect={(emp) => {
                onSearchResultSelect?.(emp);
                setSearchOpen(false);
              }}
              onApplyAll={() => {
                onSearchApplyAll?.();
                setSearchOpen(false);
              }}
              onApplyFavorites={() => {
                onSearchApplyFavorites?.();
                setSearchOpen(false);
              }}
              isFavoriteRecord={isFavoriteRecord}
            />
          </div>
          <MgViewSeg value={viewMode} onChange={onViewModeChange} disabled={toolsLocked} />
        </div>

        <div className="relative" ref={moreRef}>
          <MgSpeedDialMenu
            open={moreOpen}
            onOpenChange={setMoreOpen}
            disabled={toolsLocked}
            items={speedDialItems}
          />
        </div>
      </div>
    </div>
  );
}
