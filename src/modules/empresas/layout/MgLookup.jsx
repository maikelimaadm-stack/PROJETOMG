import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";

export default function MgLookup({
  label,
  required = false,
  value,
  items = [],
  onChange,
  displayField = "nome",
  searchFields = ["nome"],
  readOnly = false,
  disabled = false,
}) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        searchFields.some((field) =>
          String(item[field] || "").toLowerCase().includes(query.toLowerCase())
        )
      ),
    [items, query, searchFields]
  );

  const panelStyle = useMgPanelPosition(
    open,
    rootRef,
    panelRef,
    { estimatedHeight: 380 },
    `${query}|${filtered.length}`
  );

  useMgPanelCoordinator(rootRef, setOpen);

  const itemKey = (item) => String(item?.id ?? item?.value ?? item?.codigo ?? "");
  const selected = items.find((item) => itemKey(item) === String(value));
  const display = selected?.[displayField] || (value ? String(value) : "");

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

  const toggle = () => {
    if (readOnly || disabled) return;
    setOpen((wasOpen) => {
      if (!wasOpen) {
        closeMgPanels(rootRef.current);
        setQuery("");
        setHighlighted(-1);
        return true;
      }
      return false;
    });
  };

  const selectItem = (item) => {
    onChange?.(itemKey(item));
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) { toggle(); return; }
      const item = filtered[highlighted >= 0 ? highlighted : filtered.findIndex((i) => itemKey(i) === String(value))];
      if (item) selectItem(item);
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { toggle(); return; }
      setHighlighted((idx) => {
        if (e.key === "ArrowDown") return Math.min(filtered.length - 1, idx + 1);
        return Math.max(0, idx - 1);
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`mg-lookup${open ? " open" : ""}${disabled || readOnly ? " disabled" : ""}${display ? " mg-has-value" : ""}`}
      tabIndex={disabled || readOnly ? -1 : 0}
      onKeyDown={onKeyDown}
      onClick={toggle}
    >
      {label ? <span className={`mg-lookup-label${required ? " req" : ""}`}>{label}</span> : null}
      <div className="mg-lookup-display">{display}</div>
      <ChevronDown className="mg-lookup-icon h-3 w-3" />
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="mg-lookup-panel"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mg-lookup-search">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlighted(-1); }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="mg-lookup-list mg-panel-options">
          {filtered.map((item, index) => (
            <div
              key={itemKey(item)}
              className={`mg-lookup-option${String(value) === itemKey(item) ? " selected" : ""}${highlighted === index ? " highlighted" : ""}`}
              onClick={() => selectItem(item)}
            >
              <div className="mg-lookup-option-text">{item[displayField]}</div>
            </div>
          ))}
        </div>
      </MgPortalPanel>
    </div>
  );
}
