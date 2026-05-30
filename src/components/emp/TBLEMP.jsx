import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/components/emp/empRepository";
import campoEngine from "@/components/emp/empCampoEngine";
import EmpConfiguracaoColunasDialog from "@/components/emp/EmpConfiguracaoColunasDialog";
import EmpTablePagination, { EMP_PAGE_SIZE_OPTIONS } from "@/components/emp/EmpTablePagination";
import { Filter, FilterX, X, ArrowDownAZ, ArrowUpZA, Check } from "lucide-react";
import { EMP_TOOLBAR_BTN } from "@/components/emp/toolbars/empToolbarStyles";

const FILTER_POPOVER_WIDTH = 272;
const FILTER_ICON_CLASS = "w-3 h-3 shrink-0";

const COLUNAS_BASE = [
  { id: "codigo_empresa", label: "Código", default: true, sortable: true, align: "right", width: 90 },
  { id: "razao_social", label: "Razão Social", default: true, sortable: true, align: "left", width: 260 },
  { id: "nome_fantasia", label: "Nome Fantasia", default: true, sortable: true, align: "left", width: 220 },
  { id: "tipo_pessoa", label: "Tipo", default: true, sortable: true, align: "left", width: 80 },
  { id: "cpf_cnpj", label: "CPF/CNPJ", default: true, sortable: true, align: "left", width: 160 },
  { id: "inscricao_estadual", label: "Inscrição Estadual", default: false, sortable: true, align: "left", width: 170 },
  { id: "telefone", label: "Telefone", default: true, sortable: true, align: "left", width: 130 },
  { id: "whatsapp", label: "WhatsApp", default: false, sortable: true, align: "left", width: 140 },
  { id: "email", label: "E-mail", default: true, sortable: true, align: "left", width: 200 },
  { id: "logo_url", label: "Logo", default: false, sortable: false, align: "left", width: 180 },
  { id: "cep", label: "CEP", default: false, sortable: true, align: "left", width: 110 },
  { id: "endereco", label: "Endereço", default: false, sortable: true, align: "left", width: 240 },
  { id: "numero", label: "Número", default: false, sortable: true, align: "left", width: 100 },
  { id: "bairro", label: "Bairro", default: false, sortable: true, align: "left", width: 150 },
  { id: "cidade", label: "Cidade", default: true, sortable: true, align: "left", width: 150 },
  { id: "estado", label: "UF", default: true, sortable: true, align: "left", width: 70 },
  { id: "observacoes", label: "Observações", default: false, sortable: true, align: "left", width: 260 },
  { id: "status", label: "Status", default: true, sortable: true, align: "left", width: 90 },
];

const WIDTHS_KEY = "emp_col_widths";
const FROZEN_KEY = "emp_col_frozen";
const VISIBLE_KEY = "emp_col_visiveis";
const ORDER_KEY = "emp_col_ordem";
const AGGR_KEY = "emp_table_aggregation_config";
const PAGE_SIZE_KEY = "emp_table_page_size";
const MIN_COL_WIDTH = 80;
const getMinWidth = (col) => Math.max(MIN_COL_WIDTH, String(col?.label || "").length * 7 + 18);

const fmtData = (d) => { if (!d) return "-"; const [a, m, dia] = String(d).split("T")[0].split("-"); return !a || !m || !dia ? "-" : `${dia}/${m}/${a}`; };

const formatHeaderLabel = (col) => {
  const label = String(col?.label || "");
  if (col?.id === "custom:valor" || label.toUpperCase() === "VALOR") return "VALOR";
  return label;
};

export default function TBLEMP({ empresas = [], onEdit, showConfigColunas, setShowConfigColunas, searchTerm = "", selectedRecordId, onSelectionChange, onVisibleDataChange, onFilteredEmpresasChange }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "codigo_empresa", direction: "asc" });
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, valores: [] });
  const [filtrosColunas, setFiltrosColunas] = useState({});
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const [columnWidths, setColumnWidths] = useState(() => { const def = Object.fromEntries(COLUNAS_BASE.map((c) => [c.id, c.width || 160])); const saved = localStorage.getItem(WIDTHS_KEY); if (!saved) return def; try { return { ...def, ...JSON.parse(saved) }; } catch { return def; } });
  const [frozenColumnCount, setFrozenColumnCount] = useState(() => { const s = Number(localStorage.getItem(FROZEN_KEY) || 0); return Number.isFinite(s) ? s : 0; });
  const [colunasOrdem, setColunasOrdem] = useState(() => { const s = localStorage.getItem(ORDER_KEY); if (s) { try { return JSON.parse(s); } catch {} } return COLUNAS_BASE.map((c) => c.id); });
  const [colunasVisiveis, setColunasVisiveis] = useState(() => { const s = localStorage.getItem(VISIBLE_KEY); if (s) { try { return Array.from(new Set([...JSON.parse(s), ...COLUNAS_BASE.filter((c) => c.default).map((c) => c.id)])); } catch {} } return COLUNAS_BASE.filter((c) => c.default).map((c) => c.id); });
  const [layoutAggregationConfig, setLayoutAggregationConfig] = useState(() => { const s = localStorage.getItem(AGGR_KEY); if (!s) return {}; try { return JSON.parse(s); } catch { return {}; } });

  const lastTapRef = useRef({ id: null, time: 0 });
  const lastSelectedIdRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const tableRef = useRef(null);
  const dragRef = useRef(null);
  const filterAnchorRefs = useRef({});
  const filterPanelRef = useRef(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState(null);
  const [resizeColumnId, setResizeColumnId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
    return EMP_PAGE_SIZE_OPTIONS.includes(saved) ? saved : 50;
  });

  const { data: camposPersonalizados = [] } = useQuery({ queryKey: ["emp-campos-personalizados"], queryFn: () => empRepository.listCamposPersonalizados(), initialData: [] });

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
      agregacao_tipo: c.agregacao_tipo || c.agregacao || "",
      customField: c.field_name
    }));
    const aggByCol = { ...layoutAggregationConfig };
    return [...COLUNAS_BASE, ...dinamicas.sort((a, b) => (a.ordem_tabela || 999) - (b.ordem_tabela || 999))].map((col) => {
      const cfg = aggByCol[col.id];
      if (cfg?.enabled) return { ...col, agregacao_tipo: cfg.type, agregacao: cfg.type, usar_decimal: col.usar_decimal ?? true, decimal_places: col.decimal_places ?? 2 };
      if (col.agregacao_tipo || col.agregacao) return col;
      return { ...col, agregacao_tipo: "", agregacao: "" };
    });
  }, [camposPersonalizados, layoutAggregationConfig]);

  useEffect(() => { const defaultVisible = colunasDisponiveis.filter((c) => c.default).map((c) => c.id); const allColumnIds = colunasDisponiveis.map((c) => c.id); setColunasVisiveis((p) => Array.from(new Set([...p, ...defaultVisible]))); setColunasOrdem((p) => { const merged = Array.from(new Set([...p, ...allColumnIds])); return merged.sort((a, b) => { const cA = colunasDisponiveis.find((c) => c.id === a); const cB = colunasDisponiveis.find((c) => c.id === b); return (cA?.ordem_tabela || 999) - (cB?.ordem_tabela || 999); }); }); }, [colunasDisponiveis]);

  useEffect(() => { localStorage.setItem(WIDTHS_KEY, JSON.stringify(columnWidths)); }, [columnWidths]);
  useEffect(() => { localStorage.setItem(FROZEN_KEY, String(frozenColumnCount)); }, [frozenColumnCount]);
  useEffect(() => { const s = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s ? JSON.parse(s) : {}); } catch { setLayoutAggregationConfig({}); } const h = () => { const s2 = localStorage.getItem(AGGR_KEY); try { setLayoutAggregationConfig(s2 ? JSON.parse(s2) : {}); } catch { setLayoutAggregationConfig({}); } }; window.addEventListener("storage", h); window.addEventListener("emp-layout-updated", h); return () => { window.removeEventListener("storage", h); window.removeEventListener("emp-layout-updated", h); }; }, []);

  useEffect(() => { const onMove = (e) => { if (!dragRef.current) return; if (e.cancelable) e.preventDefault(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const { columnId, startX, startWidth, minWidth } = dragRef.current; setColumnWidths((p) => ({ ...p, [columnId]: Math.max(minWidth || MIN_COL_WIDTH, startWidth + (cx - startX)) })); }; const onUp = () => { if (!dragRef.current) return; dragRef.current = null; setResizeColumnId(null); document.body.style.cursor = ""; document.body.style.userSelect = ""; }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onUp); return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); }; }, []);

  const startDragResize = (e, col) => { e.preventDefault(); e.stopPropagation(); const cx = e.touches?.[0]?.clientX ?? e.clientX; dragRef.current = { columnId: col.id, startX: cx, startWidth: columnWidths[col.id] || col.width || 160, minWidth: getMinWidth(col) }; setResizeColumnId(col.id); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; };

  useEffect(() => { setSelectedItems((p) => { const valid = p.filter((id) => empresas.some((e) => e.id === id)); return p.length === valid.length && p.every((id, i) => id === valid[i]) ? p : valid; }); }, [empresas]);
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

  const getFieldValue = (emp, colId) => {
    if (colId === "codigo_empresa") return emp.codigo_empresa ?? "-";
    if (colId === "razao_social") return emp.razao_social || "-";
    if (colId === "nome_fantasia") return emp.nome_fantasia || "-";
    if (colId === "tipo_pessoa") return emp.tipo_pessoa || "-";
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

  const getColumnFilterType = (col) => { if (col?.id === "codigo_empresa") return "number"; if (col?.tipo === "date" || col?.id === "data") return "date"; if (col?.tipo === "number" && col?.usar_mascara) return "list"; if (["number", "calculado"].includes(col?.tipo) || col?.id === "codigo_empresa") return "number"; return "list"; };
  const getRangeFilterValues = (valores, ft) => {
    if (ft === "number") return valores.filter((i) => String(i).startsWith("min:") || String(i).startsWith("max:"));
    if (ft === "date") return valores.filter((i) => String(i).startsWith("start:") || String(i).startsWith("end:"));
    return [];
  };
  const getListFilterValues = (valores, ft) => {
    if (ft === "number") return valores.filter((i) => !String(i).startsWith("min:") && !String(i).startsWith("max:"));
    if (ft === "date") return valores.filter((i) => !String(i).startsWith("start:") && !String(i).startsWith("end:"));
    return valores;
  };
  const parseDateFilterValue = (val) => {
    if (!val) return null;
    const s = String(val).split("T")[0];
    if (s.includes("/")) {
      const [dia, mes, ano] = s.split("/");
      if (!dia || !mes || !ano) return null;
      return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
    }
    const [ano, mes, dia] = s.split("-");
    if (!ano || !mes || !dia) return null;
    return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
  };
  const parseNumberFilterValue = (val) => {
    const s = String(val ?? "").trim();
    if (!s) return NaN;
    return Number(s.replace(/\./g, "").replace(",", "."));
  };
  const formatRangeTokenForInput = (token, ft, col) => {
    if (!token) return "";
    const raw = String(token).replace(/^(min:|max:|start:|end:)/, "");
    if (!raw) return "";
    if (ft === "date") {
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const [ano, mes, dia] = raw.split("T")[0].split("-");
        return `${dia}/${mes}/${ano}`;
      }
      return raw;
    }
    const n = parseNumberFilterValue(raw);
    if (!Number.isFinite(n)) return raw;
    if (col?.id === "codigo_empresa") return String(n);
    const places = col?.decimal_places ?? 2;
    return n.toLocaleString("pt-BR", col?.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 0 });
  };
  const getRangeTokenInputValue = (token) => {
    if (!token) return "";
    return String(token).replace(/^(min:|max:|start:|end:)/, "");
  };
  const normalizeRangeValoresForEdit = (colunaId, valores) => {
    const col = colunasDisponiveis.find((c) => c.id === colunaId);
    const ft = getColumnFilterType(col);
    if (ft !== "number" && ft !== "date") return valores;
    return valores.map((v) => {
      const s = String(v);
      if (s.startsWith("min:") || s.startsWith("max:") || s.startsWith("start:") || s.startsWith("end:")) {
        const prefix = s.match(/^(min:|max:|start:|end:)/)?.[0] || "";
        const formatted = formatRangeTokenForInput(s, ft, col);
        return formatted ? `${prefix}${formatted}` : v;
      }
      return v;
    });
  };
  const optionPassaRangeTemp = (opt, ft, tempValores) => {
    if (!tempValores?.length) return true;
    const minTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "start:" : "min:"));
    const maxTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "end:" : "max:"));
    if (!minTok && !maxTok) return true;
    if (ft === "number") {
      const nv = parseNumberFilterValue(String(opt));
      if (!Number.isFinite(nv)) return true;
      if (minTok) {
        const minN = parseNumberFilterValue(String(minTok).replace("min:", ""));
        if (Number.isFinite(minN) && nv < minN) return false;
      }
      if (maxTok) {
        const maxN = parseNumberFilterValue(String(maxTok).replace("max:", ""));
        if (Number.isFinite(maxN) && nv > maxN) return false;
      }
      return true;
    }
    if (ft === "date") {
      const ts = parseDateFilterValue(opt);
      if (ts === null) return true;
      if (minTok) {
        const startTs = parseDateFilterValue(String(minTok).replace("start:", ""));
        if (startTs !== null && ts < startTs) return false;
      }
      if (maxTok) {
        const endTs = parseDateFilterValue(String(maxTok).replace("end:", ""));
        if (endTs !== null && ts > endTs) return false;
      }
      return true;
    }
    return true;
  };
  const resolveColumnAlign = (col) => {
    if (col?.tipo === "date") return "center";
    if (col?.tipo === "number" || col?.tipo === "calculado" || col?.id === "codigo_empresa" || col?.id === "custom:valor") return "right";
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
  const getComparableValue = (emp, col) => { if (col.id === "codigo_empresa") return Number(emp.codigo_empresa || 0); return campoEngine.getValorBruto ? campoEngine.getValorBruto(emp, col) : getFieldValue(emp, col.id); };

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
    const opts = {};
    colunasDisponiveis.filter((c) => !c.fixo).forEach((col) => {
      const source = empresas.filter((e) => empresaPassaFiltros(e, col.id));
      opts[col.id] = [...new Set(source.map((e) => getFieldValue(e, col.id)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    });
    return opts;
  }, [empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

  const hasActiveFilter = (id) => (filtrosColunas[id] || []).length > 0;
  const getValoresFiltro = (id) => filtrosColunas[id] || [];
  const setValoresFiltro = (id, v) => setFiltrosColunas((p) => ({ ...p, [id]: v }));
  const clearColumnFilter = (id) => setValoresFiltro(id, []);

  const empresasFiltradas = useMemo(() => empresas.filter((emp) => empresaPassaFiltros(emp)), [empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

  const empresasOrdenadas = useMemo(() => {
    const sorted = [...empresasFiltradas];
    sorted.sort((a, b) => {
      if (sortConfig.key === "codigo_empresa") { const aV = Number(a.codigo_empresa || 0); const bV = Number(b.codigo_empresa || 0); return sortConfig.direction === "asc" ? aV - bV : bV - aV; }
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

  const totalPages = useMemo(() => {
    if (empresasOrdenadas.length === 0) return 1;
    return Math.ceil(empresasOrdenadas.length / pageSize);
  }, [empresasOrdenadas.length, pageSize]);

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const empresasPaginadas = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return empresasOrdenadas.slice(start, start + pageSize);
  }, [empresasOrdenadas, safeCurrentPage, pageSize]);

  useEffect(() => {
    localStorage.setItem(PAGE_SIZE_KEY, String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtrosColunas, searchTerm, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSort = (key) => setSortConfig((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }));

  const handleRowSelect = (emp, event) => {
    if (event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]")) return;
    if (event?.shiftKey && lastSelectedIdRef.current) { const si = empresasOrdenadas.findIndex((e) => e.id === lastSelectedIdRef.current); const ei = empresasOrdenadas.findIndex((e) => e.id === emp.id); if (si >= 0 && ei >= 0) { const [from, to] = [Math.min(si, ei), Math.max(si, ei)]; setSelectedItems(empresasOrdenadas.slice(from, to + 1).map((e) => e.id)); return; } }
    if (event?.ctrlKey || event?.metaKey) { setSelectedItems((p) => p.includes(emp.id) ? p.filter((id) => id !== emp.id) : [...p, emp.id]); return; }
    if (selectedItems.includes(emp.id)) { setSelectedItems([]); lastSelectedIdRef.current = null; return; }
    setSelectedItems([emp.id]); lastSelectedIdRef.current = emp.id;
  };

  const handleRowTouch = (emp, event) => { const now = Date.now(); if (lastTapRef.current.id === emp.id && now - lastTapRef.current.time < 300) { event.preventDefault(); if (selectedItems.length <= 1) onEdit(emp); } else { handleRowSelect(emp, event); } lastTapRef.current = { id: emp.id, time: now }; };
  const handleTableKeyDown = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); setSelectedItems(empresasOrdenadas.map((e) => e.id)); } };

  const renderFilterIcon = (active) => (
    active
      ? <FilterX className={FILTER_ICON_CLASS} strokeWidth={2} />
      : <Filter className={FILTER_ICON_CLASS} strokeWidth={2} />
  );

  const getRowBgClass = (index, selected) => {
    if (selected) return "emp-row-selected";
    return index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
  };

  const agregacoes = useMemo(() => campoEngine.calcularAgregacoes ? campoEngine.calcularAgregacoes(empresasOrdenadas, colunasOrdenadas, {}) : {}, [empresasOrdenadas, colunasOrdenadas]);

  const closeFilterMenu = () => {
    setMenuFiltroAberto(null);
    setFilterAnchorRect(null);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId: null, valores: [] });
  };

  const getFilterPanelRect = (colunaId) => {
    const el = filterAnchorRefs.current[colunaId];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const padding = 8;
    const left = Math.min(Math.max(rect.right - FILTER_POPOVER_WIDTH, padding), window.innerWidth - FILTER_POPOVER_WIDTH - padding);
    const top = rect.bottom + 6;
    return { columnId: colunaId, left, top, width: rect.width, height: rect.height };
  };

  const openFilterMenu = (colunaId) => {
    setFilterAnchorRect(getFilterPanelRect(colunaId));
    setMenuFiltroAberto(colunaId);
    setBuscaFiltroMenu("");
    setFiltroTemp({ colunaId, valores: normalizeRangeValoresForEdit(colunaId, [...getValoresFiltro(colunaId)]) });
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
    if (!menuFiltroAberto) return undefined;
    const onPointerDown = (event) => {
      const panel = filterPanelRef.current;
      const anchor = filterAnchorRefs.current[menuFiltroAberto];
      if (panel?.contains(event.target) || anchor?.contains(event.target)) return;
      closeFilterMenu();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeFilterMenu();
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
        className="emp-filter-popover fixed p-0 z-[9999]"
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
    const isInt = col.id === "codigo_empresa";
    const places = col.decimal_places ?? 2;
    return Number(valor).toLocaleString("pt-BR", isInt ? { maximumFractionDigits: 0 } : col.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 0 });
  };

  useEffect(() => {
    const buildCols = (cols) => cols.map((c) => ({ id: c.id, label: c.label, width: Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c)) }));
    const buildRows = (items, cols) => items.map((e) => cols.map((c) => getFieldValue(e, c.id)));
    const buildTotalRow = (cols, totals) => Object.keys(totals).length > 0 ? cols.map((c, i) => i === 0 ? "Totais" : totals[c.id] !== undefined ? formatTotalValue(totals[c.id], c) : "") : null;
    const exp = colunasOrdenadas.filter((c) => !c.fixo);
    const selEmps = empresasOrdenadas.filter((e) => selectedItems.includes(e.id));
    const totalRow = buildTotalRow(exp, agregacoes);
    onVisibleDataChange?.({ columns: buildCols(exp), rows: buildRows(empresasOrdenadas, exp), selectedRows: buildRows(selEmps, exp), totalRows: totalRow ? [totalRow] : [], allColumns: buildCols(colunasTodasOrdenadas), allRows: buildRows(empresasOrdenadas, colunasTodasOrdenadas), allSelectedRows: buildRows(selEmps, colunasTodasOrdenadas), allTotalRows: totalRow ? [totalRow] : [] });
  }, [colunasOrdenadas, colunasTodasOrdenadas, empresasOrdenadas, selectedItems, onVisibleDataChange, agregacoes, columnWidths]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-white select-none p-1.5">
      <Card className="emp-table-shell h-full overflow-hidden border border-slate-200 bg-white shadow-none">
        <CardContent className="h-full p-0 overflow-hidden flex flex-col">
          <div className="relative h-full overflow-hidden flex flex-col">
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              onKeyDown={handleTableKeyDown}
              className="relative flex-1 min-h-0 w-full outline-none overflow-auto"
            >
              <div
                className="block w-max min-w-full"
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
              >
              <Table
                ref={tableRef}
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
                className="emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none"
              >
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {colunasOrdenadas.map((col, colIndex) => {
                      const width = columnPixelWidths[col.id] || 160;
                      const isFrozen = colIndex < frozenColumnCount;
                      const isResizing = resizeColumnId === col.id;
                      const isColFiltered = hasActiveFilter(col.id);
                      const isFilterOpen = menuFiltroAberto === col.id;
                      return (
                        <TableHead
                          key={col.id}
                          style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }}
                          className={`emp-th group relative sticky top-0 align-middle px-1.5 whitespace-nowrap h-6 py-0 select-none cursor-pointer ${isFrozen ? "z-50" : "z-40"} ${getColumnAlignClass(col)}`}
                          onDoubleClick={() => handleSort(col.id)}
                        >
                          <div className={`emp-th-label-wrap flex items-center w-full h-full leading-6 whitespace-nowrap overflow-hidden ${getHeaderFlexClass(col)}`}>
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
                                className={`emp-header-filter-icon inline-flex h-3 w-3 shrink-0 items-center justify-center cursor-pointer text-[#082e54] ${
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
                            aria-label={`Redimensionar coluna ${formatHeaderLabel(col)}`}
                            className={`emp-col-resize-handle absolute top-0 right-0 h-full w-[7px] translate-x-1/2 z-[60] cursor-col-resize touch-none ${
                              isResizing ? "emp-col-resize-active" : ""
                            }`}
                            onMouseDown={(e) => startDragResize(e, col)}
                            onTouchStart={(e) => startDragResize(e, col)}
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                          />
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresasOrdenadas.length === 0
                    ? <TableRow><TableCell colSpan={colunasOrdenadas.length} className="text-center py-8 text-xs text-slate-400 border-b border-slate-200">Nenhuma empresa encontrada</TableCell></TableRow>
                    : empresasPaginadas.map((emp, index) => {
                      const isSelected = selectedItems.includes(emp.id);
                      const rowClass = getRowBgClass(index, isSelected);
                      return (
                      <TableRow key={emp.id} className={`${rowClass} transition-colors border-0 cursor-pointer select-none hover:brightness-[0.98]`} onClick={(e) => handleRowSelect(emp, e)} onDoubleClick={() => selectedItems.length <= 1 && onEdit(emp)} onTouchEnd={(e) => handleRowTouch(emp, e)}>
                        {colunasOrdenadas.map((col, colIndex) => {
                          const width = columnPixelWidths[col.id] || 160;
                          const isFrozen = colIndex < frozenColumnCount;
                          return (
                            <TableCell key={`${emp.id}-${col.id}`} style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }} className={`emp-td py-0 h-6 leading-6 text-[11px] align-middle border-0 whitespace-nowrap overflow-hidden select-none px-1.5 ${rowClass} ${isFrozen ? "sticky z-20" : ""} ${getColumnAlignClass(col)} ${isSelected ? "font-semibold" : ""}`} title={String(getFieldValue(emp, col.id) ?? "")}>
                              {getFieldValue(emp, col.id)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ); })
                  }
                  {Object.keys(agregacoes).length > 0 && (
                    <TableRow className="emp-total-row sticky bottom-0 z-30">
                      {colunasOrdenadas.map((col, ci) => {
                        const width = columnPixelWidths[col.id] || 160;
                        const isFrozen = ci < frozenColumnCount;
                        return (
                          <TableCell key={`total-${col.id}`} style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }} className={`emp-total-th h-[18px] px-1.5 py-0 text-[10px] leading-[18px] align-middle whitespace-nowrap overflow-hidden text-ellipsis select-none font-semibold ${isFrozen ? "sticky z-40" : ""} ${getColumnAlignClass(col)}`}>
                            {ci === 0 && agregacoes[col.id] === undefined ? "Totais" : agregacoes[col.id] !== undefined ? formatTotalValue(agregacoes[col.id], col) : ""}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
            <EmpTablePagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
      {menuFiltroAberto && filterAnchorRect?.columnId === menuFiltroAberto && renderFilterPopoverContent(menuFiltroAberto)}
      <EmpConfiguracaoColunasDialog open={showConfigColunas} onOpenChange={setShowConfigColunas} colunasDisponiveis={colunasDisponiveis} colunasVisiveis={colunasVisiveis} colunasOrdem={colunasOrdem} frozenColumnCount={frozenColumnCount} onChange={handleColumnLayoutChange} onResetDefault={handleResetColumnLayout} />
    </div>
  );
}