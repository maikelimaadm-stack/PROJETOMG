import React, { memo, useMemo } from "react";
import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";
import { renderSearchHighlight } from "@/framework/mak/layout/mgSearchHighlight";

/**
 * Painel genérico de pesquisa/cards — Foundation (metadata-driven).
 */
function MakGenericSearchPanel({
  records = [],
  searchTerm = "",
  onEdit,
  cardFields = null,
  isLoading = false,
}) {
  const module = useMakModuleRequired();
  const searchMeta = module.metadata?.search ?? {};
  const fields =
    cardFields ??
    searchMeta.cardFields ??
    (module.metadata?.table?.columns ?? [])
      .filter((col) => col.default !== false)
      .slice(0, 4)
      .map((col) => ({ key: col.id, label: col.label, column: col.id }));

  const primaryKey = searchMeta.primaryField ?? fields[0]?.key ?? "nome";
  const titleKey = searchMeta.titleField ?? primaryKey;

  const filtered = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) =>
      fields.some((field) => {
        const value = String(record?.[field.column || field.key] ?? "").toLowerCase();
        return value.includes(term);
      })
    );
  }, [records, searchTerm, fields]);

  if (isLoading && filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
        Carregando...
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
        Nenhum registro encontrado.
      </div>
    );
  }

  return (
    <div className="mg-cards-grid flex min-h-0 flex-1 flex-col overflow-auto p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((record) => {
          const title = record?.[titleKey] ?? record?.nome ?? record?.id ?? "—";
          return (
            <button
              key={record.id}
              type="button"
              className="mg-card-item rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
              onDoubleClick={() => onEdit?.(record)}
              onClick={() => onEdit?.(record)}
            >
              <div className="text-sm font-semibold text-slate-900">
                {renderSearchHighlight(String(title), searchTerm)}
              </div>
              <div className="mt-2 space-y-1">
                {fields.slice(0, 3).map((field) => {
                  const raw = record?.[field.column || field.key];
                  if (raw == null || raw === "") return null;
                  return (
                    <div key={field.key} className="text-xs text-slate-600">
                      <span className="font-medium text-slate-500">{field.label}: </span>
                      {renderSearchHighlight(String(raw), searchTerm)}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MakGenericSearchPanel);
