import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/components/emp/empRepository";
import campoEngine from "@/components/emp/empCampoEngine";
import EmpConfiguracaoColunasDialog from "@/components/emp/EmpConfiguracaoColunasDialog";
import { Filter, X, ArrowDownAZ, ArrowUpZA, GripVertical, Check, MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ACTIONS_COL_WIDTH = 28;

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
const MIN_COL_WIDTH = 80;
const getMinWidth = (col) => Math.max(MIN_COL_WIDTH, String(col?.label || "").length * 7 + 18);

const fmtData = (d) => { if (!d) return "-"; const [a, m, dia] = String(d).split("T")[0].split("-"); return !a || !m || !dia ? "-" : `${dia}/${m}/${a}`; };

const formatHeaderLabel = (col) => {
  const label = String(col?.label || "");
  if (col?.id === "custom:valor" || label.toUpperCase() === "VALOR") return "VALOR";
  return label;
};

export default function TBLEMP({ empresas = [], onEdit, showConfigColunas, setShowConfigColunas, searchTerm = "", selectedRecordId, onSelectionChange, onVisibleDataChange }) {
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
  const [resizeColumnId, setResizeColumnId] = useState(null);

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

  useEffect(() => { const onMove = (e) => { if (!dragRef.current) return; if (e.cancelable) e.preventDefault(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const { columnId, startX, startWidth, minWidth } = dragRef.current; setColumnWidths((p) => ({ ...p, [columnId]: Math.max(minWidth || MIN_COL_WIDTH, startWidth + (cx - startX)) })); }; const onUp = () => { if (!dragRef.current) return; dragRef.current = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onUp); return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); }; }, []);

  const startDragResize = (e, col) => { e.preventDefault(); e.stopPropagation(); const cx = e.touches?.[0]?.clientX ?? e.clientX; dragRef.current = { columnId: col.id, startX: cx, startWidth: columnWidths[col.id] || col.width || 160, minWidth: getMinWidth(col) }; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; };

  useEffect(() => { setSelectedItems((p) => { const valid = p.filter((id) => empresas.some((e) => e.id === id)); return p.length === valid.length && p.every((id, i) => id === valid[i]) ? p : valid; }); }, [empresas]);
  useEffect(() => { onSelectionChange?.(selectedItems); }, [selectedItems, onSelectionChange]);
  useEffect(() => { if (!selectedRecordId) return; setSelectedItems((p) => p.length === 1 && p[0] === selectedRecordId ? p : [selectedRecordId]); lastSelectedIdRef.current = selectedRecordId; }, [selectedRecordId]);

  const handleColumnLayoutChange = ({ visiveis, ordem, frozenColumnCount: nf }) => { setColunasVisiveis(visiveis); setColunasOrdem(ordem); if (nf !== undefined) setFrozenColumnCount(Math.max(0, Math.min(Number(nf) || 0, visiveis.length))); localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis)); localStorage.setItem(ORDER_KEY, JSON.stringify(ordem)); };
  const handleResetColumnLayout = () => { const def = colunasDisponiveis.filter((c) => !c.fixo); handleColumnLayoutChange({ visiveis: def.filter((c) => c.default).map((c) => c.id), ordem: def.map((c) => c.id) }); };

  const colunasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && colunasVisiveis.includes(c.id)), [colunasOrdem, colunasVisiveis, colunasDisponiveis]);
  const colunasTodasOrdenadas = useMemo(() => colunasOrdem.map((id) => colunasDisponiveis.find((c) => c.id === id)).filter((c) => c && !c.fixo), [colunasOrdem, colunasDisponiveis]);
  useEffect(() => { setFrozenColumnCount((c) => Math.min(c, colunasOrdenadas.length)); }, [colunasOrdenadas.length]);

  const columnPixelWidths = useMemo(() => Object.fromEntries(colunasOrdenadas.map((c) => [c.id, Math.max(columnWidths[c.id] || c.width || 160, getMinWidth(c))])), [colunasOrdenadas, columnWidths]);
  const totalTableWidth = useMemo(() => Math.max(isMobile ? 720 : 900, ACTIONS_COL_WIDTH + colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0)), [colunasOrdenadas, columnPixelWidths, isMobile]);
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

  const columnOptions = useMemo(() => { const opts = {}; colunasDisponiveis.filter((c) => !c.fixo).forEach((col) => { opts[col.id] = [...new Set(empresas.map((e) => getFieldValue(e, col.id)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" })); }); return opts; }, [empresas, colunasDisponiveis]);

  const hasActiveFilter = (id) => (filtrosColunas[id] || []).length > 0;
  const getValoresFiltro = (id) => filtrosColunas[id] || [];
  const setValoresFiltro = (id, v) => setFiltrosColunas((p) => ({ ...p, [id]: v }));
  const clearColumnFilter = (id) => setValoresFiltro(id, []);

  const empresasFiltradas = useMemo(() => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    return empresas.filter((emp) => {
      if (termo) { const m = colunasDisponiveis.filter((c) => !c.fixo).some((col) => String(getFieldValue(emp, col.id) || "").toLowerCase().includes(termo)); if (!m) return false; }
      return colunasDisponiveis.filter((c) => !c.fixo).every((col) => {
        const filtro = filtrosColunas[col.id] || [];
        if (filtro.length === 0) return true;
        const ft = getColumnFilterType(col);
        const raw = getComparableValue(emp, col);
        if (ft === "number") { const nv = Number(raw); const min = filtro.find((i) => String(i).startsWith("min:")); const max = filtro.find((i) => String(i).startsWith("max:")); const list = filtro.filter((i) => !String(i).startsWith("min:") && !String(i).startsWith("max:")); if (min && nv < Number(String(min).replace("min:", ""))) return false; if (max && nv > Number(String(max).replace("max:", ""))) return false; if (list.length > 0) return list.includes(getFieldValue(emp, col.id)); return true; }
        const val = getFieldValue(emp, col.id);
        return filtro.includes(val);
      });
    });
  }, [empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

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

  const renderSortIndicator = (colId) => {
    if (sortConfig.key !== colId) {
      return (
        <span className="inline-flex flex-col ml-1 opacity-35 leading-none">
          <ChevronUp className="w-2.5 h-2.5 -mb-1" />
          <ChevronDown className="w-2.5 h-2.5" />
        </span>
      );
    }
    return sortConfig.direction === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1 inline-block" />
      : <ChevronDown className="w-3 h-3 ml-1 inline-block" />;
  };

  const getRowBgClass = (index, selected) => {
    if (selected) return "emp-row-selected";
    return index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
  };

  const agregacoes = useMemo(() => campoEngine.calcularAgregacoes ? campoEngine.calcularAgregacoes(empresasOrdenadas, colunasOrdenadas, {}) : {}, [empresasOrdenadas, colunasOrdenadas]);

  const renderFilterControl = (colunaId) => {
    const btnCls = `h-4 w-4 min-w-4 p-0 ${hasActiveFilter(colunaId) ? "text-emerald-700" : "text-[#082e54] hover:text-[#082e54]/80"}`;
    const col = colunasDisponiveis.find((c) => c.id === colunaId);
    const opts = columnOptions[colunaId] || [];
    const ft = getColumnFilterType(col);
    const isRange = ft === "number" || ft === "date";
    const valSel = filtroTemp.colunaId === colunaId ? filtroTemp.valores : getValoresFiltro(colunaId);
    const filteredOpts = opts.filter((o) => String(o).toLowerCase().includes(buscaFiltroMenu.toLowerCase()));
    const allVisSel = filteredOpts.length > 0 && filteredOpts.every((o) => valSel.includes(o));
    return (
      <Popover open={menuFiltroAberto === colunaId} onOpenChange={(open) => { setMenuFiltroAberto(open ? colunaId : null); setBuscaFiltroMenu(""); setFiltroTemp(open ? { colunaId, valores: [...getValoresFiltro(colunaId)] } : { colunaId: null, valores: [] }); }}>
        <PopoverTrigger asChild><Button variant="ghost" size="icon" className={btnCls}><Filter className="w-3.5 h-3.5" /></Button></PopoverTrigger>
        <PopoverContent align="end" side="bottom" sideOffset={4} className="w-[310px] p-0 z-[9999] rounded-none">
          <div className="space-y-0.5 border-b px-1 py-1">
            <button type="button" className="flex items-center w-full h-8 text-xs hover:bg-slate-100 rounded pr-2 pl-2" onClick={() => { handleSort(colunaId); setMenuFiltroAberto(null); }}><ArrowDownAZ className="w-4 h-4 mr-2" /> Menor para Maior</button>
            <button type="button" className="flex items-center w-full px-2 h-8 text-xs hover:bg-slate-100 rounded" onClick={() => { setSortConfig({ key: colunaId, direction: "desc" }); setMenuFiltroAberto(null); }}><ArrowUpZA className="w-4 h-4 mr-2" /> Maior para Menor</button>
            <button type="button" className={`flex items-center w-full px-2 h-8 text-xs rounded ${hasActiveFilter(colunaId) ? "hover:bg-slate-100 text-slate-700" : "text-slate-300 cursor-not-allowed"}`} disabled={!hasActiveFilter(colunaId)} onClick={() => { clearColumnFilter(colunaId); setMenuFiltroAberto(null); }}><X className="w-4 h-4 mr-2" /> Limpar Filtro</button>
          </div>
          <div className="p-1 space-y-1">
            {isRange ? <div className="space-y-1"><div className="text-[11px] font-semibold text-slate-500">Entre</div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1"><Input type={ft === "date" ? "date" : "number"} value={String(valSel.find((i) => String(i).startsWith(ft === "date" ? "start:" : "min:")) || "").replace(ft === "date" ? "start:" : "min:", "")} onChange={(e) => setFiltroTemp((p) => ({ ...p, valores: [e.target.value ? `${ft === "date" ? "start" : "min"}:${e.target.value}` : "", ...p.valores.filter((i) => !String(i).startsWith(ft === "date" ? "start:" : "min:"))].filter(Boolean) }))} placeholder="De" className="h-[22px] text-xs rounded-none shadow-none focus-visible:ring-0 px-1" /><span className="text-xs text-slate-500">a</span><Input type={ft === "date" ? "date" : "number"} value={String(valSel.find((i) => String(i).startsWith(ft === "date" ? "end:" : "max:")) || "").replace(ft === "date" ? "end:" : "max:", "")} onChange={(e) => setFiltroTemp((p) => ({ ...p, valores: [e.target.value ? `${ft === "date" ? "end" : "max"}:${e.target.value}` : "", ...p.valores.filter((i) => !String(i).startsWith(ft === "date" ? "end:" : "max:"))].filter(Boolean) }))} placeholder="Até" className="h-[22px] text-xs rounded-none shadow-none focus-visible:ring-0 px-1" /></div></div>
              : <Input value={buscaFiltroMenu} onChange={(e) => setBuscaFiltroMenu(e.target.value)} placeholder="PESQUISAR" className="h-[22px] text-xs uppercase rounded-none shadow-none focus-visible:ring-0 px-1" />}
            {ft === "list" && <div className="border border-slate-300 rounded-none max-h-64 overflow-y-auto p-1 bg-white">
              <label className="flex h-8 items-center gap-2 px-2 py-0 text-xs text-slate-700 border-b border-slate-200 whitespace-nowrap overflow-hidden">
                <Checkbox checked={allVisSel} onCheckedChange={(c) => setFiltroTemp((p) => { const rest = p.valores.filter((v) => !filteredOpts.includes(v)); return { ...p, valores: c ? [...new Set([...rest, ...filteredOpts])] : rest }; })} className="h-3.5 w-3.5 shrink-0" />
                <span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap">(Selecionar Tudo)</span>
              </label>
              {filteredOpts.map((opt) => <label key={opt} className="flex h-6 items-center gap-2 px-2 py-0 text-xs text-slate-700 hover:bg-slate-50 whitespace-nowrap overflow-hidden"><Checkbox checked={valSel.includes(opt)} onCheckedChange={(c) => setFiltroTemp((p) => ({ ...p, valores: c ? [...p.valores, opt] : p.valores.filter((i) => i !== opt) }))} className="h-3.5 w-3.5 shrink-0" /><span className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{opt}</span></label>)}
            </div>}
            <div className="flex items-center justify-end gap-0 pt-2">
              <Button variant="outline" size="icon" title="Aplicar filtro" className="h-8 w-10 rounded-none border-slate-200 text-slate-800 hover:bg-slate-50" onClick={() => { setValoresFiltro(colunaId, filtroTemp.valores); setMenuFiltroAberto(null); setBuscaFiltroMenu(""); setFiltroTemp({ colunaId: null, valores: [] }); }}><Check className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" title="Cancelar" className="h-8 w-10 rounded-none -ml-px border-slate-200 text-slate-800 hover:bg-slate-50" onClick={() => { setMenuFiltroAberto(null); setBuscaFiltroMenu(""); setFiltroTemp({ colunaId: null, valores: [] }); }}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
    <div className="flex-1 min-h-0 overflow-hidden bg-white select-none">
      <Card className="h-full overflow-hidden rounded-none border-0 shadow-none">
        <CardContent className="h-full p-0 overflow-hidden rounded-none">
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
                      const filterControl = renderFilterControl(col.id);
                      return (
                        <TableHead
                          key={col.id}
                          style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }}
                          className={`emp-th group sticky top-0 align-middle px-1.5 whitespace-nowrap h-6 py-0 select-none cursor-pointer ${isFrozen ? "z-50" : "z-40"} ${getColumnAlignClass(col)}`}
                          onDoubleClick={() => handleSort(col.id)}
                        >
                          <div className={`flex items-center w-full h-full leading-6 whitespace-nowrap overflow-hidden ${getHeaderFlexClass(col)}`}>
                            <span className="truncate font-semibold">{formatHeaderLabel(col)}</span>
                            {renderSortIndicator(col.id)}
                          </div>
                          {filterControl && <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-50 flex items-center gap-0.5 bg-slate-50/95 pl-1 transition-opacity ${hasActiveFilter(col.id) || isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} onClick={(e) => e.stopPropagation()}>
                            {filterControl}
                            <button type="button" className={`h-5 w-4 flex items-center justify-center rounded cursor-col-resize ${isResizing ? "text-emerald-700 bg-emerald-100" : "text-[#082e54] hover:bg-slate-200"}`} onMouseDown={(e) => startDragResize(e, col)} onTouchStart={(e) => startDragResize(e, col)} onClick={(e) => e.stopPropagation()} title="Redimensionar"><GripVertical className="w-3.5 h-3.5" /></button>
                          </div>}
                          {isResizing && <div className="absolute top-0 right-0 h-full w-5 z-50 flex items-center justify-center cursor-col-resize bg-[#082e54]" onMouseDown={(e) => startDragResize(e, col)} onTouchStart={(e) => startDragResize(e, col)} onClick={(e) => { e.stopPropagation(); setResizeColumnId(null); }} onDoubleClick={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}><GripVertical className="w-3.5 h-3.5 text-white" /></div>}
                        </TableHead>
                      );
                    })}
                    <TableHead
                      style={{ width: ACTIONS_COL_WIDTH, minWidth: ACTIONS_COL_WIDTH, maxWidth: ACTIONS_COL_WIDTH }}
                      className="emp-th sticky top-0 z-40 text-center px-0"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresasOrdenadas.length === 0
                    ? <TableRow><TableCell colSpan={colunasOrdenadas.length + 1} className="text-center py-8 text-xs text-slate-400 border-b border-slate-200">Nenhuma empresa encontrada</TableCell></TableRow>
                    : empresasOrdenadas.map((emp, index) => {
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
                        <TableCell className={`emp-td emp-td-actions text-center px-0 ${rowClass}`} onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="h-5 w-5 inline-flex items-center justify-center text-[#082e54] hover:bg-slate-200/80 rounded-sm" title="Ações">
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 rounded-none p-1">
                              <DropdownMenuItem className="h-8 cursor-pointer text-xs" onClick={() => onEdit(emp)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem className="h-8 cursor-pointer text-xs" onClick={() => { setSelectedItems([emp.id]); onEdit(emp); }}>Visualizar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ); })
                  }
                  {Object.keys(agregacoes).length > 0 && (
                    <TableRow className="emp-total-row sticky bottom-0 z-30">
                      {colunasOrdenadas.map((col, ci) => {
                        const width = columnPixelWidths[col.id] || 160;
                        const isFrozen = ci < frozenColumnCount;
                        return (
                          <TableCell key={`total-${col.id}`} style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[col.id] : undefined }} className={`emp-total-th h-6 px-1.5 py-0 text-[11px] leading-6 align-middle whitespace-nowrap overflow-hidden text-ellipsis select-none font-semibold ${isFrozen ? "sticky z-40" : ""} ${getColumnAlignClass(col)}`}>
                            {ci === 0 && agregacoes[col.id] === undefined ? "Totais" : agregacoes[col.id] !== undefined ? formatTotalValue(agregacoes[col.id], col) : ""}
                          </TableCell>
                        );
                      })}
                      <TableCell className="emp-total-th emp-td-actions px-0" />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EmpConfiguracaoColunasDialog open={showConfigColunas} onOpenChange={setShowConfigColunas} colunasDisponiveis={colunasDisponiveis} colunasVisiveis={colunasVisiveis} colunasOrdem={colunasOrdem} frozenColumnCount={frozenColumnCount} onChange={handleColumnLayoutChange} onResetDefault={handleResetColumnLayout} />
    </div>
  );
}