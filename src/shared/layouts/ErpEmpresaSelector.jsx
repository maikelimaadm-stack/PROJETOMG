import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

const AUTHORIZED_SCOPE_OPTION = "__AUTHORIZED_SCOPE__";

export { AUTHORIZED_SCOPE_OPTION };

export default function ErpEmpresaSelector({
  value,
  allowAllEmpresas = false,
  empresas = [],
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const debouncedSearch = useDebouncedValue(normalizeSearchQuery(searchDraft));
  const [remoteItems, setRemoteItems] = useState([]);
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);

  const useRemoteSearch = empresas.length > 50 || debouncedSearch.length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !useRemoteSearch) return undefined;
    let cancelled = false;
    setLoading(true);
    void empRepository
      .listEmpresasSelector({ page: 1, pageSize: 30, search: debouncedSearch })
      .then((result) => {
        if (cancelled) return;
        setRemoteItems(result.items || []);
        setRemoteTotal(result.total || 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, useRemoteSearch, debouncedSearch]);

  const options = useMemo(() => {
    if (useRemoteSearch) return remoteItems;
    return empresas;
  }, [useRemoteSearch, remoteItems, empresas]);

  const selectedLabel = useMemo(() => {
    if (value === "all") return "Todas as empresas";
    if (value === AUTHORIZED_SCOPE_OPTION) return "Todas as empresas autorizadas";
    const found =
      empresas.find((item) => String(item.id) === String(value)) ||
      remoteItems.find((item) => String(item.id) === String(value));
    if (!found) return "Selecione a empresa";
    return `${found.codempresa} - ${found.nome_empresa}`;
  }, [value, empresas, remoteItems]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="erp-shell-company-select erp-select-closed flex h-8 min-w-[220px] max-w-[320px] items-center justify-between rounded-md border border-slate-300 bg-white px-2 text-left text-xs text-slate-700"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+4px)] z-[200] w-[min(320px,calc(100vw-24px))] rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Buscar empresa..."
                className="h-8 w-full rounded-md border border-slate-200 pl-7 pr-2 text-xs outline-none focus:border-sky-300"
              />
            </div>
          </div>
          <div className="erp-scroll-compact-y max-h-64 overflow-y-auto py-1" role="listbox">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
              onClick={() => {
                onChange?.(allowAllEmpresas ? "all" : AUTHORIZED_SCOPE_OPTION);
                setOpen(false);
              }}
            >
              {allowAllEmpresas ? "Todas as empresas" : "Todas as empresas autorizadas"}
            </button>
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando...
              </div>
            ) : null}
            {!loading && options.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400">Nenhuma empresa encontrada</div>
            ) : null}
            {options.map((empresa) => (
              <button
                key={String(empresa.id)}
                type="button"
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-slate-50${String(value) === String(empresa.id) ? " bg-sky-50 font-semibold text-sky-700" : ""}`}
                onClick={() => {
                  onChange?.(String(empresa.id));
                  setOpen(false);
                }}
              >
                {empresa.codempresa} - {empresa.nome_empresa}
              </button>
            ))}
            {useRemoteSearch && remoteTotal > options.length ? (
              <div className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">
                Mostrando {options.length} de {remoteTotal}. Refine a busca para encontrar outras.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
