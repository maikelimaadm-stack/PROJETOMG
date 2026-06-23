import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FunnelPlus, FunnelX, ListPlus, ListX, X } from "lucide-react";
import { FILTER_POPOVER_WIDTH } from "@/modules/empresas/components/tblEmp.constants";
import {
  ErpFilterPopover,
  clearErpFilter,
  cloneErpFilter,
  isErpFilterActive,
  normalizePanelFilterValue,
  resolveErpFilterEnumOptions,
  resolveErpFilterMeta,
} from "@/shared/filters";
import { buildPanelFilterOptions } from "@/modules/empresas/layout/mgPanelFilterOptions";
import {
  buildPanelCascadeFilters,
  FILTER_OPTIONS_MODE_CASCADE,
  useRemoteFilterOptions,
} from "@/shared/filters/useRemoteFilterOptions";
import { buildEmpresaPanelFilters } from "@/shared/listing/buildEmpresaListFilters";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useHorizontalScrollRail } from "@/shared/hooks/useHorizontalScrollRail";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import { isNestedMgFloatingPanelTarget } from "@/modules/empresas/layout/mgFloatingPanelUtils";

function useFilterPopover(open, setOpen, rootRef, panelRef) {
  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    minWidth: FILTER_POPOVER_WIDTH,
    width: FILTER_POPOVER_WIDTH,
    estimatedHeight: 460,
    align: "right",
    scrollable: true,
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
      if (isNestedMgFloatingPanelTarget(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, panelRef, rootRef, setOpen]);

  return panelStyle;
}

function PanelFilterPill({
  field,
  filterFields = [],
  values = {},
  appliedValues = {},
  empresas = [],
  active,
  disabled,
  onChange,
  onApply,
  onRequestDistinctColumnValues = null,
  selectorOptionsContextFilters = undefined,
  columnFilters = {},
  serverSearchTerm = "",
  selectorOptionsMode = FILTER_OPTIONS_MODE_CASCADE,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 180);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useFilterPopover(open, setOpen, rootRef, panelRef);

  const filterMeta = useMemo(() => resolveErpFilterMeta(field), [field]);
  const appliedFilter = values[field.key];
  const appliedDraft = useMemo(
    () => normalizePanelFilterValue(appliedFilter, filterMeta.filterType),
    [appliedFilter, filterMeta.filterType]
  );
  const localDistinctOptions = useMemo(
    () => buildPanelFilterOptions(empresas, appliedValues, field.key, filterFields),
    [appliedValues, empresas, field.key, filterFields]
  );
  const cascadeFilters = useMemo(
    () =>
      buildPanelCascadeFilters({
        activeFieldKey: field.key,
        appliedPanelValues: appliedValues,
        columnFilters,
        buildPanelFilters: buildEmpresaPanelFilters,
      }),
    [appliedValues, columnFilters, field.key]
  );
  const remoteFilterOptions = useRemoteFilterOptions({
    enabled: open,
    columnId: field.column || field.key,
    filterType: filterMeta.filterType,
    optionSearch: debouncedSearchQuery,
    selectedValues: Array.isArray((draft || appliedDraft)?.values) ? (draft || appliedDraft).values : [],
    onRequestDistinctColumnValues,
    contextFilters: selectorOptionsContextFilters,
    cascadeFilters,
    optionsMode: selectorOptionsMode,
    serverSearchTerm,
  });
  const distinctOptions = remoteFilterOptions.shouldUseRemote
    ? remoteFilterOptions.listOptions
    : localDistinctOptions;
  const enumOptions = useMemo(
    () => resolveErpFilterEnumOptions(field, distinctOptions),
    [distinctOptions, field]
  );

  useEffect(() => {
    if (!open) {
      setDraft(cloneErpFilter(appliedDraft));
      setSearchQuery("");
    }
  }, [open, appliedDraft]);

  const searchLoading =
    searchQuery.trim().toLowerCase() !== debouncedSearchQuery.trim().toLowerCase() ||
    (remoteFilterOptions.shouldUseRemote && remoteFilterOptions.searchLoading);

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const apply = (nextDraft) => {
    const safeDraft = nextDraft || draft || appliedDraft;
    const nextValues = { ...values, [field.key]: cloneErpFilter(safeDraft) };
    onChange?.(field.key, nextValues[field.key]);
    onApply?.(nextValues);
    setOpen(false);
  };

  const clearFilterValue = () => {
    const cleared = clearErpFilter(filterMeta.filterType);
    setDraft(cleared);
    const nextValues = { ...values, [field.key]: cleared };
    onChange?.(field.key, cleared);
    onApply?.(nextValues);
  };

  const clearActive = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    clearFilterValue();
  };

  const clearInPopup = () => {
    if (disabled) return;
    clearFilterValue();
  };

  const cancel = () => {
    setOpen(false);
  };

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
        aria-haspopup="dialog"
      >
        <span>{field.label}</span>
      </button>
      {active ? (
        <button
          type="button"
          className="mg-filter-pill__icon mg-filter-pill__icon--clear"
          onClick={clearActive}
          disabled={disabled}
          aria-label={`Limpar filtro ${field.label}`}
          title={`Limpar filtro ${field.label}`}
        >
          <X strokeWidth={2.2} aria-hidden="true" />
        </button>
      ) : (
        <ChevronDown
          className="mg-filter-pill__icon mg-filter-pill__icon--chevron"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      )}
      <ErpFilterPopover
        open={open}
        panelRef={panelRef}
        style={panelStyle}
        columnLabel={field.label}
        filterType={filterMeta.filterType}
        draft={draft || appliedDraft}
        listOptions={distinctOptions}
        enumOptions={enumOptions}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchLoading={searchLoading}
        hasMoreOptions={remoteFilterOptions.hasMoreOptions}
        loadingMoreOptions={remoteFilterOptions.loadingMoreOptions}
        onLoadMoreOptions={remoteFilterOptions.onLoadMoreOptions}
        showSortSection
        showSortActions={false}
        hasActiveFilter={active || isErpFilterActive(draft || appliedDraft)}
        onClearColumnFilter={clearInPopup}
        onDraftChange={setDraft}
        onCancel={cancel}
        onApply={apply}
      />
    </div>
  );
}

const FILTER_PILLS_TOGGLE_ANIM_MS = 220;

export default function MgFilterPills({
  filterFields = [],
  values = {},
  appliedValues = {},
  empresas = [],
  onChange,
  onClear,
  onApply,
  disabled = false,
  className = "",
  onConfigureFilters = null,
  filterPanelActive = false,
  hasActiveFilters: hasActiveFiltersProp = null,
  onRequestDistinctColumnValues = null,
  selectorOptionsContextFilters = undefined,
  columnFilters = {},
  serverSearchTerm = "",
  selectorOptionsMode = FILTER_OPTIONS_MODE_CASCADE,
}) {
  const useScrollRail = !className.includes("mg-filter-pills--drawer");
  const hasActiveFilters = useMemo(() => {
    if (hasActiveFiltersProp != null) return Boolean(hasActiveFiltersProp);
    return filterFields.some((field) => isErpFilterActive(appliedValues[field.key]));
  }, [appliedValues, filterFields, hasActiveFiltersProp]);
  const [filtersExpanded, setFiltersExpanded] = useState(() => !useScrollRail || hasActiveFilters);
  const [filtersOpen, setFiltersOpen] = useState(() => !useScrollRail || hasActiveFilters);
  const filterAnimTimeoutRef = useRef(null);
  const filtersExpandedRef = useRef(filtersExpanded);
  const filtersOpenRef = useRef(filtersOpen);

  const clearRailAnimTimeout = useCallback(() => {
    if (filterAnimTimeoutRef.current) {
      window.clearTimeout(filterAnimTimeoutRef.current);
      filterAnimTimeoutRef.current = null;
    }
  }, []);

  const expandFilterRail = useCallback(() => {
    if (!useScrollRail) return;
    clearRailAnimTimeout();
    setFiltersExpanded(true);
    setFiltersOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFiltersOpen(true);
      });
    });
  }, [clearRailAnimTimeout, useScrollRail]);

  const beginCollapseFilterRail = useCallback(() => {
    if (!useScrollRail) return;
    if (!filtersExpandedRef.current) {
      setFiltersOpen(false);
      return;
    }
    setFiltersOpen(false);
    clearRailAnimTimeout();
    filterAnimTimeoutRef.current = window.setTimeout(() => {
      setFiltersExpanded(false);
      filterAnimTimeoutRef.current = null;
    }, FILTER_PILLS_TOGGLE_ANIM_MS);
  }, [clearRailAnimTimeout, useScrollRail]);

  const toggleFilterRail = useCallback(() => {
    if (disabled || !useScrollRail) return;
    if (filtersExpandedRef.current && filtersOpenRef.current) {
      beginCollapseFilterRail();
      return;
    }
    expandFilterRail();
  }, [beginCollapseFilterRail, disabled, expandFilterRail, useScrollRail]);

  useEffect(() => {
    filtersExpandedRef.current = filtersExpanded;
    filtersOpenRef.current = filtersOpen;
  }, [filtersExpanded, filtersOpen]);

  useEffect(
    () => () => {
      clearRailAnimTimeout();
    },
    [clearRailAnimTimeout]
  );

  useEffect(() => {
    if (!useScrollRail) return;
    if (hasActiveFilters && !filtersExpandedRef.current) {
      expandFilterRail();
    }
  }, [expandFilterRail, hasActiveFilters, useScrollRail]);

  const {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft,
    scrollRight,
  } = useHorizontalScrollRail({ enabled: useScrollRail && filtersExpanded });

  const handleConfigButtonClick = () => {
    if (disabled) return;
    if (hasActiveFilters) {
      onClear?.();
      return;
    }
    onConfigureFilters?.();
  };

  const pills = (
    <>
      {filterFields.map((field) => (
        <PanelFilterPill
          key={field.key}
          field={field}
          filterFields={filterFields}
          values={values}
          appliedValues={appliedValues}
          empresas={empresas}
          active={isErpFilterActive(appliedValues[field.key])}
          disabled={disabled}
          onChange={onChange}
          onApply={onApply}
          onRequestDistinctColumnValues={onRequestDistinctColumnValues}
          selectorOptionsContextFilters={selectorOptionsContextFilters}
          columnFilters={columnFilters}
          serverSearchTerm={serverSearchTerm}
          selectorOptionsMode={selectorOptionsMode}
        />
      ))}
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
    </>
  );

  const configButton = onConfigureFilters || onClear ? (
    <div className="mg-filter-pills-rail__config-slot">
      <button
        type="button"
        className={`ios-btn mg-filter-pills-rail__config mg-filter-pills-rail__config--icon-only${
          hasActiveFilters ? " is-clear-active" : filterPanelActive ? " is-active" : ""
        }`}
        onClick={handleConfigButtonClick}
        disabled={disabled}
        aria-label={hasActiveFilters ? "Limpar todos os filtros" : "Configurar filtros"}
        title={hasActiveFilters ? "Limpar todos os filtros" : "Configurar filtros"}
        aria-pressed={hasActiveFilters ? false : filterPanelActive}
      >
        {hasActiveFilters ? (
          <FunnelX className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <FunnelPlus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  ) : null;

  if (!useScrollRail) {
    return (
      <div className={`mg-filter-pills${className ? ` ${className}` : ""}`}>
        {configButton ? (
          <div className="mg-filter-pills-rail__config-slot">{configButton}</div>
        ) : null}
        {pills}
      </div>
    );
  }

  return (
    <div
      className={`mg-filter-pills-rail mg-filter-pills-rail--track${filtersExpanded ? " is-expanded" : ""}${
        filtersOpen ? " is-open" : ""
      }${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className={`ios-btn mg-nav-btn mg-filter-pills-rail__toggle${filtersExpanded ? " is-active" : ""}`}
        onClick={toggleFilterRail}
        disabled={disabled}
        aria-label={filtersExpanded ? "Recolher faixa de filtros" : "Mostrar faixa de filtros"}
        title={filtersExpanded ? "Recolher faixa de filtros" : "Mostrar faixa de filtros"}
        aria-expanded={filtersExpanded && filtersOpen}
      >
        {filtersExpanded ? (
          <ListX className="mg-filter-pills-rail__toggle-icon" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <ListPlus className="mg-filter-pills-rail__toggle-icon" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
      {filtersExpanded ? (
        <div className="mg-filter-pills-rail__content" aria-hidden={!filtersOpen}>
          {hasOverflow ? (
            <button
              type="button"
              className="ios-btn mg-nav-btn mg-filter-pills-rail__nav mg-filter-pills-rail__nav--prev"
              onClick={scrollLeft}
              disabled={disabled || !canScrollLeft}
              aria-label="Rolar filtros para a esquerda"
              title="Rolar filtros para a esquerda"
            >
              <ChevronLeft className="mg-filter-pills-rail__nav-icon" strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
          <div ref={viewportRef} className="mg-filter-pills-rail__viewport">
            <div className="mg-filter-pills">{pills}</div>
          </div>
          {hasOverflow ? (
            <button
              type="button"
              className="ios-btn mg-nav-btn mg-filter-pills-rail__nav mg-filter-pills-rail__nav--next"
              onClick={scrollRight}
              disabled={disabled || !canScrollRight}
              aria-label="Rolar filtros para a direita"
              title="Rolar filtros para a direita"
            >
              <ChevronRight className="mg-filter-pills-rail__nav-icon" strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
          {configButton ? (
            <>
              <span className="mg-filter-pills-rail__divider" aria-hidden="true" />
              <div className="mg-filter-pills-rail__config-slot">{configButton}</div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
