import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

function resolveStartMonth(value, valueTo) {
  if (value && isValidBrDate(value)) {
    const parsed = parseBrDate(value);
    return { year: parsed.year, month: parsed.month };
  }
  if (valueTo && isValidBrDate(valueTo)) {
    const parsed = parseBrDate(valueTo);
    return addMonths(parsed.year, parsed.month, -1);
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function resolveEndMonth(value, valueTo, startMonth) {
  if (valueTo && isValidBrDate(valueTo)) {
    const parsed = parseBrDate(valueTo);
    return { year: parsed.year, month: parsed.month };
  }
  if (value && isValidBrDate(value)) {
    const parsed = parseBrDate(value);
    return addMonths(parsed.year, parsed.month, 1);
  }
  return addMonths(startMonth.year, startMonth.month, 1);
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
      onFocus={() => {
        setIsEditing(true);
        onOpenCalendar?.();
      }}
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
  );
}

function MonthGrid({
  year,
  month,
  value,
  onDaySelect,
  onMonthStep,
  onYearStep,
  disabled,
}) {
  const today = new Date();
  const dayCells = buildDayCells(year, month);

  return (
    <div className="mg-dp-range-month">
      <div className="mg-dp-range-month__header">
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Ano anterior"
          onClick={() => onYearStep?.(-1)}
          disabled={disabled}
        >
          <ChevronsLeft className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Mês anterior"
          onClick={() => onMonthStep?.(-1)}
          disabled={disabled}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <div className="mg-dp-range-month__title">
          {year} {MONTH_SHORT[month]}
        </div>
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Próximo mês"
          onClick={() => onMonthStep?.(1)}
          disabled={disabled}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Próximo ano"
          onClick={() => onYearStep?.(1)}
          disabled={disabled}
        >
          <ChevronsRight className="h-3 w-3" />
        </button>
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
  const initialStart = resolveStartMonth(value, valueTo);
  const [startView, setStartView] = useState(initialStart);
  const [endView, setEndView] = useState(() => resolveEndMonth(value, valueTo, initialStart));

  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    width: PANEL_WIDTH,
    estimatedHeight: PANEL_HEIGHT,
    scrollable: false,
    observePanelResize: false,
  });

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", close, true);
    document.addEventListener("touchstart", close, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", close, true);
      document.removeEventListener("touchstart", close, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openCalendar = () => {
    if (disabled) return;
    if (open) return;
    const nextStart = resolveStartMonth(value, valueTo);
    setStartView(nextStart);
    setEndView(resolveEndMonth(value, valueTo, nextStart));
    setOpen(true);
  };

  const navStartMonth = (delta) => setStartView((current) => addMonths(current.year, current.month, delta));
  const navStartYear = (delta) => setStartView((current) => ({ ...current, year: current.year + delta }));
  const navEndMonth = (delta) => setEndView((current) => addMonths(current.year, current.month, delta));
  const navEndYear = (delta) => setEndView((current) => ({ ...current, year: current.year + delta }));

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
        <span className="erp-filter-range-sep erp-filter-date-range__sep">até</span>
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
        <div className="mg-dp-body mg-dp-range-body">
          <div className="mg-dp-range-grid">
            <MonthGrid
              year={startView.year}
              month={startView.month}
              value={value}
              onDaySelect={onValueChange}
              onMonthStep={navStartMonth}
              onYearStep={navStartYear}
              disabled={disabled}
            />
            <MonthGrid
              year={endView.year}
              month={endView.month}
              value={valueTo}
              onDaySelect={onValueToChange}
              onMonthStep={navEndMonth}
              onYearStep={navEndYear}
              disabled={disabled}
            />
          </div>
        </div>
      </MgPortalPanel>
    </div>
  );
}
