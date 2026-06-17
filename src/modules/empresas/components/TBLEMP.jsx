import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Filter,
  Loader2,
  MoreVertical,
  PanelLeft,
  ScanLine,
  Search,
  Trash2,
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
import { EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import {
  loadColumnOrder,
  loadVisibleColumns,
} from "@/framework/cadastro/tables/empColumnLayout";
import { loadSavedVisibleColumns, mergeEffectiveColumnLayout } from "@/modules/empresas/utils/empTableColumnCatalog";
import {
  AGGR_KEY,
  AUTO_FIT_MEASURE_LIMIT,
  COLUNAS_BASE,
  FILTERS_KEY,
  FILTER_POPOVER_WIDTH,
  FROZEN_KEY,
  MAX_AUTO_FIT_WIDTH,
  MIN_COL_WIDTH,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  PINNED_RIGHT_KEY,
  ROW_DBLCLICK_OPEN_MS,
  ROW_DBLCLICK_PAIR_MS,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
  formatHeaderLabel,
  getMinWidth,
} from "./tblEmp.constants";
import {
  createDefaultColumnFilter,
  evaluateColumnFilter,
  getColumnFilterType,
  matchesFilterOptionContains,
  normalizeLegacyColumnFilter,
  parseDateFilterValue,
} from "./tblEmp.filters";
import { buildGroupedRows, pruneCollapsedGroupKeys } from "./tblEmp.grouping";
import MgPortalPanel from "@/modules/empresas/layout/MgPortalPanel";
import MgConfigBackdrop from "@/modules/empresas/layout/MgConfigBackdrop";
import { useMgPanelPosition } from "@/modules/empresas/layout/useMgPanelPosition";

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

function ColumnMenuStatusCheck({ checked }) {
  return (
    <span
      className={`mg-cards-config-menu__check emp-col-popup-menu__status-check${checked ? " is-checked" : ""}`}
      aria-hidden="true"
    >
      {checked ? <Check className="mg-cards-config-menu__check-icon" strokeWidth={2.5} /> : null}
    </span>
  );
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

const readStorageJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

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
  onServerPageChange = null,
  onServerPageSizeChange = null,
  onServerColumnFiltersChange = null,
  onServerSortChange = null,
  onRequestDistinctColumnValues = null,
  infiniteMode = false,
  hasMoreRows = false,
  isLoadingMoreRows = false,
  onLoadMoreRows = null,
  selectedCount,
  listedCount,
  filteredCount,
  totalCount,
  moduleTitle = "Cadastro",
  mgPrototype = false,
  onColumnsInUseChange,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = readStorageJSON(SORT_KEY, null);
    if (Array.isArray(saved) && saved.length > 0) {
      const first = saved.find((item) => item?.key);
      if (first?.key) {
        return [{ key: first.key, direction: first.direction === "desc" ? "desc" : "asc" }];
      }
    }
    if (saved?.key) {
      return [{ key: saved.key, direction: saved.direction === "desc" ? "desc" : "asc" }];
    }
    return [{ key: "codempresa", direction: "asc" }];
  });
  const [filtrosColunas, setFiltrosColunas] = useState(() => {
    const saved = readStorageJSON(FILTERS_KEY, {});
    if (!saved || typeof saved !== "object") return {};
    return saved;
  });
  const isMobile = useIsMobile();

  const [columnWidths, setColumnWidths] = useState(() => { const def = Object.fromEntries(COLUNAS_BASE.map((c) => [c.id, c.width || 160])); const saved = localStorage.getItem(WIDTHS_KEY); if (!saved) return def; try { return { ...def, ...JSON.parse(saved) }; } catch { return def; } });
  const [frozenColumnCount, setFrozenColumnCount] = useState(0);
  const [pinnedRightColumnIds, setPinnedRightColumnIds] = useState([]);
  const [colunasOrdem, setColunasOrdem] = useState(() => loadColumnOrder(ORDER_KEY, COLUNAS_BASE));
  const [colunasVisiveis, setColunasVisiveis] = useState(() => loadVisibleColumns(VISIBLE_KEY, COLUNAS_BASE));
  const [layoutAggregationConfig, setLayoutAggregationConfig] = useState(() => { const s = localStorage.getItem(AGGR_KEY); if (!s) return {}; try { return JSON.parse(s); } catch { return {}; } });

  useEffect(() => {
    const mergedOrder = loadColumnOrder(ORDER_KEY, COLUNAS_BASE);
    const mergedVisible = loadVisibleColumns(VISIBLE_KEY, COLUNAS_BASE);
    const savedOrder = localStorage.getItem(ORDER_KEY);
    const savedVisible = localStorage.getItem(VISIBLE_KEY);
    let shouldPersist = false;

    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (!parsed.includes("id_global") || parsed[0] !== "id_global") shouldPersist = true;
      } catch {
        shouldPersist = true;
      }
    }

    if (savedVisible) {
      try {
        const parsed = JSON.parse(savedVisible);
        if (!parsed.includes("id_global")) shouldPersist = true;
      } catch {
        shouldPersist = true;
      }
    }

    if (shouldPersist) {
      localStorage.setItem(ORDER_KEY, JSON.stringify(mergedOrder));
      localStorage.setItem(VISIBLE_KEY, JSON.stringify(mergedVisible));
      setColunasOrdem(mergedOrder);
      setColunasVisiveis(mergedVisible);
    }
  }, []);

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
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const debouncedBuscaFiltroMenu = useDebouncedValue(buscaFiltroMenu, 180);
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, draft: null });
  const [autoFitActiveColumns, setAutoFitActiveColumns] = useState({});
  const [groupByColumnIds, setGroupByColumnIds] = useState([]);
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState({});
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
      default: false,
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

  useEffect(() => {
    if (!colunasDisponiveis.length) return;
    const savedOrdem = loadColumnOrder(ORDER_KEY, colunasDisponiveis);
    const savedVisiveis = loadSavedVisibleColumns(VISIBLE_KEY);
    const { ordem, visiveis } = mergeEffectiveColumnLayout(
      colunasDisponiveis,
      savedOrdem,
      savedVisiveis
    );
    const ordemChanged = !haveSameIds(colunasOrdem, ordem);
    const visiveisChanged = !haveSameIds(colunasVisiveis, visiveis);
    if (!ordemChanged && !visiveisChanged) return;

    setColunasOrdem(ordem);
    setColunasVisiveis(visiveis);
    localStorage.setItem(ORDER_KEY, JSON.stringify(ordem));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis));
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  }, [colunasDisponiveis, colunasOrdem, colunasVisiveis]);

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
    setColumnMenuAnchor(null);
    setMenuFiltroAberto(null);
    overlayAnchorRef.current = null;
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId: null, draft: null });
  }, []);

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

  useEffect(() => { localStorage.setItem(WIDTHS_KEY, JSON.stringify(columnWidths)); }, [columnWidths]);
  useEffect(() => { localStorage.setItem(FROZEN_KEY, "0"); }, [frozenColumnCount]);
  useEffect(() => { localStorage.setItem(PINNED_RIGHT_KEY, JSON.stringify(pinnedRightColumnIds)); }, [pinnedRightColumnIds]);
  useEffect(() => { localStorage.setItem(FILTERS_KEY, JSON.stringify(filtrosColunas)); }, [filtrosColunas]);
  useEffect(() => { localStorage.setItem(SORT_KEY, JSON.stringify(sortConfig)); }, [sortConfig]);
  useEffect(() => { const s = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s ? JSON.parse(s) : {}); } catch { setLayoutAggregationConfig({}); } const h = () => { const s2 = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s2 ? JSON.parse(s2) : {}); } catch { setLayoutAggregationConfig({}); } }; window.addEventListener("storage", h); window.addEventListener("emp-layout-updated", h); return () => { window.removeEventListener("storage", h); window.removeEventListener("emp-layout-updated", h); }; }, []);

  useEffect(() => { const onMove = (e) => { if (!dragRef.current) return; if (e.cancelable) e.preventDefault(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const { columnId, startX, startWidth, minWidth } = dragRef.current; setColumnWidths((p) => ({ ...p, [columnId]: Math.round(Math.max(minWidth || MIN_COL_WIDTH, startWidth + (cx - startX))) })); }; const onUp = () => { if (!dragRef.current) return; dragRef.current = null; setResizeColumnId(null); document.body.style.cursor = ""; document.body.style.userSelect = ""; }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onUp); return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); }; }, []);

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
    setAutoFitActiveColumns((prev) => ({ ...prev, [col.id]: false }));
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

  const handleColumnLayoutChange = ({ visiveis, ordem }) => {
    setColunasVisiveis(visiveis);
    setColunasOrdem(ordem);
    setFrozenColumnCount(0);
    setPinnedRightColumnIds((prev) => {
      const filtered = prev.filter((id) => visiveis.includes(id));
      if (filtered.length <= 1) return filtered;
      return [filtered[filtered.length - 1]];
    });
    setGroupByColumnIds((prev) => prev.filter((id) => visiveis.includes(id)));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis));
    localStorage.setItem(ORDER_KEY, JSON.stringify(ordem));
    localStorage.setItem(FROZEN_KEY, "0");
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  };
  const handleResetColumnLayout = () => { const def = colunasDisponiveis.filter((c) => !c.fixo); handleColumnLayoutChange({ visiveis: def.filter((c) => c.default).map((c) => c.id), ordem: def.map((c) => c.id) }); };

  const colunasTodasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && !c.fixo), [colunasOrdem, colunasDisponiveis]);
  useEffect(() => { setFrozenColumnCount(0); }, [colunasOrdenadas.length]);
  useEffect(() => {
    setPinnedRightColumnIds((prev) => {
      const filtered = prev.filter((id) => colunasOrdenadas.some((col) => col.id === id));
      if (filtered.length <= 1) return filtered;
      return [filtered[filtered.length - 1]];
    });
  }, [colunasOrdenadas]);

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
  const totalTableWidth = useMemo(() => Math.max(isMobile ? 720 : 900, colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0)), [colunasOrdenadas, columnPixelWidths, isMobile]);
  const frozenOffsets = useMemo(() => { let left = 0; return colunasOrdenadas.reduce((acc, c, i) => { if (i < frozenColumnCount) { acc[c.id] = left; left += columnPixelWidths[c.id] || 160; } return acc; }, {}); }, [colunasOrdenadas, columnPixelWidths, frozenColumnCount]);
  const pinnedRightOrderedIds = useMemo(
    () => colunasOrdenadas.map((col) => col.id).filter((id) => pinnedRightColumnIds.includes(id)),
    [colunasOrdenadas, pinnedRightColumnIds]
  );
  const pinnedRightOffsets = useMemo(() => {
    let right = 0;
    const next = {};
    for (let i = pinnedRightOrderedIds.length - 1; i >= 0; i -= 1) {
      const columnId = pinnedRightOrderedIds[i];
      next[columnId] = right;
      right += columnPixelWidths[columnId] || 160;
    }
    return next;
  }, [columnPixelWidths, pinnedRightOrderedIds]);
  const lastPinnedLeftId = frozenColumnCount > 0 ? colunasOrdenadas[frozenColumnCount - 1]?.id : null;
  const firstPinnedRightId = pinnedRightOrderedIds.length > 0 ? pinnedRightOrderedIds[0] : null;
  const tableColGroup = useMemo(
    () => (
      <colgroup>
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

  const empresaPassaFiltros = useCallback((emp, excludeColId = null) => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    if (termo) {
      const m = colunasDisponiveis.filter((c) => !c.fixo).some((col) => String(getFieldValue(emp, col.id) || "").toLowerCase().includes(termo));
      if (!m) return false;
    }
    return colunasDisponiveis.filter((c) => !c.fixo).every((col) => {
      if (excludeColId && col.id === excludeColId) return true;
      const draft = getNormalizedFilterDraft(col.id, col);
      if (!draft) return true;
      const hasListValues = Array.isArray(draft.values) && draft.values.length > 0;
      const hasPrimaryValue = draft.value !== null && draft.value !== undefined && String(draft.value).trim() !== "";
      const hasSecondaryValue = draft.valueTo !== null && draft.valueTo !== undefined && String(draft.valueTo).trim() !== "";
      if (!hasListValues && !hasPrimaryValue && !hasSecondaryValue) return true;
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
    if (serverMode && !hasSearch && !hasAnyFilter) return empresas;
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

  const columnOptions = useMemo(() => {
    if (!menuFiltroAberto) return {};
    const col = colunasDisponiveis.find((column) => column.id === menuFiltroAberto);
    if (!col || col.fixo) return {};
    const source = empresas.filter((emp) => empresaPassaFiltros(emp, menuFiltroAberto));
    const items = [
      ...new Set(
        source
          .map((emp) => getFieldValue(emp, col.id))
          .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    return { [col.id]: items };
  }, [colunasDisponiveis, empresas, filtrosColunas, searchTerm, menuFiltroAberto, empresaPassaFiltros, getFieldValue]);

  const hasActiveFilter = (id) => {
    const value = filtrosColunas[id];
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value !== "object") return false;
    const hasList = Array.isArray(value.values) && value.values.length > 0;
    const hasValue = value.value !== null && value.value !== undefined && String(value.value).trim() !== "";
    const hasValueTo = value.valueTo !== null && value.valueTo !== undefined && String(value.valueTo).trim() !== "";
    return hasList || hasValue || hasValueTo;
  };
  const getValoresFiltro = (id, col) => getNormalizedFilterDraft(id, col) || createDefaultColumnFilter(getColumnFilterType(col));
  const setValoresFiltro = (id, draft) =>
    setFiltrosColunas((prev) => {
      const next = { ...prev };
      const hasList = Array.isArray(draft?.values) && draft.values.length > 0;
      const hasValue = draft?.value !== null && draft?.value !== undefined && String(draft.value).trim() !== "";
      const hasValueTo = draft?.valueTo !== null && draft?.valueTo !== undefined && String(draft.valueTo).trim() !== "";
      if (!hasList && !hasValue && !hasValueTo) delete next[id];
      else next[id] = draft;
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

  const groupedColumns = useMemo(
    () =>
      groupByColumnIds
        .map((columnId) => colunasDisponiveisById.get(columnId))
        .filter(Boolean),
    [groupByColumnIds, colunasDisponiveisById]
  );

  const groupedResult = useMemo(
    () =>
      buildGroupedRows({
        items: empresasPaginadas,
        groupedColumns,
        collapsedGroupKeys,
        getFieldValue,
        sortConfig,
      }),
    [empresasPaginadas, groupedColumns, collapsedGroupKeys, getFieldValue, sortConfig]
  );

  const linhasExibidas = groupedResult.rows;
  const groupKeysSignature = useMemo(
    () => groupedResult.groupKeys.join("||"),
    [groupedResult.groupKeys]
  );

  useEffect(() => {
    setCollapsedGroupKeys((previous) => {
      const nextState = pruneCollapsedGroupKeys(previous, groupedResult.groupKeys);
      const prevKeys = Object.keys(previous || {});
      const nextKeys = Object.keys(nextState);
      if (prevKeys.length !== nextKeys.length) return nextState;
      const changed = prevKeys.some((groupKey) => !Object.prototype.hasOwnProperty.call(nextState, groupKey));
      return changed ? nextState : previous;
    });
  }, [groupKeysSignature, groupedResult.groupKeys]);

  const getRowBgClass = useCallback((index, selected) => {
    if (selected) return "emp-row-selected";
    return "emp-row-even";
  }, []);
  const firstGroupingCellColumnId = colunasOrdenadas[0]?.id || null;

  const renderVirtualTableRow = useCallback(
    (rowEntry, virtualRowIndex) => {
      if (rowEntry?.__type === "group") {
        const isCollapsed = Boolean(collapsedGroupKeys[rowEntry.groupKey]);
        return colunasOrdenadas.map((col, colIndex) => {
          const isPinnedLeft = colIndex < frozenColumnCount;
          const isPinnedRight = pinnedRightColumnIds.includes(col.id);
          const isPinned = isPinnedLeft || isPinnedRight;
          const hasRightShadow = col.id === lastPinnedLeftId;
          const hasLeftShadow = col.id === firstPinnedRightId;
          const isPrimaryGroupCell = col.id === firstGroupingCellColumnId;
          return (
            <TableCell
              key={`group-cell:${rowEntry.groupKey}:${col.id}`}
              style={{
                left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
                right: isPinnedRight ? pinnedRightOffsets[col.id] : undefined,
              }}
              className={`emp-td emp-group-row-cell py-0 text-left text-[12px] align-middle select-none ${
                isPinned ? "sticky z-20" : ""
              } ${hasRightShadow ? "emp-pinned-border-right" : ""} ${hasLeftShadow ? "emp-pinned-shadow-left" : ""}`}
            >
              {isPrimaryGroupCell ? (
                <div className="emp-group-row-content" style={{ paddingLeft: `${(rowEntry.level || 0) * 14}px` }}>
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="emp-group-row-label">{rowEntry.label}</span>
                  <span className="emp-group-row-count">({rowEntry.count})</span>
                </div>
              ) : (
                <span aria-hidden="true">&nbsp;</span>
              )}
            </TableCell>
          );
        });
      }
      const emp = rowEntry?.emp ?? rowEntry;
      const isSelected = selectedItemsSet.has(emp.id);
      const rowClass = getRowBgClass(virtualRowIndex, isSelected);
      return colunasOrdenadas.map((col, colIndex) => {
        const isPinnedLeft = colIndex < frozenColumnCount;
        const isPinnedRight = pinnedRightColumnIds.includes(col.id);
        const isPinned = isPinnedLeft || isPinnedRight;
        const hasRightShadow = col.id === lastPinnedLeftId;
        const hasLeftShadow = col.id === firstPinnedRightId;
        return (
          <TableCell
            key={`${emp.id}-${col.id}`}
            style={{
              left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
              right: isPinnedRight ? pinnedRightOffsets[col.id] : undefined,
            }}
            className={`emp-td py-0 text-left text-[12px] align-middle whitespace-nowrap overflow-hidden select-none ${rowClass} ${isPinned ? "sticky z-20" : ""} ${hasRightShadow ? "emp-pinned-border-right" : ""} ${hasLeftShadow ? "emp-pinned-shadow-left" : ""} ${col.id === "id_global" ? "text-[#64748B] font-medium" : ""} ${isSelected && col.id !== "id_global" ? "font-semibold" : ""}`}
            title={String(getFieldValue(emp, col.id) ?? "")}
          >
            {getFieldValue(emp, col.id)}
          </TableCell>
        );
      });
    },
    [
      collapsedGroupKeys,
      colunasOrdenadas,
      frozenColumnCount,
      frozenOffsets,
      firstGroupingCellColumnId,
      pinnedRightColumnIds,
      pinnedRightOffsets,
      firstPinnedRightId,
      lastPinnedLeftId,
      getFieldValue,
      getRowBgClass,
      selectedItemsSet,
    ]
  );

  useEffect(() => {
    localStorage.setItem(PAGE_SIZE_KEY, String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    if (!serverMode) return;
    onServerColumnFiltersChange?.(filtrosColunas);
  }, [serverMode, filtrosColunas, onServerColumnFiltersChange]);

  useEffect(() => {
    if (!serverMode) return;
    const primarySort = Array.isArray(sortConfig) && sortConfig.length > 0
      ? sortConfig[0]
      : { key: "codempresa", direction: "asc" };
    onServerSortChange?.({
      key: primarySort.key || "codempresa",
      direction: primarySort.direction === "desc" ? "desc" : "asc",
    });
  }, [serverMode, sortConfig, onServerSortChange]);

  useEffect(() => {
    if (!serverMode) return;
    const signature = JSON.stringify({ filtrosColunas, searchTerm, pageSize, sortConfig });
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

  const handleDisplayRowClick = (row, event) => {
    if (row?.__type === "group") {
      setCollapsedGroupKeys((prev) => ({
        ...prev,
        [row.groupKey]: !prev[row.groupKey],
      }));
      return;
    }
    handleRowClick(row?.emp || row, event);
  };

  const getVirtualRowProps = useCallback(
    (row) => {
      if (row?.__type === "group") {
        return {
          role: "button",
          tabIndex: 0,
          "aria-expanded": !collapsedGroupKeys[row.groupKey],
          "aria-label": `Alternar grupo ${row.label}`,
          onKeyDown: (event) => {
            const isExpanded = !collapsedGroupKeys[row.groupKey];
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleDisplayRowClick(row, event);
              return;
            }
            if (event.key === "ArrowRight" && !isExpanded) {
              event.preventDefault();
              handleDisplayRowClick(row, event);
              return;
            }
            if (event.key === "ArrowLeft" && isExpanded) {
              event.preventDefault();
              handleDisplayRowClick(row, event);
            }
          },
        };
      }
      const emp = row?.emp || row;
      return {
        "aria-selected": selectedItemsSet.has(emp?.id),
      };
    },
    [collapsedGroupKeys, handleDisplayRowClick, selectedItemsSet]
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
        trigger?.contains(event.target)
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
      setSelectedItems(empresasOrdenadas.map((e) => e.id));
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (selectedItemsRef.current.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      const navegaveis = linhasExibidas
        .map((item) => item?.emp || item)
        .filter((item) => item?.id);
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
      setSelectedItems([nextRecord.id]);
      requestAnimationFrame(() => {
        const body = scrollContainerRef.current;
        if (!body) return;
        const visibleIndex = linhasExibidas.findIndex((item) => (item?.emp || item)?.id === nextRecord.id);
        const row = body.querySelector(`.emp-table-data-row[data-index="${visibleIndex}"]`);
        if (row instanceof HTMLElement) {
          row.scrollIntoView({ block: "nearest" });
          return;
        }
        const maxTop = Math.max(0, body.scrollHeight - body.clientHeight);
        body.scrollTo({
          top: Math.min(Math.max(0, visibleIndex) * EMP_TABLE_ROW_HEIGHT, maxTop),
          behavior: "auto",
        });
      });
      return;
    }

    if (e.key === "Enter") {
      if (selectedItemsRef.current.length === 0) return;
      const anchorId =
        (lastSelectedIdRef.current && selectedItemsRef.current.includes(lastSelectedIdRef.current))
          ? lastSelectedIdRef.current
          : selectedItemsRef.current[selectedItemsRef.current.length - 1];
      const selectedRecord = linhasExibidas
        .map((item) => item?.emp || item)
        .find((item) => item?.id === anchorId);
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
      const nextCompensation = Math.max(0, body.offsetWidth - body.clientWidth);
      if (Math.abs(scrollbarCompensationRef.current - nextCompensation) >= 1) {
        scrollbarCompensationRef.current = nextCompensation;
        setScrollbarCompensation(nextCompensation);
      }
      if (footer) footer.scrollLeft = left;
      if (header && !mgPrototype) header.scrollLeft = left;
    };
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncHorizontalScroll)
        : null;
    resizeObserver?.observe(body);
    body.addEventListener("scroll", syncHorizontalScroll, { passive: true });
    syncHorizontalScroll();
    return () => {
      body.removeEventListener("scroll", syncHorizontalScroll);
      resizeObserver?.disconnect();
    };
  }, [colunasOrdenadas, columnWidths, agregacoes, mgPrototype]);

  const loadMoreLockRef = useRef(false);

  useEffect(() => {
    if (!infiniteMode || !serverMode || typeof onLoadMoreRows !== "function") return undefined;
    const body = scrollContainerRef.current;
    if (!body) return undefined;

    if (!isLoadingMoreRows) {
      loadMoreLockRef.current = false;
    }

    const maybeLoadMore = () => {
      if (!hasMoreRows || isLoadingMoreRows || isLoadingEmpresas) return;
      const distanceToBottom = body.scrollHeight - body.scrollTop - body.clientHeight;
      if (distanceToBottom > 320 || loadMoreLockRef.current) return;
      loadMoreLockRef.current = true;
      onLoadMoreRows();
    };

    body.addEventListener("scroll", maybeLoadMore, { passive: true });
    maybeLoadMore();
    return () => body.removeEventListener("scroll", maybeLoadMore);
  }, [
    infiniteMode,
    serverMode,
    hasMoreRows,
    isLoadingMoreRows,
    isLoadingEmpresas,
    onLoadMoreRows,
    empresasPaginadas.length,
  ]);

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
        setAutoFitActiveColumns((previous) => ({ ...previous, [col.id]: true }));
      }
      setResizeColumnId(null);
    },
    [calculateAutoFitWidth]
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
    setPinnedRightColumnIds((prev) => prev.filter((id) => id !== col.id));
    setGroupByColumnIds((prev) => prev.filter((id) => id !== col.id));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(nextVisiveis));
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
    closeColumnOverlays();
  };

  const isColumnFrozenAtIndex = useCallback(
    (columnIndex) => columnIndex >= 0 && columnIndex < frozenColumnCount,
    [frozenColumnCount]
  );

  const isColumnFrozenById = useCallback(
    (columnId) => {
      const columnIndex = colunasOrdenadas.findIndex((column) => column.id === columnId);
      return isColumnFrozenAtIndex(columnIndex);
    },
    [colunasOrdenadas, isColumnFrozenAtIndex]
  );

  const applySortToColumn = (columnId, direction) => {
    if (isColumnFrozenById(columnId)) return;
    const nextDirection = direction === "desc" ? "desc" : "asc";
    setSortConfig([{ key: columnId, direction: nextDirection }]);
  };

  const toggleSortForColumn = useCallback((columnId) => {
    if (isColumnFrozenById(columnId)) return;
    setSortConfig((previous) => {
      const currentRule = Array.isArray(previous) ? previous.find((rule) => rule.key === columnId) : null;
      const nextDirection = currentRule?.direction === "asc" ? "desc" : "asc";
      return [{ key: columnId, direction: nextDirection }];
    });
  }, [isColumnFrozenById]);

  useEffect(() => {
    if (frozenColumnCount <= 0) return;
    setSortConfig((previous) => {
      const currentRule = Array.isArray(previous) ? previous.find((rule) => rule?.key) : null;
      if (!currentRule?.key) return previous;
      const columnIndex = colunasOrdenadas.findIndex((column) => column.id === currentRule.key);
      if (!isColumnFrozenAtIndex(columnIndex)) return previous;
      const fallbackColumn = colunasOrdenadas[frozenColumnCount];
      if (!fallbackColumn) return previous;
      return [{ key: fallbackColumn.id, direction: "asc" }];
    });
  }, [colunasOrdenadas, frozenColumnCount, isColumnFrozenAtIndex]);

  const togglePinColumnLeft = useCallback((columnIndex) => {
    setFrozenColumnCount((previous) => (previous === columnIndex + 1 ? 0 : columnIndex + 1));
    closeColumnOverlays();
  }, [closeColumnOverlays]);

  const buildColumnMenuItems = (col, colIndex) => [
    {
      id: "filter",
      label: "Abrir filtro avançado",
      Icon: Filter,
      active: hasActiveFilter(col.id),
      onClick: () => applyQuickColumnFilter(col),
    },
    {
      id: "filter-clear",
      label: "Limpar filtro",
      Icon: X,
      disabled: !hasActiveFilter(col.id),
      onClick: () => {
        clearColumnFilter(col.id);
        closeColumnOverlays();
      },
    },
    {
      id: "auto-fit",
      label: "Auto ajustar",
      Icon: ScanLine,
      active: Boolean(autoFitActiveColumns[col.id]),
      showStatusCheck: true,
      onClick: () => {
        if (autoFitActiveColumns[col.id]) {
          setAutoFitActiveColumns((previous) => ({ ...previous, [col.id]: false }));
        } else {
          autoFitColumnWidth(col, { keepActive: true });
        }
        closeColumnOverlays();
      },
    },
    {
      id: "pin-column-left",
      label: colIndex < frozenColumnCount ? "Descongelar coluna" : "Congelar coluna",
      Icon: PanelLeft,
      active: colIndex < frozenColumnCount,
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
      const isPinnedRight = pinnedRightColumnIds.includes(col.id);
      const isPinned = isPinnedLeft || isPinnedRight;
      const isResizing = resizeColumnId === col.id;
      const isMenuOpen = columnMenuAnchor?.columnId === col.id;
      const hasColumnFilter = hasActiveFilter(col.id);
      const sortRule = Array.isArray(sortConfig) ? sortConfig.find((rule) => rule.key === col.id) : null;
      const isSortActive = !isPinnedLeft && Boolean(sortRule);
      const isAutoFitActive = Boolean(autoFitActiveColumns[col.id]);
      const hasRightShadow = col.id === lastPinnedLeftId;
      const hasLeftShadow = col.id === firstPinnedRightId;
      return (
        <TableHead
          key={col.id}
          style={{
            left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
            right: isPinnedRight ? pinnedRightOffsets[col.id] : undefined,
          }}
          className={`emp-th relative align-middle whitespace-nowrap py-0 select-none cursor-default text-left ${isPinned ? "sticky z-50" : "z-40"} ${hasRightShadow ? "emp-pinned-border-right" : ""} ${hasLeftShadow ? "emp-pinned-shadow-left" : ""}`}
          onDoubleClick={(event) => {
            if (isPinnedLeft) return;
            const interactiveTarget = event.target?.closest?.(
              "button, [role='separator'], .emp-col-resize-handle"
            );
            if (interactiveTarget) return;
            event.preventDefault();
            event.stopPropagation();
            toggleSortForColumn(col.id);
          }}
        >
          <div className="emp-th-label-wrap flex items-center w-full h-full min-w-0 overflow-hidden gap-1">
            <span
              className="emp-th-label flex-1 min-w-0 font-semibold whitespace-nowrap text-left"
              title={formatHeaderLabel(col)}
            >
              {formatHeaderLabel(col)}
            </span>
            {isSortActive ? (
              sortRule?.direction === "desc"
                ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
            ) : null}
            {isAutoFitActive ? (
              <ScanLine className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : null}
            {isPinnedLeft ? (
              <PanelLeft className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : null}
            <button
              type="button"
              ref={(element) => {
                if (element) columnMenuTriggerRefs.current[col.id] = element;
                else delete columnMenuTriggerRefs.current[col.id];
              }}
              className={`emp-th-menu-button${isMenuOpen ? " is-open" : ""}${hasColumnFilter ? " has-filter" : ""}`}
              aria-label={`Abrir menu da coluna ${formatHeaderLabel(col)}`}
              aria-expanded={isMenuOpen}
              onClick={(event) => {
                event.stopPropagation();
                toggleColumnMenu(col.id);
              }}
            >
              <span className="emp-th-menu-icon" aria-hidden="true">
                <MoreVertical className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </button>
            {hasColumnFilter ? (
              <button
                type="button"
                className="emp-th-filter-clear-button"
                aria-label={`Limpar filtro da coluna ${formatHeaderLabel(col)}`}
                onClick={(event) => {
                  event.stopPropagation();
                  clearColumnFilter(col.id);
                }}
              >
                <X className="h-3 w-3" strokeWidth={2.2} />
              </button>
            ) : null}
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
  const filterColumnIndex = menuFiltroAberto
    ? colunasOrdenadas.findIndex((column) => column.id === menuFiltroAberto)
    : -1;
  const isFilterColumnFrozen = isColumnFrozenAtIndex(filterColumnIndex);
  const filterOptions = menuFiltroAberto ? columnOptions[menuFiltroAberto] || [] : [];
  const filterQuery = debouncedBuscaFiltroMenu.trim();
  const filteredFilterOptions = filterQuery
    ? filterOptions.filter((option) => matchesFilterOptionContains(option, filterQuery))
    : filterOptions;
  const filterDraft =
    filterColumn && filtroTemp.colunaId === menuFiltroAberto && filtroTemp.draft
      ? filtroTemp.draft
      : filterColumn
        ? getValoresFiltro(menuFiltroAberto, filterColumn)
        : null;
  const filterSelectedValues = Array.isArray(filterDraft?.values) ? filterDraft.values : [];
  const filterAllVisibleSelected =
    filteredFilterOptions.length > 0 &&
    filteredFilterOptions.every((option) => filterSelectedValues.includes(option));
  const filterColumnLabel = filterColumn ? formatHeaderLabel(filterColumn) : "";
  const filterSearchPending =
    buscaFiltroMenu.trim().toLowerCase() !== debouncedBuscaFiltroMenu.trim().toLowerCase();
  const filterSearchLoading = filterSearchPending;

  const updateFilterDraft = (updater) => {
    if (!filterColumn || !menuFiltroAberto) return;
    const filterType = getColumnFilterType(filterColumn);
    setFiltroTemp((prev) => {
      const baseDraft =
        prev.colunaId === menuFiltroAberto && prev.draft
          ? prev.draft
          : getValoresFiltro(menuFiltroAberto, filterColumn);
      const nextDraft =
        typeof updater === "function" ? updater(baseDraft) : { ...baseDraft, ...updater };
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
      const isPinnedRight = pinnedRightColumnIds.includes(col.id);
      const isPinned = isPinnedLeft || isPinnedRight;
      const hasRightShadow = col.id === lastPinnedLeftId;
      const hasLeftShadow = col.id === firstPinnedRightId;
      return (
        <TableHead
          key={`total-${col.id}`}
          style={{
            left: isPinnedLeft ? frozenOffsets[col.id] : undefined,
            right: isPinnedRight ? pinnedRightOffsets[col.id] : undefined,
          }}
          className={`emp-th relative align-middle whitespace-nowrap py-0 select-none text-left ${isPinned ? "sticky z-50" : "z-40"} ${hasRightShadow ? "emp-pinned-border-right" : ""} ${hasLeftShadow ? "emp-pinned-shadow-left" : ""}`}
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
      <TableRow className="hover:bg-transparent">{renderHeaderCells()}</TableRow>
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
            colSpan={colunasOrdenadas.length}
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
            colSpan={colunasOrdenadas.length}
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
        colCount={colunasOrdenadas.length}
        renderRow={renderVirtualTableRow}
        getRowClassName={(row, rowIndex) =>
          row?.__type === "group"
            ? "emp-group-row"
            : getRowBgClass(rowIndex, selectedItemsSet.has((row?.emp || row)?.id))
        }
        getRowProps={getVirtualRowProps}
        onRowClick={handleDisplayRowClick}
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
                  {item.showStatusCheck ? <ColumnMenuStatusCheck checked={Boolean(item.active)} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </MgPortalPanel>

      <MgPortalPanel
        open={Boolean(filterColumn && menuFiltroAberto)}
        panelRef={filterPanelRef}
        panelClassName="dropdown-menu mg-cards-config-menu open emp-col-filter-popup emp-filter-popover"
        style={filterPanelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {filterColumn && filterDraft ? (
          <>
            <div className="emp-filter-sort-section">
              <div className="px-1 text-[11px] font-semibold text-slate-500">{filterColumnLabel}</div>
              {!isFilterColumnFrozen ? (
                <>
                  <button
                    type="button"
                    className="emp-filter-sort-btn"
                    onClick={() => {
                      applySortToColumn(menuFiltroAberto, "asc");
                      closeColumnOverlays();
                    }}
                  >
                    <ArrowUp className="w-4 h-4 mr-2 shrink-0" />
                    <span>Ordenar A → Z</span>
                  </button>
                  <button
                    type="button"
                    className="emp-filter-sort-btn"
                    onClick={() => {
                      applySortToColumn(menuFiltroAberto, "desc");
                      closeColumnOverlays();
                    }}
                  >
                    <ArrowDown className="w-4 h-4 mr-2 shrink-0" />
                    <span>Ordenar Z → A</span>
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="emp-filter-sort-btn"
                disabled={!hasActiveFilter(menuFiltroAberto)}
                onClick={() => {
                  clearColumnFilter(menuFiltroAberto);
                  closeColumnOverlays();
                }}
              >
                <X className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Limpar Filtro de &apos;{filterColumnLabel}&apos;</span>
              </button>
            </div>

            <div className="emp-filter-body">
              <div className="mg-search-pill-wrap emp-col-filter-popup__search">
                <div className="mg-search-pill emp-col-filter-popup__search-pill" role="search">
                  {filterSearchLoading ? (
                    <Loader2
                      className="mg-search-pill-icon mg-search-pill-icon--loading h-3.5 w-3.5 shrink-0 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Search className="mg-search-pill-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <input
                    type="text"
                    value={buscaFiltroMenu}
                    onChange={(event) => setBuscaFiltroMenu(event.target.value)}
                    placeholder="Pesquisar..."
                    aria-label={`Pesquisar valores de ${filterColumnLabel}`}
                    aria-busy={filterSearchLoading}
                  />
                </div>
              </div>

              <div className="mg-cards-config-menu__list emp-filter-value-list emp-col-filter-popup__options">
                <>
                  <label className="mg-cards-config-menu__item emp-filter-value-list-header">
                    <FilterFieldCheck
                      checked={filterAllVisibleSelected}
                      onChange={(event) =>
                        updateFilterDraft((prev) => {
                          const currentList = Array.isArray(prev.values) ? prev.values : [];
                          const rest = currentList.filter((value) => !filteredFilterOptions.includes(value));
                          return {
                            ...prev,
                            values: event.target.checked
                              ? [...new Set([...rest, ...filteredFilterOptions])]
                              : rest,
                          };
                        })
                      }
                    />
                    <span className="mg-cards-config-menu__label">(Selecionar Tudo)</span>
                  </label>
                  {filteredFilterOptions.map((option) => (
                    <label key={option} className="mg-cards-config-menu__item emp-filter-value-list-item">
                      <FilterFieldCheck
                        checked={filterSelectedValues.includes(option)}
                        onChange={(event) =>
                          updateFilterDraft((prev) => {
                            const currentList = Array.isArray(prev.values) ? prev.values : [];
                            const nextList = event.target.checked
                              ? [...currentList, option]
                              : currentList.filter((value) => value !== option);
                            return { ...prev, values: [...new Set(nextList)] };
                          })
                        }
                      />
                      <span className="mg-cards-config-menu__label truncate" title={option}>
                        {option}
                      </span>
                    </label>
                  ))}
                  {filteredFilterOptions.length === 0 && !filterSearchLoading ? (
                    <div className="mg-search-dropdown__empty">Nenhum valor encontrado.</div>
                  ) : null}
                </>
              </div>
            </div>

            <div className="mg-cards-config-menu__footer mg-search-dropdown__config-footer emp-col-filter-popup__footer">
              <button
                type="button"
                className="ios-btn tb-btn tb-btn-labeled tb-btn-ghost mg-search-dropdown__config-action"
                onClick={closeColumnOverlays}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ios-btn tb-btn tb-btn-labeled tb-btn-green mg-search-dropdown__config-action"
                onClick={() => {
                  setValoresFiltro(menuFiltroAberto, filterDraft);
                  closeColumnOverlays();
                }}
              >
                Filtrar
              </button>
            </div>
          </>
        ) : null}
      </MgPortalPanel>

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
              className="emp-table-body-scroll relative min-h-0 flex-1 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 mg-grid-scroll"
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
                className="emp-table-body-scroll relative min-h-0 flex-1 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
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
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 md:grid-cols-4 md:gap-2">
                <span className="mg-records-summary__item truncate text-left">Selecionados: {summarySelected}</span>
                <span className="mg-records-summary__item truncate text-left">Listados: {summaryListed}</span>
                <span className="mg-records-summary__item truncate text-left">Filtrados: {summaryFiltered}</span>
                <span className="mg-records-summary__item truncate text-left">Totais: {summaryTotal}</span>
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
        onResetDefault={handleResetColumnLayout}
      />
    </div>
  );
}