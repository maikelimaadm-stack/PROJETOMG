import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListFilter, X } from "lucide-react";
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
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
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
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 180);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useFilterPopover(open, setOpen, rootRef, panelRef);

  const filterMeta = useMemo(() => resolveErpFilterMeta(field), [field]);
  const distinctOptions = useMemo(
    () => buildPanelFilterOptions(empresas, appliedValues, field.key, filterFields),
    [appliedValues, empresas, field.key, filterFields]
  );
  const enumOptions = useMemo(
    () => resolveErpFilterEnumOptions(field, distinctOptions),
    [distinctOptions, field]
  );

  const appliedFilter = values[field.key];
  const appliedDraft = useMemo(
    () => normalizePanelFilterValue(appliedFilter, filterMeta.filterType),
    [appliedFilter, filterMeta.filterType]
  );

  useEffect(() => {
    if (!open) {
      setDraft(cloneErpFilter(appliedDraft));
      setSearchQuery("");
    }
  }, [open, appliedDraft]);

  const searchLoading =
    searchQuery.trim().toLowerCase() !== debouncedSearchQuery.trim().toLowerCase();

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

  const clearActive = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const cleared = clearErpFilter(filterMeta.filterType);
    const nextValues = { ...values, [field.key]: cleared };
    onChange?.(field.key, cleared);
    onApply?.(nextValues);
    setOpen(false);
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
        className={`ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-filter-pill__trigger${
          active ? " mg-filter-pill__trigger--has-clear" : ""
        }`}
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
          className="ios-btn mg-filter-pill__clear-btn"
          onClick={clearActive}
          disabled={disabled}
          aria-label={`Limpar filtro ${field.label}`}
          title={`Limpar filtro ${field.label}`}
        >
          <X className="h-3 w-3" strokeWidth={2.3} />
        </button>
      ) : null}
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
        showSortSection={false}
        onDraftChange={setDraft}
        onCancel={cancel}
        onApply={apply}
      />
    </div>
  );
}

const FILTER_PILLS_SCROLL_STEP = 240;

function useFilterPillsScrollRail(enabled = true) {
  const viewportRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setHasOverflow(false);
      return;
    }

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const nextLeft = viewport.scrollLeft > 1;
    const nextRight = viewport.scrollLeft < maxScrollLeft - 1;
    const nextOverflow = maxScrollLeft > 1;

    setCanScrollLeft(nextLeft);
    setCanScrollRight(nextRight);
    setHasOverflow(nextOverflow);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    updateScrollState();

    const onScroll = () => updateScrollState();
    viewport.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(viewport);
      if (viewport.firstElementChild) {
        resizeObserver.observe(viewport.firstElementChild);
      }
    } else {
      window.addEventListener("resize", updateScrollState);
    }

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [enabled, updateScrollState]);

  const scrollByStep = useCallback((direction) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: direction * FILTER_PILLS_SCROLL_STEP,
      behavior: "smooth",
    });
  }, []);

  return {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft: () => scrollByStep(-1),
    scrollRight: () => scrollByStep(1),
  };
}

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
}) {
  const useScrollRail = !className.includes("mg-filter-pills--drawer");
  const {
    viewportRef,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollLeft,
    scrollRight,
  } = useFilterPillsScrollRail(useScrollRail);

  const hasActiveFilters = useMemo(
    () => filterFields.some((field) => isErpFilterActive(appliedValues[field.key])),
    [appliedValues, filterFields]
  );

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

  const configButton = onConfigureFilters ? (
    <div className="mg-filter-pills-rail__config-slot">
      <button
        type="button"
        className={`ios-btn tb-btn tb-btn-ghost tb-btn-filter tb-btn-icon mg-filter-pills-rail__config${
          filterPanelActive ? " tb-btn-filter-active is-active" : ""
        }`}
        onClick={onConfigureFilters}
        disabled={disabled}
        aria-label="Configurar filtros"
        title="Configurar filtros"
        aria-pressed={filterPanelActive}
      >
        <ListFilter className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  ) : null;

  if (!useScrollRail) {
    return (
      <div className={`mg-filter-pills${className ? ` ${className}` : ""}`}>
        {configButton}
        {pills}
      </div>
    );
  }

  return (
    <div className={`mg-filter-pills-rail mg-filter-pills-rail--track${className ? ` ${className}` : ""}`}>
      {configButton}
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
    </div>
  );
}
