import React, { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronsDown, Loader2 } from "lucide-react";
import {
  MakPortalPanel,
  closeMgPanels,
  useMgPanelCoordinator,
  useMgPanelPosition,
} from "@/framework/mak/layout";

export const MAK_LOAD_BATCH_OPTIONS = Object.freeze([100, 200, 300, 400, 500, 1000]);

function MakLoadBatchSelect({ value, onChange, options = MAK_LOAD_BATCH_OPTIONS }) {
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
      estimatedHeight: options.length * 34 + 8,
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
        <ChevronDown className="mg-records-batch-trigger__chevron" strokeWidth={2.2} aria-hidden="true" />
      </button>
      <MakPortalPanel
        open={open}
        panelRef={panelRef}
        panelClassName="dropdown-menu mg-cards-config-menu open emp-load-batch-menu"
        style={panelStyle}
      >
        <div className="mg-cards-config-menu__list" role="listbox" aria-label="Quantidade por carregamento">
          {options.map((size) => (
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
      </MakPortalPanel>
    </>
  );
}

/** Controles de carregamento em lote — promovido do Cadastro de Empresas. */
export default function MakLoadBatchControls({
  loadBatchSize,
  onLoadBatchSizeChange,
  onLoadMore,
  hasMoreRows = false,
  isLoadingMoreRows = false,
  loadedRowsLimitReached = false,
  maxLoadedRows = null,
  loadBatchOptions = MAK_LOAD_BATCH_OPTIONS,
}) {
  const canLoad = hasMoreRows && !isLoadingMoreRows && typeof onLoadMore === "function";
  const limitTitle =
    loadedRowsLimitReached && maxLoadedRows
      ? `Limite de ${maxLoadedRows.toLocaleString("pt-BR")} registros carregados atingido. Refine os filtros para manter a tela rápida.`
      : "Carregar mais registros";

  return (
    <div className="mg-records-load-controls">
      <MakLoadBatchSelect
        value={loadBatchSize}
        onChange={onLoadBatchSizeChange}
        options={loadBatchOptions}
      />
      <button
        type="button"
        className="mg-nav-btn mg-records-load-btn"
        onClick={() => onLoadMore?.()}
        disabled={!canLoad}
        aria-label="Carregar mais registros"
        title={limitTitle}
      >
        {isLoadingMoreRows ? (
          <Loader2 className="mg-records-load-btn__icon mg-records-load-btn__icon--spin" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <ChevronsDown className="mg-records-load-btn__icon" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** @deprecated alias Empresas — use MakLoadBatchControls */
export const EmpLoadBatchControls = MakLoadBatchControls;
