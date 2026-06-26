import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMgPanelCoordinator, useMgPanelPosition } from "@/framework/mak/layout/useMgPanelPosition";
import MgPortalPanel from "@/framework/mak/layout/MgPortalPanel";
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

const PANEL_WIDTH = 250;
const PANEL_HEIGHT = 248;
const PANEL_Z_INDEX = 10002;
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function resolveMonth(value) {
  if (value && isValidBrDate(value)) {
    const parsed = parseBrDate(value);
    return { year: parsed.year, month: parsed.month };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function SingleMonth({ year, month, value, onDaySelect, onMonthStep, onYearStep, disabled }) {
  const today = new Date();
  const dayCells = buildDayCells(year, month);
  const holdFocus = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mg-dp-range-month">
      <div className="mg-dp-range-month__header">
        <button type="button" className="mg-dp-range-month__nav" aria-label="Ano anterior" onMouseDown={holdFocus} onPointerDown={holdFocus} onClick={() => onYearStep?.(-1)} disabled={disabled}>
          <ChevronsLeft className="h-3 w-3" />
        </button>
        <button type="button" className="mg-dp-range-month__nav" aria-label="Mês anterior" onMouseDown={holdFocus} onPointerDown={holdFocus} onClick={() => onMonthStep?.(-1)} disabled={disabled}>
          <ChevronLeft className="h-3 w-3" />
        </button>
        <div className="mg-dp-range-month__title">{year} {MONTH_SHORT[month]}</div>
        <button type="button" className="mg-dp-range-month__nav" aria-label="Próximo mês" onMouseDown={holdFocus} onPointerDown={holdFocus} onClick={() => onMonthStep?.(1)} disabled={disabled}>
          <ChevronRight className="h-3 w-3" />
        </button>
        <button type="button" className="mg-dp-range-month__nav" aria-label="Próximo ano" onMouseDown={holdFocus} onPointerDown={holdFocus} onClick={() => onYearStep?.(1)} disabled={disabled}>
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
                onDaySelect?.(formatBrDate(cell.day, month, year));
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

/** Campo pill + ícone de calendário (mesmo visual do Entre), com popup de um calendário. */
export default function ErpFilterSingleDateInput({
  value = "",
  onValueChange,
  disabled = false,
  placeholder = "Data",
  inputId,
}) {
  const id = useId();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => resolveMonth(value));
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
    setView(resolveMonth(value));
    setOpen(true);
  };

  return (
    <div ref={rootRef} id={id} className={`erp-filter-single-date${open ? " is-calendar-open" : ""}`}>
      <div className="erp-filter-range-row erp-filter-range-row--inputs erp-filter-date-range__fields erp-filter-single-date__fields">
        <ErpFilterDateField
          inputId={inputId}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          className="erp-filter-date-range__calendar-btn"
          disabled={disabled}
          aria-label="Abrir calendário"
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
      </div>
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-dp-panel mg-dp-range-panel erp-filter-date-panel erp-filter-single-date-panel"
        style={{ ...panelStyle, zIndex: PANEL_Z_INDEX }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mg-dp-body mg-dp-range-body">
          <SingleMonth
            year={view.year}
            month={view.month}
            value={value}
            onDaySelect={onValueChange}
            onMonthStep={(delta) => setView((current) => addMonths(current.year, current.month, delta))}
            onYearStep={(delta) => setView((current) => ({ ...current, year: current.year + delta }))}
            disabled={disabled}
          />
        </div>
      </MgPortalPanel>
    </div>
  );
}
