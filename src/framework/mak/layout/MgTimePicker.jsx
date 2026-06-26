import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "./useMgPanelPosition";
import MgPortalPanel from "./MgPortalPanel";

function parseTime(value) {
  const p = String(value || "").split(":");
  if (p.length >= 2) return { hour: parseInt(p[0], 10), minute: parseInt(p[1], 10) };
  return { hour: -1, minute: -1 };
}

export default function MgTimePicker({
  label,
  value = "",
  onChange,
  readOnly = false,
  disabled = false,
  inputId = undefined,
  labelId = undefined,
}) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(parseTime(value));
  const panelStyle = useMgPanelPosition(open, rootRef, panelRef, { width: 220, estimatedHeight: 220 });

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!rootRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    setState(parseTime(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      hoursRef.current?.querySelector(".active")?.scrollIntoView({ block: "center", behavior: "smooth" });
      minutesRef.current?.querySelector(".active")?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, [open, state.hour, state.minute]);

  useEffect(() => () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const toggle = () => {
    if (readOnly || disabled) return;
    setOpen((wasOpen) => {
      if (!wasOpen) {
        closeMgPanels(rootRef.current);
        return true;
      }
      return false;
    });
  };

  const finish = (hour, minute) => {
    const next = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onChange?.({ target: { value: next } });
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 150);
  };

  const selectHour = (h) => {
    setState((s) => {
      const next = { ...s, hour: h };
      if (next.minute >= 0) finish(h, next.minute);
      return next;
    });
  };

  const selectMinute = (m) => {
    setState((s) => {
      const next = { ...s, minute: m };
      if (next.hour >= 0) finish(next.hour, m);
      return next;
    });
  };

  const display = value || (state.hour >= 0 && state.minute >= 0
    ? `${String(state.hour).padStart(2, "0")}:${String(state.minute).padStart(2, "0")}`
    : "");

  const adjustTimeBy = ({ hour = 0, minute = 0 }) => {
    const baseHour = state.hour >= 0 ? state.hour : 0;
    const baseMinute = state.minute >= 0 ? state.minute : 0;
    const totalMinutes = ((baseHour * 60 + baseMinute + hour * 60 + minute) % (24 * 60) + (24 * 60)) % (24 * 60);
    const nextHour = Math.floor(totalMinutes / 60);
    const nextMinute = totalMinutes % 60;
    setState({ hour: nextHour, minute: nextMinute });
    onChange?.({
      target: {
        value: `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`,
      },
    });
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Tab") {
      if (open) setOpen(false);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) toggle();
      adjustTimeBy({ minute: 5 });
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) toggle();
      adjustTimeBy({ minute: -5 });
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (!open) toggle();
      adjustTimeBy({ hour: 1 });
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (!open) toggle();
      adjustTimeBy({ hour: -1 });
    }
  };

  return (
    <div ref={rootRef} className={`mg-tp${open ? " open" : ""}${disabled || readOnly ? " is-disabled" : ""}${display ? " mg-has-value" : ""}`}>
      {label ? <label id={labelId} htmlFor={inputId} className="mg-tp-label">{label}</label> : null}
      <input
        id={inputId}
        aria-labelledby={labelId}
        type="text"
        className="mg-tp-field"
        value={display}
        readOnly
        disabled={disabled || readOnly}
        placeholder=" "
        onClick={toggle}
        onFocus={(event) => {
          if (!open && event.currentTarget.matches(":focus-visible")) toggle();
        }}
        onKeyDown={handleInputKeyDown}
      />
      <div className="mg-tp-icon"><Clock className="h-3.5 w-3.5" /></div>
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-tp-panel"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mg-tp-columns">
          <div className="mg-tp-col" ref={hoursRef}>
            <div className="mg-tp-col-label">Hora</div>
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className={`mg-tp-item${state.hour === h ? " active" : ""}`}
                onClick={() => selectHour(h)}
              >
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="mg-tp-col" ref={minutesRef}>
            <div className="mg-tp-col-label">Minuto</div>
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <div
                key={m}
                className={`mg-tp-item${state.minute === m ? " active" : ""}`}
                onClick={() => selectMinute(m)}
              >
                {String(m).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
      </MgPortalPanel>
    </div>
  );
}
