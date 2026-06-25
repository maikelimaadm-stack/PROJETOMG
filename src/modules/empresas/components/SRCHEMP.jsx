import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, Star, X } from "lucide-react";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";
import MgCardsVirtualGrid from "./MgCardsVirtualGrid";
import {
  formatSearchCounter,
  getEmpSearchAvatarColor,
  getEmpSearchFieldValue,
  getEmpSearchInitials,
  loadSearchFavorites,
  loadSearchVisFields,
  saveSearchFavorites,
  saveSearchVisFields,
} from "./empSearchView.constants";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";
import ErpScrollNav from "@/shared/components/ErpScrollNav";
import {
  CARD_GRID_GAP,
  CARDS_TOP_PADDING,
  estimateCardRowHeight,
} from "@/shared/hooks/useGridVirtualizer";
import { scrollVirtualRowIntoView } from "@/shared/utils/virtualScrollIntoView";
import { ROW_DBLCLICK_OPEN_MS, ROW_DBLCLICK_PAIR_MS } from "./tblEmp.constants";
import { LIST_PAGE_SIZE_OPTIONS } from "@/shared/listing/listQueryConfig";
import EmpLoadBatchControls from "@/modules/empresas/components/EmpLoadBatchControls";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import "./empSearchView.css";

function SearchPageSizeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div
      className={`emp-search-page-size${open ? " open" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((current) => !current);
      }}
      role="presentation"
    >
      <div className="emp-search-page-size-display">{value}</div>
      <ChevronDown
        className="pointer-events-none absolute text-slate-400"
        style={{ width: 12, height: 12, right: 10, top: "50%", transform: "translateY(-50%)" }}
      />
      <div className="emp-search-page-size-panel" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="py-1">
          {LIST_PAGE_SIZE_OPTIONS.map((size) => (
            <div
              key={size}
              className={`emp-search-page-size-option${size === value ? " emp-search-page-size-option--selected" : ""}`}
              onClick={() => {
                onChange(size);
                setOpen(false);
              }}
              role="presentation"
            >
              {size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  let start = Math.max(1, page - 1);
  let end = Math.min(totalPages, start + 2);
  if (end - start < 2) start = Math.max(1, end - 2);

  const buttons = [];
  if (start > 1) {
    buttons.push(
      <button key="first" type="button" className="emp-search-page-btn" onClick={() => onChange(1)}>
        1
      </button>
    );
    if (start > 2) {
      buttons.push(
        <span key="ellipsis-start" className="emp-search-page-ellipsis">
          ...
        </span>
      );
    }
  }

  for (let current = start; current <= end; current += 1) {
    buttons.push(
      <button
        key={current}
        type="button"
        className={`emp-search-page-btn${current === page ? " emp-search-page-btn--active" : ""}`}
        onClick={() => onChange(current)}
      >
        {current}
      </button>
    );
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      buttons.push(
        <span key="ellipsis-end" className="emp-search-page-ellipsis">
          ...
        </span>
      );
    }
    buttons.push(
      <button key="last" type="button" className="emp-search-page-btn" onClick={() => onChange(totalPages)}>
        {totalPages}
      </button>
    );
  }

  return <div className="emp-search-pagination">{buttons}</div>;
}

function SearchConfigModal({ open, fields, onClose, onSave }) {
  const [draft, setDraft] = useState(fields);

  useEffect(() => {
    if (open) setDraft(fields.map((field) => ({ ...field })));
  }, [open, fields]);

  if (!open) return null;

  return (
    <div
      className="emp-search-config-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="emp-search-config-modal">
        <div className="emp-search-config-header">
          <h3 className="emp-search-config-title">⚙ Configurar Visualização</h3>
          <button type="button" className="emp-search-config-close" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <div className="emp-search-config-body">
          {draft.map((field) => (
            <label key={field.key} className="emp-search-config-field">
              <input
                type="checkbox"
                className="emp-search-config-checkbox"
                checked={field.visible}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setDraft((current) =>
                    current.map((item) =>
                      item.key === field.key ? { ...item, visible: checked } : item
                    )
                  );
                }}
              />
              <span>{field.label}</span>
            </label>
          ))}
        </div>
        <div className="emp-search-config-footer">
          <button
            type="button"
            className="emp-search-config-save"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SRCHEMP({
  empresas = [],
  total = 0,
  isLoading = false,
  isFetching = false,
  searchValue = "",
  onSearchChange,
  page = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  onEdit,
  selectedIds = [],
  onSelectionChange,
  cardsDetailFields = [],
  cardsPerRow = 3,
  fieldsPerRow = 1,
  isFavoriteRecord,
  onToggleFavorite,
  mgPrototype = false,
  infiniteMode = false,
  hasMoreRows = false,
  isLoadingMoreRows = false,
  onLoadMoreRows = null,
  loadBatchSize = 100,
  onLoadBatchSizeChange = null,
  selectedCount,
  listedCount,
  filteredCount,
  totalCount,
}) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [visFields, setVisFields] = useState(() => loadSearchVisFields());
  const [favorites, setFavorites] = useState(() => loadSearchFavorites());
  const lastCardClickRef = useRef({ id: null, time: 0, wasSelectedBefore: false });
  const cardClickSuppressRef = useRef({ id: null, until: 0 });
  const selectedIdsRef = useRef(selectedIds);
  const lastSelectedIdRef = useRef(null);
  const cardsScrollRef = useRef(null);

  const filteredEmpresas = useMemo(() => {
    if (!showOnlyFavorites) return empresas;
    return empresas.filter((emp) => favorites.has(emp.id));
  }, [empresas, favorites, showOnlyFavorites]);

  const detailFields = mgPrototype
    ? cardsDetailFields
    : visFields.filter((field) => field.visible && !field.primary);

  const cardsLayoutKey = `${cardsPerRow}:${fieldsPerRow}:${detailFields.map((field) => field.key).join(",")}`;
  const cardsScrollResetKey = `${infiniteMode ? "infinite" : page}:${showOnlyFavorites}:${cardsLayoutKey}`;

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
    if (selectedIds.length === 0) {
      lastSelectedIdRef.current = null;
    } else if (!lastSelectedIdRef.current || !selectedIds.includes(lastSelectedIdRef.current)) {
      lastSelectedIdRef.current = selectedIds[selectedIds.length - 1];
    }
  }, [selectedIds]);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const refresh = () => {
      setVisFields(loadSearchVisFields());
      setFavorites(loadSearchFavorites());
    };
    const unsubscribe = subscribeEmpPreferencesCache(refresh);
    window.addEventListener("emp-favorites-updated", refresh);
    return () => {
      unsubscribe();
      window.removeEventListener("emp-favorites-updated", refresh);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localSearch !== searchValue) {
        onPageChange?.(1);
        onSearchChange?.(localSearch);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [localSearch, onSearchChange, onPageChange, searchValue]);

  const handleSearchInput = useCallback((value) => {
    setLocalSearch(value);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const counterText = formatSearchCounter({
    page,
    pageSize,
    pageCount: filteredEmpresas.length,
    total,
  });
  const summarySelected = Number.isFinite(selectedCount) ? selectedCount : selectedIds.length;
  const summaryListed = Number.isFinite(listedCount) ? listedCount : filteredEmpresas.length;
  const summaryFiltered = Number.isFinite(filteredCount) ? filteredCount : Math.max(total, summaryListed);
  const summaryTotal = Number.isFinite(totalCount) ? totalCount : Math.max(summaryFiltered, summaryListed);
  const activeSelectionId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null;

  const toggleFavorite = useCallback((empresaId, event) => {
    event?.stopPropagation();
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(empresaId)) next.delete(empresaId);
      else next.add(empresaId);
      saveSearchFavorites(next);
      return next;
    });
  }, []);

  const handleSaveVisConfig = useCallback((nextFields) => {
    setVisFields(nextFields);
    saveSearchVisFields(nextFields);
  }, []);

  const handleCardClick = useCallback(
    (emp, event) => {
      const now = Date.now();
      const suppress = cardClickSuppressRef.current;
      if (suppress.id === emp.id && now < suppress.until) return;

      const last = lastCardClickRef.current;
      const interval = last.id === emp.id && last.time > 0 ? now - last.time : null;

      if (interval !== null && interval <= ROW_DBLCLICK_PAIR_MS) {
        lastCardClickRef.current = { id: null, time: 0, wasSelectedBefore: false };
        cardClickSuppressRef.current = { id: null, until: 0 };

        if (!last.wasSelectedBefore && interval <= ROW_DBLCLICK_OPEN_MS) {
          if (selectedIdsRef.current.length <= 1) onEdit?.(emp);
        }
        return;
      }

      const wasSelectedBefore = selectedIdsRef.current.includes(emp.id);
      lastCardClickRef.current = { id: emp.id, time: now, wasSelectedBefore };

      if (event?.shiftKey && lastSelectedIdRef.current) {
        const startIndex = filteredEmpresas.findIndex((item) => item.id === lastSelectedIdRef.current);
        const endIndex = filteredEmpresas.findIndex((item) => item.id === emp.id);
        if (startIndex >= 0 && endIndex >= 0) {
          const [from, to] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
          const rangeIds = filteredEmpresas.slice(from, to + 1).map((item) => item.id);
          onSelectionChange?.(rangeIds);
          lastSelectedIdRef.current = emp.id;
          cardClickSuppressRef.current = { id: null, until: 0 };
          cardsScrollRef.current?.focus?.({ preventScroll: true });
          return;
        }
      }

      if (event?.ctrlKey || event?.metaKey) {
        const nextSelection = wasSelectedBefore
          ? selectedIdsRef.current.filter((id) => id !== emp.id)
          : [...selectedIdsRef.current, emp.id];
        onSelectionChange?.(nextSelection);
        lastSelectedIdRef.current = nextSelection.length > 0 ? emp.id : null;
        cardClickSuppressRef.current = wasSelectedBefore
          ? { id: emp.id, until: now + ROW_DBLCLICK_PAIR_MS }
          : { id: null, until: 0 };
        cardsScrollRef.current?.focus?.({ preventScroll: true });
        return;
      }

      if (wasSelectedBefore) {
        onSelectionChange?.([]);
        lastSelectedIdRef.current = null;
        cardClickSuppressRef.current = { id: emp.id, until: now + ROW_DBLCLICK_PAIR_MS };
        cardsScrollRef.current?.focus?.({ preventScroll: true });
        return;
      }

      onSelectionChange?.([emp.id]);
      lastSelectedIdRef.current = emp.id;
      cardClickSuppressRef.current = { id: null, until: 0 };
      cardsScrollRef.current?.focus?.({ preventScroll: true });
    },
    [onEdit, onSelectionChange, filteredEmpresas]
  );

  const handleCardsKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (selectedIdsRef.current.length === 0) return;
        const step = event.key === "ArrowDown" ? 1 : -1;
        const anchorId =
          (lastSelectedIdRef.current && selectedIdsRef.current.includes(lastSelectedIdRef.current))
            ? lastSelectedIdRef.current
            : selectedIdsRef.current[selectedIdsRef.current.length - 1];
        const currentIndex = filteredEmpresas.findIndex((item) => item.id === anchorId);
        if (currentIndex < 0) return;
        const nextIndex = Math.min(
          Math.max(currentIndex + step, 0),
          Math.max(0, filteredEmpresas.length - 1)
        );
        const nextRecord = filteredEmpresas[nextIndex];
        if (!nextRecord?.id) return;
        event.preventDefault();
        const scrollEl = cardsScrollRef.current;
        if (scrollEl) {
          const rowHeight = estimateCardRowHeight(detailFields.length, fieldsPerRow);
          const rowIndex = Math.floor(nextIndex / Math.max(1, cardsPerRow));
          scrollVirtualRowIntoView(scrollEl, rowIndex, {
            itemSize: rowHeight + CARD_GRID_GAP,
            rowSize: rowHeight,
            scrollOffset: CARDS_TOP_PADDING,
            direction: step < 0 ? "up" : "down",
          });
        }
        lastSelectedIdRef.current = nextRecord.id;
        onSelectionChange?.([nextRecord.id]);
        cardsScrollRef.current?.focus?.({ preventScroll: true });
        return;
      }

      if (event.key === "Enter") {
        if (selectedIdsRef.current.length === 0) return;
        const anchorId =
          (lastSelectedIdRef.current && selectedIdsRef.current.includes(lastSelectedIdRef.current))
            ? lastSelectedIdRef.current
            : selectedIdsRef.current[selectedIdsRef.current.length - 1];
        const selectedRecord = filteredEmpresas.find((item) => item.id === anchorId);
        if (!selectedRecord) return;
        event.preventDefault();
        onEdit?.(selectedRecord);
      }
    },
    [filteredEmpresas, onSelectionChange, onEdit, cardsPerRow, fieldsPerRow, detailFields]
  );

  if (mgPrototype) {
    const showCardsLoading = isLoading && filteredEmpresas.length === 0;

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ErpScrollNav
          ref={cardsScrollRef}
          tabIndex={0}
          className="emp-table-body-scroll emp-cards-body-scroll relative min-h-0 flex-1 outline-none mg-grid-scroll"
          viewportClassName="overflow-auto"
          onKeyDown={handleCardsKeyDown}
        >
          {showCardsLoading ? (
            <div className="py-8" aria-hidden="true" />
          ) : filteredEmpresas.length === 0 ? (
            <div className="py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
              Nenhum registro encontrado
            </div>
          ) : (
            <MgCardsVirtualGrid
              key={cardsLayoutKey}
              scrollRef={cardsScrollRef}
              items={filteredEmpresas}
              cardsPerRow={cardsPerRow}
              fieldsPerRow={fieldsPerRow}
              detailFields={detailFields}
              selectedIds={selectedIds}
              isFavoriteRecord={isFavoriteRecord}
              onToggleFavorite={onToggleFavorite}
              onCardClick={handleCardClick}
              activeSelectionId={activeSelectionId}
              scrollResetKey={cardsScrollResetKey}
            />
          )}
        </ErpScrollNav>
        {!infiniteMode ? (
          <EmpTablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isBusy={isFetching}
          />
        ) : (
          <div className="emp-cards-bottom-dock flex-shrink-0">
            <div className="mg-records-summary border-t border-slate-200 px-3 py-2 text-xs">
              <div className="mg-records-summary__row">
                <div className="mg-records-summary__counts grid grid-cols-2 gap-x-3 gap-y-1.5 md:grid-cols-4 md:gap-2">
                  <span className="mg-records-summary__item truncate text-left">Selecionados: {summarySelected}</span>
                  <span className="mg-records-summary__item truncate text-left">Listados: {summaryListed}</span>
                  <span className="mg-records-summary__item truncate text-left">Filtrados: {summaryFiltered}</span>
                  <span className="mg-records-summary__item truncate text-left">Totais: {summaryTotal}</span>
                </div>
                <EmpLoadBatchControls
                  loadBatchSize={loadBatchSize}
                  onLoadBatchSizeChange={onLoadBatchSizeChange}
                  onLoadMore={onLoadMoreRows}
                  hasMoreRows={hasMoreRows}
                  isLoadingMoreRows={isLoadingMoreRows}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="emp-search-view">
      <div className="emp-search-bar">
        <div className="emp-search-input-wrap">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            className="emp-search-input"
            placeholder="Digite o que você procura..."
            value={localSearch}
            onChange={(event) => handleSearchInput(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="emp-search-action-btn"
          onClick={() => {
            setShowOnlyFavorites((current) => !current);
            onPageChange?.(1);
          }}
        >
          Favoritos
        </button>
        <button type="button" className="emp-search-action-btn" onClick={() => setConfigOpen(true)}>
          Configurar
        </button>
      </div>

      <main className="emp-search-results">
        {isLoading ? (
          <div className="py-8" aria-hidden="true" />
        ) : filteredEmpresas.length === 0 ? (
          <div className="emp-search-empty">
            {showOnlyFavorites ? "Nenhum favorito nesta página." : "Nenhum registro encontrado."}
          </div>
        ) : (
          <div className="emp-search-results-list">
            {filteredEmpresas.map((emp, index) => {
              const isFavorite = favorites.has(emp.id);
              const code = getEmpSearchFieldValue(emp, "codempresa");
              const title = getEmpSearchFieldValue(emp, "razao_social");
              return (
                <div
                  key={emp.id}
                  className="emp-search-result-card"
                  onClick={() => onEdit?.(emp)}
                  role="presentation"
                >
                  <div className="emp-search-result-layout">
                    <div
                      className="emp-search-avatar"
                      style={{ background: getEmpSearchAvatarColor(emp, index) }}
                    >
                      {getEmpSearchInitials(emp)}
                    </div>
                    <div className="emp-search-result-details">
                      <div className="emp-search-result-head">
                        <span className="emp-search-result-title">
                          {code} - {title}
                        </span>
                        <button
                          type="button"
                          className={`emp-search-fav-btn${isFavorite ? " emp-search-fav-btn--active" : ""}`}
                          onClick={(event) => toggleFavorite(emp.id, event)}
                          aria-label={isFavorite ? "Remover favorito" : "Adicionar favorito"}
                        >
                          <Star
                            style={{ width: 16, height: 16 }}
                            fill={isFavorite ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      {detailFields.length > 0 ? (
                        <div className="emp-search-fields-grid">
                          {detailFields.map((field) => (
                            <div key={field.key}>
                              <span className="emp-search-field-label">{field.label}: </span>
                              <span className="emp-search-field-value">
                                {getEmpSearchFieldValue(emp, field.key)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="emp-search-footer">
        <span className="emp-search-footer-label">Por página:</span>
        {!infiniteMode ? (
          <SearchPageSizeSelect value={pageSize} onChange={onPageSizeChange} />
        ) : (
          <span className="emp-search-footer-label">Auto</span>
        )}
        <span className="emp-search-footer-label emp-search-footer-counter">{counterText}</span>
        {!infiniteMode ? (
          <SearchPagination page={page} totalPages={totalPages} onChange={onPageChange} />
        ) : null}
      </footer>

      <SearchConfigModal
        open={configOpen}
        fields={visFields}
        onClose={() => setConfigOpen?.(false)}
        onSave={handleSaveVisConfig}
      />
    </div>
  );
}
