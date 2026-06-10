import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";

function resolveOption(options, value) {
  const normalized = String(value ?? "");
  return (
    options.find((option) => String(option.value) === normalized) ||
    options.find((option) => String(option.label) === normalized) ||
    null
  );
}

export default function MgCmdSelect({
  label,
  required = false,
  value,
  options = [],
  onChange,
  placeholder = "Pesquisar...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      ),
    [options, query]
  );

  const panelStyle = useMgPanelPosition(
    open,
    rootRef,
    panelRef,
    { estimatedHeight: 380 },
    `${query}|${filtered.length}`
  );

  useMgPanelCoordinator(rootRef, setOpen);

  const selected = resolveOption(options, value);
  const display = selected?.label ?? (value ? String(value) : "");

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const selectOption = (option) => {
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
    rootRef.current?.focus();
  };

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) {
        closeMgPanels(rootRef.current);
        setQuery("");
        setHighlighted(-1);
      }
      return next;
    });
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        toggle();
        return;
      }
      const option =
        filtered[highlighted >= 0 ? highlighted : filtered.findIndex((item) => String(item.value) === String(value))];
      if (option) selectOption(option);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      toggle();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!filtered.length) return;
      setHighlighted((current) => {
        if (event.key === "ArrowDown") return Math.min(filtered.length - 1, current + 1);
        return Math.max(0, current - 1);
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cmd-select${open ? " open" : ""}${disabled ? " disabled" : ""}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      onClick={toggle}
      role="combobox"
      aria-expanded={open}
      aria-disabled={disabled}
    >
      {label ? <span className={`cmd-label${required ? " req" : ""}`}>{label}</span> : null}
      <div className="cmd-display">{display}</div>
      <ChevronDown className="cmd-chevron h-3 w-3" />
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="cmd-panel"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(-1);
          }}
          onClick={(event) => event.stopPropagation()}
        />
        <div className="cmd-panel-options py-1" role="listbox">
          {filtered.map((option, index) => (
            <div
              key={String(option.value)}
              className={`cmd-option${String(option.value) === String(value) ? " selected" : ""}${
                highlighted === index ? " highlighted" : ""
              }`}
              onClick={() => selectOption(option)}
              role="option"
              aria-selected={String(option.value) === String(value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </MgPortalPanel>
    </div>
  );
}
