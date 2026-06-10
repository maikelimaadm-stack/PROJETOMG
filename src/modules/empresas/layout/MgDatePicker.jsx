import React, { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
  const [open, setOpen] = useState(false);
  const parsed = parseBrDate(value);
  const [state, setState] = useState({ ...parsed, view: "days" });

  const displayValue = value
    ? (String(value).includes("/") ? String(value) : formatBrDate(parsed.day, parsed.month, parsed.year))
    : "";

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  useEffect(() => {
    const p = parseBrDate(value);
    setState((s) => ({ ...s, ...p }));
  }, [value]);

  const toggle = () => {
    if (readOnly || disabled) return;
    setOpen((o) => !o);
    setState((s) => ({ ...s, view: "days" }));
  };

  const selectDay = (day) => {
    const next = formatBrDate(day, state.month, state.year);
    onChange?.({ target: { value: next } });
    setOpen(false);
  };

  const renderBody = () => {
    if (state.view === "months") {
      return (
        <div className="mg-dp-grid">
          {MONTH_SHORT.map((name, m) => (
            <button
              key={name}
              type="button"
              className={m === state.month ? "active" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setState((s) => ({ ...s, month: m, view: "days" }));
              }}
            >
              {name}
            </button>
          ))}
        </div>
      );
    }
    if (state.view === "years") {
      const startYear = state.year - 5;
      return (
        <div className="mg-dp-grid">
          {Array.from({ length: 12 }, (_, i) => startYear + i).map((y) => (
            <button
              key={y}
              type="button"
              className={y === state.year ? "active" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setState((s) => ({ ...s, year: y, view: "months" }));
              }}
            >
              {y}
            </button>
          ))}
        </div>
      );
    }

    const first = new Date(state.year, state.month, 1);
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    const startDay = first.getDay();
    const prevLast = new Date(state.year, state.month, 0).getDate();
    const today = new Date();
    const cells = [];

    for (let i = startDay - 1; i >= 0; i -= 1) {
      cells.push(<button key={`p-${i}`} type="button" className="mg-dp-day other" disabled>{prevLast - i}</button>);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      let cls = "mg-dp-day";
      if (today.getDate() === d && today.getMonth() === state.month && today.getFullYear() === state.year) cls += " today";
      if (parsed.day === d && parsed.month === state.month && parsed.year === state.year) cls += " selected";
      cells.push(
        <button key={`d-${d}`} type="button" className={cls} onClick={(e) => { e.stopPropagation(); selectDay(d); }}>{d}</button>
      );
    }
    const remaining = (7 - ((startDay + daysInMonth) % 7)) % 7;
    for (let d = 1; d <= remaining; d += 1) {
      cells.push(<button key={`n-${d}`} type="button" className="mg-dp-day other" disabled>{d}</button>);
    }

    return (
      <>
        <div className="mg-dp-weekdays">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((w) => <div key={w} className="mg-dp-wd">{w}</div>)}
        </div>
        <div className="mg-dp-days">{cells}</div>
      </>
    );
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

  const title =
    state.view === "days"
      ? `${MONTH_NAMES[state.month]} de ${state.year}`
      : state.view === "months"
        ? String(state.year)
        : `${state.year - 5} – ${state.year + 6}`;

  return (
    <div ref={rootRef} id={id} className={`mg-dp${open ? " open" : ""}`}>
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
      <div className="mg-dp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mg-dp-header">
          <button type="button" className="mg-dp-nav" onClick={() => nav(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <button
            type="button"
            className="mg-dp-title"
            onClick={() => setState((s) => ({ ...s, view: s.view === "days" ? "months" : "years" }))}
          >
            {title}
          </button>
          <button type="button" className="mg-dp-nav" onClick={() => nav(1)}><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="mg-dp-body">{renderBody()}</div>
      </div>
    </div>
  );
}
