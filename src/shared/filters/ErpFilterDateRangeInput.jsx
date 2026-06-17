import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import {
  MONTH_SHORT,
  addMonths,
  buildDayCells,
  formatBrDate,
  formatBrDateRangeDisplay,
  getDayRangeClasses,
  parseBrDate,
} from "@/shared/filters/erpFilterDateUtils";

const PANEL_WIDTH = 660;
const PANEL_HEIGHT = 320;
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

function MonthGrid({ year, month, startValue, endValue, onDaySelect }) {
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
          if (isCurrent) cls += getDayRangeClasses(year, month, cell.day, startValue, endValue);

          return (
            <button
              key={cell.key}
              type="button"
              className={cls}
              disabled={!isCurrent}
              onClick={(event) => {
                event.stopPropagation();
                if (isCurrent) onDaySelect(year, month, cell.day);
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

/** Campo único de período com calendário duplo para filtros Entre / Não está entre. */
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
  const anchor = resolveAnchorMonth(value, valueTo);
  const [view, setView] = useState(anchor);

  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    width: PANEL_WIDTH,
    estimatedHeight: PANEL_HEIGHT,
    scrollable: false,
    observePanelResize: false,
  });

  useMgPanelCoordinator(rootRef, setOpen);

  const displayValue = formatBrDateRangeDisplay(value, valueTo);
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

  const toggle = () => {
    if (disabled) return;
    setOpen((wasOpen) => {
      if (!wasOpen) {
        setView(resolveAnchorMonth(value, valueTo));
        return true;
      }
      return false;
    });
  };

  const handleDaySelect = (year, month, day) => {
    const clicked = formatBrDate(day, month, year);
    const hasStart = Boolean(String(value || "").trim());
    const hasEnd = Boolean(String(valueTo || "").trim());

    if (!hasStart || (hasStart && hasEnd)) {
      onValueChange?.(clicked);
      onValueToChange?.("");
      return;
    }

    const startTs = parseBrDate(value);
    const clickTs = new Date(year, month, day).getTime();
    const startDateTs = new Date(startTs.year, startTs.month, startTs.day).getTime();

    if (clickTs < startDateTs) {
      onValueToChange?.(value);
      onValueChange?.(clicked);
      return;
    }

    onValueToChange?.(clicked);
  };

  const navMonth = (delta) => {
    setView((current) => addMonths(current.year, current.month, delta));
  };

  const navYear = (delta) => {
    setView((current) => ({ ...current, year: current.year + delta }));
  };

  return (
    <div
      ref={rootRef}
      id={id}
      className={`mg-dp mg-dp-range erp-filter-date-range-input${open ? " open" : ""}${disabled ? " is-disabled" : ""}${displayValue ? " mg-has-value" : ""}`}
    >
      <input
        id={inputId}
        type="text"
        className="mg-dp-field"
        value={displayValue}
        readOnly
        disabled={disabled}
        placeholder="Selecionar período"
        onClick={toggle}
        onFocus={(event) => {
          if (!open && event.currentTarget.matches(":focus-visible")) toggle();
        }}
      />
      <div className="mg-dp-icon"><Calendar className="h-3.5 w-3.5" /></div>
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-dp-panel mg-dp-range-panel erp-filter-date-panel"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mg-dp-header mg-dp-range-header">
          <button type="button" className="mg-dp-nav" onClick={() => navYear(-1)} aria-label="Ano anterior">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => navMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="mg-dp-range-header__spacer" aria-hidden="true" />
          <button type="button" className="mg-dp-nav" onClick={() => navMonth(1)} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => navYear(1)} aria-label="Próximo ano">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mg-dp-body mg-dp-range-body">
          <div className="mg-dp-range-grid">
            <MonthGrid
              year={view.year}
              month={view.month}
              startValue={value}
              endValue={valueTo}
              onDaySelect={handleDaySelect}
            />
            <MonthGrid
              year={rightMonth.year}
              month={rightMonth.month}
              startValue={value}
              endValue={valueTo}
              onDaySelect={handleDaySelect}
            />
          </div>
        </div>
      </MgPortalPanel>
    </div>
  );
}
