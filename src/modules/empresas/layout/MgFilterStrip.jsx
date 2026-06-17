import React, { useEffect, useMemo, useRef, useState } from "react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import {
  MG_FILTER_STATUS_FIELD,
  MG_FILTER_STATUS_OPTIONS,
  MG_FILTER_TEXT_FIELDS,
} from "@/modules/empresas/layout/mgFilterFields";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";

function FilterPillPopover({ open, panelRef, style, children, onApply, onClearField }) {
  return (
    <MgPortalPanel
      open={open}
      panelRef={panelRef}
      panelClassName="dropdown-menu mg-filter-pill-popover open"
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mg-filter-pill-popover__body">{children}</div>
      <div className="mg-filter-pill-popover__footer">
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-filter-pill-popover__action"
          onClick={onClearField}
        >
          Limpar
        </button>
        <button
          type="button"
          className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-filter-pill-popover__action"
          onClick={onApply}
        >
          Ok
        </button>
      </div>
    </MgPortalPanel>
  );
}

function TextFilterPill({ field, value, active, disabled, onChange, onApply, onClearField }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    minWidth: 260,
    width: 280,
    estimatedHeight: 120,
    align: "left",
  });

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    if (!open) setDraft(value || "");
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const apply = () => {
    onChange?.(field.key, draft);
    onApply?.();
    setOpen(false);
  };

  const clearField = () => {
    setDraft("");
    onClearField?.(field.key);
    onApply?.();
    setOpen(false);
  };

  return (
    <div className={`mg-filter-pill${open ? " is-open" : ""}${active ? " is-active" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="mg-filter-pill__trigger ios-btn"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {field.label}
      </button>
      <FilterPillPopover
        open={open}
        panelRef={panelRef}
        style={panelStyle}
        onApply={apply}
        onClearField={clearField}
      >
        <label className="mg-filter-pill-popover__label" htmlFor={`mg-filter-${field.key}`}>
          {field.label}
        </label>
        <div className="mg-search-pill-wrap mg-filter-pill-popover__input-wrap">
          <div className="mg-search-pill mg-filter-pill-popover__input" role="search">
            <input
              ref={inputRef}
              id={`mg-filter-${field.key}`}
              type="text"
              placeholder={field.placeholder}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  apply();
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>
      </FilterPillPopover>
    </div>
  );
}

function StatusFilterPill({ value, active, disabled, onChange, onApply, onClearField }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "Todos");
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    minWidth: 220,
    width: 240,
    estimatedHeight: 160,
    align: "left",
  });

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    if (!open) setDraft(value || "Todos");
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const apply = () => {
    onChange?.(draft);
    onApply?.();
    setOpen(false);
  };

  const clearField = () => {
    setDraft("Todos");
    onClearField?.();
    onApply?.();
    setOpen(false);
  };

  const selectedLabel =
    MG_FILTER_STATUS_OPTIONS.find((option) => option.value === draft)?.label || MG_FILTER_STATUS_FIELD.label;

  return (
    <div className={`mg-filter-pill${open ? " is-open" : ""}${active ? " is-active" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="mg-filter-pill__trigger ios-btn"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {active && draft !== "Todos" ? `${MG_FILTER_STATUS_FIELD.label}: ${selectedLabel}` : MG_FILTER_STATUS_FIELD.label}
      </button>
      <FilterPillPopover
        open={open}
        panelRef={panelRef}
        style={panelStyle}
        onApply={apply}
        onClearField={clearField}
      >
        <div className="mg-filter-pill-popover__options" role="listbox" aria-label="Status">
          {MG_FILTER_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`mg-filter-pill-popover__option${draft === option.value ? " is-selected" : ""}`}
              onClick={() => setDraft(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterPillPopover>
    </div>
  );
}

export default function MgFilterStrip({
  values = {},
  status = "Todos",
  appliedValues = {},
  appliedStatus = "Todos",
  onChange,
  onStatusChange,
  onClear,
  onApply,
  disabled = false,
}) {
  const hasActiveFilters = useMemo(() => {
    const textActive = MG_FILTER_TEXT_FIELDS.some((field) => String(appliedValues[field.key] || "").trim());
    const statusActive = appliedStatus && appliedStatus !== "Todos";
    return textActive || statusActive;
  }, [appliedStatus, appliedValues]);

  const clearSingleField = (key) => {
    onChange?.(key, "");
  };

  const clearStatusField = () => {
    onStatusChange?.("Todos");
  };

  return (
    <div data-template-id="filter-strip" className="mg-filter-strip hidden md:flex">
      <div className="mg-filter-strip__scroll">
        {MG_FILTER_TEXT_FIELDS.map((field) => (
          <TextFilterPill
            key={field.key}
            field={field}
            value={values[field.key] || ""}
            active={Boolean(String(appliedValues[field.key] || "").trim())}
            disabled={disabled}
            onChange={onChange}
            onApply={onApply}
            onClearField={clearSingleField}
          />
        ))}
        <StatusFilterPill
          value={status}
          active={appliedStatus !== "Todos"}
          disabled={disabled}
          onChange={onStatusChange}
          onApply={onApply}
          onClearField={clearStatusField}
        />
        {hasActiveFilters ? (
          <button
            type="button"
            className="mg-filter-pill__trigger mg-filter-pill__trigger--clear ios-btn"
            onClick={onClear}
            disabled={disabled}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
