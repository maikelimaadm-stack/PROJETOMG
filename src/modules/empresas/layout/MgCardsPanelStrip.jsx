import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, GalleryThumbnails } from "lucide-react";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  getDefaultCardVisFields,
} from "@/modules/empresas/components/empSearchView.constants";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import {
  closeMgPanels,
  useMgPanelCoordinator,
  useMgPanelPosition,
} from "@/modules/empresas/layout/useMgPanelPosition";

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

export default function MgCardsPanelStrip({
  fields: fieldsProp = [],
  onSave,
  onRestoreDefaults,
  disabled = false,
}) {
  const fields =
    Array.isArray(fieldsProp) && fieldsProp.length > 0 ? fieldsProp : EMP_SEARCH_DEFAULT_FIELDS;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(fields);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const panelStyle = useMgPanelPosition(
    open,
    rootRef,
    panelRef,
    {
      minWidth: 280,
      width: 280,
      estimatedHeight: 420,
      align: "right",
      scrollable: false,
    },
    `${open}|${draft.length}|${fields.length}`
  );

  const menuStyle = useMemo(
    () => ({
      ...panelStyle,
      height: "auto",
      maxHeight: "min(420px, calc(100vh - 96px))",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }),
    [panelStyle]
  );

  useMgPanelCoordinator(rootRef, setOpen);

  useEffect(() => {
    setDraft(fields.map((field) => ({ ...field })));
  }, [fields]);

  useEffect(() => {
    if (open) setDraft(fields.map((field) => ({ ...field })));
  }, [open, fields]);

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

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => {
      const next = !current;
      if (next) closeMgPanels(rootRef.current);
      return next;
    });
  };

  const handleOk = () => {
    onSave?.(draft);
    setOpen(false);
  };

  const handleRestore = () => {
    const defaults = onRestoreDefaults?.() ?? getDefaultCardVisFields(fields);
    setDraft(defaults.map((field) => ({ ...field })));
  };

  return (
    <div data-template-id="cards-panel" className="mg-cards-panel-strip hidden md:flex">
      <div className="mg-cards-panel-strip__actions relative" ref={rootRef}>
        <button
          type="button"
          className="mg-nav-btn ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-cards-panel-strip__config-btn"
          onClick={toggle}
          disabled={disabled}
          title="Configurar campos dos cards"
          aria-label="Configurar campos dos cards"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <GalleryThumbnails className="h-3 w-3" />
        </button>

        <MgPortalPanel
          open={open}
          panelRef={panelRef}
          panelClassName="dropdown-menu mg-cards-config-menu open"
          style={menuStyle}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mg-cards-config-menu__list">
            {draft.map((field) => (
              <label
                key={field.key}
                className={`mg-cards-config-menu__item${field.primary ? " mg-cards-config-menu__item--locked" : ""}`}
              >
                <CardsFieldCheck
                  checked={field.visible}
                  disabled={field.primary}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setDraft((current) =>
                      current.map((item) =>
                        item.key === field.key ? { ...item, visible: checked } : item
                      )
                    );
                  }}
                />
                <span className="mg-cards-config-menu__label">{field.label}</span>
              </label>
            ))}
          </div>
          <div className="mg-cards-config-menu__footer">
            <button type="button" className="mg-cards-config-menu__reset" onClick={handleRestore}>
              Restaurar padrão
            </button>
            <button type="button" className="mg-cards-config-menu__ok" onClick={handleOk}>
              OK
            </button>
          </div>
        </MgPortalPanel>
      </div>
    </div>
  );
}
