import React from "react";
import {
  getEmpSearchFieldValue,
} from "@/modules/empresas/components/empSearchView.constants";
import MgRecordFavoriteStar from "@/modules/empresas/layout/MgRecordFavoriteStar";

export const MG_SEARCH_DROPDOWN_MAX = 10;

export default function MgSearchResultsDropdown({
  open = false,
  items = [],
  detailFields = [],
  loading = false,
  onSelect,
  isFavoriteRecord,
  onToggleFavorite,
}) {
  if (!open) return null;

  const visibleItems = items.slice(0, MG_SEARCH_DROPDOWN_MAX);

  return (
    <div className="mg-search-dropdown" role="listbox" aria-label="Resultados da pesquisa">
      {loading && visibleItems.length === 0 ? (
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
                      <span className="mg-search-dropdown__code">{code}</span>
                      <span className="mg-search-dropdown__sep"> • </span>
                    </>
                  ) : null}
                  <span className="mg-search-dropdown__name">{nome}</span>
                </div>
              </div>
              {detailFields.length > 0 ? (
                <div className="mg-search-dropdown__meta">
                  {detailFields.map((field, index) => (
                    <React.Fragment key={field.key}>
                      {index > 0 ? (
                        <span className="mg-search-dropdown__meta-sep" aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      <span className="mg-search-dropdown__meta-item">
                        <span className="mg-search-dropdown__meta-label">{field.label}:</span>
                        <span className="mg-search-dropdown__meta-value">
                          {getEmpSearchFieldValue(emp, field.key)}
                        </span>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  );
}
