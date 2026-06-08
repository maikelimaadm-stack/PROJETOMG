import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, Star, X } from "lucide-react";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  formatSearchCounter,
  getEmpSearchAvatarColor,
  getEmpSearchFieldValue,
  getEmpSearchInitials,
  loadSearchFavorites,
  loadSearchVisFields,
  saveSearchFavorites,
  saveSearchVisFields,
} from "./empSearchView.constants";
import "./empSearchView.css";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

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
          {PAGE_SIZE_OPTIONS.map((size) => (
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
  searchValue = "",
  onSearchChange,
  page = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  onEdit,
}) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [visFields, setVisFields] = useState(() => loadSearchVisFields());
  const [favorites, setFavorites] = useState(() => loadSearchFavorites());

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

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

  const filteredEmpresas = useMemo(() => {
    if (!showOnlyFavorites) return empresas;
    return empresas.filter((emp) => favorites.has(emp.id));
  }, [empresas, favorites, showOnlyFavorites]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const counterText = formatSearchCounter({
    page,
    pageSize,
    pageCount: filteredEmpresas.length,
    total,
  });

  const detailFields = useMemo(
    () => visFields.filter((field) => field.visible && !field.primary),
    [visFields]
  );

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
    const normalized = nextFields.map((field) => {
      const fallback = EMP_SEARCH_DEFAULT_FIELDS.find((item) => item.key === field.key);
      return { ...fallback, ...field };
    });
    setVisFields(normalized);
    saveSearchVisFields(normalized);
  }, []);

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
          <div className="emp-search-empty">Carregando registros...</div>
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
                  <div className="emp-search-result-head">
                    <div className="emp-search-result-main">
                      <div
                        className="emp-search-avatar"
                        style={{ background: getEmpSearchAvatarColor(emp, index) }}
                      >
                        {getEmpSearchInitials(emp)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="emp-search-result-title">
                          {code} - {title}
                        </div>
                      </div>
                    </div>
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
              );
            })}
          </div>
        )}
      </main>

      <footer className="emp-search-footer">
        <span className="emp-search-footer-label">Por página:</span>
        <SearchPageSizeSelect value={pageSize} onChange={onPageSizeChange} />
        <span className="emp-search-footer-label emp-search-footer-counter">{counterText}</span>
        <SearchPagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </footer>

      <SearchConfigModal
        open={configOpen}
        fields={visFields}
        onClose={() => setConfigOpen(false)}
        onSave={handleSaveVisConfig}
      />
    </div>
  );
}
