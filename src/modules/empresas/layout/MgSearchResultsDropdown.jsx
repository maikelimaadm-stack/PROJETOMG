import React from "react";
import {
  getEmpSearchFieldValue,
} from "@/modules/empresas/components/empSearchView.constants";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";
import { renderSearchHighlight } from "@/modules/empresas/layout/mgSearchHighlight";

export const MG_SEARCH_DROPDOWN_MAX = 10;

export default function MgSearchResultsDropdown({
  open = false,
  items = [],
  detailFields = [],
  loading = false,
  searchQuery = "",
  onSelect,
  onApplyAll,
  isFavoriteRecord,
  onToggleFavorite,
}) {
  if (!open) return null;

  const visibleItems = items.slice(0, MG_SEARCH_DROPDOWN_MAX);
  const query = searchQuery.trim();
  const showLoading = loading && visibleItems.length === 0;

  return (
    <div className="mg-search-dropdown" role="listbox" aria-label="Resultados da pesquisa">
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
                    onToggle={() => onToggleFavorite?.(emp.id)}
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
                          <span className="mg-search-dropdown__field-label">{field.label}:</span>
                          <span className="mg-search-dropdown__field-value">
                            {renderSearchHighlight(value, query)}
                          </span>
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
      <div className="mg-search-dropdown__footer">
        <button
          type="button"
          className="mg-search-dropdown__apply-all"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onApplyAll?.()}
        >
          Buscar todos
        </button>
      </div>
    </div>
  );
}
