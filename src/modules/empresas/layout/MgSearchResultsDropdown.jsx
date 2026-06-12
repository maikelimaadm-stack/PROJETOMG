import React, { useEffect, useState } from "react";
import { Bookmark, Check, Settings2 } from "lucide-react";
import {
  getEmpSearchFieldValue,
} from "@/modules/empresas/components/empSearchView.constants";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";
import { renderSearchHighlight } from "@/modules/empresas/layout/mgSearchHighlight";

export const MG_SEARCH_DROPDOWN_MAX = 10;

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
  detailFields = [],
  loading = false,
  searchQuery = "",
  configFields = [],
  onConfigSave,
  onConfigRestoreDefaults,
  onSelect,
  onApplyAll,
  onApplyFavorites,
  isFavoriteRecord,
}) {
  const [configOpen, setConfigOpen] = useState(false);
  const [fieldsDraft, setFieldsDraft] = useState(configFields);

  useEffect(() => {
    if (!open) setConfigOpen(false);
  }, [open]);

  useEffect(() => {
    setFieldsDraft(configFields.map((field) => ({ ...field })));
  }, [configFields]);

  useEffect(() => {
    if (configOpen) setFieldsDraft(configFields.map((field) => ({ ...field })));
  }, [configOpen, configFields]);

  if (!open) return null;

  const visibleItems = items.slice(0, MG_SEARCH_DROPDOWN_MAX);
  const query = searchQuery.trim();
  const showLoading = loading && visibleItems.length === 0;

  const handleConfigOk = () => {
    onConfigSave?.(fieldsDraft);
    setConfigOpen(false);
  };

  const handleConfigRestore = () => {
    const defaults = onConfigRestoreDefaults?.() ?? configFields;
    setFieldsDraft(defaults.map((field) => ({ ...field })));
  };

  return (
    <div className="mg-search-dropdown" role="listbox" aria-label="Resultados da pesquisa">
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
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setFieldsDraft((current) =>
                      current.map((item) =>
                        item.key === field.key ? { ...item, visible: checked } : item
                      )
                    );
                  }}
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
        <div className="mg-search-dropdown__list">
          {showLoading ? (
            <div className="mg-search-dropdown__empty">Carregando...</div>
          ) : visibleItems.length === 0 ? (
            <div className="mg-search-dropdown__empty">Nenhum registro encontrado</div>
          ) : (
            visibleItems.map((emp) => {
              const code = getEmpSearchFieldValue(emp, "codempresa");
              const nome = getEmpSearchFieldValue(emp, "razao_social");
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
                        const value = getEmpSearchFieldValue(emp, field.key);
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
            })
          )}
        </div>
      )}

      <div className="mg-search-dropdown__footer">
        <button
          type="button"
          className="mg-search-dropdown__footer-btn mg-search-dropdown__footer-btn--primary ios-btn tb-btn tb-btn-labeled tb-btn-green"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setConfigOpen(false);
            onApplyAll?.();
          }}
        >
          Buscar todos
        </button>
        <button
          type="button"
          className="mg-search-dropdown__footer-btn ios-btn tb-btn tb-btn-labeled tb-btn-green"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setConfigOpen(false);
            onApplyFavorites?.();
          }}
        >
          <Bookmark className="mg-search-dropdown__footer-icon" strokeWidth={2.1} aria-hidden="true" />
          Favoritos
        </button>
        <button
          type="button"
          className={`mg-search-dropdown__footer-btn mg-search-dropdown__footer-btn--icon ios-btn tb-btn tb-btn-icon tb-btn-ghost${
            configOpen ? " is-open" : ""
          }`}
          aria-label="Configurar campos da pesquisa"
          aria-expanded={configOpen}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setConfigOpen((current) => !current)}
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
