import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import {
  MONTH_SHORT,
  addMonths,
  buildDayCells,
  formatBrDate,
  formatBrDateMaskAsYouType,
  getSingleSelectedDayClass,
  isValidBrDate,
  normalizeBrDateInput,
  parseBrDate,
} from "@/shared/filters/erpFilterDateUtils";

const PANEL_WIDTH = 500;
const PANEL_HEIGHT = 248;
const PANEL_Z_INDEX = 10002;
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function resolveAnchorMonth(value, valueTo) {
  if (value) {
    const parsed = parseBrDate(value);
    return { year: parsed.year, month: parsed.month };
  }
  if (valueTo) {
    const parsed = parseBrDate(valueTo);
    return addMonths(parsed.year, parsed.month, -1);
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function ErpFilterDateField({
  value = "",
  onChange,
  placeholder,
  disabled = false,
  inputId,
  onOpenCalendar,
}) {
  const [textValue, setTextValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setTextValue(value);
  }, [isEditing, value]);

  const commit = (nextText = textValue) => {
    const normalized = normalizeBrDateInput(nextText);
    const committed = isValidBrDate(normalized) ? normalized : formatBrDateMaskAsYouType(nextText);
    onChange?.(committed);
    setTextValue(committed);
    setIsEditing(false);
  };

  return (
    <div className="erp-filter-date-field-wrap">
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        className="erp-filter-field-input erp-filter-date-field"
        value={textValue}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        maxLength={10}
        onChange={(event) => {
          setIsEditing(true);
          setTextValue(formatBrDateMaskAsYouType(event.target.value));
        }}
        onFocus={() => setIsEditing(true)}
        onBlur={() => commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setIsEditing(false);
            setTextValue(value);
            event.currentTarget.blur();
          }
        }}
      />
      <button
        type="button"
        className="erp-filter-date-field__icon"
        disabled={disabled}
        aria-label={`Abrir calendário (${placeholder})`}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenCalendar?.();
        }}
      >
        <Calendar className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MonthGrid({ year, month, value, onDaySelect, disabled }) {
  const today = new Date();
  const dayCells = buildDayCells(year, month);

  return (
    <div className="mg-dp-range-month">
      <div className="mg-dp-range-month__title">
        {year} {MONTH_SHORT[month]}
      </div>
      <div className="mg-dp-weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="mg-dp-wd">{weekday}</div>
        ))}
      </div>
      <div className="mg-dp-days">
        {dayCells.map((cell) => {
          const isCurrent = cell.type === "current";
          const isToday =
            isCurrent &&
            today.getDate() === cell.day &&
            today.getMonth() === month &&
            today.getFullYear() === year;

          let cls = "mg-dp-day";
          if (!isCurrent) cls += " other";
          if (isToday) cls += " today";
          if (isCurrent) cls += getSingleSelectedDayClass(year, month, cell.day, value);

          return (
            <button
              key={cell.key}
              type="button"
              className={cls}
              disabled={disabled || !isCurrent}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!isCurrent) return;
                onDaySelect(formatBrDate(cell.day, month, year));
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Dois campos + popup flutuante com calendário duplo (esquerda = inicial, direita = final). */
export default function ErpFilterDateRangeInput({
  value = "",
  valueTo = "",
  onValueChange,
  onValueToChange,
  disabled = false,
  inputId,
}) {
  const id = useId();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => resolveAnchorMonth(value, valueTo));

  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    width: PANEL_WIDTH,
    estimatedHeight: PANEL_HEIGHT,
    scrollable: false,
    observePanelResize: false,
  });

  useMgPanelCoordinator(rootRef, setOpen);

  const rightMonth = addMonths(view.year, view.month, 1);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open) {
      setView(resolveAnchorMonth(value, valueTo));
    }
  }, [open, value, valueTo]);

  const openCalendar = () => {
    if (disabled) return;
    setView(resolveAnchorMonth(value, valueTo));
    setOpen(true);
  };

  const navMonth = (delta) => {
    setView((current) => addMonths(current.year, current.month, delta));
  };

  const navYear = (delta) => {
    setView((current) => ({ ...current, year: current.year + delta }));
  };

  return (
    <div ref={rootRef} id={id} className={`erp-filter-date-range${open ? " is-calendar-open" : ""}`}>
      <div className="erp-filter-range-row erp-filter-range-row--inputs erp-filter-date-range__fields">
        <ErpFilterDateField
          inputId={inputId}
          value={value}
          onChange={onValueChange}
          placeholder="Data inicial"
          disabled={disabled}
          onOpenCalendar={openCalendar}
        />
        <span className="erp-filter-range-sep">até</span>
        <ErpFilterDateField
          value={valueTo}
          onChange={onValueToChange}
          placeholder="Data final"
          disabled={disabled}
          onOpenCalendar={openCalendar}
        />
      </div>

      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-dp-panel mg-dp-range-panel erp-filter-date-panel"
        style={{ ...panelStyle, zIndex: PANEL_Z_INDEX }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mg-dp-header mg-dp-range-header">
          <button type="button" className="mg-dp-nav" onClick={() => navYear(-1)} aria-label="Ano anterior">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => navMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="mg-dp-range-header__spacer" aria-hidden="true" />
          <button type="button" className="mg-dp-nav" onClick={() => navMonth(1)} aria-label="Próximo mês">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => navYear(1)} aria-label="Próximo ano">
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mg-dp-body mg-dp-range-body">
          <div className="mg-dp-range-grid">
            <MonthGrid
              year={view.year}
              month={view.month}
              value={value}
              onDaySelect={onValueChange}
              disabled={disabled}
            />
            <MonthGrid
              year={rightMonth.year}
              month={rightMonth.month}
              value={valueTo}
              onDaySelect={onValueToChange}
              disabled={disabled}
            />
          </div>
        </div>
      </MgPortalPanel>
    </div>
  );
}
