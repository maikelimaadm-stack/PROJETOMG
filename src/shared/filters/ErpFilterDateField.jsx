import React, { useEffect, useState } from "react";
import {
  formatBrDateMaskAsYouType,
  isValidBrDate,
  normalizeBrDateInput,
} from "@/shared/filters/erpFilterDateUtils";

export default function ErpFilterDateField({
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
    const committed = isValidBrDate(normalized) ? normalized : formatBrDateMaskAsYouType(nextText);
    setTextValue(committed);
    setIsEditing(false);
    if (committed === String(value || "")) return;
    onChange?.(committed);
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
