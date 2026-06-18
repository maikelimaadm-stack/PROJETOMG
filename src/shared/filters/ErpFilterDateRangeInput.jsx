import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import ErpFilterDateField from "@/shared/filters/ErpFilterDateField";
import {
  MONTH_SHORT,
  addMonths,
  buildDayCells,
  formatBrDate,
  getSingleSelectedDayClass,
  isValidBrDate,
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
  const holdFocus = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mg-dp-range-month">
      <div className="mg-dp-range-month__header">
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Ano anterior"
          onMouseDown={holdFocus}
          onPointerDown={holdFocus}
          onClick={() => onYearStep?.(-1)}
          disabled={disabled}
        >
          <ChevronsLeft className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Mês anterior"
          onMouseDown={holdFocus}
          onPointerDown={holdFocus}
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
          onMouseDown={holdFocus}
          onPointerDown={holdFocus}
          onClick={() => onMonthStep?.(1)}
          disabled={disabled}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="mg-dp-range-month__nav"
          aria-label="Próximo ano"
          onMouseDown={holdFocus}
          onPointerDown={holdFocus}
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
              onMouseDown={holdFocus}
              onPointerDown={holdFocus}
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
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", close, true);
    document.addEventListener("mousedown", close, true);
    document.addEventListener("click", close, true);
    document.addEventListener("focusin", close, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", close, true);
      document.removeEventListener("mousedown", close, true);
      document.removeEventListener("click", close, true);
      document.removeEventListener("focusin", close, true);
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
        />
        <button
          type="button"
          className="erp-filter-date-range__calendar-btn"
          disabled={disabled}
          aria-label="Abrir calendário de período"
          aria-expanded={open}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openCalendar();
          }}
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>
        <ErpFilterDateField
          value={valueTo}
          onChange={onValueToChange}
          placeholder="Data final"
          disabled={disabled}
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
