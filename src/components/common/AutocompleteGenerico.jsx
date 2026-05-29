import React, { useState, useRef, useEffect } from "react";

export default function AutocompleteGenerico({
  items = [],
  value,
  onChange,
  displayField = "nome",
  searchFields = ["nome"],
  placeholder = "BUSCAR...",
  inputClassName = "",
  className = "",
  disabled = false,
  readOnly = false,
  renderItem,
  renderSubtext,
  uppercaseDisplay = true,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedItem = items.find((item) => item.id === value || item.value === value);
  const displayValue = selectedItem ? String(selectedItem[displayField] || "") : "";

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = items.filter((item) =>
    searchFields.some((field) =>
      String(item[field] || "").toLowerCase().includes(search.toLowerCase())
    )
  ).slice(0, 50);

  const handleSelect = (item) => {
    onChange(item.id ?? item.value ?? "");
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        className={`w-full bg-transparent focus:outline-none ${inputClassName}`}
        value={open ? search : uppercaseDisplay ? displayValue.toUpperCase() : displayValue}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        onFocus={() => { if (!readOnly && !disabled) { setSearch(""); setOpen(true); } }}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 min-w-full bg-white border border-slate-300 shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-2 py-1 text-xs text-slate-400">Nenhum resultado</div>
          )}
          {filtered.map((item) => (
            <div
              key={item.id ?? item.value}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-emerald-50"
              onMouseDown={() => handleSelect(item)}
            >
              {renderItem ? renderItem(item) : (
                <div>
                  <div className="font-medium text-slate-900">{uppercaseDisplay ? String(item[displayField] || "").toUpperCase() : String(item[displayField] || "")}</div>
                  {renderSubtext && <div className="text-slate-500 text-[10px]">{renderSubtext(item)}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}