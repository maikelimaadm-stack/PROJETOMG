import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/utils";

/** @typedef {'select' | 'lookup'} EmpAutocompleteVariant */

export function resolveEmpAutocompleteVariant({ variant, showSearchButton, field } = {}) {
  if (variant === "select" || variant === "lookup") return variant;
  if (showSearchButton) return "lookup";
  if (field) {
    if (field.type === "relation" || field.type === "lookup") return "lookup";
    if (field.relation_entity || field.options_source_entity) return "lookup";
    if (field.type === "autocomplete" && (field.relation_entity || field.options_source_entity)) {
      return "lookup";
    }
  }
  return "select";
}

export default function EmpAutocomplete({
  items = [],
  value,
  onChange,
  className,
  placeholder,
  displayField = "nome",
  searchFields = ["nome"],
  subtextField = "subtext",
  renderItem,
  renderSubtext,
  inputClassName = "",
  disabled = false,
  readOnly = false,
  uppercaseDisplay = true,
  showSearchButton = false,
  variant: variantProp,
  createNewLabel,
  onCreateNew,
  inputId,
  ariaLabelledby,
}) {
  const variant = resolveEmpAutocompleteVariant({ variant: variantProp, showSearchButton });
  const isLookup = variant === "lookup";
  const isSelect = !isLookup;

  const resolvedPlaceholder =
    placeholder ?? (isLookup ? "Digite para pesquisar..." : "SELECIONE");

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuFilter, setMenuFilter] = useState("");
  const [dropdownPos, setDropdownPos] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuSearchRef = useRef(null);
  const dropdownRef = useRef(null);
  const interactingWithDropdownRef = useRef(false);
  const portalContainerRef = useRef(null);

  const menuItems = useMemo(
    () => items.filter((item) => isLookup || String(item?.id ?? "") !== ""),
    [items, isLookup]
  );

  const selectedItem = useMemo(() => {
    if (value === "" || value == null) return undefined;
    return items.find((item) => item.id === value) ?? menuItems.find((item) => item.id === value);
  }, [items, menuItems, value]);
  const filterText = isSelect ? menuFilter : searchTerm;

  useEffect(() => {
    if (isLookup) {
      if (selectedItem) setSearchTerm(selectedItem[displayField] || "");
      else if (!value) setSearchTerm("");
      return;
    }
    if (!open) setMenuFilter("");
  }, [selectedItem, displayField, value, isLookup, open]);

  const calcPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const dialogEl = wrapperRef.current?.closest('[role="dialog"]');
    const dialogRect = dialogEl?.getBoundingClientRect();
    portalContainerRef.current = dialogEl || null;
    const panelWidth = Math.max(Math.round(rect.width), 200);
    setDropdownPos({
      top: dialogRect ? rect.bottom - dialogRect.top + 4 : rect.bottom + 4,
      left: dialogRect ? rect.left - dialogRect.left : rect.left,
      width: panelWidth,
      inDialog: !!dialogRect,
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

  const focusAdjacentField = useCallback((backward) => {
    const current = inputRef.current;
    if (!current) return;
    const scope = current.closest("form, [role='dialog'], .cadastro-emp-scope") || document;
    const candidates = Array.from(
      scope.querySelectorAll(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"
      )
    ).filter((el) => {
      if (el.tabIndex < 0) return false;
      if (el.closest("[aria-hidden='true']")) return false;
      return el.getClientRects().length > 0;
    });
    const index = candidates.indexOf(current);
    if (index < 0) return;
    const next = candidates[index + (backward ? -1 : 1)];
    next?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (interactingWithDropdownRef.current) return;
      const insideWrapper = wrapperRef.current?.contains(event.target);
      const insideDropdown = dropdownRef.current?.contains(event.target);
      if (!insideWrapper && !insideDropdown) {
        setOpen(false);
        if (isLookup) setSearchTerm(selectedItem?.[displayField] || "");
        setMenuFilter("");
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open, selectedItem, displayField, isLookup]);

  const filteredItems = useMemo(
    () =>
      [...menuItems]
        .sort((a, b) =>
          String(a?.[displayField] || "").localeCompare(String(b?.[displayField] || ""), "pt-BR", {
            numeric: true,
            sensitivity: "base",
          })
        )
        .filter((item) =>
          searchFields.some((field) =>
            String(item[field] || "")
              .toLowerCase()
              .includes(String(filterText || "").toLowerCase())
          )
        ),
    [menuItems, displayField, searchFields, filterText]
  );

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredItems.findIndex((item) => item.id === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, filterText, value, filteredItems.length]);

  const handleSelect = useCallback(
    (item) => {
      if (disabled || readOnly) return;
      onChange(item.id);
      if (isLookup) setSearchTerm(item[displayField] || "");
      setMenuFilter("");
      setOpen(false);
    },
    [onChange, displayField, disabled, readOnly, isLookup]
  );

  const handleKeyDown = (event) => {
    if (disabled || readOnly) return;
    if (event.key === "Escape") {
      setOpen(false);
      if (isLookup) setSearchTerm(selectedItem?.[displayField] || "");
      setMenuFilter("");
      return;
    }
    if (event.key === "Tab") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        if (isLookup) setSearchTerm(selectedItem?.[displayField] || "");
        setMenuFilter("");
        window.requestAnimationFrame(() => focusAdjacentField(event.shiftKey));
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(filteredItems.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter") {
      if (open) {
        event.preventDefault();
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex]);
        }
        return;
      }
    }
  };

  const handleMenuSearchChange = (next) => {
    if (isSelect) setMenuFilter(next);
    else setSearchTerm(next);
    if (!open) setOpen(true);
    calcPosition();
  };

  const openPanel = () => {
    if (disabled || readOnly) return;
    calcPosition();
    setOpen(true);
    if (isLookup) inputRef.current?.focus();
  };

  const defaultSubtext = useCallback(
    (item) => {
      if (item?.[subtextField]) return item[subtextField];
      if (item?.cnpj) return `CNPJ: ${item.cnpj}`;
      if (item?.cpf) return `CPF: ${item.cpf}`;
      if (item?.codigo) return String(item.codigo);
      return "";
    },
    [subtextField]
  );

  const renderMenuSearch = () => (
    <div
      className="erp-menu-search-field"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Search className="shrink-0" aria-hidden />
      <input
        ref={menuSearchRef}
        type="text"
        value={filterText}
        onChange={(e) => handleMenuSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pesquisar..."
        className="erp-menu-search-field__input"
        disabled={disabled || readOnly}
        aria-label="Pesquisar opções"
      />
    </div>
  );

  const renderResultList = () =>
    filteredItems.map((item, index) => {
      const subtext = renderSubtext ? renderSubtext(item) : isLookup ? defaultSubtext(item) : "";
      return (
        <div
          key={String(item.id ?? index)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(item);
          }}
          onWheel={(e) => e.stopPropagation()}
          onMouseEnter={() => setActiveIndex(index)}
          className={cn(
            "erp-menu-item",
            isLookup && "erp-menu-item--lookup",
            activeIndex === index && "erp-dropdown-item--active",
            value === item.id && "erp-menu-item--selected"
          )}
        >
          {renderItem ? (
            renderItem(item)
          ) : (
            <>
              <div
                className={cn(
                  "erp-menu-item__primary",
                  isLookup && "font-semibold text-[#1e293b]"
                )}
              >
                {item[displayField]}
              </div>
              {subtext ? <div className="erp-menu-item__secondary">{subtext}</div> : null}
            </>
          )}
        </div>
      );
    });

  const renderFooter = () => {
    if (!isLookup || !createNewLabel) return null;
    return (
      <div className="erp-search-panel__footer">
        <button
          type="button"
          className="erp-search-panel__footer-action"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onCreateNew?.();
          }}
          disabled={!onCreateNew}
        >
          <Plus className="shrink-0" aria-hidden />
          <span>{createNewLabel}</span>
        </button>
      </div>
    );
  };

  const renderDropdown = () => {
    if (!open || !dropdownPos) return null;
    const style = dropdownPos.inDialog
      ? {
          position: "absolute",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          minWidth: 200,
          zIndex: 999999,
          pointerEvents: "auto",
        }
      : {
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          minWidth: 200,
          zIndex: 999999,
          pointerEvents: "auto",
        };

    const panelClass = cn(
      "erp-menu-panel",
      isLookup ? "erp-search-panel" : "erp-select-menu"
    );

    const panelBody =
      filteredItems.length > 0 ? (
        <div className={isLookup ? "erp-search-panel__results" : "erp-select-menu__list"}>
          {renderResultList()}
        </div>
      ) : (
        <div className="erp-dropdown-empty">Nenhum item encontrado</div>
      );

    return ReactDOM.createPortal(
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
        {renderMenuSearch()}
        {panelBody}
        {renderFooter()}
      </div>,
      portalContainerRef.current || document.body
    );
  };

  const displayValue = isSelect
    ? selectedItem
      ? String(selectedItem[displayField] || "")
      : ""
    : searchTerm;

  return (
    <div
      ref={wrapperRef}
      data-autocomplete-open={open ? "true" : "false"}
      className={cn(
        "emp-form-autocomplete-wrap erp-select-control",
        isLookup ? "erp-field-lookup" : "erp-field-select",
        (isLookup || isSelect) && "emp-form-autocomplete-wrap--with-btn",
        open && "erp-field-open",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        {isLookup ? (
          <Search
            className="erp-field-lookup-inline-icon pointer-events-none absolute left-2 top-1/2 z-[2] h-[14px] w-[14px] -translate-y-1/2 text-[#1a1f26]"
            aria-hidden
          />
        ) : null}
        <Input
          ref={inputRef}
          id={inputId}
          aria-labelledby={ariaLabelledby}
          value={displayValue}
          onChange={(e) => {
            if (!isLookup) return;
            setSearchTerm(e.target.value);
            if (!open) setOpen(true);
            calcPosition();
          }}
          onFocus={() => openPanel()}
          onClick={() => openPanel()}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly || isSelect}
          placeholder={resolvedPlaceholder}
          className={cn(
            "emp-form-input emp-form-input-no-zoom h-full min-h-0 border-0 text-xs shadow-none focus-visible:ring-0",
            inputClassName,
            isLookup ? "erp-field-lookup-input !pl-7 !pr-2" : "erp-field-select-input !pr-2 !pl-2.5",
            !isLookup && uppercaseDisplay && "uppercase"
          )}
          style={!isLookup && uppercaseDisplay ? { textTransform: "uppercase" } : undefined}
        />
      </div>
      {isSelect ? (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || readOnly}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? setOpen(false) : openPanel())}
            className="erp-field-select-chevron-btn emp-form-select-btn shrink-0"
            aria-label={open ? "Fechar lista" : "Abrir lista"}
          >
            <ChevronDown
              className={cn("h-[14px] w-[14px] shrink-0 text-[#1a1f26] transition-transform duration-150", open && "rotate-180")}
              strokeWidth={2}
              color="#1a1f26"
            />
          </button>
      ) : null}
      {isLookup ? (
        <>
          <span className="erp-lookup-inline-divider" aria-hidden />
          <button
            type="button"
            className="emp-form-lookup-btn shrink-0"
            tabIndex={-1}
            disabled={disabled || readOnly}
            onClick={openPanel}
            aria-label="Pesquisar"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
      {renderDropdown()}
    </div>
  );
}
