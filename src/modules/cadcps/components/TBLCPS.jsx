import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import EmpTablePagination, { EMP_PAGE_SIZE_OPTIONS } from "@/framework/cadastro/pagination/EmpTablePagination";
import { useErpTableFullscreen } from "@/shared/layouts/ErpTableFullscreenContext";
import ErpListingTopProgress from "@/shared/components/ErpListingTopProgress";
import { useTableVirtualizer } from "@/shared/hooks/useTableVirtualizer";
import { Filter, FilterX, X, ArrowDownAZ, ArrowUpZA, Check, Loader2 } from "lucide-react";
import ErpScrollViewport from "@/shared/components/ErpScrollViewport";
import { isolateFloatingPanelWheel } from "@/shared/utils/scrollWheelBoundary";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import {
  loadColumnOrder,
  loadVisibleColumns,
} from "@/framework/cadastro/tables/empColumnLayout";
import {
  AGGR_KEY,
  AUTO_FIT_MEASURE_LIMIT,
  COLUNAS_BASE,
  FILTER_ICON_CLASS,
  FILTER_POPOVER_WIDTH,
  FROZEN_KEY,
  MAX_AUTO_FIT_WIDTH,
  MIN_COL_WIDTH,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  ROW_DBLCLICK_OPEN_MS,
  ROW_DBLCLICK_PAIR_MS,
  VISIBLE_KEY,
  WIDTHS_KEY,
  formatDateValue,
  formatHeaderLabel,
  getMinWidth,
} from "./tblCps.constants";
import { tipoLabel } from "@/modules/cadcps/config/cadcpsConstants";
import {
  formatRangeTokenForInput,
  getColumnFilterType,
  getListFilterValues,
  getRangeFilterValues,
  getRangeTokenInputValue,
  normalizeRangeValoresForEdit,
  optionPassaRangeTemp,
  parseDateFilterValue,
  parseNumberFilterValue,
} from "./tblCps.filters";

export default function TBLCPS({
  campos = [],
  isLoadingCampos = false,
  isFetchingCampos = false,
  onEdit,
  searchTerm = "",
  selectedRecordId,
  onSelectionChange,
  onVisibleDataChange,
  onFilteredCamposChange,
  serverPage = 1,
  serverPageSize = 50,
  serverTotal = null,
  onServerPageChange = null,
  onServerPageSizeChange = null,
  onServerSortChange = null,
  onServerColumnFiltersChange = null,
  moduleTitle = "Cadastro",
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "codigo", direction: "asc" });
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, valores: [] });
  const [filtrosColunas, setFiltrosColunas] = useState({});
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const [columnWidths, setColumnWidths] = useState(() => { const def = Object.fromEntries(COLUNAS_BASE.map((c) => [c.id, c.width || 160])); const saved = localStorage.getItem(WIDTHS_KEY); if (!saved) return def; try { return { ...def, ...JSON.parse(saved) }; } catch { return def; } });
  const [frozenColumnCount, setFrozenColumnCount] = useState(() => { const s = Number(localStorage.getItem(FROZEN_KEY) || 0); return Number.isFinite(s) ? s : 0; });
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
  const filterAnchorRefs = useRef({});
  const filterPanelRef = useRef(null);
  const measureCanvasRef = useRef(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState(null);
  const [resizeColumnId, setResizeColumnId] = useState(null);
  const serverMode = typeof onServerPageChange === "function";
  const [currentPage, setCurrentPage] = useState(serverPage || 1);
  const [pageSize, setPageSize] = useState(() => {
    if (serverPageSize) return serverPageSize;
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
    return EMP_PAGE_SIZE_OPTIONS.includes(saved) ? saved : 50;
  });

  const colunasDisponiveis = useMemo(() => {
    const aggByCol = { ...layoutAggregationConfig };
    return COLUNAS_BASE.map((col) => {
      const cfg = aggByCol[col.id];
      if (cfg?.enabled) {
        return {
          ...col,
          agregacao_tipo: cfg.type,
          agregacao: cfg.type,
        };
      }
      return { ...col, agregacao_tipo: "", agregacao: "" };
    });
  }, [layoutAggregationConfig]);

  useEffect(() => { const defaultVisible = colunasDisponiveis.filter((c) => c.default).map((c) => c.id); const allColumnIds = colunasDisponiveis.map((c) => c.id); setColunasVisiveis((p) => Array.from(new Set([...p, ...defaultVisible]))); setColunasOrdem((p) => { const merged = Array.from(new Set([...p, ...allColumnIds])); return merged.sort((a, b) => { const cA = colunasDisponiveis.find((c) => c.id === a); const cB = colunasDisponiveis.find((c) => c.id === b); return (cA?.ordem_tabela || 999) - (cB?.ordem_tabela || 999); }); }); }, [colunasDisponiveis]);

  useEffect(() => { localStorage.setItem(WIDTHS_KEY, JSON.stringify(columnWidths)); }, [columnWidths]);
  useEffect(() => { localStorage.setItem(FROZEN_KEY, String(frozenColumnCount)); }, [frozenColumnCount]);
  useEffect(() => { const s = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s ? JSON.parse(s) : {}); } catch { setLayoutAggregationConfig({}); } const h = () => { const s2 = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s2 ? JSON.parse(s2) : {}); } catch { setLayoutAggregationConfig({}); } }; window.addEventListener("storage", h); window.addEventListener("cps-layout-updated", h); return () => { window.removeEventListener("storage", h); window.removeEventListener("cps-layout-updated", h); }; }, []);

  useEffect(() => { const onMove = (e) => { if (!dragRef.current) return; if (e.cancelable) e.preventDefault(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const { columnId, startX, startWidth, minWidth } = dragRef.current; setColumnWidths((p) => ({ ...p, [columnId]: Math.max(minWidth || MIN_COL_WIDTH, startWidth + (cx - startX)) })); }; const onUp = () => { if (!dragRef.current) return; dragRef.current = null; setResizeColumnId(null); document.body.style.cursor = ""; document.body.style.userSelect = ""; }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onUp); return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); }; }, []);

  const startDragResize = (e, col) => {
    if (e.detail >= 2) return;
    e.preventDefault();
    e.stopPropagation();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    dragRef.current = { columnId: col.id, startX: cx, startWidth: columnWidths[col.id] || col.width || 160, minWidth: getMinWidth(col) };
    setResizeColumnId(col.id);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => { selectedItemsRef.current = selectedItems; }, [selectedItems]);
  useEffect(() => { setSelectedItems((p) => { const valid = p.filter((id) => campos.some((e) => e.id === id)); return p.length === valid.length && p.every((id, i) => id === valid[i]) ? p : valid; }); }, [campos]);
  useEffect(() => { onSelectionChange?.(selectedItems); }, [selectedItems, onSelectionChange]);
  useEffect(() => { if (!selectedRecordId) return; setSelectedItems((p) => p.length === 1 && p[0] === selectedRecordId ? p : [selectedRecordId]); lastSelectedIdRef.current = selectedRecordId; }, [selectedRecordId]);

  const handleColumnLayoutChange = ({ visiveis, ordem, frozenColumnCount: nf }) => { setColunasVisiveis(visiveis); setColunasOrdem(ordem); if (nf !== undefined) setFrozenColumnCount(Math.max(0, Math.min(Number(nf) || 0, visiveis.length))); localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis)); localStorage.setItem(ORDER_KEY, JSON.stringify(ordem)); };
  const handleResetColumnLayout = () => { const def = colunasDisponiveis.filter((c) => !c.fixo); handleColumnLayoutChange({ visiveis: def.filter((c) => c.default).map((c) => c.id), ordem: def.map((c) => c.id) }); };

  const colunasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && colunasVisiveis.includes(c.id)), [colunasOrdem, colunasVisiveis, colunasDisponiveis]);
  const colunasTodasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && !c.fixo), [colunasOrdem, colunasDisponiveis]);
  useEffect(() => { setFrozenColumnCount((c) => Math.min(c, colunasOrdenadas.length)); }, [colunasOrdenadas.length]);

  const columnPixelWidths = useMemo(() => Object.fromEntries(colunasOrdenadas.map((c) => [c.id, Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c))])), [colunasOrdenadas, columnWidths]);
  const totalTableWidth = useMemo(() => Math.max(isMobile ? 720 : 900, colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0)), [colunasOrdenadas, columnPixelWidths, isMobile]);
  const frozenOffsets = useMemo(() => { let left = 0; return colunasOrdenadas.reduce((acc, c, i) => { if (i < frozenColumnCount) { acc[c.id] = left; left += columnPixelWidths[c.id] || 160; } return acc; }, {}); }, [colunasOrdenadas, columnPixelWidths, frozenColumnCount]);

  const getFieldValue = (item, colId) => {
    if (colId === "id_global") return item.id_global ? formatIdGlobal(item.id_global) : "-";
    if (colId === "codigo") return item.codigo ?? "-";
    if (colId === "nome") return item.nome || "-";
    if (colId === "tipo") return tipoLabel(item.tipo) || "-";
    if (colId === "telas") return (item.telas || []).map((t) => t.nome).join(", ") || "-";
    if (colId === "aplicacao") {
      return item.aplicacao_modo === "todas" ? "Todas as empresas" : "Empresas específicas";
    }
    if (colId === "quantidade_empresas") {
      return item.aplicacao_modo === "todas" ? "Todas" : String(item.quantidade_empresas ?? 0);
    }
    if (colId === "obrigatorio") return item.obrigatorio ? "Sim" : "Não";
    if (colId === "ativo") return item.ativo ? "Sim" : "Não";
    if (colId === "createdAt" || colId === "updatedAt") return formatDateValue(item[colId]);
    return "-";
  };

  const resolveColumnAlign = (col) => {
    if (col?.tipo === "date") return "center";
    if (col?.tipo === "number" || col?.tipo === "calculado" || col?.id === "id_global" || col?.id === "codigo" || col?.id === "custom:valor") return "right";
    return "left";
  };

  const getColumnAlignClass = (col) => {
    const align = resolveColumnAlign(col);
    if (align === "right") return "text-right";
    if (align === "center") return "text-center";
    return "text-left";
  };

  const getHeaderFlexClass = (col) => {
    const align = resolveColumnAlign(col);
    if (align === "right") return "justify-end";
    if (align === "center") return "justify-center";
    return "justify-start";
  };
  const getComparableValue = (item, col) => {
    if (col.id === "id_global") return Number(item.id_global || 0);
    if (col.id === "codigo") return Number(item.codigo || 0);
    if (col.id === "quantidade_empresas") return Number(item.quantidade_empresas || 0);
    return getFieldValue(item, col.id);
  };

  const campoPassaFiltros = (item, excludeColId = null) => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    if (termo) {
      const m = colunasDisponiveis.filter((c) => !c.fixo).some((col) => String(getFieldValue(item, col.id) || "").toLowerCase().includes(termo));
      if (!m) return false;
    }
    return colunasDisponiveis.filter((c) => !c.fixo).every((col) => {
      if (excludeColId && col.id === excludeColId) return true;
      const filtro = filtrosColunas[col.id] || [];
      if (filtro.length === 0) return true;
      const ft = getColumnFilterType(col);
      const raw = getComparableValue(item, col);
      if (ft === "number") {
        const nv = Number(raw);
        const min = filtro.find((i) => String(i).startsWith("min:"));
        const max = filtro.find((i) => String(i).startsWith("max:"));
        const list = getListFilterValues(filtro, ft);
        const minN = min ? parseNumberFilterValue(String(min).replace("min:", "")) : NaN;
        const maxN = max ? parseNumberFilterValue(String(max).replace("max:", "")) : NaN;
        if (Number.isFinite(minN) && nv < minN) return false;
        if (Number.isFinite(maxN) && nv > maxN) return false;
        if (list.length > 0) return list.includes(getFieldValue(item, col.id));
        return true;
      }
      if (ft === "date") {
        const ts = parseDateFilterValue(raw);
        const start = filtro.find((i) => String(i).startsWith("start:"));
        const end = filtro.find((i) => String(i).startsWith("end:"));
        const list = getListFilterValues(filtro, ft);
        const startTs = start ? parseDateFilterValue(String(start).replace("start:", "")) : null;
        const endTs = end ? parseDateFilterValue(String(end).replace("end:", "")) : null;
        if (startTs !== null && (ts === null || ts < startTs)) return false;
        if (endTs !== null && (ts === null || ts > endTs)) return false;
        if (list.length > 0) return list.includes(getFieldValue(item, col.id));
        return true;
      }
      const val = getFieldValue(item, col.id);
      return filtro.includes(val);
    });
  };

  const columnOptions = useMemo(() => {
    const opts = {};
    colunasDisponiveis.filter((c) => !c.fixo).forEach((col) => {
      const source = campos.filter((e) => campoPassaFiltros(e, col.id));
      opts[col.id] = [...new Set(source.map((e) => getFieldValue(e, col.id)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    });
    return opts;
  }, [campos, filtrosColunas, colunasDisponiveis, searchTerm]);

  const hasActiveFilter = (id) => (filtrosColunas[id] || []).length > 0;
  const getValoresFiltro = (id) => filtrosColunas[id] || [];
  const setValoresFiltro = (id, v) => setFiltrosColunas((p) => ({ ...p, [id]: v }));
  const clearColumnFilter = (id) => setValoresFiltro(id, []);

  const camposFiltrados = useMemo(() => {
    if (serverMode) return campos;
    return campos.filter((item) => campoPassaFiltros(item));
  }, [serverMode, campos, filtrosColunas, colunasDisponiveis, searchTerm]);

  const camposOrdenados = useMemo(() => {
    if (serverMode) return camposFiltrados;
    const sorted = [...camposFiltrados];
    sorted.sort((a, b) => {
      if (sortConfig.key === "id_global") { const aV = Number(a.id_global || 0); const bV = Number(b.id_global || 0); return sortConfig.direction === "asc" ? aV - bV : bV - aV; }
      if (sortConfig.key === "codigo") { const aV = Number(a.codigo || 0); const bV = Number(b.codigo || 0); return sortConfig.direction === "asc" ? aV - bV : bV - aV; }
      const aV = String(getFieldValue(a, sortConfig.key)).toLowerCase();
      const bV = String(getFieldValue(b, sortConfig.key)).toLowerCase();
      if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
      if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [camposFiltrados, sortConfig]);

  useEffect(() => {
    onFilteredCamposChange?.(camposOrdenados);
  }, [camposOrdenados, onFilteredCamposChange]);

  useEffect(() => {
    if (!serverMode) return;
    setCurrentPage(serverPage || 1);
  }, [serverMode, serverPage]);

  useEffect(() => {
    if (!serverMode) return;
    if (serverPageSize && serverPageSize !== pageSize) setPageSize(serverPageSize);
  }, [serverMode, serverPageSize, pageSize]);

  const totalPages = useMemo(() => {
    if (serverMode) {
      if (!serverTotal || serverTotal <= 0) return 1;
      return Math.ceil(serverTotal / pageSize);
    }
    if (camposOrdenados.length === 0) return 1;
    return Math.ceil(camposOrdenados.length / pageSize);
  }, [serverMode, serverTotal, camposOrdenados.length, pageSize]);

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const camposPaginados = useMemo(() => {
    if (serverMode) return camposOrdenados;
    const start = (safeCurrentPage - 1) * pageSize;
    return camposOrdenados.slice(start, start + pageSize);
  }, [serverMode, camposOrdenados, safeCurrentPage, pageSize]);

  useEffect(() => {
    localStorage.setItem(PAGE_SIZE_KEY, String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    if (!serverMode) return;
    onServerColumnFiltersChange?.(filtrosColunas);
  }, [serverMode, filtrosColunas, onServerColumnFiltersChange]);

  useEffect(() => {
    if (serverMode) {
      onServerPageChange?.(1);
      return;
    }
    setCurrentPage(1);
  }, [serverMode, onServerPageChange, filtrosColunas, searchTerm, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSort = (key) =>
    setSortConfig((p) => {
      const next = { key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" };
      onServerSortChange?.(next);
      return next;
    });

  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
    onServerPageChange?.(nextPage);
  };

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize);
    onServerPageSizeChange?.(nextPageSize);
  };

  const handleRowSelect = (emp, event) => {
    if (event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]")) return;
    if (event?.shiftKey && lastSelectedIdRef.current) { const si = camposOrdenados.findIndex((e) => e.id === lastSelectedIdRef.current); const ei = camposOrdenados.findIndex((e) => e.id === emp.id); if (si >= 0 && ei >= 0) { const [from, to] = [Math.min(si, ei), Math.max(si, ei)]; setSelectedItems(camposOrdenados.slice(from, to + 1).map((e) => e.id)); return; } }
    if (event?.ctrlKey || event?.metaKey) { setSelectedItems((p) => p.includes(emp.id) ? p.filter((id) => id !== emp.id) : [...p, emp.id]); return; }
    if (selectedItems.includes(emp.id)) {
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

  const TABLE_ROW_HEIGHT = 32;
  const { virtualItems, paddingTop, paddingBottom, virtualizer } = useTableVirtualizer({
    scrollRef: scrollContainerRef,
    count: camposPaginados.length,
    estimateSize: TABLE_ROW_HEIGHT,
    enabled: camposPaginados.length > 0 && !isLoadingCampos,
  });

  const syncTableFullscreen = useCallback(() => {
    setIsTableFullscreen(document.fullscreenElement === tableStageRef.current);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      syncTableFullscreen();
      requestAnimationFrame(() => updateFilterAnchorRect());
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
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
    if (e.key === "Escape" && document.fullscreenElement === tableStageRef.current) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setSelectedItems(camposOrdenados.map((e) => e.id));
    }
  };

  const renderFilterIcon = (active) => (
    active
      ? <FilterX className={FILTER_ICON_CLASS} strokeWidth={2} />
      : <Filter className={FILTER_ICON_CLASS} strokeWidth={2} />
  );

  const getRowBgClass = (index, selected) => {
    if (selected) return "emp-row-selected";
    return "emp-row-even";
  };

  const agregacoes = useMemo(() => ({}), [camposOrdenados, colunasOrdenadas]);

  const closeFilterMenu = () => {
    setMenuFiltroAberto(null);
    setFilterAnchorRect(null);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId: null, valores: [] });
  };

  const getFilterPanelRect = (colunaId) => {
    const el = filterAnchorRefs.current[colunaId];
    const stage = tableStageRef.current;
    if (!el || !stage) return null;
    const rect = el.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const padding = 8;
    const maxLeft = stageRect.width - FILTER_POPOVER_WIDTH - padding;
    const left = Math.min(Math.max(rect.right - FILTER_POPOVER_WIDTH - stageRect.left, padding), maxLeft);
    const top = rect.bottom + 6 - stageRect.top;
    return { columnId: colunaId, left, top, width: rect.width, height: rect.height };
  };

  const openFilterMenu = (colunaId) => {
    setFilterAnchorRect(getFilterPanelRect(colunaId));
    setMenuFiltroAberto(colunaId);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId, valores: normalizeRangeValoresForEdit(colunaId, [...getValoresFiltro(colunaId)], colunasDisponiveis) });
  };

  const toggleFilterMenu = (colunaId) => {
    if (menuFiltroAberto === colunaId) {
      closeFilterMenu();
      return;
    }
    openFilterMenu(colunaId);
  };

  const updateFilterAnchorRect = () => {
    if (!menuFiltroAberto) {
      setFilterAnchorRect(null);
      return;
    }
    setFilterAnchorRect(getFilterPanelRect(menuFiltroAberto));
  };

  useLayoutEffect(() => {
    updateFilterAnchorRect();
    if (!menuFiltroAberto) return undefined;
    let rafId = 0;
    const onReflow = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateFilterAnchorRect();
      });
    };
    const raf = requestAnimationFrame(updateFilterAnchorRect);
    const root = scrollContainerRef.current;
    root?.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      cancelAnimationFrame(raf);
      if (rafId) cancelAnimationFrame(rafId);
      root?.removeEventListener("scroll", onReflow);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [menuFiltroAberto, colunasOrdenadas, columnWidths, frozenColumnCount]);

  useEffect(() => {
    const body = scrollContainerRef.current;
    const footer = footerScrollRef.current;
    const header = headerScrollRef.current;
    if (!body) return undefined;
    const syncHorizontalScroll = () => {
      const left = body.scrollLeft;
      if (footer) footer.scrollLeft = left;
      if (header) header.scrollLeft = left;
    };
    body.addEventListener("scroll", syncHorizontalScroll, { passive: true });
    syncHorizontalScroll();
    return () => body.removeEventListener("scroll", syncHorizontalScroll);
  }, [colunasOrdenadas, columnWidths, agregacoes]);

  useEffect(() => {
    if (!menuFiltroAberto) return undefined;
    const onPointerDown = (event) => {
      const panel = filterPanelRef.current;
      const anchor = filterAnchorRefs.current[menuFiltroAberto];
      if (panel?.contains(event.target) || anchor?.contains(event.target)) return;
      closeFilterMenu();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeFilterMenu();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuFiltroAberto]);

  const renderFilterPopoverContent = (colunaId) => {
    const col = colunasDisponiveis.find((c) => c.id === colunaId);
    const opts = columnOptions[colunaId] || [];
    const ft = getColumnFilterType(col);
    const isRange = ft === "number" || ft === "date";
    const valSel = filtroTemp.colunaId === colunaId ? filtroTemp.valores : getValoresFiltro(colunaId);
    const listSel = getListFilterValues(valSel, ft);
    const tempRangeValores = filtroTemp.colunaId === colunaId ? filtroTemp.valores : [];
    const rangeFilteredOpts = isRange && menuFiltroAberto === colunaId
      ? opts.filter((o) => optionPassaRangeTemp(o, ft, tempRangeValores))
      : opts;
    const filteredOpts = rangeFilteredOpts.filter((o) => String(o).toLowerCase().includes(buscaFiltroMenu.toLowerCase()));
    const allVisSel = filteredOpts.length > 0 && filteredOpts.every((o) => listSel.includes(o));
    const colLabel = formatHeaderLabel(col);
    const closeFilter = closeFilterMenu;

    return (
      <div
        ref={filterPanelRef}
        className="emp-filter-popover erp-menu-panel erp-scroll-lock-wheel absolute z-[9999]"
        style={{ left: filterAnchorRect?.left ?? 0, top: filterAnchorRect?.top ?? 0 }}
        onWheel={(event) => isolateFloatingPanelWheel(event, ".emp-filter-value-list")}
      >
          <div className="emp-filter-sort-section">
            <button
              type="button"
              className="emp-filter-sort-btn"
              onClick={() => { handleSort(colunaId); closeFilter(); }}
            >
              <ArrowDownAZ className="w-4 h-4 mr-2 shrink-0" />
              <span>Classificar do Menor para o Maior</span>
            </button>
            <button
              type="button"
              className="emp-filter-sort-btn"
              onClick={() => { setSortConfig({ key: colunaId, direction: "desc" }); closeFilter(); }}
            >
              <ArrowUpZA className="w-4 h-4 mr-2 shrink-0" />
              <span>Classificar do Maior para o Menor</span>
            </button>
            <button
              type="button"
              className="emp-filter-sort-btn"
              disabled={!hasActiveFilter(colunaId)}
              onClick={() => { clearColumnFilter(colunaId); closeFilter(); }}
            >
              <X className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Limpar Filtro de &apos;{colLabel}&apos;</span>
            </button>
          </div>

          <div className="emp-filter-body">
            {isRange && (
              <div className="space-y-1">
                <div className="emp-filter-range-label">Filtrar entre</div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                  <input
                    type="text"
                    value={getRangeTokenInputValue(valSel.find((i) => String(i).startsWith(ft === "date" ? "start:" : "min:")))}
                    onChange={(e) => setFiltroTemp((p) => {
                      const rangeVals = getRangeFilterValues(p.valores, ft).filter((i) => !String(i).startsWith(ft === "date" ? "start:" : "min:"));
                      const listVals = getListFilterValues(p.valores, ft);
                      const minVal = e.target.value.trim() ? `${ft === "date" ? "start" : "min"}:${e.target.value.trim()}` : null;
                      return { ...p, valores: [...(minVal ? [minVal] : []), ...rangeVals, ...listVals] };
                    })}
                    placeholder="DE"
                    className="emp-filter-field emp-filter-search"
                  />
                  <span className="emp-filter-range-sep">a</span>
                  <input
                    type="text"
                    value={getRangeTokenInputValue(valSel.find((i) => String(i).startsWith(ft === "date" ? "end:" : "max:")))}
                    onChange={(e) => setFiltroTemp((p) => {
                      const rangeVals = getRangeFilterValues(p.valores, ft).filter((i) => !String(i).startsWith(ft === "date" ? "end:" : "max:"));
                      const listVals = getListFilterValues(p.valores, ft);
                      const maxVal = e.target.value.trim() ? `${ft === "date" ? "end" : "max"}:${e.target.value.trim()}` : null;
                      return { ...p, valores: [...rangeVals, ...(maxVal ? [maxVal] : []), ...listVals] };
                    })}
                    placeholder="ATÉ"
                    className="emp-filter-field emp-filter-search"
                  />
                </div>
              </div>
            )}

            <input
              value={buscaFiltroMenu}
              onChange={(e) => setBuscaFiltroMenu(e.target.value)}
              placeholder="PESQUISAR"
              className="emp-filter-field emp-filter-search"
            />

            <ErpScrollViewport variant="compact" className="emp-filter-value-list">
              <label className="emp-filter-value-list-header">
                <Checkbox
                  checked={allVisSel}
                  onCheckedChange={(c) => setFiltroTemp((p) => {
                    const rangeVals = getRangeFilterValues(p.valores, ft);
                    const listVals = getListFilterValues(p.valores, ft);
                    const rest = listVals.filter((v) => !filteredOpts.includes(v));
                    return { ...p, valores: c ? [...rangeVals, ...new Set([...rest, ...filteredOpts])] : [...rangeVals, ...rest] };
                  })}
                  className="emp-filter-checkbox"
                />
                <span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap">(Selecionar Tudo)</span>
              </label>
              {filteredOpts.map((opt) => (
                <label key={opt} className="emp-filter-value-list-item">
                  <Checkbox
                    checked={listSel.includes(opt)}
                    onCheckedChange={(c) => setFiltroTemp((p) => {
                      const rangeVals = getRangeFilterValues(p.valores, ft);
                      const listVals = getListFilterValues(p.valores, ft);
                      const nextList = c ? [...listVals, opt] : listVals.filter((i) => i !== opt);
                      return { ...p, valores: [...rangeVals, ...nextList] };
                    })}
                    className="emp-filter-checkbox"
                  />
                  <span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={opt}>{opt}</span>
                </label>
              ))}
            </ErpScrollViewport>

            <div className="emp-filter-actions">
              <button
                type="button"
                title="Aplicar filtro"
                className={EMP_TOOLBAR_BTN}
                onClick={() => { setValoresFiltro(colunaId, filtroTemp.valores); closeFilter(); }}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Cancelar"
                className={EMP_TOOLBAR_BTN}
                onClick={closeFilter}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
      </div>
    );
  };

  const formatTotalValue = (valor, col) => {
    const isInt = col.id === "id_global" || col.id === "codigo";
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

  const autoFitColumnWidth = (col) => {
    const minW = getMinWidth(col);
    let maxW = measureTextWidth(formatHeaderLabel(col), '600 12px Inter, system-ui, sans-serif') + 38;
    camposOrdenados.slice(0, AUTO_FIT_MEASURE_LIMIT).forEach((emp) => {
      const cellW = measureTextWidth(getFieldValue(emp, col.id)) + 14;
      maxW = Math.max(maxW, cellW);
    });
    if (agregacoes[col.id] !== undefined) {
      const totalW = measureTextWidth(
        colunasOrdenadas.findIndex((c) => c.id === col.id) === 0 ? "Totais" : formatTotalValue(agregacoes[col.id], col),
        '600 10px Inter, system-ui, sans-serif'
      ) + 14;
      maxW = Math.max(maxW, totalW);
    }
    const nextWidth = Math.min(MAX_AUTO_FIT_WIDTH, Math.max(minW, Math.ceil(maxW)));
    setColumnWidths((p) => ({ ...p, [col.id]: nextWidth }));
    setResizeColumnId(null);
  };

  useEffect(() => {
    const buildCols = (cols) => cols.map((c) => ({ id: c.id, label: c.label, width: Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c)) }));
    const buildRows = (items, cols) => items.map((e) => cols.map((c) => getFieldValue(e, c.id)));
    const buildTotalRow = (cols, totals) => Object.keys(totals).length > 0 ? cols.map((c, i) => i === 0 ? "Totais" : totals[c.id] !== undefined ? formatTotalValue(totals[c.id], c) : "") : null;
    const exp = colunasOrdenadas.filter((c) => !c.fixo);
    const selEmps = camposOrdenados.filter((e) => selectedItems.includes(e.id));
    const totalRow = buildTotalRow(exp, agregacoes);
    onVisibleDataChange?.({ columns: buildCols(exp), rows: buildRows(camposOrdenados, exp), selectedRows: buildRows(selEmps, exp), totalRows: totalRow ? [totalRow] : [], allColumns: buildCols(colunasTodasOrdenadas), allRows: buildRows(camposOrdenados, colunasTodasOrdenadas), allSelectedRows: buildRows(selEmps, colunasTodasOrdenadas), allTotalRows: totalRow ? [totalRow] : [] });
  }, [colunasOrdenadas, colunasTodasOrdenadas, camposOrdenados, selectedItems, onVisibleDataChange, agregacoes, columnWidths]);

  const hasTotalRow = Object.keys(agregacoes).length > 0;

  const renderHeaderCells = () =>
    colunasOrdenadas.map((col, colIndex) => {
      const width = columnPixelWidths[col.id] || 160;
      const isFrozen = colIndex < frozenColumnCount;
      const isResizing = resizeColumnId === col.id;
      const isColFiltered = hasActiveFilter(col.id);
      const isFilterOpen = menuFiltroAberto === col.id;
      return (
        <TableHead
          key={col.id}
          style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }}
          className={`emp-th group relative align-middle px-1.5 whitespace-nowrap h-[26px] py-0 select-none cursor-pointer ${isFrozen ? "z-50" : "z-40"} ${getColumnAlignClass(col)}`}
          onDoubleClick={() => handleSort(col.id)}
        >
          <div className={`emp-th-label-wrap flex items-center w-full h-full leading-[26px] whitespace-nowrap overflow-hidden ${getHeaderFlexClass(col)}`}>
            <span className="emp-th-label truncate font-semibold">{formatHeaderLabel(col)}</span>
          </div>
          <div
            className="emp-th-controls absolute right-1 top-1/2 -translate-y-1/2 z-50 flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <span
              ref={(el) => {
                if (el) filterAnchorRefs.current[col.id] = el;
                else delete filterAnchorRefs.current[col.id];
              }}
              role="button"
              tabIndex={0}
              className={`emp-header-filter-icon inline-flex h-3 w-3 shrink-0 items-center justify-center cursor-pointer text-[#2899f5] ${
                isColFiltered || isFilterOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
              }`}
              title={isColFiltered ? "Duplo clique para limpar filtro" : "Filtrar coluna"}
              onClick={(e) => {
                e.stopPropagation();
                toggleFilterMenu(col.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isColFiltered) return;
                clearColumnFilter(col.id);
                closeFilterMenu();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFilterMenu(col.id);
                }
              }}
            >
              {renderFilterIcon(isColFiltered)}
            </span>
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

  const renderTotalCells = () =>
    colunasOrdenadas.map((col, ci) => {
      const width = columnPixelWidths[col.id] || 160;
      const isFrozen = ci < frozenColumnCount;
      return (
        <TableHead
          key={`total-${col.id}`}
          style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }}
          className={`emp-th relative align-middle px-1.5 whitespace-nowrap h-[26px] py-0 select-none ${isFrozen ? "z-50" : "z-40"} ${getColumnAlignClass(col)}`}
        >
          <div className={`emp-th-label-wrap flex items-center w-full h-full leading-[26px] whitespace-nowrap overflow-hidden ${getHeaderFlexClass(col)}`}>
            <span className="emp-th-label truncate font-semibold">
              {ci === 0 && agregacoes[col.id] === undefined ? "Totais" : agregacoes[col.id] !== undefined ? formatTotalValue(agregacoes[col.id], col) : ""}
            </span>
          </div>
        </TableHead>
      );
    });

  return (
    <div className="emp-table-root flex h-full min-h-0 flex-1 flex-col overflow-hidden select-none">
      <div
        ref={tableStageRef}
        className={`emp-table-stage relative min-h-0 overflow-hidden ${menuFiltroAberto ? "overflow-visible" : ""}`}
      >
        <div className="emp-table-shell flex min-h-0 flex-col overflow-hidden bg-white">
          <ErpListingTopProgress active={isFetchingCampos && !isLoadingCampos} />
          <div
            ref={headerScrollRef}
            className="emp-table-header-bar shrink-0 overflow-x-hidden overflow-y-hidden"
          >
            <div
              className="block w-max min-w-full"
              style={{ width: totalTableWidth, minWidth: totalTableWidth }}
            >
              <Table
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                className="emp-table-pro emp-table-pro-header w-full border-separate border-spacing-0 table-fixed select-none"
              >
                <TableHeader>
                  <TableRow className="hover:bg-transparent">{renderHeaderCells()}</TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
          <ErpScrollViewport
            ref={scrollContainerRef}
            tabIndex={0}
            onKeyDown={handleTableKeyDown}
            stepSize={TABLE_ROW_HEIGHT}
            className="emp-table-body-scroll relative min-h-0 flex-1 outline-none"
          >
            <div
              className="block w-max min-w-full min-h-full"
              style={{ width: totalTableWidth, minWidth: totalTableWidth }}
            >
              <Table
                ref={tableRef}
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                className="emp-table-pro emp-table-pro-body w-full border-separate border-spacing-0 table-fixed select-none"
              >
                <TableBody>
                  {isLoadingCampos ? (
                    <TableRow>
                      <TableCell colSpan={colunasOrdenadas.length} className="emp-td text-center py-8 text-xs text-slate-400">
                        Carregando campos...
                      </TableCell>
                    </TableRow>
                  ) : camposOrdenados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={colunasOrdenadas.length} className="emp-td text-center py-8 text-xs text-slate-400">
                        Nenhuma campo encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paddingTop > 0 ? (
                        <TableRow aria-hidden="true">
                          <TableCell colSpan={colunasOrdenadas.length} style={{ height: paddingTop, padding: 0, border: 0 }} />
                        </TableRow>
                      ) : null}
                      {virtualItems.map((virtualRow) => {
                        const item = camposPaginados[virtualRow.index];
                        if (!item) return null;
                        const isSelected = selectedItems.includes(item.id);
                        const rowClass = getRowBgClass(virtualRow.index, isSelected);
                        return (
                          <TableRow
                            key={item.id}
                            data-index={virtualRow.index}
                            ref={virtualizer?.measureElement}
                            className={`${rowClass} transition-colors cursor-pointer select-none hover:brightness-[0.98]`}
                            onClick={(e) => handleRowClick(item, e)}
                          >
                            {colunasOrdenadas.map((col, colIndex) => {
                              const width = columnPixelWidths[col.id] || 160;
                              const isFrozen = colIndex < frozenColumnCount;
                              return (
                                <TableCell
                                  key={`${item.id}-${col.id}`}
                                  style={{
                                    width,
                                    minWidth: width,
                                    maxWidth: width,
                                    left: isFrozen ? frozenOffsets[col.id] : undefined,
                                  }}
                                  className={`emp-td py-0 text-[12px] align-middle whitespace-nowrap overflow-hidden select-none px-1.5 ${rowClass} ${isFrozen ? "sticky z-20" : ""} ${getColumnAlignClass(col)} ${isSelected ? "font-semibold" : ""}`}
                                  title={String(getFieldValue(item, col.id) ?? "")}
                                >
                                  {getFieldValue(item, col.id)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                      {paddingBottom > 0 ? (
                        <TableRow aria-hidden="true">
                          <TableCell colSpan={colunasOrdenadas.length} style={{ height: paddingBottom, padding: 0, border: 0 }} />
                        </TableRow>
                      ) : null}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </ErpScrollViewport>
        </div>
        <div className="emp-table-bottom-dock">
          {hasTotalRow ? (
            <div
              ref={footerScrollRef}
              className="emp-table-footer-bar overflow-x-hidden overflow-y-hidden"
            >
              <div
                className="block w-max min-w-full"
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
              >
                <Table
                  style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                  className="emp-table-pro emp-table-pro-footer w-full border-separate border-spacing-0 table-fixed select-none"
                >
                  <TableFooter className="emp-table-footer border-0 font-semibold [&>tr]:border-0">
                    <TableRow className="emp-total-row border-0 hover:bg-transparent">
                      {renderTotalCells()}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          ) : null}
          <EmpTablePagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isBusy={isFetchingCampos}
          />
        </div>
        {menuFiltroAberto && filterAnchorRect?.columnId === menuFiltroAberto && renderFilterPopoverContent(menuFiltroAberto)}
      </div>
      
    </div>
  );
}