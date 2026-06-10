import React, { useRef } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/shared/utils/utils";

export default function EmpFormDateControl({
  value,
  onChange,
  readOnly,
  disabled,
  type = "date",
  className,
  variant = "default",
}) {
  const inputRef = useRef(null);
  const isMg = variant === "mg";
  const isTime = type === "time";
  const Icon = isTime ? Clock : Calendar;

  const openPicker = () => {
    if (readOnly || disabled) return;
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
        el.focus();
      }
    } else {
      el.focus();
    }
  };

  if (isMg) {
    return (
      <div className={cn(isTime ? "mg-tp" : "mg-dp", className)}>
        <input
          ref={inputRef}
          type={type}
          value={value || ""}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          className={isTime ? "mg-tp-field" : "mg-dp-field"}
          onClick={openPicker}
        />
        <div className={isTime ? "mg-tp-icon" : "mg-dp-icon"} aria-hidden>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("emp-form-date-control", className)}>
      <input
        ref={inputRef}
        type={type}
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
        className="emp-form-input min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <button
        type="button"
        className="emp-form-date-btn"
        tabIndex={-1}
        disabled={readOnly || disabled}
        onClick={openPicker}
        aria-label={isTime ? "Abrir seletor de hora" : "Abrir calendário"}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
