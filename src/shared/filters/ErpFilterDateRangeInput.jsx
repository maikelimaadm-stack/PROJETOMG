import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTH_SHORT,
  addMonths,
  buildDayCells,
  formatBrDate,
  getSingleSelectedDayClass,
  isValidBrDate,
  normalizeBrDateInput,
  parseBrDate,
} from "@/shared/filters/erpFilterDateUtils";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function resolveViewMonth(value) {
  if (value && isValidBrDate(value)) {
    const parsed = parseBrDate(value);
    return { year: parsed.year, month: parsed.month };
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
}) {
  const [textValue, setTextValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setTextValue(value);
  }, [isEditing, value]);

  const commit = (nextText = textValue) => {
    const normalized = normalizeBrDateInput(nextText);
    const committed = isValidBrDate(normalized) ? normalized : String(nextText || "").trim();
    onChange?.(committed);
    setTextValue(committed);
    setIsEditing(false);
  };

  return (
    <input
      id={inputId}
      type="text"
      className="erp-filter-field-input erp-filter-date-field"
      value={textValue}
      disabled={disabled}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      onChange={(event) => {
        setIsEditing(true);
        setTextValue(event.target.value);
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
  );
}

function InlineCalendar({
  label,
  value,
  onChange,
  view,
  onViewChange,
  disabled = false,
}) {
  const today = new Date();
  const dayCells = buildDayCells(view.year, view.month);

  return (
    <div className="erp-filter-inline-calendar">
      <div className="erp-filter-inline-calendar__label">{label}</div>
      <div className="erp-filter-inline-calendar__header">
        <button
          type="button"
          className="erp-filter-inline-calendar__nav"
          disabled={disabled}
          aria-label={`Mês anterior (${label})`}
          onClick={() => onViewChange(addMonths(view.year, view.month, -1))}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span className="erp-filter-inline-calendar__title">
          {view.year} {MONTH_SHORT[view.month]}
        </span>
        <button
          type="button"
          className="erp-filter-inline-calendar__nav"
          disabled={disabled}
          aria-label={`Próximo mês (${label})`}
          onClick={() => onViewChange(addMonths(view.year, view.month, 1))}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="erp-filter-inline-calendar__weekdays">
        {WEEKDAYS.map((weekday, index) => (
          <div key={`${label}-${weekday}-${index}`} className="erp-filter-inline-calendar__wd">
            {weekday}
          </div>
        ))}
      </div>
      <div className="erp-filter-inline-calendar__days">
        {dayCells.map((cell) => {
          const isCurrent = cell.type === "current";
          const isToday =
            isCurrent &&
            today.getDate() === cell.day &&
            today.getMonth() === view.month &&
            today.getFullYear() === view.year;

          let cls = "erp-filter-inline-calendar__day";
          if (!isCurrent) cls += " other";
          if (isToday) cls += " today";
          if (isCurrent) cls += getSingleSelectedDayClass(view.year, view.month, cell.day, value);

          return (
            <button
              key={cell.key}
              type="button"
              className={cls}
              disabled={disabled || !isCurrent}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!isCurrent) return;
                onChange?.(formatBrDate(cell.day, view.month, view.year));
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

/** Dois campos + dois calendários lado a lado: esquerda = inicial, direita = final. */
export default function ErpFilterDateRangeInput({
  value = "",
  valueTo = "",
  onValueChange,
  onValueToChange,
  disabled = false,
  inputId,
}) {
  const [startView, setStartView] = useState(() => resolveViewMonth(value));
  const [endView, setEndView] = useState(() => {
    if (valueTo && isValidBrDate(valueTo)) return resolveViewMonth(valueTo);
    const start = resolveViewMonth(value);
    return addMonths(start.year, start.month, 1);
  });

  useEffect(() => {
    if (value && isValidBrDate(value)) {
      setStartView(resolveViewMonth(value));
    }
  }, [value]);

  useEffect(() => {
    if (valueTo && isValidBrDate(valueTo)) {
      setEndView(resolveViewMonth(valueTo));
    }
  }, [valueTo]);

  return (
    <div className="erp-filter-date-range">
      <div className="erp-filter-range-row erp-filter-range-row--inputs erp-filter-date-range__fields">
        <ErpFilterDateField
          inputId={inputId}
          value={value}
          onChange={onValueChange}
          placeholder="Data inicial"
          disabled={disabled}
        />
        <span className="erp-filter-range-sep">até</span>
        <ErpFilterDateField
          value={valueTo}
          onChange={onValueToChange}
          placeholder="Data final"
          disabled={disabled}
        />
      </div>
      <div className="erp-filter-date-range__calendars">
        <InlineCalendar
          label="Data inicial"
          value={value}
          onChange={onValueChange}
          view={startView}
          onViewChange={setStartView}
          disabled={disabled}
        />
        <InlineCalendar
          label="Data final"
          value={valueTo}
          onChange={onValueToChange}
          view={endView}
          onViewChange={setEndView}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
