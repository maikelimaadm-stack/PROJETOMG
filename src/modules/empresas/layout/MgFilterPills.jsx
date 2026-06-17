import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgFilterFieldCheck from "@/modules/empresas/layout/MgFilterFieldCheck";
import {
  MG_FILTER_FIELDS,
  MG_FILTER_STATUS_FIELD,
  MG_FILTER_STATUS_OPTIONS,
} from "@/modules/empresas/layout/mgFilterFields";
import { buildEmpresaPanelFilters } from "@/shared/listing/buildEmpresaListFilters";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";

function FilterPillPopover({ open, panelRef, style, children, onApply, onCancel }) {
  return (
    <MgPortalPanel
      open={open}
      panelRef={panelRef}
      panelClassName="dropdown-menu mg-cards-config-menu open emp-col-filter-popup emp-filter-popover"
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
      <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer emp-col-filter-popup__footer">
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-search-dropdown__config-action"
          onClick={onApply}
        >
          Filtrar
        </button>
      </div>
    </MgPortalPanel>
  );
}

function useFilterPopover(open, setOpen, rootRef, panelRef, estimatedHeight = 320) {
  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    minWidth: 280,
    width: 280,
    estimatedHeight,
    align: "left",
  });

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, panelRef, rootRef, setOpen]);

  return panelStyle;
}

function SelectFilterPill({
  field,
  values = {},
  selectedValues = [],
  active,
  disabled,
  onChange,
  onApply,
  onRequestDistinctValues,
  appliedFilters,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selectedValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);

  const panelStyle = useFilterPopover(open, setOpen, rootRef, panelRef, 360);

  useEffect(() => {
    if (!open) {
      setDraft(Array.isArray(selectedValues) ? selectedValues : []);
      setSearchQuery("");
    }
  }, [open, selectedValues]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !field.column || !onRequestDistinctValues) return undefined;
    let cancelled = false;
    setLoading(true);
    onRequestDistinctValues({
      column: field.column,
      optionSearch: searchQuery,
      filters: appliedFilters,
    })
      .then((result) => {
        if (!cancelled) setOptions(result?.items || []);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, field.column, onRequestDistinctValues, open, searchQuery]);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => String(option).toLowerCase().includes(query));
  }, [options, searchQuery]);

  const allVisibleSelected =
    filteredOptions.length > 0 && filteredOptions.every((option) => draft.includes(option));

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const apply = () => {
    const nextValues = { ...values, [field.key]: [...new Set(draft)] };
    onChange?.(field.key, nextValues[field.key]);
    onApply?.(nextValues);
    setOpen(false);
  };

  const cancel = () => {
    setOpen(false);
  };

  const triggerLabel =
    active && selectedValues.length > 0
      ? `${field.label} (${selectedValues.length})`
      : field.label;

  return (
    <div
      className={`mg-filter-pill${open ? " is-open" : ""}${active ? " is-active" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-filter-pill__trigger"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {triggerLabel}
      </button>
      <FilterPillPopover
        open={open}
        panelRef={panelRef}
        style={panelStyle}
        onApply={apply}
        onCancel={cancel}
      >
        <div className="emp-filter-body">
          <div className="mg-search-pill-wrap emp-col-filter-popup__search">
            <div className="mg-search-pill emp-col-filter-popup__search-pill" role="search">
              {loading ? (
                <Loader2
                  className="mg-search-pill-icon mg-search-pill-icon--loading h-3.5 w-3.5 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label={`Pesquisar valores de ${field.label}`}
                aria-busy={loading}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="mg-cards-config-menu__list emp-filter-value-list emp-col-filter-popup__options">
            <label className="mg-cards-config-menu__item emp-filter-value-list-header">
              <MgFilterFieldCheck
                checked={allVisibleSelected}
                disabled={filteredOptions.length === 0}
                onChange={(event) => {
                  setDraft((current) => {
                    const rest = current.filter((value) => !filteredOptions.includes(value));
                    return event.target.checked
                      ? [...new Set([...rest, ...filteredOptions])]
                      : rest;
                  });
                }}
              />
              <span className="mg-cards-config-menu__label">(Selecionar Tudo)</span>
            </label>
            {filteredOptions.map((option) => (
              <label key={option} className="mg-cards-config-menu__item emp-filter-value-list-item">
                <MgFilterFieldCheck
                  checked={draft.includes(option)}
                  onChange={(event) => {
                    setDraft((current) =>
                      event.target.checked
                        ? [...new Set([...current, option])]
                        : current.filter((value) => value !== option)
                    );
                  }}
                />
                <span className="mg-cards-config-menu__label truncate" title={option}>
                  {option}
                </span>
              </label>
            ))}
            {!loading && filteredOptions.length === 0 ? (
              <div className="mg-search-dropdown__empty">Nenhum valor encontrado.</div>
            ) : null}
          </div>
        </div>
      </FilterPillPopover>
    </div>
  );
}

function StatusFilterPill({ values = {}, selectedValues = [], active, disabled, onChange, onApply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selectedValues);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useFilterPopover(open, setOpen, rootRef, panelRef, 180);

  useEffect(() => {
    if (!open) setDraft(Array.isArray(selectedValues) ? selectedValues : []);
  }, [open, selectedValues]);

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const apply = () => {
    const nextValues = { ...values, [MG_FILTER_STATUS_FIELD.key]: [...new Set(draft)] };
    onChange?.(MG_FILTER_STATUS_FIELD.key, nextValues[MG_FILTER_STATUS_FIELD.key]);
    onApply?.(nextValues);
    setOpen(false);
  };

  const cancel = () => {
    setOpen(false);
  };

  const triggerLabel =
    active && selectedValues.length > 0
      ? `${MG_FILTER_STATUS_FIELD.label} (${selectedValues.length})`
      : MG_FILTER_STATUS_FIELD.label;

  return (
    <div
      className={`mg-filter-pill${open ? " is-open" : ""}${active ? " is-active" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-filter-pill__trigger"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {triggerLabel}
      </button>
      <FilterPillPopover open={open} panelRef={panelRef} style={panelStyle} onApply={apply} onCancel={cancel}>
        <div className="emp-filter-body emp-filter-body--status-only">
          <div className="mg-cards-config-menu__list emp-filter-value-list emp-col-filter-popup__options">
            {MG_FILTER_STATUS_OPTIONS.map((option) => (
              <label key={option.value} className="mg-cards-config-menu__item emp-filter-value-list-item">
                <MgFilterFieldCheck
                  checked={draft.includes(option.value)}
                  onChange={(event) => {
                    setDraft((current) =>
                      event.target.checked
                        ? [...new Set([...current, option.value])]
                        : current.filter((value) => value !== option.value)
                    );
                  }}
                />
                <span className="mg-cards-config-menu__label">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </FilterPillPopover>
    </div>
  );
}

export default function MgFilterPills({
  values = {},
  appliedValues = {},
  onChange,
  onClear,
  onApply,
  onRequestDistinctValues,
  disabled = false,
  className = "",
}) {
  const appliedFilters = useMemo(() => buildEmpresaPanelFilters(appliedValues), [appliedValues]);

  const hasActiveFilters = useMemo(() => {
    const fieldsActive = MG_FILTER_FIELDS.some(
      (field) => Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0
    );
    const statusActive =
      Array.isArray(appliedValues[MG_FILTER_STATUS_FIELD.key]) &&
      appliedValues[MG_FILTER_STATUS_FIELD.key].length > 0;
    return fieldsActive || statusActive;
  }, [appliedValues]);

  const buildFiltersExcluding = (excludeKey) => {
    const snapshot = { ...appliedValues };
    delete snapshot[excludeKey];
    return buildEmpresaPanelFilters(snapshot);
  };

  return (
    <div className={`mg-filter-pills${className ? ` ${className}` : ""}`}>
      {MG_FILTER_FIELDS.map((field) => (
        <SelectFilterPill
          key={field.key}
          field={field}
          values={values}
          selectedValues={values[field.key] || []}
          active={Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0}
          disabled={disabled}
          onChange={onChange}
          onApply={onApply}
          onRequestDistinctValues={onRequestDistinctValues}
          appliedFilters={buildFiltersExcluding(field.key)}
        />
      ))}
      <StatusFilterPill
        values={values}
        selectedValues={values[MG_FILTER_STATUS_FIELD.key] || []}
        active={
          Array.isArray(appliedValues[MG_FILTER_STATUS_FIELD.key]) &&
          appliedValues[MG_FILTER_STATUS_FIELD.key].length > 0
        }
        disabled={disabled}
        onChange={onChange}
        onApply={onApply}
      />
      {hasActiveFilters ? (
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-filter-pill__trigger mg-filter-pill__trigger--clear"
          onClick={onClear}
          disabled={disabled}
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );
}
