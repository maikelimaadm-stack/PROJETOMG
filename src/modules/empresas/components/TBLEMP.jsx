import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import EmpConfiguracaoColunasDialog from "@/framework/cadastro/configurators/EmpConfiguracaoColunasDialog";
import EmpTablePagination from "@/framework/cadastro/pagination/EmpTablePagination";
import { useErpTableFullscreen } from "@/shared/layouts/ErpTableFullscreenContext";
import ErpScrollNav from "@/shared/components/ErpScrollNav";
import EmpVirtualTableBody from "@/shared/components/EmpVirtualTableBody";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { readStoredListPageSize } from "@/shared/listing/listQueryConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter, FilterX, X, ArrowDownAZ, ArrowUpZA, Check } from "lucide-react";
import { buildEmpresaColumnFilters } from "@/shared/listing/buildEmpresaListFilters";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import {
  loadColumnOrder,
  loadVisibleColumns,
} from "@/framework/cadastro/tables/empColumnLayout";
import { mergeEffectiveColumnLayout } from "@/modules/empresas/utils/empTableColumnCatalog";
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
  formatHeaderLabel,
  getMinWidth,
} from "./tblEmp.constants";
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
} from "./tblEmp.filters";

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
  onServerSortChange = null,
  onServerColumnFiltersChange = null,
  infiniteMode = false,
  hasMoreRows = false,
  isLoadingMoreRows = false,
  onLoadMoreRows = null,
  moduleTitle = "Cadastro",
  mgPrototype = false,
  onColumnsInUseChange,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "codempresa", direction: "asc" });
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, valores: [] });
  const [filtrosColunas, setFiltrosColunas] = useState({});
  const isMobile = useIsMobile();

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
    return readStoredListPageSize(PAGE_SIZE_KEY, 50);
  });

  const distinctFiltersKey = useMemo(() => {
    if (!serverMode || !menuFiltroAberto) return "";
    const withoutColumn = { ...filtrosColunas };
    delete withoutColumn[menuFiltroAberto];
    const merged = buildEmpresaColumnFilters(withoutColumn);
    const payload = { ...(serverBaseFilters || {}), ...(merged || {}) };
    return JSON.stringify(payload);
  }, [serverMode, menuFiltroAberto, filtrosColunas, serverBaseFilters]);

  const { data: serverDistinctOptions, isFetching: serverDistinctFetching } = useQuery({
    queryKey: [
      "emp-distinct-column",
      menuFiltroAberto,
      serverSearchTerm,
      distinctFiltersKey,
      buscaFiltroMenu,
    ],
    queryFn: () =>
      empRepository.listDistinctColumnValues({
        column: menuFiltroAberto,
        search: serverSearchTerm,
        optionSearch: buscaFiltroMenu,
        filters: distinctFiltersKey ? JSON.parse(distinctFiltersKey) : serverBaseFilters,
        limit: 5000,
      }),
    enabled: serverMode && Boolean(menuFiltroAberto),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
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

  useEffect(() => {
    if (!colunasDisponiveis.length) return;
    const savedOrdem = loadColumnOrder(ORDER_KEY, colunasDisponiveis);
    const savedVisiveis = loadVisibleColumns(VISIBLE_KEY, colunasDisponiveis);
    const { ordem, visiveis } = mergeEffectiveColumnLayout(
      colunasDisponiveis,
      savedOrdem,
      savedVisiveis
    );
    setColunasOrdem(ordem);
    setColunasVisiveis(visiveis);
    localStorage.setItem(ORDER_KEY, JSON.stringify(ordem));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis));
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  }, [colunasDisponiveis]);

  const colunasOrdenadas = useMemo(
    () =>
      colunasOrdem
        .map((id) => colunasDisponiveis.find((c) => c.id === id))
        .filter((c) => c && colunasVisiveis.includes(c.id)),
    [colunasOrdem, colunasVisiveis, colunasDisponiveis]
  );

  useEffect(() => {
    onColumnsInUseChange?.(colunasOrdenadas);
  }, [colunasOrdenadas, onColumnsInUseChange]);

  useEffect(() => { localStorage.setItem(WIDTHS_KEY, JSON.stringify(columnWidths)); }, [columnWidths]);
  useEffect(() => { localStorage.setItem(FROZEN_KEY, String(frozenColumnCount)); }, [frozenColumnCount]);
  useEffect(() => { const s = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s ? JSON.parse(s) : {}); } catch { setLayoutAggregationConfig({}); } const h = () => { const s2 = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s2 ? JSON.parse(s2) : {}); } catch { setLayoutAggregationConfig({}); } }; window.addEventListener("storage", h); window.addEventListener("emp-layout-updated", h); return () => { window.removeEventListener("storage", h); window.removeEventListener("emp-layout-updated", h); }; }, []);

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

  const handleColumnLayoutChange = ({ visiveis, ordem, frozenColumnCount: nf }) => {
    setColunasVisiveis(visiveis);
    setColunasOrdem(ordem);
    if (nf !== undefined) setFrozenColumnCount(Math.max(0, Math.min(Number(nf) || 0, visiveis.length)));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis));
    localStorage.setItem(ORDER_KEY, JSON.stringify(ordem));
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  };
  const handleResetColumnLayout = () => { const def = colunasDisponiveis.filter((c) => !c.fixo); handleColumnLayoutChange({ visiveis: def.filter((c) => c.default).map((c) => c.id), ordem: def.map((c) => c.id) }); };

  const colunasTodasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && !c.fixo), [colunasOrdem, colunasDisponiveis]);
  useEffect(() => { setFrozenColumnCount((c) => Math.min(c, colunasOrdenadas.length)); }, [colunasOrdenadas.length]);

  const columnPixelWidths = useMemo(() => Object.fromEntries(colunasOrdenadas.map((c) => [c.id, Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c))])), [colunasOrdenadas, columnWidths]);
  const totalTableWidth = useMemo(() => Math.max(isMobile ? 720 : 900, colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0)), [colunasOrdenadas, columnPixelWidths, isMobile]);
  const frozenOffsets = useMemo(() => { let left = 0; return colunasOrdenadas.reduce((acc, c, i) => { if (i < frozenColumnCount) { acc[c.id] = left; left += columnPixelWidths[c.id] || 160; } return acc; }, {}); }, [colunasOrdenadas, columnPixelWidths, frozenColumnCount]);

  const getFieldValue = (emp, colId) => {
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
    const col = colunasDisponiveis.find((c) => c.id === colId);
    return campoEngine.getValorCampo(emp, col || { id: colId }, {});
  };

  const resolveColumnAlign = (col) => {
    if (col?.tipo === "date") return "center";
    if (col?.tipo === "number" || col?.tipo === "calculado" || col?.id === "id_global" || col?.id === "codempresa" || col?.id === "custom:valor") return "right";
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
  const getComparableValue = (emp, col) => {
    if (col.id === "id_global") return Number(emp.id_global || 0);
    if (col.id === "codempresa") return Number(emp.codempresa || 0);
    return campoEngine.getValorBruto ? campoEngine.getValorBruto(emp, col) : getFieldValue(emp, col.id);
  };

  const empresaPassaFiltros = (emp, excludeColId = null) => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    if (termo) {
      const m = colunasDisponiveis.filter((c) => !c.fixo).some((col) => String(getFieldValue(emp, col.id) || "").toLowerCase().includes(termo));
      if (!m) return false;
    }
    return colunasDisponiveis.filter((c) => !c.fixo).every((col) => {
      if (excludeColId && col.id === excludeColId) return true;
      const filtro = filtrosColunas[col.id] || [];
      if (filtro.length === 0) return true;
      const ft = getColumnFilterType(col);
      const raw = getComparableValue(emp, col);
      if (ft === "number") {
        const nv = Number(raw);
        const min = filtro.find((i) => String(i).startsWith("min:"));
        const max = filtro.find((i) => String(i).startsWith("max:"));
        const list = getListFilterValues(filtro, ft);
        const minN = min ? parseNumberFilterValue(String(min).replace("min:", "")) : NaN;
        const maxN = max ? parseNumberFilterValue(String(max).replace("max:", "")) : NaN;
        if (Number.isFinite(minN) && nv < minN) return false;
        if (Number.isFinite(maxN) && nv > maxN) return false;
        if (list.length > 0) return list.includes(getFieldValue(emp, col.id));
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
        if (list.length > 0) return list.includes(getFieldValue(emp, col.id));
        return true;
      }
      const val = getFieldValue(emp, col.id);
      return filtro.includes(val);
    });
  };

  const columnOptions = useMemo(() => {
    if (serverMode) {
      if (!menuFiltroAberto) return {};
      return { [menuFiltroAberto]: serverDistinctOptions?.items || [] };
    }
    const opts = {};
    colunasDisponiveis.filter((c) => !c.fixo).forEach((col) => {
      const source = empresas.filter((e) => empresaPassaFiltros(e, col.id));
      opts[col.id] = [...new Set(source.map((e) => getFieldValue(e, col.id)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    });
    return opts;
  }, [serverMode, menuFiltroAberto, serverDistinctOptions, empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

  const hasActiveFilter = (id) => (filtrosColunas[id] || []).length > 0;
  const getValoresFiltro = (id) => filtrosColunas[id] || [];
  const setValoresFiltro = (id, v) => setFiltrosColunas((p) => ({ ...p, [id]: v }));
  const clearColumnFilter = (id) => setValoresFiltro(id, []);
  const selectedItemsSet = useMemo(() => new Set(selectedItems), [selectedItems]);

  const empresasFiltradas = useMemo(() => {
    if (serverMode) return empresas;
    return empresas.filter((emp) => empresaPassaFiltros(emp));
  }, [serverMode, empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

  const empresasOrdenadas = useMemo(() => {
    if (serverMode) return empresasFiltradas;
    const sorted = [...empresasFiltradas];
    sorted.sort((a, b) => {
      if (sortConfig.key === "id_global") { const aV = Number(a.id_global || 0); const bV = Number(b.id_global || 0); return sortConfig.direction === "asc" ? aV - bV : bV - aV; }
      if (sortConfig.key === "codempresa") { const aV = Number(a.codempresa || 0); const bV = Number(b.codempresa || 0); return sortConfig.direction === "asc" ? aV - bV : bV - aV; }
      const aV = String(getFieldValue(a, sortConfig.key)).toLowerCase();
      const bV = String(getFieldValue(b, sortConfig.key)).toLowerCase();
      if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
      if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [empresasFiltradas, sortConfig]);

  useEffect(() => {
    onFilteredEmpresasChange?.(empresasOrdenadas);
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

  const empresasPaginadas = useMemo(() => {
    if (infiniteMode) return empresasOrdenadas;
    if (serverMode) return empresasOrdenadas;
    const start = (safeCurrentPage - 1) * pageSize;
    return empresasOrdenadas.slice(start, start + pageSize);
  }, [infiniteMode, serverMode, empresasOrdenadas, safeCurrentPage, pageSize]);

  const getRowBgClass = (index, selected) => {
    if (selected) return "emp-row-selected";
    return "emp-row-even";
  };

  const renderVirtualTableRow = useCallback(
    (emp, virtualRowIndex) => {
      const isSelected = selectedItemsSet.has(emp.id);
      const rowClass = getRowBgClass(virtualRowIndex, isSelected);
      return colunasOrdenadas.map((col, colIndex) => {
        const width = columnPixelWidths[col.id] || 160;
        const isFrozen = colIndex < frozenColumnCount;
        return (
          <TableCell
            key={`${emp.id}-${col.id}`}
            style={{
              width,
              minWidth: width,
              maxWidth: width,
              left: isFrozen ? frozenOffsets[col.id] : undefined,
            }}
            className={`emp-td py-0 text-[12px] align-middle whitespace-nowrap overflow-hidden select-none px-1.5 ${rowClass} ${isFrozen ? "sticky z-20" : ""} ${getColumnAlignClass(col)} ${col.id === "id_global" ? "text-[#64748B] font-medium" : ""} ${isSelected && col.id !== "id_global" ? "font-semibold" : ""}`}
            title={String(getFieldValue(emp, col.id) ?? "")}
          >
            {getFieldValue(emp, col.id)}
          </TableCell>
        );
      });
    },
    [
      colunasOrdenadas,
      columnPixelWidths,
      frozenColumnCount,
      frozenOffsets,
      getColumnAlignClass,
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
    onServerPageChange?.(1);
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
      setSelectedItems(empresasOrdenadas.map((e) => e.id));
    }
  };

  const renderFilterIcon = (active) => (
    active
      ? <FilterX className={FILTER_ICON_CLASS} strokeWidth={2} />
      : <Filter className={FILTER_ICON_CLASS} strokeWidth={2} />
  );

  const agregacoes = useMemo(() => {
    if (empresasOrdenadas.length > 150) return {};
    return campoEngine.calcularAgregacoes
      ? campoEngine.calcularAgregacoes(empresasOrdenadas, colunasOrdenadas, {})
      : {};
  }, [empresasOrdenadas, colunasOrdenadas]);

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
    const onReflow = () => updateFilterAnchorRect();
    const raf = requestAnimationFrame(updateFilterAnchorRect);
    const root = scrollContainerRef.current;
    root?.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      cancelAnimationFrame(raf);
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
        className="emp-filter-popover erp-menu-panel absolute z-[9999]"
        style={{ left: filterAnchorRect?.left ?? 0, top: filterAnchorRect?.top ?? 0 }}
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

            <div className="emp-filter-value-list">
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
              {serverMode && serverDistinctFetching && filteredOpts.length === 0 ? (
                <div className="emp-filter-loading px-2 py-3 text-xs text-slate-500">Carregando opções...</div>
              ) : (
                filteredOpts.map((opt) => (
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
                ))
              )}
            </div>

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

  const autoFitColumnWidth = (col) => {
    const minW = getMinWidth(col);
    let maxW = measureTextWidth(formatHeaderLabel(col), '600 12px Inter, system-ui, sans-serif') + 38;
    empresasOrdenadas.slice(0, AUTO_FIT_MEASURE_LIMIT).forEach((emp) => {
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
              className={`emp-header-filter-icon inline-flex h-3 w-3 shrink-0 items-center justify-center cursor-pointer text-[var(--accent)] ${
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

  const tableClass = mgPrototype
    ? "mg-grid emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none"
    : "emp-table-pro emp-table-pro-header w-full border-separate border-spacing-0 table-fixed select-none";
  const bodyTableClass = mgPrototype
    ? "mg-grid emp-table-pro emp-table-pro-body w-full border-separate border-spacing-0 table-fixed select-none"
    : "emp-table-pro emp-table-pro-body w-full border-separate border-spacing-0 table-fixed select-none";

  return (
    <div className={`emp-table-root flex h-full min-h-0 flex-1 flex-col overflow-hidden select-none${mgPrototype ? " mg-grid-wrapper" : ""}`}>
      <div
        ref={tableStageRef}
        className={`emp-table-stage relative min-h-0 overflow-hidden ${menuFiltroAberto ? "overflow-visible" : ""}`}
      >
        <div className="emp-table-shell flex min-h-0 flex-col overflow-hidden bg-white">
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
                className={tableClass}
              >
                <TableHeader>
                  <TableRow className="hover:bg-transparent">{renderHeaderCells()}</TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
          <ErpScrollNav
            ref={scrollContainerRef}
            tabIndex={0}
            onKeyDown={handleTableKeyDown}
            className={`emp-table-body-scroll relative min-h-0 flex-1 outline-none${mgPrototype ? " mg-grid-scroll" : ""}`}
            viewportClassName="overflow-auto"
          >
            <div
              className="block w-max min-w-full"
              style={{ width: totalTableWidth, minWidth: totalTableWidth }}
            >
              {isLoadingEmpresas ? (
                <Table
                  style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                  className={bodyTableClass}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={colunasOrdenadas.length} className="emp-td text-center py-8 text-xs text-slate-400">
                        &nbsp;
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : empresasOrdenadas.length === 0 ? (
                <Table
                  style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                  className={bodyTableClass}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={colunasOrdenadas.length} className="emp-td text-center py-8 text-xs text-slate-400">
                        Nenhuma empresa encontrada
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <>
                  <EmpVirtualTableBody
                    scrollRef={scrollContainerRef}
                    rows={empresasPaginadas}
                    enabled={!isLoadingEmpresas}
                    totalTableWidth={totalTableWidth}
                    bodyTableClass={bodyTableClass}
                    renderRow={renderVirtualTableRow}
                    getRowClassName={(emp, rowIndex) =>
                      getRowBgClass(rowIndex, selectedItemsSet.has(emp.id))
                    }
                    onRowClick={handleRowClick}
                  />
                  {infiniteMode && isLoadingMoreRows ? <div className="py-1" aria-hidden="true" /> : null}
                </>
              )}
            </div>
          </ErpScrollNav>
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
          {!infiniteMode ? (
            <EmpTablePagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isBusy={isFetchingEmpresas}
            />
          ) : null}
        </div>
        {menuFiltroAberto && filterAnchorRect?.columnId === menuFiltroAberto && renderFilterPopoverContent(menuFiltroAberto)}
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