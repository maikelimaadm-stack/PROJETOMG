import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { FILTER_POPOVER_WIDTH } from "@/modules/empresas/components/tblEmp.constants";
import EmpColFilterPopover from "@/modules/empresas/components/EmpColFilterPopover";
import { matchesFilterOptionContains } from "@/modules/empresas/components/tblEmp.filters";
import {
  MG_FILTER_FIELDS,
  MG_FILTER_STATUS_FIELD,
} from "@/modules/empresas/layout/mgFilterFields";
import {
  buildPanelFilterOptions,
  MG_PANEL_FILTER_FIELDS,
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
    () => buildPanelFilterOptions(empresas, appliedValues, field.key),
    [appliedValues, empresas, field.key]
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
        aria-haspopup="listbox"
      >
        <span>{field.label}</span>
        {active ? (
          <span className="mg-filter-pill__active-icon" aria-hidden="true">
            <X className="h-3 w-3" strokeWidth={2.3} />
          </span>
        ) : null}
      </button>
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

export default function MgFilterPills({
  values = {},
  appliedValues = {},
  empresas = [],
  onChange,
  onClear,
  onApply,
  disabled = false,
  className = "",
}) {
  const hasActiveFilters = useMemo(
    () =>
      MG_PANEL_FILTER_FIELDS.some(
        (field) => Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0
      ),
    [appliedValues]
  );

  return (
    <div className={`mg-filter-pills${className ? ` ${className}` : ""}`}>
      {MG_FILTER_FIELDS.map((field) => (
        <PanelFilterPill
          key={field.key}
          field={field}
          values={values}
          appliedValues={appliedValues}
          empresas={empresas}
          active={Array.isArray(appliedValues[field.key]) && appliedValues[field.key].length > 0}
          disabled={disabled}
          onChange={onChange}
          onApply={onApply}
        />
      ))}
      <PanelFilterPill
        field={MG_FILTER_STATUS_FIELD}
        values={values}
        appliedValues={appliedValues}
        empresas={empresas}
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
