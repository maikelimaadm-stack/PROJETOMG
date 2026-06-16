import { useCallback, useState } from "react";

/**
 * Controla ordenação local com sincronização opcional no servidor.
 * Permite reutilizar o mesmo comportamento em tabelas de cadastro.
 */
export function useServerAwareSort({ initialSort, serverMode = false, onServerSortChange = null }) {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const applySort = useCallback(
    (key, direction) => {
      const next = { key, direction };
      setSortConfig(next);
      if (serverMode) {
        onServerSortChange?.(next);
      }
    },
    [serverMode, onServerSortChange]
  );

  const toggleSort = useCallback(
    (key) => {
      setSortConfig((previous) => {
        const next = {
          key,
          direction: previous.key === key && previous.direction === "asc" ? "desc" : "asc",
        };
        if (serverMode) {
          onServerSortChange?.(next);
        }
        return next;
      });
    },
    [serverMode, onServerSortChange]
  );

  return {
    sortConfig,
    setSortConfig,
    applySort,
    toggleSort,
  };
}
