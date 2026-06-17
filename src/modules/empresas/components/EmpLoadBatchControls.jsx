import React, { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronsDown, Loader2 } from "lucide-react";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import { closeMgPanels, useMgPanelCoordinator, useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import { EMP_LOAD_BATCH_OPTIONS } from "@/modules/empresas/hooks/useEmpresasInfiniteData";

function EmpLoadBatchSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useMgPanelCoordinator(triggerRef, setOpen);
  const panelStyle = useMgPanelPosition(
    open,
    triggerRef,
    panelRef,
    {
      minWidth: 104,
      width: 104,
      estimatedHeight: EMP_LOAD_BATCH_OPTIONS.length * 34 + 8,
      scrollable: false,
      align: "right",
    },
    value
  );

  useLayoutEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`mg-records-batch-trigger${open ? " is-open" : ""}`}
        aria-label="Quantidade de registros por carregamento"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={(event) => {
          event.stopPropagation();
          if (open) {
            setOpen(false);
            return;
          }
          closeMgPanels(triggerRef.current);
          setOpen(true);
        }}
      >
        <span className="mg-records-batch-trigger__value">{value}</span>
        <ChevronDown className="mg-records-batch-trigger__icon" strokeWidth={2.2} aria-hidden="true" />
      </button>
      <MgPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="dropdown-menu mg-cards-config-menu open emp-load-batch-menu"
        style={panelStyle}
      >
        <div className="mg-cards-config-menu__list" role="listbox" aria-label="Quantidade por carregamento">
          {EMP_LOAD_BATCH_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={size === value}
              className={`mg-cards-config-menu__item emp-load-batch-menu__item${size === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(size);
                setOpen(false);
              }}
            >
              <span className="mg-cards-config-menu__label">{size}</span>
              {size === value ? (
                <Check className="emp-load-batch-menu__check" strokeWidth={2.5} aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      </MgPortalPanel>
    </>
  );
}

export default function EmpLoadBatchControls({
  loadBatchSize,
  onLoadBatchSizeChange,
  onLoadMore,
  hasMoreRows = false,
  isLoadingMoreRows = false,
}) {
  const canLoad = hasMoreRows && !isLoadingMoreRows && typeof onLoadMore === "function";

  return (
    <div className="mg-records-load-controls">
      <EmpLoadBatchSelect value={loadBatchSize} onChange={onLoadBatchSizeChange} />
      <button
        type="button"
        className="emp-th-menu-button mg-records-load-btn"
        onClick={() => onLoadMore?.()}
        disabled={!canLoad}
        aria-label="Carregar mais registros"
        title="Carregar mais registros"
      >
        {isLoadingMoreRows ? (
          <Loader2 className="emp-th-menu-button__icon mg-records-load-btn__icon--spin" aria-hidden="true" />
        ) : (
          <ChevronsDown className="emp-th-menu-button__icon" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
