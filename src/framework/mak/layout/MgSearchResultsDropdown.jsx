import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Columns3Cog } from "lucide-react";
import {
  countSearchDropdownVisibleFields,
  MAK_SEARCH_DROPDOWN_MAX_FIELDS,
} from "@/framework/mak/search/makSearchView.utils.js";
import { useMakSearchViewConfig } from "@/framework/mak/search/useMakSearchViewConfig.js";
import MgRecordFavoriteStar from "./MgRecordFavoriteStar";
import { renderSearchHighlight } from "./mgSearchHighlight";
import { showWarning } from "@/shared/feedback";

const SCROLL_LOAD_THRESHOLD_PX = 48;

function SearchFieldCheck({ checked, disabled, onChange }) {
  return (
    <span
      className={`mg-cards-config-menu__check${checked ? " is-checked" : ""}${disabled ? " is-locked" : ""}`}
    >
      <input
        type="checkbox"
        className="mg-cards-config-menu__checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {checked ? <Check className="mg-cards-config-menu__check-icon" strokeWidth={2.5} aria-hidden="true" /> : null}
    </span>
  );
}

export default function MgSearchResultsDropdown({
  open = false,
  items = [],
  searchResultsTotal = 0,
  searchHasFavoritesInResults = false,
  detailFields = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  searchQuery = "",
  configFields = [],
  onConfigSave,
  onConfigRestoreDefaults,
  onSelect,
  onApplyAll,
  onApplyFavorites,
  isFavoriteRecord,
}) {
  const { dropdownMaxFields, getFieldValue } = useMakSearchViewConfig();
  const [configOpen, setConfigOpen] = useState(false);
  const [fieldsDraft, setFieldsDraft] = useState(configFields);
  const listRef = useRef(null);
  const loadMoreLockRef = useRef(false);

  useEffect(() => {
    if (!open) setConfigOpen(false);
  }, [open]);

  useEffect(() => {
    setFieldsDraft(configFields.map((field) => ({ ...field })));
  }, [configFields]);

  useEffect(() => {
    if (configOpen) setFieldsDraft(configFields.map((field) => ({ ...field })));
  }, [configOpen, configFields]);

  useEffect(() => {
    if (!configOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setConfigOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [configOpen]);

  useEffect(() => {
    if (!loadingMore) loadMoreLockRef.current = false;
  }, [loadingMore]);

  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore || loading || loadingMore || loadMoreLockRef.current) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > SCROLL_LOAD_THRESHOLD_PX) return;
    loadMoreLockRef.current = true;
    onLoadMore?.();
  }, [hasMore, loading, loadingMore, onLoadMore]);

  if (!open) return null;

  const query = searchQuery.trim();
  const hasQuery = query.length > 0;
  const showLoading = hasQuery && loading && items.length === 0;
  const hasListingData = hasQuery && !showLoading && searchResultsTotal > 0;
  const canApplyFavorites = !hasQuery || (hasListingData && searchHasFavoritesInResults);
  const showResultsCounter = hasQuery && !showLoading;
  const selectedFieldCount = countSearchDropdownVisibleFields(fieldsDraft);

  const handleFieldToggle = (fieldKey, checked) => {
    if (checked) {
      const currentCount = countSearchDropdownVisibleFields(fieldsDraft);
      if (currentCount >= dropdownMaxFields) {
        showWarning(
          `É permitido selecionar no máximo ${dropdownMaxFields} campos.`
        );
        return;
      }
    }

    setFieldsDraft((current) =>
      current.map((item) => (item.key === fieldKey ? { ...item, visible: checked } : item))
    );
  };

  const handleConfigOk = () => {
    onConfigSave?.(fieldsDraft);
    setConfigOpen(false);
  };

  const handleConfigRestore = () => {
    const defaults = onConfigRestoreDefaults?.() ?? configFields;
    setFieldsDraft(defaults.map((field) => ({ ...field })));
  };

  return (
    <>
      {configOpen ? (
        <button
          type="button"
          className="mg-config-backdrop"
          aria-label="Fechar configuração de campos da pesquisa"
          tabIndex={-1}
          onClick={() => setConfigOpen(false)}
        />
      ) : null}
      <div
        className={`mg-search-dropdown${configOpen ? " is-config-open" : ""}`}
        role="listbox"
        aria-label="Resultados da pesquisa"
      >
        {configOpen ? (
          <div className="mg-search-dropdown__config">
            <div className="mg-search-dropdown__config-list">
              {fieldsDraft.map((field) => (
                <label
                  key={field.key}
                  className={`mg-cards-config-menu__item mg-search-dropdown__config-item${
                    field.primary ? " mg-cards-config-menu__item--locked" : ""
                  }`}
                >
                  <SearchFieldCheck
                    checked={field.visible}
                    disabled={field.primary}
                    onChange={(event) => handleFieldToggle(field.key, event.target.checked)}
                  />
                  <span className="mg-cards-config-menu__label">{field.label}</span>
                </label>
              ))}
            </div>
            <div className="mg-search-dropdown__config-footer">
              <button
                type="button"
                className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleConfigRestore}
              >
                Restaurar
              </button>
              <span
                className="mg-search-dropdown__config-counter"
                aria-live="polite"
                aria-label={`${selectedFieldCount} de ${dropdownMaxFields} campos selecionados`}
              >
                {selectedFieldCount}/{dropdownMaxFields}
              </span>
              <button
                type="button"
                className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-search-dropdown__config-action"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleConfigOk}
              >
                Ok
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={listRef}
            className={`mg-search-dropdown__list${!hasQuery ? " mg-search-dropdown__list--idle" : ""}`}
            onScroll={handleListScroll}
          >
            {showLoading ? (
              <div className="mg-search-dropdown__empty">Carregando...</div>
            ) : !hasQuery ? null : items.length === 0 ? (
              <div className="mg-search-dropdown__empty">Nenhum registro encontrado</div>
            ) : (
              <>
                {items.map((emp) => {
                  const code = getFieldValue(emp, "codempresa");
                  const nome = getFieldValue(emp, "razao_social");
                  const isFavorite = isFavoriteRecord?.(emp.id) ?? false;

                  return (
                    <button
                      key={emp.id}
                      type="button"
                      className="mg-search-dropdown__item"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelect?.(emp)}
                    >
                      <div className="mg-search-dropdown__head">
                        <MgRecordFavoriteStar
                          active={isFavorite}
                          disabled
                          className="mg-search-dropdown__fav-btn"
                        />
                        <div className="mg-search-dropdown__title">
                          {code && code !== "—" ? (
                            <>
                              <span className="mg-search-dropdown__code">
                                {renderSearchHighlight(code, query)}
                              </span>
                              <span className="mg-search-dropdown__sep"> • </span>
                            </>
                          ) : null}
                          <span className="mg-search-dropdown__name">
                            {renderSearchHighlight(nome, query)}
                          </span>
                        </div>
                      </div>
                      {detailFields.length > 0 ? (
                        <div className="mg-search-dropdown__meta">
                          {detailFields.map((field) => {
                            const value = getFieldValue(emp, field.key);
                            return (
                              <div key={field.key} className="mg-search-dropdown__field">
                                <div className="mg-search-dropdown__field-line">
                                  <span className="mg-search-dropdown__field-label">{field.label}:</span>
                                  <span className="mg-search-dropdown__field-value">
                                    {renderSearchHighlight(value, query)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
                {loadingMore ? (
                  <div className="mg-search-dropdown__empty mg-search-dropdown__empty--more">
                    Carregando mais...
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}

        {!configOpen ? (
          <div
            className={`mg-search-dropdown__footer${
              showResultsCounter ? " mg-search-dropdown__footer--with-counter" : ""
            }`}
          >
            <button
              type="button"
              className="mg-search-dropdown__footer-btn ios-btn tb-btn tb-btn-labeled tb-btn-ghost"
              disabled={!hasListingData}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!hasListingData) return;
                setConfigOpen(false);
                onApplyAll?.();
              }}
            >
              Buscar todos
            </button>
            {showResultsCounter ? (
              <span
                className="mg-search-dropdown__results-counter"
                aria-live="polite"
                aria-label={`${searchResultsTotal} registros encontrados`}
              >
                {searchResultsTotal}
              </span>
            ) : null}
            <button
              type="button"
              className="mg-search-dropdown__footer-btn ios-btn tb-btn tb-btn-labeled tb-btn-ghost"
              disabled={!canApplyFavorites}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!canApplyFavorites) return;
                setConfigOpen(false);
                onApplyFavorites?.();
              }}
            >
              Buscar favoritos
            </button>
            <button
              type="button"
              className="ios-btn mg-search-dropdown__config-btn mg-search-dropdown__config-btn--icon-only"
              aria-label="Configurar campos da pesquisa"
              aria-expanded={false}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setConfigOpen(true)}
            >
              <Columns3Cog className="mg-search-dropdown__config-icon" strokeWidth={2.1} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
