import { useEffect, useMemo, useState } from "react";

/**
 * Carrega valores distintos de coluna via API (todos os registros no escopo),
 * respeitando filtros já aplicados nos demais campos.
 */
export function useDistinctFilterOptions({
  enabled = true,
  onRequest = null,
  column = "",
  filters,
  search = "",
  optionSearch = "",
  formatItems = null,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);
  const normalizedColumn = String(column || "").trim();
  const normalizedSearch = String(search || "").trim();
  const normalizedOptionSearch = String(optionSearch || "").trim();

  useEffect(() => {
    if (!enabled || !onRequest || !normalizedColumn) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    onRequest({
      column: normalizedColumn,
      filters: filters ?? {},
      search: normalizedSearch,
      optionSearch: normalizedOptionSearch,
    })
      .then((response) => {
        if (cancelled) return;
        const rawItems = Array.isArray(response?.items) ? response.items : [];
        setItems(typeof formatItems === "function" ? formatItems(rawItems) : rawItems);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    onRequest,
    normalizedColumn,
    filtersKey,
    normalizedSearch,
    normalizedOptionSearch,
    formatItems,
  ]);

  return { items, loading };
}
