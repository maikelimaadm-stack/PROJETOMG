import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 320;
const VIEW_HEIGHT = 272;

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const VIEW_INDEX = { days: 0, months: 1, years: 2 };

function parseBrDate(value) {
  const parts = String(value || "").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return { day: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, year: parseInt(parts[2], 10) };
  }
  const iso = String(value || "").split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number);
    return { day, month: month - 1, year };
  }
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
}

function formatBrDate(day, month, year) {
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

function buildDayCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLast = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1) {
      cells.push({ key: `p-${i}`, day: prevLast + dayNum, type: "other" });
    } else if (dayNum > daysInMonth) {
      cells.push({ key: `n-${i}`, day: dayNum - daysInMonth, type: "other" });
    } else {
      cells.push({ key: `d-${dayNum}`, day: dayNum, type: "current" });
    }
  }

  return cells;
}

export default function MgDatePicker({
  label,
  required = false,
  value = "",
  onChange,
  readOnly = false,
  disabled = false,
}) {
  const id = useId();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [open, setOpen] = useState(false);
  const parsed = parseBrDate(value);
  const [state, setState] = useState({ ...parsed, view: "days" });
  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, {
    width: PANEL_WIDTH,
    estimatedHeight: PANEL_HEIGHT,
    scrollable: false,
    observePanelResize: false,
  });

  useMgPanelCoordinator(rootRef, setOpen);
  onChangeRef.current = onChange;

  const displayValue = value
    ? (String(value).includes("/") ? String(value) : formatBrDate(parsed.day, parsed.month, parsed.year))
    : "";

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
    const p = parseBrDate(value);
    setState((s) => ({ ...s, ...p }));
  }, [value]);

  const toggle = () => {
    if (readOnly || disabled) return;
    setOpen((wasOpen) => {
      if (!wasOpen) {
        closeMgPanels(rootRef.current);
        setState((s) => ({ ...s, view: "days" }));
        return true;
      }
      return false;
    });
  };

  const selectDay = (day) => {
    const next = formatBrDate(day, state.month, state.year);
    onChangeRef.current?.({ target: { value: next } });
    setOpen(false);
  };

  const nav = (dir) => {
    setState((s) => {
      if (s.view === "days") {
        let month = s.month + dir;
        let year = s.year;
        if (month > 11) { month = 0; year += 1; }
        if (month < 0) { month = 11; year -= 1; }
        return { ...s, month, year };
      }
      if (s.view === "months") return { ...s, year: s.year + dir };
      return { ...s, year: s.year + dir * 12 };
    });
  };

  const drillUp = () => {
    setState((s) => {
      if (s.view === "days") return { ...s, view: "months" };
      if (s.view === "months") return { ...s, view: "years" };
      return s;
    });
  };

  const yearStart = state.year - 5;
  const title =
    state.view === "days"
      ? `${MONTH_NAMES[state.month]} de ${state.year}`
      : state.view === "months"
        ? String(state.year)
        : `${yearStart} – ${yearStart + 11}`;

  const today = new Date();
  const dayCells = buildDayCells(state.year, state.month);
  const viewOffset = VIEW_INDEX[state.view] * VIEW_HEIGHT;

  const renderDaysView = () => (
    <div className="mg-dp-view-layer mg-dp-view-layer--days">
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
            today.getMonth() === state.month &&
            today.getFullYear() === state.year;
          const isSelected =
            isCurrent &&
            parsed.day === cell.day &&
            parsed.month === state.month &&
            parsed.year === state.year;

          let cls = "mg-dp-day";
          if (!isCurrent) cls += " other";
          if (isToday) cls += " today";
          if (isSelected) cls += " selected";

          return (
            <button
              key={cell.key}
              type="button"
              className={cls}
              disabled={!isCurrent}
              onClick={(event) => {
                event.stopPropagation();
                if (isCurrent) selectDay(cell.day);
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMonthsView = () => (
    <div className="mg-dp-view-layer mg-dp-view-layer--grid">
      <div className="mg-dp-grid">
        {MONTH_SHORT.map((name, monthIndex) => (
          <button
            key={name}
            type="button"
            className={`mg-dp-pick${monthIndex === state.month ? " selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setState((s) => ({ ...s, month: monthIndex, view: "days" }));
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderYearsView = () => (
    <div className="mg-dp-view-layer mg-dp-view-layer--grid">
      <div className="mg-dp-grid">
        {Array.from({ length: 12 }, (_, i) => yearStart + i).map((year) => (
          <button
            key={year}
            type="button"
            className={`mg-dp-pick${year === state.year ? " selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setState((s) => ({ ...s, year, view: "months" }));
            }}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} id={id} className={`mg-dp${open ? " open" : ""}${disabled || readOnly ? " is-disabled" : ""}${displayValue ? " mg-has-value" : ""}`}>
      {label ? <label className={`mg-dp-label${required ? " req" : ""}`}>{label}</label> : null}
      <input
        type="text"
        className="mg-dp-field"
        value={displayValue}
        readOnly
        disabled={disabled || readOnly}
        onClick={toggle}
      />
      <div className="mg-dp-icon"><Calendar className="h-3.5 w-3.5" /></div>
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-dp-panel"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mg-dp-header">
          <button type="button" className="mg-dp-nav" onClick={() => nav(-1)} aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="mg-dp-title" onClick={drillUp}>
            {title}
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => nav(1)} aria-label="Próximo">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mg-dp-body">
          <div className="mg-dp-viewport">
            <div
              className="mg-dp-view-track"
              style={{ transform: `translate3d(0, -${viewOffset}px, 0)` }}
            >
              {renderDaysView()}
              {renderMonthsView()}
              {renderYearsView()}
            </div>
          </div>
        </div>
      </MgPortalPanel>
    </div>
  );
}
