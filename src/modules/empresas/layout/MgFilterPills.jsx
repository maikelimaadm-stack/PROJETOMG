import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { FILTER_POPOVER_WIDTH } from "@/modules/empresas/components/tblEmp.constants";
import EmpColFilterPopover from "@/modules/empresas/components/EmpColFilterPopover";
import { matchesFilterOptionContains } from "@/modules/empresas/components/tblEmp.filters";
import {
  buildPanelFilterOptions,
} from "@/modules/empresas/layout/mgPanelFilterOptions";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";

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
  const [draft, setDraft] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 180);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useFilterPopover(open, setOpen, rootRef, panelRef);
  const selectedValues = values[field.key] || [];

  useEffect(() => {
    if (!open) {
      setDraft(Array.isArray(selectedValues) ? selectedValues : []);
      setSearchQuery("");
    }
  }, [open, selectedValues]);

  const filterOptions = useMemo(
    () => buildPanelFilterOptions(empresas, appliedValues, field.key, filterFields),
    [appliedValues, empresas, field.key, filterFields]
  );

  const filterQuery = debouncedSearchQuery.trim();
  const filteredOptions = filterQuery
    ? filterOptions.filter((option) => matchesFilterOptionContains(option, filterQuery))
    : filterOptions;

  const searchLoading =
    searchQuery.trim().toLowerCase() !== debouncedSearchQuery.trim().toLowerCase();

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

  const clearActive = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const nextValues = { ...values, [field.key]: [] };
    onChange?.(field.key, []);
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
        aria-haspopup="listbox"
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
      <EmpColFilterPopover
        open={open}
        panelRef={panelRef}
        style={panelStyle}
        columnLabel={field.label}
        showSortSection={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchLoading={searchLoading}
        filteredOptions={filteredOptions}
        selectedValues={draft}
        allVisibleSelected={allVisibleSelected}
        onToggleAll={(event) => {
          setDraft((current) => {
            const rest = current.filter((value) => !filteredOptions.includes(value));
            return event.target.checked ? [...new Set([...rest, ...filteredOptions])] : rest;
          });
        }}
        onToggleOption={(option, checked) => {
          setDraft((current) =>
            checked
              ? [...new Set([...current, option])]
              : current.filter((value) => value !== option)
          );
        }}
        onCancel={cancel}
        onApply={apply}
        searchAriaLabel={`Pesquisar valores de ${field.label}`}
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
    () =>
      filterFields.some(
        (field) => Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0
      ),
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
          active={Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0}
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

  if (!useScrollRail) {
    return (
      <div className={`mg-filter-pills${className ? ` ${className}` : ""}`}>
        {pills}
      </div>
    );
  }

  return (
    <div className={`mg-filter-pills-rail${className ? ` ${className}` : ""}`}>
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
      {onConfigureFilters ? (
        <button
          type="button"
          className={`ios-btn mg-nav-btn mg-filter-pills-rail__nav mg-filter-pills-rail__config${
            filterPanelActive ? " is-active" : ""
          }`}
          onClick={onConfigureFilters}
          disabled={disabled}
          aria-label="Configurar filtros"
          title="Configurar filtros"
          aria-pressed={filterPanelActive}
        >
          <Filter className="mg-filter-pills-rail__nav-icon" strokeWidth={2.2} aria-hidden="true" />
        </button>
      ) : null}
      {onConfigureFilters ? (
        <div className="mg-filter-pills-rail__side-border" aria-hidden="true" />
      ) : null}
    </div>
  );
}
