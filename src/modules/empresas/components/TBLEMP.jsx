import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  EyeOff,
  Filter,
  Loader2,
  MoreVertical,
  PanelLeft,
  ScanLine,
  Search,
  X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import EmpConfiguracaoColunasDialog from "@/framework/cadastro/configurators/EmpConfiguracaoColunasDialog";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";
import { useErpTableFullscreen } from "@/shared/layouts/ErpTableFullscreenContext";
import ErpScrollNav from "@/shared/components/ErpScrollNav";
import EmpVirtualTableBody from "@/shared/components/EmpVirtualTableBody";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { readStoredListPageSize } from "@/shared/listing/listQueryConfig";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { EMP_TABLE_HEADER_HEIGHT, EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";
import { scrollVirtualRowIntoView } from "@/shared/utils/virtualScrollIntoView";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import {
  loadColumnOrder,
  markVisibleColumnsInitialized,
} from "@/framework/cadastro/tables/empColumnLayout";
import { loadSavedVisibleColumns, mergeEffectiveColumnLayout } from "@/modules/empresas/utils/empTableColumnCatalog";
import {
  AGGR_KEY,
  AUTO_FIT_MEASURE_LIMIT,
  COLUNAS_BASE,
  FILTER_POPOVER_WIDTH,
  FROZEN_KEY,
  MAX_AUTO_FIT_WIDTH,
  MIN_COL_WIDTH,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  ROW_DBLCLICK_OPEN_MS,
  ROW_DBLCLICK_PAIR_MS,
  SIZING_MODE_KEY,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
  formatHeaderLabel,
  getMinWidth,
} from "./tblEmp.constants";
import {
  readStoredFilterOperators,
  writeStoredFilterOperators,
  writeStoredTempListagemFilters,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import {
  createDefaultColumnFilter,
  evaluateColumnFilter,
  filterNeedsClientSideProcessing,
  getColumnFilterType,
  hasClientOnlyColumnFilters,
  normalizeLegacyColumnFilter,
  parseDateFilterValue,
} from "./tblEmp.filters";
import {
  ErpFilterPopover,
  isErpFilterActive,
  resolveErpFilterEnumOptions,
  resolveErpFilterMeta,
} from "@/shared/filters";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgConfigBackdrop from "@/modules/empresas/layout/MgConfigBackdrop";
import { isNestedMgFloatingPanelTarget } from "@/modules/empresas/layout/mgFloatingPanelUtils";
import { useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";
import EmpLoadBatchControls from "@/modules/empresas/components/EmpLoadBatchControls";
import { buildEmpresaColumnFilters, mergeEmpresaListFilters } from "@/shared/listing/buildEmpresaListFilters";
import {
  emitEmpPreferencesCacheUpdate,
  readEmpPreferencesJson,
  readEmpPreferencesText,
  removeEmpPreferencesKey,
  subscribeEmpPreferencesCache,
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import { stableJsonEqual, stableStringify } from "@/shared/utils/stableStringify";
import {
  buildColumnSizingModeFromAutoFit,
  mergeColumnSizingMode,
  mergeExpandedCatalogIntoTableState,
  readEmpTablePreferencesSnapshot,
} from "@/modules/empresas/preferences/empTablePreferencesHydration";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { markEmpPreferencesPerf } from "@/modules/empresas/preferences/empresasPreferencesPerfMarks";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";

const SELECT_COLUMN_WIDTH = 36;
const FILTER_OPTIONS_PAGE_SIZE = 100;
const FILTER_OPTIONS_REQUEST_TIMEOUT_MS = 45_000;
const FILTER_OPTIONS_MODE_GLOBAL = "global";
const FILTER_OPTIONS_MODE_CASCADE = "cascade";
const REMOTE_DISTINCT_FILTER_TYPES = new Set(["text", "enum", "number", "money", "date"]);

function haveSameIds(listA = [], listB = []) {
  if (listA === listB) return true;
  if (listA.length !== listB.length) return false;
  return listA.every((item, index) => {
    const leftId = typeof item === "string" ? item : item?.id;
    const rightId = typeof listB[index] === "string" ? listB[index] : listB[index]?.id;
    return leftId === rightId;
  });
}

function haveSameRecordIds(listA = [], listB = []) {
  if (listA === listB) return true;
  if (listA.length !== listB.length) return false;
  return listA.every((item, index) => item?.id === listB[index]?.id);
}

function FilterFieldCheck({ checked, onChange, disabled = false }) {
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

function TableSelectCheck({ checked, indeterminate = false, onChange, ariaLabel, disabled = false }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate) && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <span
      className={`mg-cards-config-menu__check emp-table-select-check${checked ? " is-checked" : ""}${indeterminate && !checked ? " is-indeterminate" : ""}${disabled ? " is-locked" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className="mg-cards-config-menu__checkbox-input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => {
          event.stopPropagation();
          onChange?.(event);
        }}
        onClick={(event) => event.stopPropagation()}
      />
      {checked ? <Check className="mg-cards-config-menu__check-icon" strokeWidth={2.5} aria-hidden="true" /> : null}
      {indeterminate && !checked ? (
        <span className="mg-cards-config-menu__check-dash" aria-hidden="true" />
      ) : null}
    </span>
  );
}

const readStorageJSON = (key, fallback) => {
  const parsed = readEmpPreferencesJson(key, fallback);
  return parsed ?? fallback;
};

const normalizeExternalColumnFilters = (filters) =>
  filters && typeof filters === "object" ? filters : {};

const normalizeFilterOptionsMode = (mode) =>
  String(mode || FILTER_OPTIONS_MODE_GLOBAL).toLowerCase() === FILTER_OPTIONS_MODE_CASCADE
    ? FILTER_OPTIONS_MODE_CASCADE
    : FILTER_OPTIONS_MODE_GLOBAL;

const mergeFilterOptionsWithSelected = (options = [], selected = []) => {
  const merged = [];
  const seen = new Set();
  [...options, ...selected].forEach((value) => {
    const normalized = String(value ?? "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    merged.push(normalized);
  });
  return merged;
};

const normalizeOptionValues = (values = []) =>
  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

export default function TBLEMP({
  empresas = [],
  isLoadingEmpresas = false,
  isFetchingEmpresas = false,
  onEdit,
  showConfigColunas,
  setShowConfigColunas,
  searchTerm = "",
  selectedRecordId,
  selectedIds,
  onSelectionChange,
  onVisibleDataChange,
  onFilteredEmpresasChange,
  serverPage = 1,
  serverPageSize = 50,
  serverTotal = null,
  serverSearchTerm = "",
  serverBaseFilters = undefined,
  selectorOptionsMode = FILTER_OPTIONS_MODE_GLOBAL,
  selectorOptionsContextFilters = undefined,
  onServerPageChange = null,
  onServerPageSizeChange = null,
  onServerColumnFiltersChange = null,
  externalColumnFilters = undefined,
  onServerSortChange = null,
  onRequestDistinctColumnValues = null,
  infiniteMode = false,
  hasMoreRows = false,
  isLoadingMoreRows = false,
  loadedRowsLimitReached = false,
  maxLoadedRows = null,
  onLoadMoreRows = null,
  loadBatchSize = 100,
  onLoadBatchSizeChange = null,
  selectedCount,
  listedCount,
  filteredCount,
  totalCount,
  moduleTitle = "Cadastro",
  mgPrototype = false,
  onColumnsInUseChange,
  preferencesReady = true,
  bootstrapGeneration = 0,
}) {
  const suppressPersistenceRef = useRef(false);
  const tableHydratedRef = useRef(true);
  const catalogSignatureRef = useRef("");
  const [preferencesVersion, setPreferencesVersion] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const initialTableSnapshot = useMemo(() => {
    markEmpPreferencesPerf("PREF_LOCAL_SNAPSHOT_READ", {
      section: "table",
      source: "local",
    });
    const snapshot = readEmpTablePreferencesSnapshot(COLUNAS_BASE);
    markEmpPreferencesPerf("PREF_TABLE_INITIAL_STATE", {
      section: "table",
      source: "local",
      changed: true,
    });
    return snapshot;
  }, []);
  const defaultSortConfig = initialTableSnapshot.sortConfig?.length
    ? initialTableSnapshot.sortConfig
    : [{ key: "codempresa", direction: "asc" }];
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);
  const [filtrosColunas, setFiltrosColunas] = useState(() => initialTableSnapshot.filtrosColunas || {});
  const lastExternalFiltersSigRef = useRef(null);
  const lastServerFiltersSigRef = useRef(null);
  const lastServerSortSigRef = useRef(null);
  useEffect(() => {
    if (externalColumnFilters === undefined) return;
    const normalized = normalizeExternalColumnFilters(externalColumnFilters);
    const nextSig = stableStringify(normalized || {});
    if (lastExternalFiltersSigRef.current === nextSig) return;
    lastExternalFiltersSigRef.current = nextSig;
    lastServerFiltersSigRef.current = nextSig;
    setFiltrosColunas((prev) => {
      const prevJson = stableStringify(prev || {});
      if (prevJson === nextSig) return prev;
      return normalized;
    });
  }, [externalColumnFilters]);
  const isMobile = useIsMobile();

  const [columnWidths, setColumnWidths] = useState(() => initialTableSnapshot.columnWidths);
  const [frozenColumnCount, setFrozenColumnCount] = useState(() =>
    Math.min(
      initialTableSnapshot.frozenColumnCount,
      initialTableSnapshot.colunasVisiveis.length
    )
  );
  const [colunasOrdem, setColunasOrdem] = useState(() => initialTableSnapshot.colunasOrdem);
  const [colunasVisiveis, setColunasVisiveis] = useState(() => initialTableSnapshot.colunasVisiveis);
  const colunasOrdemRef = useRef(colunasOrdem);
  const colunasVisiveisRef = useRef(colunasVisiveis);
  const columnWidthsRef = useRef(columnWidths);
  useEffect(() => {
    colunasOrdemRef.current = colunasOrdem;
  }, [colunasOrdem]);
  useEffect(() => {
    colunasVisiveisRef.current = colunasVisiveis;
  }, [colunasVisiveis]);
  useEffect(() => {
    columnWidthsRef.current = columnWidths;
  }, [columnWidths]);
  const [layoutAggregationConfig, setLayoutAggregationConfig] = useState(
    () => initialTableSnapshot.layoutAggregationConfig || {}
  );
  const [autoFitActiveColumns, setAutoFitActiveColumns] = useState(
    () => initialTableSnapshot.autoFitActiveColumns || {}
  );
  const columnSizingModeRef = useRef(initialTableSnapshot.columnSizingMode || {});

  const lastRowClickRef = useRef({ id: null, time: 0, wasSelectedBefore: false });
  const rowClickSuppressRef = useRef({ id: null, until: 0 });
  const selectedItemsRef = useRef(selectedItems);
  const lastSelectedIdRef = useRef(null);
  const tableStageRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const headerScrollRef = useRef(null);
  const footerScrollRef = useRef(null);
  const tableRef = useRef(null);
  const [isTableFullscreen, setIsTableFullscreen] = useState(false);
  const dragRef = useRef(null);
  const columnMenuTriggerRefs = useRef({});
  const columnMenuPanelRef = useRef(null);
  const filterPanelRef = useRef(null);
  const overlayAnchorRef = useRef(null);
  const measureCanvasRef = useRef(null);
  const [scrollbarCompensation, setScrollbarCompensation] = useState(0);
  const scrollbarCompensationRef = useRef(0);
  const columnsInUseSignatureRef = useRef("");
  const filteredEmpresasSignatureRef = useRef("");
  const serverResetSignatureRef = useRef("");
  const filterOptionsCacheRef = useRef(new Map());
  const filterOptionsRequestIdRef = useRef(0);
  const filterOptionsInFlightCountRef = useRef(0);
  const activeFilterColumnRef = useRef(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const debouncedBuscaFiltroMenu = useDebouncedValue(buscaFiltroMenu, 180);
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, draft: null });
  const [filterOptionsRemoteState, setFilterOptionsRemoteState] = useState({
    columnId: null,
    cacheKey: "",
    items: [],
    nextCursor: null,
    loadingInitial: false,
    loadingMore: false,
  });
  const [resizeColumnId, setResizeColumnId] = useState(null);
  const serverMode = typeof onServerPageChange === "function";

  const [currentPage, setCurrentPage] = useState(serverPage || 1);
  const [pageSize, setPageSize] = useState(() => {
    if (serverPageSize) return serverPageSize;
    return readStoredListPageSize(PAGE_SIZE_KEY, 50);
  });

  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  const colunasDisponiveis = useMemo(() => {
    const dinamicas = camposPersonalizados.map(campoEngine.normalize).filter((c) => c.ativo !== false && c.visivel_tabela === true).map((c) => ({
      ...c,
      id: `custom:${c.field_name}`,
      label: c.label,
      default: true,
      sortable: c.ordenavel !== false,
      filtravel: c.filtravel !== false,
      align: c.tipo === "date" ? "center" : (c.tipo === "number" || c.tipo === "calculado") ? "right" : "left",
      width: c.largura_coluna || 160,
      ordem_tabela: c.ordem_tabela ?? c.ordem ?? 999,
      customField: c.field_name
    }));
    const aggByCol = { ...layoutAggregationConfig };
    return [...COLUNAS_BASE, ...dinamicas.sort((a, b) => (a.ordem_tabela || 999) - (b.ordem_tabela || 999))].map((col) => {
      const cfg = aggByCol[col.id];
      if (cfg?.enabled) {
        return {
          ...col,
          agregacao_tipo: cfg.type,
          agregacao: cfg.type,
          usar_decimal: col.usar_decimal ?? true,
          decimal_places: col.decimal_places ?? 2
        };
      }
      return { ...col, agregacao_tipo: "", agregacao: "" };
    });
  }, [camposPersonalizados, layoutAggregationConfig]);
  const colunasDisponiveisById = useMemo(
    () => new Map(colunasDisponiveis.map((column) => [column.id, column])),
    [colunasDisponiveis]
  );
  const colunasCatalogSignature = useMemo(
    () => colunasDisponiveis.map((column) => column.id).join("|"),
    [colunasDisponiveis]
  );
  const colunasDisponiveisRef = useRef(colunasDisponiveis);
  colunasDisponiveisRef.current = colunasDisponiveis;

  const applyTablePreferencesFromCache = useCallback(
    (columns) => {
      if (!columns?.length) return;
      suppressPersistenceRef.current = true;
      const snapshot = readEmpTablePreferencesSnapshot(columns);
      columnSizingModeRef.current = snapshot.columnSizingMode;
      setColunasOrdem((current) =>
        haveSameIds(current, snapshot.colunasOrdem) ? current : snapshot.colunasOrdem
      );
      setColunasVisiveis((current) =>
        haveSameIds(current, snapshot.colunasVisiveis) ? current : snapshot.colunasVisiveis
      );
      setColumnWidths((current) => {
        return stableJsonEqual(snapshot.columnWidths || {}, current || {})
          ? current
          : snapshot.columnWidths;
      });
      setFrozenColumnCount((current) => {
        const next = Math.min(snapshot.frozenColumnCount, snapshot.colunasVisiveis.length);
        return current === next ? current : next;
      });
      setSortConfig((current) => {
        return stableJsonEqual(snapshot.sortConfig || [], current || [])
          ? current
          : snapshot.sortConfig;
      });
      if (externalColumnFilters === undefined) {
        setFiltrosColunas((current) => {
          return stableJsonEqual(snapshot.filtrosColunas || {}, current || {})
            ? current
            : snapshot.filtrosColunas;
        });
        lastServerFiltersSigRef.current = stableStringify(snapshot.filtrosColunas || {});
      }
      const primarySort = snapshot.sortConfig?.[0] || { key: "codempresa", direction: "asc" };
      lastServerSortSigRef.current = stableStringify({
        key: primarySort.key || "codempresa",
        direction: primarySort.direction === "desc" ? "desc" : "asc",
      });
      setLayoutAggregationConfig((current) => {
        return stableJsonEqual(snapshot.layoutAggregationConfig || {}, current || {})
          ? current
          : snapshot.layoutAggregationConfig;
      });
      setAutoFitActiveColumns((current) => {
        return stableJsonEqual(snapshot.autoFitActiveColumns || {}, current || {})
          ? current
          : snapshot.autoFitActiveColumns;
      });
      tableHydratedRef.current = true;
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          suppressPersistenceRef.current = false;
        }, 0);
      } else {
        suppressPersistenceRef.current = false;
      }
    },
    [externalColumnFilters]
  );

  useLayoutEffect(() => {
    if (!preferencesReady || !colunasCatalogSignature) return;

    const previousSignature = catalogSignatureRef.current;
    const catalogExpanded =
      previousSignature &&
      previousSignature !== colunasCatalogSignature &&
      colunasCatalogSignature.startsWith(previousSignature);

    catalogSignatureRef.current = colunasCatalogSignature;

    if (catalogExpanded && !isEmpPreferencesSectionDirty("table")) {
      const merged = mergeExpandedCatalogIntoTableState(
        {
          colunasOrdem: colunasOrdemRef.current,
          colunasVisiveis: colunasVisiveisRef.current,
          columnWidths: columnWidthsRef.current,
        },
        colunasDisponiveisRef.current,
        previousSignature
      );
      if (merged) {
        setColunasOrdem((current) =>
          haveSameIds(current, merged.colunasOrdem) ? current : merged.colunasOrdem
        );
        setColunasVisiveis((current) =>
          haveSameIds(current, merged.colunasVisiveis) ? current : merged.colunasVisiveis
        );
        setColumnWidths((current) =>
          stableJsonEqual(current || {}, merged.columnWidths || {}) ? current : merged.columnWidths
        );
      }
      return;
    }

    if (isEmpPreferencesSectionDirty("table")) {
      markEmpPreferencesPerf("PREF_REMOTE_APPLY_SKIPPED", {
        section: "table",
        source: "remote",
        dirty: true,
      });
      return;
    }

    markEmpPreferencesPerf("PREF_REMOTE_APPLY_ATTEMPT", {
      section: "table",
      source: "remote",
    });
    suppressPersistenceRef.current = true;
    applyTablePreferencesFromCache(colunasDisponiveisRef.current);
    markEmpPreferencesPerf("PREF_REMOTE_APPLY_EFFECTIVE", {
      section: "table",
      source: "remote",
      changed: true,
    });
  }, [
    preferencesReady,
    colunasCatalogSignature,
    preferencesVersion,
    bootstrapGeneration,
    applyTablePreferencesFromCache,
  ]);

  useLayoutEffect(() => {
    if (!preferencesReady) return undefined;
    const bumpVersion = () => setPreferencesVersion((current) => current + 1);
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, bumpVersion);
    const unsubscribeCache = subscribeEmpPreferencesCache((detail) => {
      const reason = detail?.reason;
      const normalized = String(reason || "").toLowerCase();
      if (
        !normalized.includes("storage") &&
        !normalized.includes("bootstrap") &&
        !normalized.includes("listagem:hydrate") &&
        !normalized.includes("remote-tab") &&
        !normalized.includes("remote-sync")
      ) {
        return;
      }
      if (
        (normalized.includes("listagem:hydrate") || normalized.includes("remote-sync")) &&
        isEmpPreferencesSectionDirty("table")
      ) {
        return;
      }
      bumpVersion();
    });
    return () => {
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, bumpVersion);
      unsubscribeCache();
    };
  }, [preferencesReady]);

  const persistSizingMode = useCallback((nextAutoFitMap) => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current || !preferencesReady) return;
    const nextMode = buildColumnSizingModeFromAutoFit(nextAutoFitMap);
    columnSizingModeRef.current = nextMode;
    writeEmpPreferencesJson(SIZING_MODE_KEY, nextMode, { reason: "listagem:table-sizing-mode" });
  }, [preferencesReady]);

  const colunasOrdenadas = useMemo(
    () =>
      colunasOrdem
        .map((id) => colunasDisponiveis.find((c) => c.id === id))
        .filter((c) => c && colunasVisiveis.includes(c.id)),
    [colunasOrdem, colunasVisiveis, colunasDisponiveis]
  );

  useEffect(() => {
    if (!onColumnsInUseChange) return;
    const signature = colunasOrdenadas.map((column) => column.id).join("|");
    if (columnsInUseSignatureRef.current === signature) return;
    columnsInUseSignatureRef.current = signature;
    onColumnsInUseChange(colunasOrdenadas);
  }, [colunasOrdenadas, onColumnsInUseChange]);

  const closeColumnOverlays = useCallback(() => {
    filterOptionsRequestIdRef.current += 1;
    setColumnMenuAnchor(null);
    setMenuFiltroAberto(null);
    overlayAnchorRef.current = null;
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId: null, draft: null });
    setFilterOptionsRemoteState({
      columnId: null,
      cacheKey: "",
      items: [],
      nextCursor: null,
      loadingInitial: false,
      loadingMore: false,
    });
  }, []);

  useEffect(() => {
    activeFilterColumnRef.current = menuFiltroAberto;
  }, [menuFiltroAberto]);

  const toggleColumnMenu = useCallback((columnId) => {
    setMenuFiltroAberto(null);
    setColumnMenuAnchor((prev) => {
      if (prev?.columnId === columnId) {
        overlayAnchorRef.current = null;
        return null;
      }
      overlayAnchorRef.current = columnMenuTriggerRefs.current[columnId] || null;
      return { columnId };
    });
  }, []);

  const openFilterMenu = useCallback((columnId) => {
    const col = colunasDisponiveis.find((column) => column.id === columnId);
    if (!col) return;
    const trigger = columnMenuTriggerRefs.current[columnId];
    if (!trigger) return;
    const filterType = getColumnFilterType(col);
    const currentValues = filtrosColunas[columnId];
    const nextDraft = Array.isArray(currentValues)
      ? normalizeLegacyColumnFilter(currentValues, filterType)
      : {
          ...createDefaultColumnFilter(filterType),
          ...(currentValues || {}),
          type: filterType,
        };
    overlayAnchorRef.current = trigger;
    setColumnMenuAnchor(null);
    setMenuFiltroAberto(columnId);
    setBuscaFiltroMenu("");
    setFiltroTemp({
      colunaId: columnId,
      draft: nextDraft,
    });
  }, [colunasDisponiveis, filtrosColunas]);

  useEffect(() => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current || !preferencesReady) return;
    writeEmpPreferencesJson(WIDTHS_KEY, columnWidths, {
      reason: "listagem:table-widths",
      emit: false,
    });
  }, [columnWidths, preferencesReady]);
  useEffect(() => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current || !preferencesReady) return;
    writeEmpPreferencesText(FROZEN_KEY, String(frozenColumnCount), {
      reason: "listagem:table-frozen",
    });
  }, [frozenColumnCount, preferencesReady]);
  useEffect(() => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current || !preferencesReady) return;
    writeStoredTempListagemFilters(filtrosColunas);
  }, [filtrosColunas, preferencesReady]);
  useEffect(() => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current || !preferencesReady) return;
    writeEmpPreferencesJson(SORT_KEY, sortConfig, { reason: "listagem:table-sort" });
  }, [sortConfig, preferencesReady]);
  useEffect(() => {
    setLayoutAggregationConfig(readEmpPreferencesJson(AGGR_KEY, {}));
    const refresh = () => {
      setLayoutAggregationConfig(readEmpPreferencesJson(AGGR_KEY, {}));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("emp-layout-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("emp-layout-updated", refresh);
    };
  }, []);

  useEffect(() => { const onMove = (e) => { if (!dragRef.current) return; if (e.cancelable) e.preventDefault(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const { columnId, startX, startWidth, minWidth } = dragRef.current; setColumnWidths((p) => ({ ...p, [columnId]: Math.round(Math.max(minWidth || MIN_COL_WIDTH, startWidth + (cx - startX))) })); }; const onUp = () => { if (!dragRef.current) return; dragRef.current = null; setResizeColumnId(null); document.body.style.cursor = ""; document.body.style.userSelect = ""; emitEmpPreferencesCacheUpdate([WIDTHS_KEY], "listagem:table-widths"); }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onUp); return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); }; }, []);

  const startDragResize = (e, col) => {
    if (e.detail >= 2) return;
    e.preventDefault();
    e.stopPropagation();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    dragRef.current = {
      columnId: col.id,
      startX: cx,
      startWidth: columnWidths[col.id] || col.width || 160,
      minWidth: getMinWidth(col),
    };
    setAutoFitActiveColumns((prev) => {
      const next = { ...prev, [col.id]: false };
      columnSizingModeRef.current = mergeColumnSizingMode(columnSizingModeRef.current, col.id, "manual");
      persistSizingMode(next);
      return next;
    });
    setResizeColumnId(col.id);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => { selectedItemsRef.current = selectedItems; }, [selectedItems]);
  useEffect(() => { setSelectedItems((p) => { const valid = p.filter((id) => empresas.some((e) => e.id === id)); return p.length === valid.length && p.every((id, i) => id === valid[i]) ? p : valid; }); }, [empresas]);
  useEffect(() => {
    if (selectedIds === undefined) return;
    setSelectedItems((prev) => {
      const next = Array.isArray(selectedIds) ? selectedIds : [];
      if (prev.length === next.length && prev.every((id, index) => id === next[index])) return prev;
      return next;
    });
  }, [selectedIds]);
  useEffect(() => { onSelectionChange?.(selectedItems); }, [selectedItems, onSelectionChange]);
  useEffect(() => { if (!selectedRecordId || selectedIds !== undefined) return; setSelectedItems((p) => p.length === 1 && p[0] === selectedRecordId ? p : [selectedRecordId]); lastSelectedIdRef.current = selectedRecordId; }, [selectedRecordId, selectedIds]);

  useEffect(() => {
    removeEmpPreferencesKey("emp_col_pinned_right", { reason: "legacy:cleanup" });
    removeEmpPreferencesKey("emp_group_by_columns_v1", { reason: "legacy:cleanup" });
  }, []);

  const handleColumnLayoutChange = ({ visiveis, ordem, frozenColumnCount: nextFrozenCount = 0 }) => {
    markEmpPreferencesPerf("PREF_USER_ACTION", {
      section: "table",
      source: "user_action",
    });
    const normalizedFrozenCount = Math.max(
      0,
      Math.min(Number(nextFrozenCount) || 0, Array.isArray(visiveis) ? visiveis.length : 0)
    );
    setColunasVisiveis(visiveis);
    setColunasOrdem(ordem);
    setFrozenColumnCount(normalizedFrozenCount);
    markEmpPreferencesPerf("PREF_UI_STATE_CHANGED", {
      section: "table",
      source: "user_action",
      changed: true,
    });
    markVisibleColumnsInitialized();
    writeEmpPreferencesJson(VISIBLE_KEY, visiveis, { reason: "listagem:table-visible" });
    writeEmpPreferencesJson(ORDER_KEY, ordem, { reason: "listagem:table-order" });
    writeEmpPreferencesText(FROZEN_KEY, String(normalizedFrozenCount), {
      reason: "listagem:table-frozen",
    });
    markEmpPreferencesPerf("PREF_LOCAL_WRITE", {
      section: "table",
      source: "user_action",
      dirty: true,
    });
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  };
  const getRestoreColumnLayout = () => {
    const def = colunasDisponiveis.filter((c) => !c.fixo);
    return {
      visiveis: def.filter((c) => c.default).map((c) => c.id),
      ordem: def.map((c) => c.id),
      frozenColumnCount: 0,
    };
  };

  const colunasTodasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && !c.fixo), [colunasOrdem, colunasDisponiveis]);
  useEffect(() => {
    setFrozenColumnCount((current) => Math.max(0, Math.min(current, colunasOrdenadas.length)));
  }, [colunasOrdenadas.length]);

  const columnPixelWidths = useMemo(
    () =>
      Object.fromEntries(
        colunasOrdenadas.map((c) => {
          const minW = getMinWidth(c);
          const rawWidth = Math.max(columnWidths[c.id] || c.width || 160, minW);
          return [c.id, Math.round(rawWidth)];
        })
      ),
    [colunasOrdenadas, columnWidths]
  );
  const totalTableWidth = useMemo(
    () =>
      Math.max(
        isMobile ? 720 : 900,
        SELECT_COLUMN_WIDTH + colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0)
      ),
    [colunasOrdenadas, columnPixelWidths, isMobile]
  );
  const frozenOffsets = useMemo(() => {
    let left = SELECT_COLUMN_WIDTH;
    return colunasOrdenadas.reduce((acc, c, i) => {
      if (i < frozenColumnCount) {
        acc[c.id] = left;
        left += columnPixelWidths[c.id] || 160;
      }
      return acc;
    }, {});
  }, [colunasOrdenadas, columnPixelWidths, frozenColumnCount]);
  const lastPinnedLeftId = frozenColumnCount > 0 ? colunasOrdenadas[frozenColumnCount - 1]?.id : null;
  const tableColGroup = useMemo(
    () => (
      <colgroup>
        <col
          style={{
            width: `${SELECT_COLUMN_WIDTH}px`,
            minWidth: `${SELECT_COLUMN_WIDTH}px`,
            maxWidth: `${SELECT_COLUMN_WIDTH}px`,
          }}
          span={1}
        />
        {colunasOrdenadas.map((col) => {
          const width = columnPixelWidths[col.id] || 160;
          return <col key={col.id} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }} span={1} />;
        })}
      </colgroup>
    ),
    [colunasOrdenadas, columnPixelWidths]
  );

  const getFieldValue = useCallback((emp, colId) => {
    if (colId === "id_global") return emp.id_global ? formatIdGlobal(emp.id_global) : "-";
    if (colId === "codempresa") return emp.codempresa ?? "-";
    if (colId === "razao_social") return emp.razao_social || "-";
    if (colId === "nome_fantasia") return emp.nome_fantasia || "-";
    if (colId === "tipo_pessoa") return emp.tipo_pessoa || "-";
    if (colId === "tipo_vinculo") {
      if (emp.tipo_vinculo === "proprietario") return "PROPRIETÁRIO";
      if (emp.tipo_vinculo === "arrendatario") return "ARRENDATÁRIO";
      return "-";
    }
    if (colId === "cpf_cnpj") return emp.cpf_cnpj || "-";
    if (colId === "inscricao_estadual") return emp.inscricao_estadual || "-";
    if (colId === "telefone") return emp.telefone || "-";
    if (colId === "whatsapp") return emp.whatsapp || "-";
    if (colId === "email") return emp.email || "-";
    if (colId === "logo_url") return emp.logo_url || "-";
    if (colId === "cep") return emp.cep || "-";
    if (colId === "endereco") return emp.endereco || "-";
    if (colId === "numero") return emp.numero || "-";
    if (colId === "bairro") return emp.bairro || "-";
    if (colId === "cidade") return emp.cidade || "-";
    if (colId === "estado") return emp.estado || "-";
    if (colId === "observacoes") return emp.observacoes || "-";
    if (colId === "status") return emp.status || "-";
    const col = colunasDisponiveisById.get(colId);
    return campoEngine.getValorCampo(emp, col || { id: colId }, {});
  }, [colunasDisponiveisById]);

  const getComparableValue = useCallback((emp, col) => {
    if (col.id === "id_global") return Number(emp.id_global || 0);
    if (col.id === "codempresa") return Number(emp.codempresa || 0);
    return campoEngine.getValorBruto ? campoEngine.getValorBruto(emp, col) : getFieldValue(emp, col.id);
  }, [getFieldValue]);

  const getNormalizedFilterDraft = useCallback(
    (columnId, col) => {
      const current = filtrosColunas[columnId];
      if (!current) return null;
      const filterType = getColumnFilterType(col);
      if (Array.isArray(current)) return normalizeLegacyColumnFilter(current, filterType);
      if (typeof current !== "object") return null;
      return {
        ...createDefaultColumnFilter(filterType),
        ...current,
        type: filterType,
      };
    },
    [filtrosColunas]
  );

  const empresaPassaFiltros = useCallback((emp, excludeColId = null, clientOnlyFilters = false) => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    if (termo) {
      const m = colunasDisponiveis.filter((c) => !c.fixo).some((col) => String(getFieldValue(emp, col.id) || "").toLowerCase().includes(termo));
      if (!m) return false;
    }
    return colunasDisponiveis.filter((c) => !c.fixo).every((col) => {
      if (excludeColId && col.id === excludeColId) return true;
      const draft = getNormalizedFilterDraft(col.id, col);
      if (!draft) return true;
      if (clientOnlyFilters && !filterNeedsClientSideProcessing(draft)) return true;
      if (!isErpFilterActive(draft)) return true;
      const raw = getComparableValue(emp, col);
      const display = getFieldValue(emp, col.id);
      return evaluateColumnFilter({
        filterDraft: draft,
        filterType: draft.type || getColumnFilterType(col),
        rawValue: raw,
        displayValue: display,
      });
    });
  }, [searchTerm, colunasDisponiveis, getNormalizedFilterDraft]);

  const selectedItemsSet = useMemo(() => new Set(selectedItems), [selectedItems]);

  const empresasFiltradas = useMemo(() => {
    const hasSearch = String(searchTerm || "").trim().length > 0;
    const hasAnyFilter = Object.values(filtrosColunas || {}).some((item) => {
      if (!item) return false;
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item !== "object") return false;
      const hasValues = Array.isArray(item.values) && item.values.length > 0;
      const hasPrimary = item.value !== null && item.value !== undefined && String(item.value).trim() !== "";
      const hasSecondary = item.valueTo !== null && item.valueTo !== undefined && String(item.valueTo).trim() !== "";
      return hasValues || hasPrimary || hasSecondary;
    });
    if (serverMode) {
      if (!hasSearch && !hasAnyFilter) return empresas;
      if (!hasSearch && !hasClientOnlyColumnFilters(filtrosColunas)) return empresas;
      return empresas.filter((emp) => empresaPassaFiltros(emp, null, !hasSearch));
    }
    if (!hasSearch && !hasAnyFilter) return empresas;
    return empresas.filter((emp) => empresaPassaFiltros(emp));
  }, [serverMode, empresas, filtrosColunas, searchTerm, empresaPassaFiltros]);

  const empresasOrdenadas = useMemo(() => {
    if (serverMode) return empresasFiltradas;
    const sortRules = Array.isArray(sortConfig) ? sortConfig.filter((rule) => rule?.key) : [];
    if (sortRules.length === 0) return empresasFiltradas;
    const sorted = [...empresasFiltradas];
    sorted.sort((a, b) => {
      for (const rule of sortRules) {
        const direction = rule.direction === "desc" ? "desc" : "asc";
        const column = colunasDisponiveisById.get(rule.key);
        if (!column) continue;
        const columnType = getColumnFilterType(column);
        let cmp = 0;
        if (columnType === "number") {
          const aNumber = Number(getComparableValue(a, column) ?? 0);
          const bNumber = Number(getComparableValue(b, column) ?? 0);
          cmp = aNumber - bNumber;
        } else if (columnType === "date") {
          const aDate = parseDateFilterValue(getComparableValue(a, column));
          const bDate = parseDateFilterValue(getComparableValue(b, column));
          cmp = (aDate || 0) - (bDate || 0);
        } else {
          const aValue = String(getFieldValue(a, rule.key)).toLowerCase();
          const bValue = String(getFieldValue(b, rule.key)).toLowerCase();
          cmp = aValue.localeCompare(bValue, "pt-BR", { sensitivity: "base", numeric: true });
        }
        if (cmp !== 0) return direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return sorted;
  }, [serverMode, empresasFiltradas, sortConfig, colunasDisponiveisById, getComparableValue, getFieldValue]);

  const localColumnOptions = useMemo(() => {
    if (!menuFiltroAberto) return {};
    const col = colunasDisponiveis.find((column) => column.id === menuFiltroAberto);
    if (!col || col.fixo) return {};
    const filterType = getColumnFilterType(col);
    const shouldUseRemoteOptionsForColumn =
      serverMode &&
      typeof onRequestDistinctColumnValues === "function" &&
      REMOTE_DISTINCT_FILTER_TYPES.has(filterType);
    if (shouldUseRemoteOptionsForColumn) return {};
    const source = empresas.filter((emp) => empresaPassaFiltros(emp, menuFiltroAberto));
    const items = [
      ...new Set(
        source
          .map((emp) => getFieldValue(emp, col.id))
          .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    return { [col.id]: items };
  }, [
    colunasDisponiveis,
    empresas,
    filtrosColunas,
    searchTerm,
    menuFiltroAberto,
    empresaPassaFiltros,
    getFieldValue,
    serverMode,
    onRequestDistinctColumnValues,
  ]);

  const hasActiveFilter = (id) => isErpFilterActive(filtrosColunas[id]);
  const getValoresFiltro = (id, col) => getNormalizedFilterDraft(id, col) || createDefaultColumnFilter(getColumnFilterType(col));
  const setValoresFiltro = (id, draft) =>
    setFiltrosColunas((prev) => {
      const next = { ...prev };
      if (!isErpFilterActive(draft)) delete next[id];
      else next[id] = draft;
      if (draft?.operator) {
        const currentOperators = readStoredFilterOperators();
        if (currentOperators[id] !== draft.operator) {
          writeStoredFilterOperators({ ...currentOperators, [id]: draft.operator });
        }
      }
      return next;
    });
  const clearColumnFilter = (id) =>
    setFiltrosColunas((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  useEffect(() => {
    if (!onFilteredEmpresasChange) return;
    const signature = empresasOrdenadas.map((empresa) => empresa.id).join("|");
    if (filteredEmpresasSignatureRef.current === signature) return;
    filteredEmpresasSignatureRef.current = signature;
    onFilteredEmpresasChange(empresasOrdenadas);
  }, [empresasOrdenadas, onFilteredEmpresasChange]);

  useEffect(() => {
    if (!serverMode) return;
    setCurrentPage(serverPage || 1);
  }, [serverMode, serverPage]);

  useEffect(() => {
    if (!serverMode) return;
    if (serverPageSize && serverPageSize !== pageSize) setPageSize(serverPageSize);
  }, [serverMode, serverPageSize, pageSize]);

  const totalPages = useMemo(() => {
    if (infiniteMode) return 1;
    if (serverMode) {
      if (!serverTotal || serverTotal <= 0) return 1;
      return Math.ceil(serverTotal / pageSize);
    }
    if (empresasOrdenadas.length === 0) return 1;
    return Math.ceil(empresasOrdenadas.length / pageSize);
  }, [serverMode, serverTotal, empresasOrdenadas.length, pageSize]);

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const summarySelected = Number.isFinite(selectedCount) ? selectedCount : selectedItems.length;
  const summaryListed = Number.isFinite(listedCount) ? listedCount : empresasOrdenadas.length;
  const summaryFiltered = Number.isFinite(filteredCount) ? filteredCount : Math.max(serverTotal || 0, summaryListed);
  const summaryTotal = Number.isFinite(totalCount) ? totalCount : Math.max(summaryFiltered, summaryListed);

  const empresasPaginadas = useMemo(() => {
    if (infiniteMode) return empresasOrdenadas;
    if (serverMode) return empresasOrdenadas;
    const start = (safeCurrentPage - 1) * pageSize;
    return empresasOrdenadas.slice(start, start + pageSize);
  }, [infiniteMode, serverMode, empresasOrdenadas, safeCurrentPage, pageSize]);

  const linhasExibidas = empresasPaginadas;
  const listedEmpresaIds = useMemo(
    () => empresasPaginadas.map((empresa) => empresa.id).filter(Boolean),
    [empresasPaginadas]
  );
  const allListedSelected = useMemo(
    () => listedEmpresaIds.length > 0 && listedEmpresaIds.every((id) => selectedItemsSet.has(id)),
    [listedEmpresaIds, selectedItemsSet]
  );
  const someListedSelected = useMemo(
    () => listedEmpresaIds.some((id) => selectedItemsSet.has(id)),
    [listedEmpresaIds, selectedItemsSet]
  );
  const handleToggleSelectAllListed = useCallback(() => {
    setSelectedItems((previous) => {
      if (allListedSelected) {
        return previous.filter((id) => !listedEmpresaIds.includes(id));
      }
      const next = new Set(previous);
      listedEmpresaIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }, [allListedSelected, listedEmpresaIds]);
  const handleToggleRowCheckbox = useCallback((empId) => {
    setSelectedItems((previous) =>
      previous.includes(empId) ? previous.filter((id) => id !== empId) : [...previous, empId]
    );
    lastSelectedIdRef.current = empId;
  }, []);
  const getRowBgClass = useCallback((index, selected) => {
    if (selected) return "emp-row-selected";
    return index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
  }, []);
  const renderSelectHeaderCell = () => (
    <TableHead
      key="__select__"
      style={{
        left: 0,
        top: 0,
        width: SELECT_COLUMN_WIDTH,
        minWidth: SELECT_COLUMN_WIDTH,
        maxWidth: SELECT_COLUMN_WIDTH,
      }}
      className="emp-th emp-th-select relative align-middle whitespace-nowrap py-0 select-none cursor-default text-center sticky z-[60]"
    >
      <div className="emp-table-select-wrap">
        <TableSelectCheck
          checked={allListedSelected}
          indeterminate={someListedSelected && !allListedSelected}
          disabled={listedEmpresaIds.length === 0}
          ariaLabel="Selecionar todos os registros listados"
          onChange={handleToggleSelectAllListed}
        />
      </div>
    </TableHead>
  );

  const renderSelectFooterCell = () => (
    <TableHead
      key="__select__"
      style={{
        left: 0,
        width: SELECT_COLUMN_WIDTH,
        minWidth: SELECT_COLUMN_WIDTH,
        maxWidth: SELECT_COLUMN_WIDTH,
      }}
      className="emp-th emp-th-select relative align-middle whitespace-nowrap py-0 select-none text-center sticky z-[60]"
    >
      <span aria-hidden="true">&nbsp;</span>
    </TableHead>
  );

  const renderSelectBodyCell = useCallback(
    ({ rowKey, emp, isSelected, rowClass }) => (
      <TableCell
        key={rowKey}
        style={{
          left: 0,
          width: SELECT_COLUMN_WIDTH,
          minWidth: SELECT_COLUMN_WIDTH,
          maxWidth: SELECT_COLUMN_WIDTH,
        }}
        className={`emp-td emp-td-select py-0 text-center align-middle select-none sticky z-[21] ${rowClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="emp-table-select-wrap">
          <TableSelectCheck
            checked={isSelected}
            ariaLabel={`Selecionar ${emp.razao_social || emp.codempresa || emp.id}`}
            onChange={() => handleToggleRowCheckbox(emp.id)}
          />
        </div>
      </TableCell>
    ),
    [handleToggleRowCheckbox]
  );

  const renderVirtualTableRow = useCallback(
    (emp, virtualRowIndex) => {
      const isSelected = selectedItemsSet.has(emp.id);
      const rowClass = getRowBgClass(virtualRowIndex, isSelected);
      return [
        renderSelectBodyCell({
          rowKey: `select:${emp.id}`,
          emp,
          isSelected,
          rowClass,
        }),
        ...colunasOrdenadas.map((col, colIndex) => {
          const isPinnedLeft = colIndex < frozenColumnCount;
          const hasRightShadow = col.id === lastPinnedLeftId;
          return (
            <TableCell
              key={`${emp.id}-${col.id}`}
              style={{
                left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
              }}
              className={`emp-td py-0 text-left text-[12px] align-middle whitespace-nowrap overflow-hidden select-none ${rowClass} ${isPinnedLeft ? "sticky z-20" : ""} ${hasRightShadow ? "emp-pinned-border-right" : ""} ${col.id === "id_global" ? "text-[#64748B] font-medium" : ""} ${isSelected && col.id !== "id_global" ? "font-semibold" : ""}`}
              title={String(getFieldValue(emp, col.id) ?? "")}
            >
              {getFieldValue(emp, col.id)}
            </TableCell>
          );
        }),
      ];
    },
    [
      colunasOrdenadas,
      frozenColumnCount,
      frozenOffsets,
      lastPinnedLeftId,
      getFieldValue,
      getRowBgClass,
      renderSelectBodyCell,
      selectedItemsSet,
    ]
  );

  useEffect(() => {
    if (suppressPersistenceRef.current || !tableHydratedRef.current) return;
    writeEmpPreferencesText(PAGE_SIZE_KEY, String(pageSize), {
      reason: "listagem:table-page-size",
      emit: false,
    });
  }, [pageSize]);

  useEffect(() => {
    if (!serverMode || suppressPersistenceRef.current || !tableHydratedRef.current) return;
    const sig = stableStringify(filtrosColunas || {});
    if (lastServerFiltersSigRef.current === sig) return;
    lastServerFiltersSigRef.current = sig;
    onServerColumnFiltersChange?.(filtrosColunas);
  }, [serverMode, filtrosColunas, onServerColumnFiltersChange]);

  useEffect(() => {
    if (!serverMode || suppressPersistenceRef.current || !tableHydratedRef.current) return;
    const primarySort = Array.isArray(sortConfig) && sortConfig.length > 0
      ? sortConfig[0]
      : { key: "codempresa", direction: "asc" };
    const nextSort = {
      key: primarySort.key || "codempresa",
      direction: primarySort.direction === "desc" ? "desc" : "asc",
    };
    const sig = stableStringify(nextSort);
    if (lastServerSortSigRef.current === sig) return;
    lastServerSortSigRef.current = sig;
    onServerSortChange?.(nextSort);
  }, [serverMode, sortConfig, onServerSortChange]);

  useEffect(() => {
    if (!serverMode) return;
    const signature = stableStringify({ filtrosColunas, searchTerm, pageSize, sortConfig });
    if (serverResetSignatureRef.current === signature) return;
    serverResetSignatureRef.current = signature;
    setCurrentPage(1);
    onServerPageChange?.(1);
  }, [serverMode, onServerPageChange, filtrosColunas, searchTerm, pageSize, sortConfig]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (nextPage) => {
    if (infiniteMode) return;
    setCurrentPage(nextPage);
    onServerPageChange?.(nextPage);
  };

  const handlePageSizeChange = (nextPageSize) => {
    if (infiniteMode) return;
    setPageSize(nextPageSize);
    onServerPageSizeChange?.(nextPageSize);
  };

  const handleRowSelect = (emp, event) => {
    if (event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]")) return;
    if (event?.shiftKey && lastSelectedIdRef.current) { const si = empresasOrdenadas.findIndex((e) => e.id === lastSelectedIdRef.current); const ei = empresasOrdenadas.findIndex((e) => e.id === emp.id); if (si >= 0 && ei >= 0) { const [from, to] = [Math.min(si, ei), Math.max(si, ei)]; setSelectedItems(empresasOrdenadas.slice(from, to + 1).map((e) => e.id)); return; } }
    if (event?.ctrlKey || event?.metaKey) { setSelectedItems((p) => p.includes(emp.id) ? p.filter((id) => id !== emp.id) : [...p, emp.id]); return; }
    if (selectedItemsSet.has(emp.id)) {
      setSelectedItems([]);
      lastSelectedIdRef.current = null;
      rowClickSuppressRef.current = { id: emp.id, until: Date.now() + ROW_DBLCLICK_PAIR_MS };
      return;
    }
    setSelectedItems([emp.id]);
    lastSelectedIdRef.current = emp.id;
    rowClickSuppressRef.current = { id: null, until: 0 };
  };

  const isRowInteractionTarget = (event) =>
    event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]");

  const handleRowClick = (emp, event) => {
    if (isRowInteractionTarget(event)) return;

    const now = Date.now();
    const suppress = rowClickSuppressRef.current;
    if (suppress.id === emp.id && now < suppress.until) return;

    const last = lastRowClickRef.current;
    const interval = last.id === emp.id && last.time > 0 ? now - last.time : null;

    if (interval !== null && interval <= ROW_DBLCLICK_PAIR_MS) {
      lastRowClickRef.current = { id: null, time: 0, wasSelectedBefore: false };
      rowClickSuppressRef.current = { id: null, until: 0 };

      if (!last.wasSelectedBefore && interval <= ROW_DBLCLICK_OPEN_MS) {
        if (selectedItemsRef.current.length <= 1) onEdit?.(emp);
        return;
      }

      handleRowSelect(emp, event);
      return;
    }

    const wasSelectedBefore = selectedItemsRef.current.includes(emp.id);
    lastRowClickRef.current = { id: emp.id, time: now, wasSelectedBefore };

    if (event?.shiftKey || event?.ctrlKey || event?.metaKey) {
      rowClickSuppressRef.current = { id: null, until: 0 };
      handleRowSelect(emp, event);
      return;
    }

    handleRowSelect(emp, event);
  };

  const getVirtualRowProps = useCallback(
    (emp) => ({
      "aria-selected": selectedItemsSet.has(emp?.id),
    }),
    [selectedItemsSet]
  );

  const overlayColumnId = columnMenuAnchor?.columnId || menuFiltroAberto;
  const isColumnOverlayOpen = Boolean(columnMenuAnchor || menuFiltroAberto);

  const columnMenuPanelStyle = useMgPanelPosition(
    Boolean(columnMenuAnchor?.columnId),
    overlayAnchorRef,
    columnMenuPanelRef,
    {
      minWidth: 228,
      width: 280,
      estimatedHeight: 280,
      align: "right",
      scrollable: false,
    },
    columnMenuAnchor?.columnId
  );

  const filterPanelStyle = useMgPanelPosition(
    Boolean(menuFiltroAberto),
    overlayAnchorRef,
    filterPanelRef,
    {
      minWidth: FILTER_POPOVER_WIDTH,
      width: FILTER_POPOVER_WIDTH,
      estimatedHeight: 460,
      align: "right",
      scrollable: true,
    },
    menuFiltroAberto
  );

  useEffect(() => {
    if (!overlayColumnId) return undefined;
    const onPointerDown = (event) => {
      const menuPanel = columnMenuPanelRef.current;
      const filterPanel = filterPanelRef.current;
      const trigger = columnMenuTriggerRefs.current[overlayColumnId];
      if (
        menuPanel?.contains(event.target) ||
        filterPanel?.contains(event.target) ||
        trigger?.contains(event.target) ||
        isNestedMgFloatingPanelTarget(event.target)
      ) {
        return;
      }
      closeColumnOverlays();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeColumnOverlays();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [overlayColumnId, closeColumnOverlays]);

  useEffect(() => {
    if (!columnMenuAnchor?.columnId) return;
    const raf = requestAnimationFrame(() => {
      const panel = columnMenuPanelRef.current;
      if (!panel) return;
      const firstItem = panel.querySelector("button:not(:disabled)");
      if (firstItem instanceof HTMLElement) firstItem.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [columnMenuAnchor]);

  useEffect(() => {
    if (!overlayColumnId) return;
    if (colunasOrdenadas.some((column) => column.id === overlayColumnId)) return;
    closeColumnOverlays();
  }, [overlayColumnId, colunasOrdenadas, closeColumnOverlays]);

  const syncTableFullscreen = useCallback(() => {
    setIsTableFullscreen(document.fullscreenElement === tableStageRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncTableFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncTableFullscreen);
  }, [syncTableFullscreen]);

  const handleToggleTableFullscreen = useCallback(async () => {
    const el = tableStageRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* navegador sem suporte */
    }
  }, []);

  const { registerTableFullscreen, unregisterTableFullscreen } = useErpTableFullscreen();

  useEffect(() => {
    registerTableFullscreen({
      onToggle: handleToggleTableFullscreen,
      isFullscreen: isTableFullscreen,
    });
    return () => unregisterTableFullscreen();
  }, [
    registerTableFullscreen,
    unregisterTableFullscreen,
    handleToggleTableFullscreen,
    isTableFullscreen,
  ]);

  const handleTableKeyDown = (e) => {
    if (e.key === "Escape" && (columnMenuAnchor || menuFiltroAberto)) {
      e.preventDefault();
      closeColumnOverlays();
      return;
    }
    if (e.key === "Escape" && document.fullscreenElement === tableStageRef.current) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setSelectedItems(listedEmpresaIds);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (selectedItemsRef.current.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      const navegaveis = linhasExibidas.filter((item) => item?.id);
      const anchorId =
        (lastSelectedIdRef.current && selectedItemsRef.current.includes(lastSelectedIdRef.current))
          ? lastSelectedIdRef.current
          : selectedItemsRef.current[selectedItemsRef.current.length - 1];
      const currentIndex = navegaveis.findIndex((item) => item.id === anchorId);
      if (currentIndex < 0) return;
      const nextIndex = Math.min(
        Math.max(currentIndex + step, 0),
        Math.max(0, navegaveis.length - 1)
      );
      const nextRecord = navegaveis[nextIndex];
      if (!nextRecord?.id) return;
      e.preventDefault();
      lastSelectedIdRef.current = nextRecord.id;
      const visibleIndex = linhasExibidas.findIndex((item) => item?.id === nextRecord.id);
      const body = scrollContainerRef.current;
      if (body && visibleIndex >= 0) {
        const tableHeaderOffset = mgPrototype ? EMP_TABLE_HEADER_HEIGHT : 0;
        scrollVirtualRowIntoView(body, visibleIndex, {
          itemSize: EMP_TABLE_ROW_HEIGHT,
          direction: step < 0 ? "up" : "down",
          scrollOffset: tableHeaderOffset,
          stickyHeaderOffset: tableHeaderOffset,
        });
      }
      setSelectedItems([nextRecord.id]);
      return;
    }

    if (e.key === "Enter") {
      if (selectedItemsRef.current.length === 0) return;
      const anchorId =
        (lastSelectedIdRef.current && selectedItemsRef.current.includes(lastSelectedIdRef.current))
          ? lastSelectedIdRef.current
          : selectedItemsRef.current[selectedItemsRef.current.length - 1];
      const selectedRecord = linhasExibidas.find((item) => item?.id === anchorId);
      if (!selectedRecord) return;
      e.preventDefault();
      onEdit?.(selectedRecord);
    }
  };

  const agregacoes = useMemo(() => {
    if (empresasOrdenadas.length > 150) return {};
    return campoEngine.calcularAgregacoes
      ? campoEngine.calcularAgregacoes(empresasOrdenadas, colunasOrdenadas, {})
      : {};
  }, [empresasOrdenadas, colunasOrdenadas]);

  useEffect(() => {
    const body = scrollContainerRef.current;
    const footer = footerScrollRef.current;
    const header = headerScrollRef.current;
    if (!body) return undefined;

    const syncHorizontalScroll = () => {
      // Evita subpixel na rolagem horizontal para manter as linhas da grade alinhadas.
      const rawLeft = body.scrollLeft;
      const snappedLeft = Math.round(rawLeft);
      if (Math.abs(rawLeft - snappedLeft) > 0.01) {
        body.scrollLeft = snappedLeft;
      }
      const left = body.scrollLeft;
      if (footer) footer.scrollLeft = left;
      if (header && !mgPrototype) header.scrollLeft = left;
    };

    const syncScrollbarCompensation = () => {
      const nextCompensation = Math.max(0, body.offsetWidth - body.clientWidth);
      if (Math.abs(scrollbarCompensationRef.current - nextCompensation) >= 1) {
        scrollbarCompensationRef.current = nextCompensation;
        setScrollbarCompensation(nextCompensation);
      }
    };

    const onScroll = () => {
      syncHorizontalScroll();
    };

    const onResize = () => {
      syncHorizontalScroll();
      syncScrollbarCompensation();
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onResize)
        : null;
    resizeObserver?.observe(body);
    body.addEventListener("scroll", onScroll, { passive: true });
    onResize();
    return () => {
      body.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
    };
  }, [colunasOrdenadas, columnWidths, agregacoes, mgPrototype]);

  const formatTotalValue = (valor, col) => {
    const isInt = col.id === "id_global" || col.id === "codempresa";
    const places = col.decimal_places ?? 2;
    return Number(valor).toLocaleString("pt-BR", isInt ? { maximumFractionDigits: 0 } : col.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 0 });
  };

  const measureTextWidth = (text, font = '12px Inter, system-ui, sans-serif') => {
    if (typeof document === "undefined") return String(text || "").length * 7;
    if (!measureCanvasRef.current) measureCanvasRef.current = document.createElement("canvas");
    const ctx = measureCanvasRef.current.getContext("2d");
    if (!ctx) return String(text || "").length * 7;
    ctx.font = font;
    return ctx.measureText(String(text ?? "")).width;
  };

  const calculateAutoFitWidth = useCallback(
    (col) => {
      const minW = getMinWidth(col);
      let maxW = measureTextWidth(formatHeaderLabel(col), "600 12px Inter, system-ui, sans-serif") + 74;
      empresasOrdenadas.slice(0, AUTO_FIT_MEASURE_LIMIT).forEach((emp) => {
        const cellW = measureTextWidth(getFieldValue(emp, col.id)) + 16;
        maxW = Math.max(maxW, cellW);
      });
      if (agregacoes[col.id] !== undefined) {
        const totalW = measureTextWidth(
          colunasOrdenadas.findIndex((c) => c.id === col.id) === 0 ? "Totais" : formatTotalValue(agregacoes[col.id], col),
          "600 10px Inter, system-ui, sans-serif"
        ) + 16;
        maxW = Math.max(maxW, totalW);
      }
      return Math.round(Math.min(MAX_AUTO_FIT_WIDTH, Math.max(minW, Math.ceil(maxW))));
    },
    [agregacoes, colunasOrdenadas, empresasOrdenadas, getFieldValue]
  );

  const autoFitColumnWidth = useCallback(
    (col, { keepActive = false } = {}) => {
      const nextWidth = calculateAutoFitWidth(col);
      setColumnWidths((previous) => {
        if (previous[col.id] === nextWidth) return previous;
        return { ...previous, [col.id]: nextWidth };
      });
      if (keepActive) {
        setAutoFitActiveColumns((previous) => {
          const next = { ...previous, [col.id]: true };
          columnSizingModeRef.current = mergeColumnSizingMode(columnSizingModeRef.current, col.id, "auto");
          persistSizingMode(next);
          return next;
        });
      }
      setResizeColumnId(null);
    },
    [calculateAutoFitWidth, persistSizingMode]
  );

  useEffect(() => {
    const activeColumnIds = Object.entries(autoFitActiveColumns)
      .filter(([, active]) => Boolean(active))
      .map(([columnId]) => columnId)
      .filter((columnId) => colunasOrdenadas.some((column) => column.id === columnId));
    if (activeColumnIds.length === 0) return;
    setColumnWidths((previous) => {
      let changed = false;
      const next = { ...previous };
      activeColumnIds.forEach((columnId) => {
        const column = colunasDisponiveisById.get(columnId);
        if (!column) return;
        const nextWidth = calculateAutoFitWidth(column);
        if (next[columnId] !== nextWidth) {
          next[columnId] = nextWidth;
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [autoFitActiveColumns, calculateAutoFitWidth, colunasDisponiveisById, colunasOrdenadas]);

  useEffect(() => {
    setAutoFitActiveColumns((previous) => {
      const visibleIds = new Set(colunasOrdenadas.map((column) => column.id));
      let changed = false;
      const next = {};
      Object.entries(previous).forEach(([columnId, active]) => {
        if (!active) return;
        if (!visibleIds.has(columnId)) {
          changed = true;
          return;
        }
        next[columnId] = true;
      });
      if (!changed && Object.keys(next).length === Object.keys(previous).filter((id) => previous[id]).length) {
        return previous;
      }
      return next;
    });
  }, [colunasOrdenadas]);

  const applyQuickColumnFilter = (col) => {
    openFilterMenu(col.id);
  };

  const hideColumn = (col) => {
    if (!colunasVisiveis.includes(col.id) || colunasVisiveis.length <= 1) return;
    const nextVisiveis = colunasVisiveis.filter((id) => id !== col.id);
    setColunasVisiveis(nextVisiveis);
    markVisibleColumnsInitialized();
    writeEmpPreferencesJson(VISIBLE_KEY, nextVisiveis, { reason: "listagem:table-visible" });
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
    closeColumnOverlays();
  };

  const applySortToColumn = (columnId, direction) => {
    const nextDirection = direction === "desc" ? "desc" : "asc";
    setSortConfig([{ key: columnId, direction: nextDirection }]);
  };

  const toggleSortForColumn = useCallback((columnId) => {
    setSortConfig((previous) => {
      const currentRule = Array.isArray(previous) ? previous.find((rule) => rule.key === columnId) : null;
      const nextDirection = currentRule?.direction === "asc" ? "desc" : "asc";
      return [{ key: columnId, direction: nextDirection }];
    });
  }, []);

  const togglePinColumnLeft = useCallback((columnIndex) => {
    setFrozenColumnCount((previous) => (previous === columnIndex + 1 ? 0 : columnIndex + 1));
    closeColumnOverlays();
  }, [closeColumnOverlays]);

  const buildColumnMenuItems = (col, colIndex) => {
    const isFrozenAnchorColumn = frozenColumnCount > 0 && colIndex === frozenColumnCount - 1;
    return [
    {
      id: "filter",
      label: "Abrir filtro avançado",
      Icon: Filter,
      active: hasActiveFilter(col.id),
      onClick: () => applyQuickColumnFilter(col),
    },
    {
      id: "auto-fit",
      label: autoFitActiveColumns[col.id] ? "Ajuste manual" : "Auto ajustar coluna",
      Icon: ScanLine,
      active: Boolean(autoFitActiveColumns[col.id]),
      onClick: () => {
        if (autoFitActiveColumns[col.id]) {
          setAutoFitActiveColumns((previous) => {
            const next = { ...previous, [col.id]: false };
            columnSizingModeRef.current = mergeColumnSizingMode(columnSizingModeRef.current, col.id, "manual");
            persistSizingMode(next);
            return next;
          });
        } else {
          autoFitColumnWidth(col, { keepActive: true });
        }
        closeColumnOverlays();
      },
    },
    {
      id: "pin-column-left",
      label: isFrozenAnchorColumn ? "Descongelar coluna" : "Congelar coluna",
      Icon: PanelLeft,
      active: isFrozenAnchorColumn,
      onClick: () => togglePinColumnLeft(colIndex),
    },
    {
      id: "hide-column",
      label: "Ocultar coluna",
      Icon: EyeOff,
      disabled: colunasVisiveis.length <= 1,
      onClick: () => hideColumn(col),
    },
  ];
  };

  useEffect(() => {
    if (!onVisibleDataChange) return undefined;
    const buildCols = (cols) => cols.map((c) => ({ id: c.id, label: c.label, width: Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c)) }));
    const buildRows = (items, cols) => items.map((e) => cols.map((c) => getFieldValue(e, c.id)));
    const buildTotalRow = (cols, totals) => Object.keys(totals).length > 0 ? cols.map((c, i) => i === 0 ? "Totais" : totals[c.id] !== undefined ? formatTotalValue(totals[c.id], c) : "") : null;
    const exp = colunasOrdenadas.filter((c) => !c.fixo);
    const selEmps = empresasOrdenadas.filter((e) => selectedItemsSet.has(e.id));
    const totalRow = buildTotalRow(exp, agregacoes);
    const skipHeavyRows = serverMode && empresasOrdenadas.length > 80;
    const timer = window.setTimeout(() => {
      onVisibleDataChange({
        columns: buildCols(exp),
        rows: skipHeavyRows ? [] : buildRows(empresasOrdenadas, exp),
        selectedRows: buildRows(selEmps, exp),
        totalRows: totalRow ? [totalRow] : [],
        allColumns: buildCols(colunasTodasOrdenadas),
        allRows: skipHeavyRows ? [] : buildRows(empresasOrdenadas, colunasTodasOrdenadas),
        allSelectedRows: buildRows(selEmps, colunasTodasOrdenadas),
        allTotalRows: totalRow ? [totalRow] : [],
      });
    }, skipHeavyRows ? 0 : 120);
    return () => window.clearTimeout(timer);
  }, [colunasOrdenadas, colunasTodasOrdenadas, empresasOrdenadas, selectedItemsSet, onVisibleDataChange, agregacoes, columnWidths, serverMode]);

  const hasTotalRow = Object.keys(agregacoes).length > 0;

  const renderHeaderCells = () =>
    colunasOrdenadas.map((col, colIndex) => {
      const isPinnedLeft = colIndex < frozenColumnCount;
      const isResizing = resizeColumnId === col.id;
      const isMenuOpen = columnMenuAnchor?.columnId === col.id;
      const hasColumnFilter = hasActiveFilter(col.id);
      const sortRule = Array.isArray(sortConfig) ? sortConfig.find((rule) => rule.key === col.id) : null;
      const isSortActive = Boolean(sortRule);
      const isAutoFitActive = Boolean(autoFitActiveColumns[col.id]);
      const isFrozenAnchorColumn = frozenColumnCount > 0 && colIndex === frozenColumnCount - 1;
      const hasRightShadow = isFrozenAnchorColumn;
      return (
        <TableHead
          key={col.id}
          style={{
            left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
            top: isPinnedLeft ? 0 : undefined,
            zIndex: isPinnedLeft ? 51 + colIndex : undefined,
          }}
          className={`emp-th relative align-middle whitespace-nowrap py-0 select-none cursor-default text-left ${isPinnedLeft ? "sticky z-50 emp-th-pinned" : "z-40"} ${hasRightShadow ? "emp-pinned-border-right" : ""}`}
          onDoubleClick={(event) => {
            const interactiveTarget = event.target?.closest?.(
              "button, [role='separator'], .emp-col-resize-handle"
            );
            if (interactiveTarget) return;
            event.preventDefault();
            event.stopPropagation();
            toggleSortForColumn(col.id);
          }}
        >
          <div className="emp-th-label-wrap flex w-full h-full min-w-0 overflow-hidden">
            <span
              className="emp-th-label flex-1 min-w-0 truncate font-semibold whitespace-nowrap text-left"
              title={formatHeaderLabel(col)}
            >
              {formatHeaderLabel(col)}
            </span>
            <div className="emp-th-trailing flex shrink-0 items-center">
              {isSortActive ? (
                <span className="emp-th-icon-button emp-th-icon-button--indicator" aria-hidden="true">
                  {sortRule?.direction === "desc" ? (
                    <ArrowDown className="emp-th-icon-button__icon" strokeWidth={2.2} />
                  ) : (
                    <ArrowUp className="emp-th-icon-button__icon" strokeWidth={2.2} />
                  )}
                </span>
              ) : null}
              {isAutoFitActive ? (
                <button
                  type="button"
                  className="emp-th-icon-button emp-th-icon-button--status"
                  aria-label={`Desativar auto ajustar da coluna ${formatHeaderLabel(col)}`}
                  title="Clique para ajuste manual"
                  onClick={(event) => {
                    event.stopPropagation();
                    setAutoFitActiveColumns((previous) => {
                      const next = { ...previous, [col.id]: false };
                      columnSizingModeRef.current = mergeColumnSizingMode(
                        columnSizingModeRef.current,
                        col.id,
                        "manual"
                      );
                      persistSizingMode(next);
                      return next;
                    });
                  }}
                >
                  <ScanLine className="emp-th-icon-button__icon" strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              {isFrozenAnchorColumn ? (
                <button
                  type="button"
                  className="emp-th-icon-button emp-th-icon-button--status"
                  aria-label={`Descongelar coluna ${formatHeaderLabel(col)}`}
                  title="Clique para descongelar coluna"
                  onClick={(event) => {
                    event.stopPropagation();
                    togglePinColumnLeft(colIndex);
                  }}
                >
                  <PanelLeft className="emp-th-icon-button__icon" strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              {hasColumnFilter ? (
                <button
                  type="button"
                  className="emp-th-icon-button emp-th-filter-clear-button"
                  aria-label={`Limpar filtro da coluna ${formatHeaderLabel(col)}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    clearColumnFilter(col.id);
                  }}
                >
                  <X className="emp-th-icon-button__icon" strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                ref={(element) => {
                  if (element) columnMenuTriggerRefs.current[col.id] = element;
                  else delete columnMenuTriggerRefs.current[col.id];
                }}
                className={`emp-th-menu-button${isMenuOpen ? " is-open" : ""}`}
                aria-label={`Abrir menu da coluna ${formatHeaderLabel(col)}`}
                aria-expanded={isMenuOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleColumnMenu(col.id);
                }}
              >
                <MoreVertical className="emp-th-menu-button__icon" strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Redimensionar coluna ${formatHeaderLabel(col)}. Duplo clique para ajustar automaticamente.`}
            className={`emp-col-resize-handle absolute top-0 right-0 h-full w-[7px] translate-x-1/2 z-[60] cursor-col-resize touch-none ${
              isResizing ? "emp-col-resize-active" : ""
            }`}
            onMouseDown={(e) => startDragResize(e, col)}
            onTouchStart={(e) => startDragResize(e, col)}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              autoFitColumnWidth(col);
            }}
          />
        </TableHead>
      );
    });

  const columnMenuColumn = columnMenuAnchor?.columnId
    ? colunasOrdenadas.find((column) => column.id === columnMenuAnchor.columnId)
    : null;
  const columnMenuIndex = columnMenuColumn
    ? colunasOrdenadas.findIndex((column) => column.id === columnMenuColumn.id)
    : -1;
  const columnMenuItems = columnMenuColumn && columnMenuIndex >= 0
    ? buildColumnMenuItems(columnMenuColumn, columnMenuIndex)
    : [];

  const filterColumn = menuFiltroAberto
    ? colunasDisponiveis.find((column) => column.id === menuFiltroAberto)
    : null;
  const filterColumnType = filterColumn ? getColumnFilterType(filterColumn) : "";
  const normalizedFilterOptionsMode = normalizeFilterOptionsMode(selectorOptionsMode);
  const shouldUseRemoteFilterOptions = Boolean(
    menuFiltroAberto &&
    filterColumn &&
    typeof onRequestDistinctColumnValues === "function" &&
    REMOTE_DISTINCT_FILTER_TYPES.has(filterColumnType)
  );
  const resolveDistinctFilters = useCallback(
    (activeColumnId) => {
      const contextFilters =
        selectorOptionsContextFilters && typeof selectorOptionsContextFilters === "object"
          ? selectorOptionsContextFilters
          : {};
      if (normalizedFilterOptionsMode !== FILTER_OPTIONS_MODE_CASCADE) {
        return contextFilters;
      }
      const cascadedColumnFilters = Object.entries(filtrosColunas || {}).reduce((acc, [columnId, value]) => {
        if (columnId === activeColumnId) return acc;
        acc[columnId] = value;
        return acc;
      }, {});
      const cascadedFilters = buildEmpresaColumnFilters(cascadedColumnFilters);
      return mergeEmpresaListFilters(contextFilters, cascadedFilters);
    },
    [normalizedFilterOptionsMode, selectorOptionsContextFilters, filtrosColunas]
  );
  const filterMeta = filterColumn
    ? resolveErpFilterMeta(
        { columnMeta: filterColumn, column: filterColumn.id, key: filterColumn.id },
        localColumnOptions[menuFiltroAberto] || []
      )
    : null;
  const filterDraft =
    filterColumn && filtroTemp.colunaId === menuFiltroAberto && filtroTemp.draft
      ? filtroTemp.draft
      : filterColumn
        ? getValoresFiltro(menuFiltroAberto, filterColumn)
        : null;
  const selectedFilterValues = useMemo(
    () => normalizeOptionValues(Array.isArray(filterDraft?.values) ? filterDraft.values : []),
    [filterDraft?.values]
  );
  const remoteFilterRequest = useMemo(() => {
    if (!shouldUseRemoteFilterOptions || !menuFiltroAberto) return null;
    const optionSearch = String(debouncedBuscaFiltroMenu || "").trim();
    const requestFilters = resolveDistinctFilters(menuFiltroAberto);
    const search =
      normalizedFilterOptionsMode === FILTER_OPTIONS_MODE_CASCADE
        ? String(serverSearchTerm || "").trim()
        : "";
    const params = {
      column: menuFiltroAberto,
      optionSearch,
      q: optionSearch,
      search,
      filters: requestFilters,
      limit: FILTER_OPTIONS_PAGE_SIZE,
      cursor: null,
    };
    const cacheKey = JSON.stringify({
      mode: normalizedFilterOptionsMode,
      ...params,
    });
    return { cacheKey, params };
  }, [
    shouldUseRemoteFilterOptions,
    menuFiltroAberto,
    debouncedBuscaFiltroMenu,
    resolveDistinctFilters,
    normalizedFilterOptionsMode,
    serverSearchTerm,
  ]);
  const fetchRemoteFilterOptions = useCallback(
    async ({ cacheKey, params, append = false, baseItems = [] }) => {
      if (typeof onRequestDistinctColumnValues !== "function" || !params?.column) return;
      if (append && filterOptionsInFlightCountRef.current > 0) return;
      const requestId = ++filterOptionsRequestIdRef.current;
      const expectedColumn = params.column;
      filterOptionsInFlightCountRef.current += 1;
      setFilterOptionsRemoteState((prev) => ({
        columnId: expectedColumn,
        cacheKey,
        items: append ? prev.items : prev.columnId === expectedColumn && prev.cacheKey === cacheKey ? prev.items : [],
        nextCursor: append ? prev.nextCursor : null,
        loadingInitial: !append,
        loadingMore: append,
      }));
      try {
        const payload = await Promise.race([
          onRequestDistinctColumnValues(params),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), FILTER_OPTIONS_REQUEST_TIMEOUT_MS)
          ),
        ]);
        if (
          requestId !== filterOptionsRequestIdRef.current ||
          activeFilterColumnRef.current !== expectedColumn
        ) {
          return;
        }
        const fetchedItems = normalizeOptionValues(payload?.items || []);
        const nextCursor = payload?.nextCursor || null;
        const mergedItems = append
          ? mergeFilterOptionsWithSelected(baseItems, fetchedItems)
          : fetchedItems;
        const noProgressOnAppend = append && mergedItems.length <= (baseItems?.length || 0);
        const resolvedNextCursor = noProgressOnAppend ? null : nextCursor;
        filterOptionsCacheRef.current.set(cacheKey, {
          items: mergedItems,
          nextCursor: resolvedNextCursor,
        });
        setFilterOptionsRemoteState({
          columnId: expectedColumn,
          cacheKey,
          items: mergedItems,
          nextCursor: resolvedNextCursor,
          loadingInitial: false,
          loadingMore: false,
        });
      } catch {
        if (
          requestId !== filterOptionsRequestIdRef.current ||
          activeFilterColumnRef.current !== expectedColumn
        ) {
          return;
        }
        setFilterOptionsRemoteState((prev) => ({
          ...prev,
          nextCursor: append ? null : prev.nextCursor,
          loadingInitial: false,
          loadingMore: false,
        }));
      } finally {
        filterOptionsInFlightCountRef.current = Math.max(
          0,
          filterOptionsInFlightCountRef.current - 1
        );
      }
    },
    [onRequestDistinctColumnValues]
  );
  useEffect(() => {
    if (!remoteFilterRequest || !menuFiltroAberto || !shouldUseRemoteFilterOptions) return;
    const cached = filterOptionsCacheRef.current.get(remoteFilterRequest.cacheKey);
    if (cached && Array.isArray(cached.items)) {
      setFilterOptionsRemoteState({
        columnId: menuFiltroAberto,
        cacheKey: remoteFilterRequest.cacheKey,
        items: cached.items,
        nextCursor: cached.nextCursor || null,
        loadingInitial: false,
        loadingMore: false,
      });
      return;
    }
    void fetchRemoteFilterOptions({
      cacheKey: remoteFilterRequest.cacheKey,
      params: remoteFilterRequest.params,
      append: false,
    });
  }, [
    remoteFilterRequest,
    menuFiltroAberto,
    shouldUseRemoteFilterOptions,
    fetchRemoteFilterOptions,
  ]);
  const handleLoadMoreFilterOptions = useCallback(() => {
    if (!remoteFilterRequest) return;
    if (filterOptionsInFlightCountRef.current > 0) return;
    if (filterOptionsRemoteState.loadingMore || filterOptionsRemoteState.loadingInitial) return;
    if (!filterOptionsRemoteState.nextCursor) return;
    void fetchRemoteFilterOptions({
      cacheKey: remoteFilterRequest.cacheKey,
      params: {
        ...remoteFilterRequest.params,
        cursor: filterOptionsRemoteState.nextCursor,
      },
      append: true,
      baseItems: filterOptionsRemoteState.items,
    });
  }, [
    remoteFilterRequest,
    filterOptionsRemoteState.loadingMore,
    filterOptionsRemoteState.loadingInitial,
    filterOptionsRemoteState.nextCursor,
    filterOptionsRemoteState.items,
    fetchRemoteFilterOptions,
  ]);
  const filterColumnLabel = filterColumn ? formatHeaderLabel(filterColumn) : "";
  const localFilterListOptions = menuFiltroAberto ? localColumnOptions[menuFiltroAberto] || [] : [];
  const remoteFilterListOptions =
    shouldUseRemoteFilterOptions &&
    filterOptionsRemoteState.columnId === menuFiltroAberto
      ? filterOptionsRemoteState.items
      : [];
  const baseFilterListOptions = shouldUseRemoteFilterOptions
    ? remoteFilterListOptions
    : localFilterListOptions;
  const filterListOptions = useMemo(
    () => mergeFilterOptionsWithSelected(baseFilterListOptions, selectedFilterValues),
    [baseFilterListOptions, selectedFilterValues]
  );
  const filterEnumOptions = filterColumn
    ? resolveErpFilterEnumOptions(
        { columnMeta: filterColumn, column: filterColumn.id, key: filterColumn.id },
        filterListOptions
      )
    : [];
  const filterSearchPending =
    buscaFiltroMenu.trim().toLowerCase() !== debouncedBuscaFiltroMenu.trim().toLowerCase();
  const filterSearchLoading =
    filterSearchPending ||
    (shouldUseRemoteFilterOptions &&
      (filterOptionsRemoteState.loadingInitial || filterOptionsRemoteState.loadingMore));
  const hasMoreFilterOptions =
    shouldUseRemoteFilterOptions &&
    filterOptionsRemoteState.columnId === menuFiltroAberto &&
    Boolean(filterOptionsRemoteState.nextCursor);
  const loadingMoreFilterOptions =
    shouldUseRemoteFilterOptions &&
    filterOptionsRemoteState.columnId === menuFiltroAberto &&
    filterOptionsRemoteState.loadingMore;

  const updateFilterDraft = (updater) => {
    if (!filterColumn || !menuFiltroAberto) return;
    const filterType = getColumnFilterType(filterColumn);
    setFiltroTemp((prev) => {
      const baseDraft =
        prev.colunaId === menuFiltroAberto && prev.draft
          ? prev.draft
          : getValoresFiltro(menuFiltroAberto, filterColumn);
      const nextDraft =
        typeof updater === "function"
          ? updater(baseDraft)
          : updater?.type
            ? updater
            : { ...baseDraft, ...updater };
      return {
        colunaId: menuFiltroAberto,
        draft: {
          ...createDefaultColumnFilter(filterType),
          ...nextDraft,
          type: filterType,
        },
      };
    });
  };

  const handleColumnMenuKeyDown = (event) => {
    const panel = columnMenuPanelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll("button:not(:disabled)"));
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeColumnOverlays();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
      items[nextIndex]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const renderTotalCells = () =>
    colunasOrdenadas.map((col, ci) => {
      const isPinnedLeft = ci < frozenColumnCount;
      const hasRightShadow = col.id === lastPinnedLeftId;
      return (
        <TableHead
          key={`total-${col.id}`}
          style={{
            left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
          }}
          className={`emp-th relative align-middle whitespace-nowrap py-0 select-none text-left ${isPinnedLeft ? "sticky z-50" : "z-40"} ${hasRightShadow ? "emp-pinned-border-right" : ""}`}
        >
          <div className="emp-th-label-wrap flex items-center w-full h-full leading-[26px] whitespace-nowrap overflow-hidden">
            <span className="emp-th-label truncate font-semibold text-left">
              {ci === 0 && agregacoes[col.id] === undefined ? "Totais" : agregacoes[col.id] !== undefined ? formatTotalValue(agregacoes[col.id], col) : ""}
            </span>
          </div>
        </TableHead>
      );
    });

  const tableClass = mgPrototype
    ? "mg-grid emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none"
    : "emp-table-pro emp-table-pro-header w-full border-separate border-spacing-0 table-fixed select-none";
  const bodyTableClass = mgPrototype
    ? "mg-grid emp-table-pro emp-table-pro-body w-full border-separate border-spacing-0 table-fixed select-none"
    : "emp-table-pro emp-table-pro-body w-full border-separate border-spacing-0 table-fixed select-none";
  const tableWideStyle = { width: totalTableWidth, minWidth: totalTableWidth };
  const headerBarClassName = mgPrototype
    ? "emp-table-header-bar emp-table-header-bar--in-scroll shrink-0 overflow-x-hidden overflow-y-hidden"
    : "emp-table-header-bar shrink-0 overflow-x-hidden overflow-y-hidden";
  const headerBarStyle = !mgPrototype && scrollbarCompensation > 0
    ? { paddingRight: `${scrollbarCompensation}px` }
    : undefined;

  const tableHeader = (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {renderSelectHeaderCell()}
        {renderHeaderCells()}
      </TableRow>
    </TableHeader>
  );

  const tableHeaderBar = (
    <div ref={headerScrollRef} className={headerBarClassName} style={headerBarStyle}>
      <div className="block w-max min-w-full" style={tableWideStyle}>
        <Table style={tableWideStyle} className={tableClass}>
          {tableColGroup}
          {tableHeader}
        </Table>
      </div>
    </div>
  );

  const tableBodyContent = isLoadingEmpresas ? (
    <Table style={tableWideStyle} className={bodyTableClass}>
      {tableColGroup}
      {mgPrototype ? tableHeader : null}
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={colunasOrdenadas.length + 1}
            className="emp-td text-center py-8 text-xs text-slate-500"
            role="status"
            aria-live="polite"
          >
            Carregando empresas...
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ) : empresasOrdenadas.length === 0 ? (
    <Table style={tableWideStyle} className={bodyTableClass}>
      {tableColGroup}
      {mgPrototype ? tableHeader : null}
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={colunasOrdenadas.length + 1}
            className="emp-td text-center py-8 text-xs text-slate-400"
            role="status"
            aria-live="polite"
          >
            Nenhuma empresa encontrada
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ) : (
    <>
      <EmpVirtualTableBody
        scrollRef={scrollContainerRef}
        rows={linhasExibidas}
        enabled={!isLoadingEmpresas}
        totalTableWidth={totalTableWidth}
        bodyTableClass={bodyTableClass}
        colGroup={tableColGroup}
        tableHeader={mgPrototype ? tableHeader : null}
        colCount={colunasOrdenadas.length + 1}
        renderRow={renderVirtualTableRow}
        getRowClassName={(row, rowIndex) =>
          getRowBgClass(rowIndex, selectedItemsSet.has(row?.id))
        }
        getRowProps={getVirtualRowProps}
        onRowClick={handleRowClick}
      />
      {infiniteMode && isLoadingMoreRows ? <div className="py-1" aria-hidden="true" /> : null}
    </>
  );

  return (
    <div className={`emp-table-root flex h-full min-h-0 flex-1 flex-col overflow-hidden select-none${mgPrototype ? " mg-grid-wrapper" : ""}`}>
      <MgConfigBackdrop
        open={isColumnOverlayOpen}
        onClose={closeColumnOverlays}
        ariaLabel="Fechar opções da coluna"
      />

      <MgPortalPanel
        open={Boolean(columnMenuColumn)}
        panelRef={columnMenuPanelRef}
        panelClassName="dropdown-menu mg-cards-config-menu open emp-col-popup-menu"
        style={columnMenuPanelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          role="menu"
          tabIndex={-1}
          onKeyDown={handleColumnMenuKeyDown}
        >
          <div className="mg-cards-config-menu__list">
            {columnMenuItems.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mg-cards-config-menu__item emp-col-popup-menu__item${item.active ? " is-active" : ""}`}
                  disabled={item.disabled}
                  onClick={item.onClick}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="mg-cards-config-menu__label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </MgPortalPanel>

      <ErpFilterPopover
        open={Boolean(filterColumn && menuFiltroAberto)}
        panelRef={filterPanelRef}
        style={filterPanelStyle}
        columnLabel={filterColumnLabel}
        filterType={filterMeta?.filterType || "text"}
        draft={filterDraft}
        listOptions={filterListOptions}
        enumOptions={filterEnumOptions}
        searchQuery={buscaFiltroMenu}
        onSearchQueryChange={setBuscaFiltroMenu}
        searchLoading={filterSearchLoading}
        hasMoreOptions={hasMoreFilterOptions}
        loadingMoreOptions={loadingMoreFilterOptions}
        onLoadMoreOptions={handleLoadMoreFilterOptions}
        showSortSection={Boolean(filterColumn && filterDraft)}
        hasActiveFilter={Boolean(menuFiltroAberto && hasActiveFilter(menuFiltroAberto))}
        onSortAsc={() => {
          applySortToColumn(menuFiltroAberto, "asc");
          closeColumnOverlays();
        }}
        onSortDesc={() => {
          applySortToColumn(menuFiltroAberto, "desc");
          closeColumnOverlays();
        }}
        onClearColumnFilter={() => {
          clearColumnFilter(menuFiltroAberto);
          if (filterColumn) {
            setFiltroTemp({
              colunaId: menuFiltroAberto,
              draft: createDefaultColumnFilter(getColumnFilterType(filterColumn)),
            });
          }
          setBuscaFiltroMenu("");
        }}
        onDraftChange={(nextDraft) => updateFilterDraft(nextDraft)}
        onCancel={closeColumnOverlays}
        onApply={(appliedDraft) => {
          setValoresFiltro(menuFiltroAberto, appliedDraft || filterDraft);
          closeColumnOverlays();
        }}
      />

      <div
        ref={tableStageRef}
        className={`emp-table-stage relative min-h-0 ${isColumnOverlayOpen ? "overflow-visible" : "overflow-hidden"}`}
      >
        <div className="emp-table-shell flex min-h-0 flex-col overflow-hidden bg-white">
          {mgPrototype ? (
            <ErpScrollNav
              ref={scrollContainerRef}
              tabIndex={0}
              onKeyDown={handleTableKeyDown}
              className="emp-table-body-scroll relative min-h-0 flex-1 outline-none mg-grid-scroll"
              viewportClassName="overflow-auto"
              aria-busy={isLoadingEmpresas || isFetchingEmpresas}
            >
              <div className="block w-max min-w-full" style={tableWideStyle}>
                {tableBodyContent}
              </div>
            </ErpScrollNav>
          ) : (
            <>
              {tableHeaderBar}
              <ErpScrollNav
                ref={scrollContainerRef}
                tabIndex={0}
                onKeyDown={handleTableKeyDown}
                className="emp-table-body-scroll relative min-h-0 flex-1 outline-none"
                viewportClassName="overflow-auto"
                aria-busy={isLoadingEmpresas || isFetchingEmpresas}
              >
                <div className="block w-max min-w-full" style={tableWideStyle}>
                  {tableBodyContent}
                </div>
              </ErpScrollNav>
            </>
          )}
        </div>
        <div className="emp-table-bottom-dock">
          {hasTotalRow ? (
            <div
              ref={footerScrollRef}
              className="emp-table-footer-bar overflow-x-hidden overflow-y-hidden"
              style={{
                paddingRight: scrollbarCompensation > 0 ? `${scrollbarCompensation}px` : undefined,
              }}
            >
              <div
                className="block w-max min-w-full"
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
              >
                <Table
                  style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                  className="emp-table-pro emp-table-pro-footer w-full border-separate border-spacing-0 table-fixed select-none"
                >
                  {tableColGroup}
                  <TableFooter className="emp-table-footer border-0 font-semibold [&>tr]:border-0">
                    <TableRow className="emp-total-row border-0 hover:bg-transparent">
                      {renderSelectFooterCell()}
                      {renderTotalCells()}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          ) : null}
          {!infiniteMode ? (
            <EmpTablePagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isBusy={isFetchingEmpresas}
            />
          ) : (
            <div className="mg-records-summary border-t border-slate-200 px-3 py-2 text-xs">
              <div className="mg-records-summary__row">
                <div className="mg-records-summary__counts grid grid-cols-2 gap-x-3 gap-y-1.5 md:grid-cols-4 md:gap-2">
                  <span className="mg-records-summary__item truncate text-left">Selecionados: {summarySelected}</span>
                  <span className="mg-records-summary__item truncate text-left">Listados: {summaryListed}</span>
                  <span className="mg-records-summary__item truncate text-left">Filtrados: {summaryFiltered}</span>
                  <span className="mg-records-summary__item truncate text-left">Totais: {summaryTotal}</span>
                </div>
                <EmpLoadBatchControls
                  loadBatchSize={loadBatchSize}
                  onLoadBatchSizeChange={onLoadBatchSizeChange}
                  onLoadMore={onLoadMoreRows}
                  hasMoreRows={hasMoreRows}
                  isLoadingMoreRows={isLoadingMoreRows}
                  loadedRowsLimitReached={loadedRowsLimitReached}
                  maxLoadedRows={maxLoadedRows}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <EmpConfiguracaoColunasDialog
        open={showConfigColunas}
        onOpenChange={setShowConfigColunas}
        moduleTitle={moduleTitle}
        colunasDisponiveis={colunasDisponiveis}
        colunasVisiveis={colunasVisiveis}
        colunasOrdem={colunasOrdem}
        frozenColumnCount={frozenColumnCount}
        onChange={handleColumnLayoutChange}
        getRestoreDefaults={getRestoreColumnLayout}
      />
    </div>
  );
}