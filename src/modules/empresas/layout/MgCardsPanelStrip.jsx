import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Columns3Cog, Combine } from "lucide-react";
import {
  EMP_CARDS_LAYOUT_DEFAULT,
  EMP_CARDS_LAYOUT_OPTIONS,
  EMP_SEARCH_DEFAULT_FIELDS,
  getDefaultCardVisFields,
} from "@/modules/empresas/components/empSearchView.constants";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgFilterPills from "@/modules/empresas/layout/MgFilterPills";
import {
  closeMgPanels,
  useMgPanelCoordinator,
  useMgPanelPosition,
} from "@/modules/empresas/layout/useMgPanelPosition";

const cloneFieldsDraft = (fields = []) => fields.map((field) => ({ ...field }));

const sameFieldsDraft = (left = [], right = []) => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    const leftField = left[index];
    const rightField = right[index];
    if (!leftField || !rightField) return false;
    if (leftField.key !== rightField.key) return false;
    if (leftField.visible !== rightField.visible) return false;
    if (leftField.primary !== rightField.primary) return false;
    if (leftField.label !== rightField.label) return false;
  }
  return true;
};

function CardsFieldCheck({ checked, disabled, onChange }) {
  return (
    <span
      className={`mg-cards-config-menu__check${checked ? " is-checked" : ""}${disabled ? " is-locked" : ""}`}
    >
      <input
        type="checkbox"
        className="mg-cards-config-menu__checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {checked ? <Check className="mg-cards-config-menu__check-icon" strokeWidth={2.5} aria-hidden="true" /> : null}
    </span>
  );
}

function CardsLayoutRadio({ checked, onChange }) {
  return (
    <span className={`mg-cards-config-menu__check mg-cards-config-menu__check--radio${checked ? " is-checked" : ""}`}>
      <input
        type="radio"
        className="mg-cards-config-menu__checkbox-input"
        checked={checked}
        onChange={onChange}
      />
      {checked ? <span className="mg-cards-config-menu__radio-dot" aria-hidden="true" /> : null}
    </span>
  );
}

function CardsConfigMenuFooter({ onRestore }) {
  return (
    <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer">
      <button
        type="button"
        className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
        onClick={onRestore}
      >
        Restaurar
      </button>
    </div>
  );
}

export default function MgCardsPanelStrip({
  fields: fieldsProp = [],
  onSave,
  onRestoreDefaults,
  layout = EMP_CARDS_LAYOUT_DEFAULT,
  onSaveLayout,
  onRestoreLayoutDefaults,
  disabled = false,
  hideConfig = false,
  filterFields = [],
  empresas = [],
  filterValues = {},
  appliedFilterValues = {},
  onFilterChange,
  onFilterClear,
  onFilterApply,
  onConfigureFilters = null,
  filterPanelActive = false,
  hasActiveFilters = false,
  onRequestDistinctColumnValues = null,
  selectorOptionsContextFilters = undefined,
  columnFilters = {},
  serverSearchTerm = "",
  selectorOptionsMode = "cascade",
}) {
  const fields =
    Array.isArray(fieldsProp) && fieldsProp.length > 0 ? fieldsProp : EMP_SEARCH_DEFAULT_FIELDS;

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [fieldsDraft, setFieldsDraft] = useState(fields);
  const [layoutDraft, setLayoutDraft] = useState(layout?.cardsPerRow ?? EMP_CARDS_LAYOUT_DEFAULT.cardsPerRow);

  const layoutRootRef = useRef(null);
  const fieldsRootRef = useRef(null);
  const layoutPanelRef = useRef(null);
  const fieldsPanelRef = useRef(null);

  const fieldsPanelStyle = useMgPanelPosition(
    fieldsOpen,
    fieldsRootRef,
    fieldsPanelRef,
    {
      minWidth: 280,
      width: 280,
      estimatedHeight: 420,
      align: "right",
      scrollable: false,
    },
    `${fieldsOpen}|${fieldsDraft.length}|${fields.length}`
  );

  const layoutPanelStyle = useMgPanelPosition(
    layoutOpen,
    layoutRootRef,
    layoutPanelRef,
    {
      minWidth: 280,
      width: 280,
      estimatedHeight: 220,
      align: "right",
      scrollable: false,
    },
    `${layoutOpen}|${layoutDraft}`
  );

  const fieldsMenuStyle = useMemo(
    () => ({
      ...fieldsPanelStyle,
      height: "auto",
      maxHeight: "min(420px, calc(100vh - 96px))",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }),
    [fieldsPanelStyle]
  );

  const layoutMenuStyle = useMemo(
    () => ({
      ...layoutPanelStyle,
      height: "auto",
      maxHeight: "min(280px, calc(100vh - 96px))",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }),
    [layoutPanelStyle]
  );

  useMgPanelCoordinator(layoutRootRef, setLayoutOpen);
  useMgPanelCoordinator(fieldsRootRef, setFieldsOpen);

  useEffect(() => {
    const nextDraft = cloneFieldsDraft(fields);
    setFieldsDraft((current) => (sameFieldsDraft(current, nextDraft) ? current : nextDraft));
  }, [fields]);

  useEffect(() => {
    setLayoutDraft(layout?.cardsPerRow ?? EMP_CARDS_LAYOUT_DEFAULT.cardsPerRow);
  }, [layout?.cardsPerRow]);

  useEffect(() => {
    if (!fieldsOpen) return;
    const nextDraft = cloneFieldsDraft(fields);
    setFieldsDraft((current) => (sameFieldsDraft(current, nextDraft) ? current : nextDraft));
  }, [fieldsOpen, fields]);

  useEffect(() => {
    if (layoutOpen) setLayoutDraft(layout?.cardsPerRow ?? EMP_CARDS_LAYOUT_DEFAULT.cardsPerRow);
  }, [layoutOpen, layout?.cardsPerRow]);

  useEffect(() => {
    if (!fieldsOpen && !layoutOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFieldsOpen(false);
        setLayoutOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fieldsOpen, layoutOpen]);

  useEffect(() => {
    if (!fieldsOpen && !layoutOpen) return undefined;
    const close = (event) => {
      const inFields =
        fieldsRootRef.current?.contains(event.target) || fieldsPanelRef.current?.contains(event.target);
      const inLayout =
        layoutRootRef.current?.contains(event.target) || layoutPanelRef.current?.contains(event.target);
      if (!inFields) setFieldsOpen(false);
      if (!inLayout) setLayoutOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [fieldsOpen, layoutOpen]);

  const toggleLayout = () => {
    if (disabled) return;
    setLayoutOpen((current) => {
      const next = !current;
      if (next) {
        closeMgPanels(layoutRootRef.current);
        setFieldsOpen(false);
      }
      return next;
    });
  };

  const toggleFields = () => {
    if (disabled) return;
    setFieldsOpen((current) => {
      const next = !current;
      if (next) {
        closeMgPanels(fieldsRootRef.current);
        setLayoutOpen(false);
      }
      return next;
    });
  };

  const handleFieldsRestore = () => {
    const defaults = onRestoreDefaults?.() ?? getDefaultCardVisFields(fields);
    const next = defaults.map((field) => ({ ...field }));
    setFieldsDraft(next);
    onSave?.(next);
  };

  const handleLayoutRestore = () => {
    const defaults = onRestoreLayoutDefaults?.() ?? EMP_CARDS_LAYOUT_DEFAULT;
    setLayoutDraft(defaults.cardsPerRow);
    onSaveLayout?.({ cardsPerRow: defaults.cardsPerRow });
  };

  const handleLayoutDraftChange = (value) => {
    setLayoutDraft(value);
    onSaveLayout?.({ cardsPerRow: value });
  };

  const handleFieldVisibilityChange = (fieldKey, checked) => {
    setFieldsDraft((current) => {
      const next = current.map((item) =>
        item.key === fieldKey ? { ...item, visible: checked } : item
      );
      onSave?.(next);
      return next;
    });
  };

  const showConfig = !hideConfig;

  return (
    <div data-template-id="cards-panel" className="mg-cards-panel-strip hidden md:flex">
      <div className="mg-panel-strip__filters">
        <MgFilterPills
          filterFields={filterFields}
          values={filterValues}
          appliedValues={appliedFilterValues}
          empresas={empresas}
          onChange={onFilterChange}
          onClear={onFilterClear}
          onApply={onFilterApply}
          disabled={disabled}
          onConfigureFilters={onConfigureFilters}
          filterPanelActive={filterPanelActive}
          hasActiveFilters={hasActiveFilters}
          onRequestDistinctColumnValues={onRequestDistinctColumnValues}
          selectorOptionsContextFilters={selectorOptionsContextFilters}
          columnFilters={columnFilters}
          serverSearchTerm={serverSearchTerm}
          selectorOptionsMode={selectorOptionsMode}
        />
      </div>

      {showConfig ? (
        <div className="mg-cards-panel-strip__actions">
        <div
          className={`mg-cards-panel-strip__action${layoutOpen ? " is-config-open" : ""}`}
          ref={layoutRootRef}
        >
          <button
            type="button"
            className={`mg-nav-btn ios-btn mg-cards-panel-strip__config-btn${layoutOpen ? " is-open" : ""}`}
            onClick={toggleLayout}
            disabled={disabled}
            title="Configurar layout dos cards"
            aria-label="Configurar layout dos cards"
            aria-expanded={layoutOpen}
            aria-haspopup="dialog"
          >
            <Combine className="mg-cards-panel-strip__config-icon" strokeWidth={2.1} />
          </button>

          <MgPortalPanel
            open={layoutOpen}
            panelRef={layoutPanelRef}
            panelClassName="dropdown-menu mg-cards-config-menu mg-cards-layout-menu open"
            style={layoutMenuStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mg-cards-config-menu__list mg-cards-layout-menu__list">
              {EMP_CARDS_LAYOUT_OPTIONS.map((option) => (
                <label key={option.value} className="mg-cards-config-menu__item mg-cards-layout-menu__item">
                  <CardsLayoutRadio
                    checked={layoutDraft === option.value}
                    onChange={() => handleLayoutDraftChange(option.value)}
                  />
                  <span className="mg-cards-layout-menu__text">
                    <span className="mg-cards-config-menu__label">{option.label}</span>
                    <span className="mg-cards-layout-menu__hint">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <CardsConfigMenuFooter onRestore={handleLayoutRestore} />
          </MgPortalPanel>
        </div>

        <div
          className={`mg-cards-panel-strip__action${fieldsOpen ? " is-config-open" : ""}`}
          ref={fieldsRootRef}
        >
          <button
            type="button"
            className={`mg-nav-btn ios-btn mg-cards-panel-strip__config-btn${fieldsOpen ? " is-open" : ""}`}
            onClick={toggleFields}
            disabled={disabled}
            title="Configurar campos dos cards"
            aria-label="Configurar campos dos cards"
            aria-expanded={fieldsOpen}
            aria-haspopup="dialog"
          >
            <Columns3Cog className="mg-cards-panel-strip__config-icon" strokeWidth={2.1} />
          </button>

          <MgPortalPanel
            open={fieldsOpen}
            panelRef={fieldsPanelRef}
            panelClassName="dropdown-menu mg-cards-config-menu open"
            style={fieldsMenuStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mg-cards-config-menu__list">
              {fieldsDraft.map((field) => (
                <label
                  key={field.key}
                  className={`mg-cards-config-menu__item${field.primary ? " mg-cards-config-menu__item--locked" : ""}`}
                >
                  <CardsFieldCheck
                    checked={field.visible}
                    disabled={field.primary}
                    onChange={(event) => {
                      handleFieldVisibilityChange(field.key, event.target.checked);
                    }}
                  />
                  <span className="mg-cards-config-menu__label">{field.label}</span>
                </label>
              ))}
            </div>
            <CardsConfigMenuFooter onRestore={handleFieldsRestore} />
          </MgPortalPanel>
        </div>
        </div>
      ) : null}
    </div>
  );
}
