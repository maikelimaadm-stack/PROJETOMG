import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/utils";

export default function EmpAutocomplete({
  items = [],
  value,
  onChange,
  className,
  placeholder = "Buscar...",
  displayField = "nome",
  searchFields = ["nome"],
  renderItem,
  renderSubtext,
  inputClassName = "",
  disabled = false,
  readOnly = false,
  uppercaseDisplay = true,
  showSearchButton = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPos, setDropdownPos] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const interactingWithDropdownRef = useRef(false);
  const portalContainerRef = useRef(null);

  const selectedItem = items.find((item) => item.id === value);

  useEffect(() => {
    if (selectedItem) setSearchTerm(selectedItem[displayField] || "");
    else if (!value) setSearchTerm("");
  }, [selectedItem, displayField, value]);

  const calcPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const dialogEl = wrapperRef.current?.closest('[role="dialog"]');
    const dialogRect = dialogEl?.getBoundingClientRect();
    portalContainerRef.current = dialogEl || null;
    setDropdownPos({
      top: dialogRect ? rect.bottom - dialogRect.top + 2 : rect.bottom + 2,
      left: dialogRect ? rect.left - dialogRect.left : rect.left,
      width: rect.width,
      inDialog: !!dialogRect
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPosition();
    const handleScroll = (event) => {
      if (dropdownRef.current?.contains(event.target)) return;
      calcPosition();
    };
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, calcPosition]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (interactingWithDropdownRef.current) return;
      const insideWrapper = wrapperRef.current?.contains(event.target);
      const insideDropdown = dropdownRef.current?.contains(event.target);
      if (!insideWrapper && !insideDropdown) {
        setOpen(false);
        setSearchTerm(selectedItem?.[displayField] || "");
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open, selectedItem, displayField]);

  const filteredItems = [...items]
    .sort((a, b) => String(a?.[displayField] || "").localeCompare(String(b?.[displayField] || ""), "pt-BR", { numeric: true, sensitivity: "base" }))
    .filter((item) => searchFields.some((field) => String(item[field] || "").toLowerCase().includes(searchTerm.toLowerCase())));

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredItems.findIndex((item) => item.id === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, searchTerm, value, filteredItems.length]);

  const handleSelect = useCallback((item) => {
    if (disabled || readOnly) return;
    onChange(item.id);
    setSearchTerm(item[displayField] || "");
    setOpen(false);
  }, [onChange, displayField, disabled, readOnly]);

  const handleKeyDown = (event) => {
    if (disabled || readOnly) return;
    if (event.key === "Tab" || event.key === "Escape") { setOpen(false); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((prev) => Math.min(prev + 1, Math.max(filteredItems.length - 1, 0))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((prev) => Math.max(prev - 1, 0)); }
    if (event.key === "Enter" && open && filteredItems[activeIndex]) { event.preventDefault(); handleSelect(filteredItems[activeIndex]); }
  };

  const handleClear = () => {
    if (disabled || readOnly) return;
    onChange("");
    setSearchTerm("");
    calcPosition();
    setOpen(true);
    inputRef.current?.focus();
  };

  const renderDropdown = () => {
    if (!open || !dropdownPos) return null;
    const style = dropdownPos.inDialog
      ? { position: "absolute", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 999999, pointerEvents: "auto" }
      : { position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 999999, pointerEvents: "auto" };

    const panelClass = cn("erp-menu-panel", showSearchButton ? "erp-search-panel" : "erp-select-menu");
    const renderResultList = () =>
      filteredItems.map((item, index) => (
        <div
          key={item.id}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(item);
          }}
          onWheel={(e) => e.stopPropagation()}
          onMouseEnter={() => setActiveIndex(index)}
          className={cn(
            "erp-menu-item erp-select-item",
            activeIndex === index && "erp-dropdown-item--active",
            value === item.id && "erp-menu-item--selected erp-select-item--selected"
          )}
        >
          {renderItem ? (
            renderItem(item)
          ) : (
            <>
              <div className="text-xs font-medium text-[#1e293b]">{item[displayField]}</div>
              {renderSubtext ? <div className="text-[10px] text-[#64748b]">{renderSubtext(item)}</div> : null}
            </>
          )}
        </div>
      ));

    const content = filteredItems.length > 0 ? (
      <div
        ref={dropdownRef}
        style={style}
        onPointerDownCapture={() => {
          interactingWithDropdownRef.current = true;
        }}
        onPointerUpCapture={() => {
          setTimeout(() => {
            interactingWithDropdownRef.current = false;
          }, 300);
        }}
        onWheel={(e) => e.stopPropagation()}
        className={panelClass}
      >
        {showSearchButton ? (
          <div className="erp-search-panel__query-bar" aria-hidden="true">
            <div className="erp-menu-search-field">
              <Search className="shrink-0" />
              <span className="erp-menu-search-field__text">{searchTerm || placeholder}</span>
            </div>
          </div>
        ) : null}
        <div className={showSearchButton ? "erp-search-panel__results" : undefined}>{renderResultList()}</div>
      </div>
    ) : searchTerm ? (
      <div ref={dropdownRef} style={style} className={panelClass}>
        {showSearchButton ? (
          <div className="erp-search-panel__query-bar" aria-hidden="true">
            <div className="erp-menu-search-field">
              <Search className="shrink-0" />
              <span className="erp-menu-search-field__text">{searchTerm || placeholder}</span>
            </div>
          </div>
        ) : null}
        <div className="erp-dropdown-empty">Nenhum item encontrado</div>
      </div>
    ) : null;

    return content ? ReactDOM.createPortal(content, portalContainerRef.current || document.body) : null;
  };

  const openSearch = () => {
    if (disabled || readOnly) return;
    calcPosition();
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "emp-form-autocomplete-wrap erp-select-control",
        showSearchButton && "emp-form-autocomplete-wrap--with-btn",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!open) setOpen(true);
            calcPosition();
          }}
          onFocus={() => {
            if (disabled || readOnly) return;
            calcPosition();
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${showSearchButton ? "pr-2" : "pr-8"} h-full min-h-0 text-xs rounded-none border-0 ${uppercaseDisplay ? "uppercase" : ""} ${inputClassName}`}
          style={uppercaseDisplay ? { textTransform: "uppercase" } : undefined}
        />
        {!showSearchButton && searchTerm && !disabled && !readOnly ? (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {showSearchButton ? (
        <button
          type="button"
          className="emp-form-lookup-btn shrink-0"
          tabIndex={-1}
          disabled={disabled || readOnly}
          onClick={openSearch}
          aria-label="Pesquisar"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {renderDropdown()}
    </div>
  );
}