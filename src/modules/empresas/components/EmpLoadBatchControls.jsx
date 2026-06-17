import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronsDown, Loader2 } from "lucide-react";
import { EMP_LOAD_BATCH_OPTIONS } from "@/modules/empresas/hooks/useEmpresasInfiniteData";

function EmpLoadBatchSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div
      className={`emp-load-batch-size${open ? " open" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((current) => !current);
      }}
      role="presentation"
    >
      <div className="emp-load-batch-size__display">{value}</div>
      <ChevronDown className="emp-load-batch-size__chevron" aria-hidden="true" />
      <div
        className="emp-load-batch-size__panel"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div className="emp-load-batch-size__panel-inner">
          {EMP_LOAD_BATCH_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              className={`emp-load-batch-size__option${size === value ? " emp-load-batch-size__option--selected" : ""}`}
              onClick={() => {
                onChange(size);
                setOpen(false);
              }}
            >
              <span>{size}</span>
              {size === value ? <Check className="emp-load-batch-size__check" strokeWidth={2.5} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
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
        className="mg-records-load-btn"
        onClick={() => onLoadMore?.()}
        disabled={!canLoad}
        aria-label="Carregar mais registros"
        title="Carregar mais registros"
      >
        {isLoadingMoreRows ? (
          <Loader2 className="mg-records-load-btn__icon mg-records-load-btn__icon--spin" aria-hidden="true" />
        ) : (
          <ChevronsDown className="mg-records-load-btn__icon" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
