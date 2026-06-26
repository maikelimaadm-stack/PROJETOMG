import { useCallback, useEffect, useRef, useState } from "react";
import { useModeloBase1Config } from "@/ModeloBase1/config";
import { normalizeEmpListViewMode } from "@/framework/mak/layout/mgViewMode.js";

/**
 * Modo de visualização (tabela/cards/registro) — genérico por preferencesAdapter.
 */
export function useModeloBase1ViewModePreference(initialMode = "table") {
  const config = useModeloBase1Config();
  const adapter = config.preferencesAdapter;
  const searchView = config.searchView ?? {};
  const viewModeKey = searchView.viewModeKey ?? `${config.moduleId}_view_mode`;
  const updatedEvent = searchView.viewModeUpdatedEvent ?? `${config.moduleId}-view-mode-updated`;
  const bootstrapEvent = adapter?.bootstrapAppliedEvent;
  const isSectionDirty = adapter?.isSectionDirty ?? (() => false);

  const fallbackMode = normalizeEmpListViewMode(initialMode, { allowRecord: false });
  const readStored = () => {
    const stored = adapter?.readText?.(viewModeKey, null);
    return stored ? normalizeEmpListViewMode(stored, { allowRecord: false }) : null;
  };
  const writeStored = (mode) => {
    adapter?.writeText?.(viewModeKey, mode, { reason: "listagem:view-mode" });
  };

  const [viewMode, setViewModeState] = useState(() => readStored() || fallbackMode);
  const userViewModeLockedRef = useRef(false);

  useEffect(() => {
    const reloadFromStorage = () => {
      if (isSectionDirty("view")) return;
      if (userViewModeLockedRef.current) return;
      setViewModeState((current) => {
        const next = readStored() || fallbackMode;
        return current === next ? current : next;
      });
    };

    const unsubscribe = adapter?.subscribe?.((detail) => {
      const reason = String(detail?.reason ?? "").toLowerCase();
      if (reason.includes("view") || reason.includes("listagem")) reloadFromStorage();
    });

    const onDomOrBootstrap = () => reloadFromStorage();
    window.addEventListener(updatedEvent, onDomOrBootstrap);
    if (bootstrapEvent) window.addEventListener(bootstrapEvent, onDomOrBootstrap);

    return () => {
      unsubscribe?.();
      window.removeEventListener(updatedEvent, onDomOrBootstrap);
      if (bootstrapEvent) window.removeEventListener(bootstrapEvent, onDomOrBootstrap);
    };
  }, [adapter, fallbackMode, updatedEvent, bootstrapEvent, viewModeKey]);

  const setViewMode = useCallback(
    (mode) => {
      const normalized = normalizeEmpListViewMode(mode, { allowRecord: true });
      userViewModeLockedRef.current = true;
      setViewModeState(normalized);
      writeStored(normalized);
    },
    [viewModeKey]
  );

  return { viewMode, setViewMode };
}

export default useModeloBase1ViewModePreference;
