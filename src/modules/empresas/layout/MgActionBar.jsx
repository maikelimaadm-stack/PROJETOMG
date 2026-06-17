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
import { useIsMobile } from "@/hooks/use-mobile";

const DESKTOP_SEARCH_ANIM_MS = 220;

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
  searchLoadingMore = false,
  searchHasMore = false,
  onSearchLoadMore,
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
  filterActive = false,
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
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [desktopSearchExpanded, setDesktopSearchExpanded] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const moreRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const searchAnimTimeoutRef = useRef(null);
  const desktopSearchExpandedRef = useRef(false);
  const desktopSearchOpenRef = useRef(false);
  const isMobile = useIsMobile();
  const showSecondaryTools = !secondaryToolsLocked;
  const lockedClass = actionsLocked ? " mg-action-bar__zone--locked" : "";

  useEffect(() => {
    if (secondaryToolsLocked) {
      setMoreOpen(false);
      setSearchOpen(false);
      setMobileSearchExpanded(false);
      setDesktopSearchExpanded(false);
      setDesktopSearchOpen(false);
    }
  }, [secondaryToolsLocked]);

  useEffect(() => () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (searchAnimTimeoutRef.current) {
      window.clearTimeout(searchAnimTimeoutRef.current);
      searchAnimTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    desktopSearchExpandedRef.current = desktopSearchExpanded;
    desktopSearchOpenRef.current = desktopSearchOpen;
  }, [desktopSearchExpanded, desktopSearchOpen]);

  const shouldKeepDesktopSearchExpanded =
    searchHasFilter || String(searchInputValue || "").trim().length > 0;

  const clearDesktopSearchAnimTimeout = () => {
    if (searchAnimTimeoutRef.current) {
      window.clearTimeout(searchAnimTimeoutRef.current);
      searchAnimTimeoutRef.current = null;
    }
  };

  const beginCollapseDesktopSearch = () => {
    if (searchAnimTimeoutRef.current) return;

    if (!desktopSearchExpandedRef.current) {
      setSearchOpen(false);
      setDesktopSearchOpen(false);
      return;
    }

    setSearchOpen(false);
    setDesktopSearchOpen(false);
    clearDesktopSearchAnimTimeout();
    searchAnimTimeoutRef.current = window.setTimeout(() => {
      setDesktopSearchExpanded(false);
      searchAnimTimeoutRef.current = null;
    }, DESKTOP_SEARCH_ANIM_MS);
  };

  const toggleDesktopSearch = () => {
    if (actionsLocked) return;
    if (searchHasFilter) {
      onSearchClear?.();
      return;
    }
    if (desktopSearchExpandedRef.current && desktopSearchOpenRef.current) {
      beginCollapseDesktopSearch();
      return;
    }
    clearDesktopSearchAnimTimeout();
    expandDesktopSearch();
  };

  const expandDesktopSearch = () => {
    if (actionsLocked) return;
    clearDesktopSearchAnimTimeout();
    setDesktopSearchExpanded(true);
    setDesktopSearchOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setDesktopSearchOpen(true);
        desktopSearchInputRef.current?.focus();
        setSearchOpen(true);
      });
    });
  };

  const handleDesktopSearchBlur = () => {
    window.clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = window.setTimeout(() => {
      if (searchRef.current?.contains(document.activeElement)) return;
      if (shouldKeepDesktopSearchExpanded) return;
      if (searchAnimTimeoutRef.current) return;
      beginCollapseDesktopSearch();
    }, 120);
  };

  useEffect(() => {
    if (!searchOpen && !desktopSearchExpanded) return undefined;
    const close = (event) => {
      if (event.target.closest?.(".mg-config-backdrop")) return;
      if (!searchRef.current?.contains(event.target)) {
        if (!shouldKeepDesktopSearchExpanded) beginCollapseDesktopSearch();
        else setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [searchOpen, desktopSearchExpanded, desktopSearchOpen, shouldKeepDesktopSearchExpanded]);

  useEffect(() => {
    if (!searchOpen && !desktopSearchExpanded) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!shouldKeepDesktopSearchExpanded) beginCollapseDesktopSearch();
        else setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, desktopSearchExpanded, desktopSearchOpen, shouldKeepDesktopSearchExpanded]);

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
    onConfigColumns,
    onDuplicate,
    onExportExcel,
    onExportPdf,
    onLayoutConfig,
    showDuplicate,
  ]);

  const collapseMobileSearch = () => {
    setMobileSearchExpanded(false);
    setSearchOpen(false);
  };

  const expandMobileSearch = () => {
    if (actionsLocked) return;
    setMobileSearchExpanded(true);
    requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus();
      setSearchOpen(true);
    });
  };

  const handleMobileSearchBlur = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = window.setTimeout(() => {
      if (searchRef.current?.contains(document.activeElement)) return;
      collapseMobileSearch();
      blurTimeoutRef.current = null;
    }, 120);
  };

  const renderAttachButton = (extraClassName = "") => {
    if (!onAttach) return null;

    return (
      <button
        type="button"
        className={`ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-action-bar__attach-btn${extraClassName ? ` ${extraClassName}` : ""}`}
        onClick={onAttach}
        disabled={actionsLocked || attachDisabled}
        title="Anexos"
        aria-label="Anexos"
      >
        <Paperclip className="h-3.5 w-3.5" />
      </button>
    );
  };

  const renderSearchDropdown = (onClose) => (
    <MgSearchResultsDropdown
      open={searchOpen && !actionsLocked}
      items={searchResults}
      searchResultsTotal={searchResultsTotal}
      searchHasFavoritesInResults={searchHasFavoritesInResults}
      detailFields={searchDetailFields}
      loading={searchLoading}
      loadingMore={searchLoadingMore}
      hasMore={searchHasMore}
      onLoadMore={onSearchLoadMore}
      searchQuery={searchInputValue}
      configFields={searchDropdownConfigFields}
      onConfigSave={onSearchDropdownConfigSave}
      onConfigRestoreDefaults={onSearchDropdownConfigRestore}
      onSelect={(emp) => {
        onSearchResultSelect?.(emp);
        onClose?.();
      }}
      onApplyAll={() => {
        onSearchApplyAll?.();
        onClose?.();
      }}
      onApplyFavorites={() => {
        onSearchApplyFavorites?.();
        onClose?.();
      }}
      isFavoriteRecord={isFavoriteRecord}
    />
  );

  const renderMobileSearchField = () => (
    <div
      className={`mg-mobile-search${mobileSearchExpanded ? " is-expanded" : ""}`}
      ref={searchRef}
    >
      {!mobileSearchExpanded ? (
        <button
          type="button"
          className={`ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-mobile-search__trigger${
            searchHasFilter ? " mg-mobile-search__trigger--active" : ""
          }`}
          onClick={() => {
            if (searchHasFilter) {
              onSearchClear?.();
              return;
            }
            expandMobileSearch();
          }}
          disabled={actionsLocked}
          aria-label={searchHasFilter ? "Pesquisa ativa" : "Pesquisar"}
          aria-expanded={false}
        >
          {searchHasFilter ? (
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      ) : (
        <div className="mg-search-pill-wrap mg-mobile-search__field">
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
                disabled={actionsLocked}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSearchClear?.();
                  collapseMobileSearch();
                }}
              >
                <X className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </button>
            ) : (
              <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Pesquisar..."
              value={searchInputValue}
              onChange={(event) => {
                const next = event.target.value;
                onSearchInputChange?.(next);
                if (!actionsLocked) setSearchOpen(true);
              }}
              onFocus={() => {
                if (!actionsLocked) setSearchOpen(true);
              }}
              onBlur={handleMobileSearchBlur}
              aria-label="Pesquisar"
              aria-expanded={searchOpen}
              aria-haspopup="listbox"
              disabled={actionsLocked}
            />
          </div>
          {renderSearchDropdown(collapseMobileSearch)}
        </div>
      )}
    </div>
  );

  const renderSearchField = () => (
    <div
      className={`mg-desktop-search${desktopSearchExpanded ? " is-expanded" : ""}${desktopSearchOpen ? " is-open" : ""}`}
      ref={searchRef}
    >
      <button
        type="button"
        className={`ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-desktop-search__trigger${
          searchHasFilter ? " mg-desktop-search__trigger--active" : ""
        }`}
        onClick={toggleDesktopSearch}
        disabled={actionsLocked}
        aria-label={searchHasFilter ? "Pesquisa ativa" : "Pesquisar"}
        aria-expanded={desktopSearchOpen}
        tabIndex={desktopSearchOpen ? -1 : 0}
      >
        {searchHasFilter ? (
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      {desktopSearchExpanded ? (
        <div className="mg-desktop-search__panel" aria-hidden={!desktopSearchOpen}>
          <div className="mg-desktop-search__panel-inner">
            <div className="mg-search-pill-wrap mg-desktop-search__field">
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
                    disabled={actionsLocked}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSearchClear?.();
                      beginCollapseDesktopSearch();
                    }}
                  >
                    <X className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mg-search-pill-toggle"
                    aria-label="Fechar pesquisa"
                    disabled={actionsLocked}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (shouldKeepDesktopSearchExpanded) {
                        setSearchOpen(false);
                        return;
                      }
                      beginCollapseDesktopSearch();
                    }}
                  >
                    <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </button>
                )}
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchInputValue}
                  onChange={(event) => {
                    const next = event.target.value;
                    onSearchInputChange?.(next);
                    if (!actionsLocked) setSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (!actionsLocked) setSearchOpen(true);
                  }}
                  onBlur={handleDesktopSearchBlur}
                  aria-label="Pesquisar"
                  aria-expanded={searchOpen}
                  aria-haspopup="listbox"
                  disabled={actionsLocked}
                  tabIndex={desktopSearchOpen ? 0 : -1}
                />
              </div>
              {renderSearchDropdown(() => {
                if (!shouldKeepDesktopSearchExpanded) beginCollapseDesktopSearch();
                else setSearchOpen(false);
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderPrimaryActions = () => (
    <>
      <ActionSlot show={showNew && !!onNew} width={64}>
        <ActionLabelBtn className="tb-btn-green" onClick={onNew} disabled={actionsLocked} title="Novo">
          Novo
        </ActionLabelBtn>
      </ActionSlot>
      <ActionSlot show={showSave && !!onSave} width={68}>
        <ActionLabelBtn className="tb-btn-green" onClick={onSave} disabled={actionsLocked} title="Salvar">
          Salvar
        </ActionLabelBtn>
      </ActionSlot>
      <ActionSlot show={showCancel && !!onCancel} width={74}>
        <ActionLabelBtn className="tb-btn-ghost" onClick={onCancel} disabled={actionsLocked} title="Cancelar">
          Cancelar
        </ActionLabelBtn>
      </ActionSlot>
      <ActionSlot show={showEdit && !!onEdit} width={66}>
        <ActionLabelBtn className="tb-btn-ghost" onClick={onEdit} disabled={actionsLocked} title="Editar">
          Editar
        </ActionLabelBtn>
      </ActionSlot>
      <ActionSlot show={showDelete && !!onDelete} width={68}>
        <ActionLabelBtn className="tb-btn-ghost tb-btn-danger" onClick={onDelete} disabled={actionsLocked} title="Excluir">
          Excluir
        </ActionLabelBtn>
      </ActionSlot>
      <ActionSlot show={showDuplicate && !!onDuplicate} width={78}>
        <ActionLabelBtn className="tb-btn-ghost" onClick={onDuplicate} disabled={actionsLocked} title="Duplicar">
          Duplicar
        </ActionLabelBtn>
      </ActionSlot>
    </>
  );

  if (layoutConfigMode && layoutToolbar) {
    const { isEditing, onBack, onEdit, onSave, onCancel, onRestore } = layoutToolbar;

    return (
      <>
        <div
          data-template-id="action-bar-mobile"
          className="mg-action-bar-mobile canva-section flex w-full shrink-0 flex-col md:hidden"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="mg-action-bar-mobile__actions">
            {onBack ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onBack} disabled={actionsLocked} title="Voltar">
                Voltar
              </ActionLabelBtn>
            ) : null}
            {!isEditing && onEdit ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onEdit} disabled={actionsLocked} title="Editar layout">
                Editar
              </ActionLabelBtn>
            ) : null}
            {isEditing && onSave ? (
              <ActionLabelBtn className="tb-btn-green shrink-0" onClick={onSave} disabled={actionsLocked} title="Salvar">
                Salvar
              </ActionLabelBtn>
            ) : null}
            {isEditing && onCancel ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onCancel} disabled={actionsLocked} title="Cancelar">
                Cancelar
              </ActionLabelBtn>
            ) : null}
            {isEditing && onRestore ? (
              <button
                type="button"
                className="ios-btn tb-btn tb-btn-ghost tb-btn-icon shrink-0"
                onClick={onRestore}
                disabled={actionsLocked}
                title="Restaurar padrão"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

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
      </>
    );
  }

  return (
    <>
      <div
        data-template-id="action-bar-mobile"
        className={`mg-action-bar-mobile canva-section flex w-full shrink-0 md:hidden${
          mobileSearchExpanded ? " mg-action-bar-mobile--search-open" : ""
        }`}
        style={{ background: "var(--bg-card)" }}
      >
        <div className="mg-action-bar-mobile__row">
          <div className={`mg-action-bar-mobile__actions${lockedClass}`}>
            {showSecondaryTools && onToggleFilter ? (
              <button
                type="button"
                className={`ios-btn tb-btn tb-btn-ghost tb-btn-filter tb-btn-icon shrink-0${
                  filterActive ? " tb-btn-filter-active" : ""
                }`}
                onClick={onToggleFilter}
                disabled={actionsLocked}
                title="Filtrar"
                aria-label="Filtrar"
                aria-pressed={filterActive}
              >
                <Filter className="h-3.5 w-3.5" />
                {filterActive ? <span className="tb-filter-active-dot" aria-hidden="true" /> : null}
              </button>
            ) : null}
            {showNew && onNew ? (
              <ActionLabelBtn className="tb-btn-green shrink-0" onClick={onNew} disabled={actionsLocked} title="Novo">
                Novo
              </ActionLabelBtn>
            ) : null}
            {showSave && onSave ? (
              <ActionLabelBtn className="tb-btn-green shrink-0" onClick={onSave} disabled={actionsLocked} title="Salvar">
                Salvar
              </ActionLabelBtn>
            ) : null}
            {showCancel && onCancel ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onCancel} disabled={actionsLocked} title="Cancelar">
                Cancelar
              </ActionLabelBtn>
            ) : null}
            {showEdit && onEdit ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onEdit} disabled={actionsLocked} title="Editar">
                Editar
              </ActionLabelBtn>
            ) : null}
            {showDelete && onDelete ? (
              <ActionLabelBtn className="tb-btn-ghost tb-btn-danger shrink-0" onClick={onDelete} disabled={actionsLocked} title="Excluir">
                Excluir
              </ActionLabelBtn>
            ) : null}
            {showDuplicate && onDuplicate ? (
              <ActionLabelBtn className="tb-btn-ghost shrink-0" onClick={onDuplicate} disabled={actionsLocked} title="Duplicar">
                Duplicar
              </ActionLabelBtn>
            ) : null}
            {showSecondaryTools ? (
              <div className="relative shrink-0" ref={moreRef}>
                <MgSpeedDialMenu
                  open={moreOpen}
                  onOpenChange={setMoreOpen}
                  disabled={actionsLocked}
                  items={speedDialItems}
                />
              </div>
            ) : null}
          </div>
          {showSecondaryTools ? (
            <div className={`mg-action-bar-mobile__search-slot${lockedClass}`}>
              {renderMobileSearchField()}
              {renderAttachButton("shrink-0")}
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-template-id="action-bar"
        className="mg-action-bar canva-section hidden w-full shrink-0 items-center md:flex"
        style={{
          background: "var(--bg-card)",
        }}
      >
      <div className="mg-action-bar__actions flex min-w-0 items-center">
        <ActionSlot show={showSecondaryTools && !!onToggleFilter} width={28}>
          <div className={`mg-action-bar__filter-slot${lockedClass}`}>
            <button
              type="button"
              className={`ios-btn tb-btn tb-btn-ghost tb-btn-filter tb-btn-icon${filterActive ? " tb-btn-filter-active" : ""}`}
              onClick={onToggleFilter}
              disabled={actionsLocked}
              title="Filtrar"
              aria-label="Filtrar"
              aria-pressed={filterActive}
              aria-disabled={actionsLocked}
            >
              <Filter className="h-3.5 w-3.5" />
              {filterActive ? (
                <span className="tb-filter-active-dot" aria-hidden="true" />
              ) : null}
            </button>
          </div>
        </ActionSlot>

        {renderPrimaryActions()}
      </div>

      <div className="mg-action-bar__end">
        {showSecondaryTools ? (
          <>
            <div className={`mg-action-bar__tools mg-action-bar__tools--visible${lockedClass}`}>
              {renderSearchField()}
            </div>
            {renderAttachButton()}
            <MgViewSeg value={viewMode} onChange={onViewModeChange} disabled={actionsLocked} />
            <div className="relative" ref={moreRef}>
              <MgSpeedDialMenu
                open={moreOpen}
                onOpenChange={setMoreOpen}
                disabled={actionsLocked}
                items={speedDialItems}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
    </>
  );
}
