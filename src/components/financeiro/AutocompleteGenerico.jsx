import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function AutocompleteGenerico({
  items = [],
  value,
  onChange,
  placeholder = "BUSCAR...",
  displayField = "nome",
  searchFields = ["nome"],
  className = "",
  inputClassName = "",
  disabled = false,
  readOnly = false,
  renderItem,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = items.find((item) => item.id === value || item.value === value);
  const displayValue = selected ? String(selected[displayField] || selected.nome || selected.label || "") : "";

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = search
    ? items.filter((item) =>
        searchFields.some((field) =>
          String(item[field] || "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : items;

  const handleSelect = (item) => {
    onChange(item.id || item.value || "");
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Input
        value={open ? search : displayValue}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { if (!readOnly && !disabled) setOpen(true); }}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        className={inputClassName}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full bg-white border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item, i) => (
            <div
              key={item.id || item.value || i}
              onMouseDown={() => handleSelect(item)}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-slate-100"
            >
              {renderItem ? renderItem(item) : String(item[displayField] || item.nome || item.label || "")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}