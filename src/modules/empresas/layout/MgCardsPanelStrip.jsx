import React, { useEffect, useRef, useState } from "react";
import { GalleryThumbnails } from "lucide-react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import {
  closeMgPanels,
  useMgPanelCoordinator,
  useMgPanelPosition,
} from "@/modules/empresas/layout/useMgPanelPosition";

export default function MgCardsPanelStrip({ fields = [], onSave, disabled = false }) {
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
      estimatedHeight: 360,
      align: "right",
      scrollable: false,
    },
    `${open}|${draft.length}|${fields.length}`
  );

  useMgPanelCoordinator(rootRef, setOpen);

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
    if (disabled || fields.length === 0) return;
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

  return (
    <div data-template-id="cards-panel" className="mg-cards-panel-strip hidden md:flex">
      <div className="mg-cards-panel-strip__actions relative" ref={rootRef}>
        <button
          type="button"
          className="mg-nav-btn ios-btn tb-btn tb-btn-ghost tb-btn-icon mg-cards-panel-strip__config-btn"
          onClick={toggle}
          disabled={disabled || fields.length === 0}
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
          style={panelStyle}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mg-cards-config-menu__list">
            {draft.length === 0 ? (
              <p className="mg-cards-config-menu__empty">Nenhum campo disponível.</p>
            ) : (
              draft.map((field) => (
                <label
                  key={field.key}
                  className={`mg-cards-config-menu__item${field.primary ? " mg-cards-config-menu__item--locked" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mg-cards-config-menu__checkbox"
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
                  <span>{field.label}</span>
                </label>
              ))
            )}
          </div>
          <div className="mg-cards-config-menu__footer">
            <button type="button" className="mg-cards-config-menu__ok" onClick={handleOk}>
              OK
            </button>
          </div>
        </MgPortalPanel>
      </div>
    </div>
  );
}
