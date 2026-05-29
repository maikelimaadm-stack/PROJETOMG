import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import campoEngine from "@/services/campoEngine";
import empresaCadastroRepository from "./empresaCadastroRepository";
import { Filter, X, ArrowDownAZ, ArrowUpZA, GripVertical, Check } from "lucide-react";
import ConfiguracaoColunasEmpresaDialog from "./ConfiguracaoColunasEmpresaDialog";

const COLUNAS_BASE = [
  { id: "codigo_empresa", label: "Código", default: true, sortable: true, align: "right", width: 80 },
  { id: "razao_social", label: "Razão Social", default: true, sortable: true, align: "left", width: 240 },
  { id: "nome_fantasia", label: "Nome Fantasia", default: true, sortable: true, align: "left", width: 200 },
  { id: "tipo_pessoa", label: "Tipo", default: true, sortable: true, align: "left", width: 70 },
  { id: "cpf_cnpj", label: "CPF/CNPJ", default: true, sortable: true, align: "left", width: 160 },
  { id: "telefone", label: "Telefone", default: true, sortable: true, align: "left", width: 130 },
  { id: "email", label: "E-mail", default: true, sortable: true, align: "left", width: 200 },
  { id: "cidade", label: "Cidade", default: true, sortable: true, align: "left", width: 150 },
  { id: "estado", label: "UF", default: true, sortable: true, align: "left", width: 60 },
  { id: "status", label: "Status", default: true, sortable: true, align: "left", width: 90 },
];

const COL_WIDTHS_KEY = "emp_colunas_largura";
const FROZEN_KEY = "emp_colunas_congeladas";
const VISIBLE_KEY = "emp_colunas_visiveis";
const ORDER_KEY = "emp_colunas_ordem";
const MIN_W = 60;

const getMin = (col) => Math.max(MIN_W, String(col?.label || "").length * 7 + 18);

export default function TBLEMP({ empresas = [], onEdit, showConfigColunas, setShowConfigColunas, searchTerm = "", selectedRecordId, onSelectionChange, onVisibleDataChange }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "codigo_empresa", direction: "asc" });
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(null);
  const [buscaFiltroMenu, setBuscaFiltroMenu] = useState("");
  const [filtroTemp, setFiltroTemp] = useState({ colunaId: null, valores: [] });
  const [filtrosColunas, setFiltrosColunas] = useState({});
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const scrollContainerRef = useRef(null);
  const headerScrollRef = useRef(null);
  const tableRef = useRef(null);
  const dragRef = useRef(null);
  const lastSelectedIdRef = useRef(null);
  const lastTapRef = useRef({ id: null, time: 0 });
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [resizeColumnId, setResizeColumnId] = useState(null);

  const [columnWidths, setColumnWidths] = useState(() => {
    const defaults = Object.fromEntries(COLUNAS_BASE.map(c => [c.id, c.width || 160]));
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(COL_WIDTHS_KEY) || "{}") }; } catch { return defaults; }
  });

  const [frozenColumnCount, setFrozenColumnCount] = useState(() => {
    const saved = Number(localStorage.getItem(FROZEN_KEY) || 0);
    return Number.isFinite(saved) ? saved : 0;
  });

  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empresaCadastroRepository.listCamposPersonalizados(),
    initialData: []
  });

  const colunasDisponiveis = useMemo(() => {
    const dinamicas = camposPersonalizados
      .map(campoEngine.normalize)
      .filter(c => c.ativo !== false && c.visivel_tabela === true)
      .map(c => ({ ...c, id: `custom:${c.field_name}`, label: c.label, default: true, sortable: c.ordenavel !== false, align: c.alinhamento || "left", width: c.largura_coluna || 160, ordem_tabela: c.ordem_tabela ?? 999, customField: c.field_name }));
    return [...COLUNAS_BASE, ...dinamicas.sort((a, b) => (a.ordem_tabela || 999) - (b.ordem_tabela || 999))];
  }, [camposPersonalizados]);

  const [colunasOrdem, setColunasOrdem] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]") || COLUNAS_BASE.map(c => c.id); } catch { return COLUNAS_BASE.map(c => c.id); }
  });

  const [colunasVisiveis, setColunasVisiveis] = useState(() => {
    const defaults = COLUNAS_BASE.filter(c => c.default).map(c => c.id);
    try { return [...new Set([...JSON.parse(localStorage.getItem(VISIBLE_KEY) || "[]"), ...defaults])] || defaults; } catch { return defaults; }
  });

  useEffect(() => {
    const custom = colunasDisponiveis.filter(c => c.id.startsWith("custom:") && c.default).map(c => c.id);
    setColunasVisiveis(prev => [...new Set([...prev, ...custom])]);
    setColunasOrdem(prev => [...new Set([...prev, ...custom])]);
  }, [colunasDisponiveis]);

  useEffect(() => { localStorage.setItem(COL_WIDTHS_KEY, JSON.stringify(columnWidths)); }, [columnWidths]);
  useEffect(() => { localStorage.setItem(FROZEN_KEY, String(frozenColumnCount)); }, [frozenColumnCount]);

  useEffect(() => {
    const onMove = e => {
      if (!dragRef.current) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const { columnId, startX, startWidth, minWidth } = dragRef.current;
      setColumnWidths(prev => ({ ...prev, [columnId]: Math.max(minWidth || MIN_W, startWidth + (clientX - startX)) }));
    };
    const onUp = () => { if (!dragRef.current) return; dragRef.current = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, []);

  const startDragResize = (e, coluna) => {
    e.preventDefault(); e.stopPropagation();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    dragRef.current = { columnId: coluna.id, startX: clientX, startWidth: columnWidths[coluna.id] || coluna.width || 160, minWidth: getMin(coluna) };
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  };

  const getFieldValue = (empresa, colunaId) => {
    if (colunaId === "codigo_empresa") return empresa.codigo_empresa ?? "";
    if (COLUNAS_BASE.find(c => c.id === colunaId)) return empresa[colunaId] ?? "";
    const col = colunasDisponiveis.find(c => c.id === colunaId);
    return campoEngine.getValorCampo(empresa, col || { id: colunaId }, {});
  };

  const getColumnFilterType = coluna => {
    if (["codigo_empresa"].includes(coluna?.id) || coluna?.tipo === "number") return "number";
    if (coluna?.tipo === "date") return "date";
    return "list";
  };

  const getColumnAlignClass = coluna => {
    const t = getColumnFilterType(coluna);
    if (t === "number") return "text-right";
    return "text-left";
  };

  const hasActiveFilter = colunaId => (filtrosColunas[colunaId] || []).length > 0;
  const getValoresFiltro = colunaId => filtrosColunas[colunaId] || [];
  const setValoresFiltro = (colunaId, values) => setFiltrosColunas(prev => ({ ...prev, [colunaId]: values }));
  const clearColumnFilter = colunaId => setValoresFiltro(colunaId, []);

  const columnOptions = useMemo(() => {
    const opts = {};
    colunasDisponiveis.filter(c => !c.fixo).forEach(col => {
      opts[col.id] = [...new Set(empresas.map(e => getFieldValue(e, col.id)).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
    });
    return opts;
  }, [empresas, colunasDisponiveis]);

  const empresasFiltradas = useMemo(() => {
    const termo = String(searchTerm || "").toLowerCase().trim();
    return empresas.filter(empresa => {
      if (termo) {
        const match = colunasDisponiveis.filter(c => !c.fixo).some(col => String(getFieldValue(empresa, col.id) || "").toLowerCase().includes(termo));
        if (!match) return false;
      }
      return colunasDisponiveis.filter(c => !c.fixo).every(col => {
        const filtro = filtrosColunas[col.id] || [];
        if (filtro.length === 0) return true;
        const ft = getColumnFilterType(col);
        const raw = getFieldValue(empresa, col.id);
        if (ft === "number") {
          const num = Number(raw);
          const min = filtro.find(i => String(i).startsWith("min:"));
          const max = filtro.find(i => String(i).startsWith("max:"));
          if (min && num < Number(String(min).replace("min:", ""))) return false;
          if (max && num > Number(String(max).replace("max:", ""))) return false;
          return true;
        }
        return filtro.includes(getFieldValue(empresa, col.id));
      });
    });
  }, [empresas, filtrosColunas, colunasDisponiveis, searchTerm]);

  const empresasOrdenadas = useMemo(() => {
    return [...empresasFiltradas].sort((a, b) => {
      const aV = getFieldValue(a, sortConfig.key);
      const bV = getFieldValue(b, sortConfig.key);
      if (sortConfig.key === "codigo_empresa") {
        return sortConfig.direction === "asc" ? Number(aV) - Number(bV) : Number(bV) - Number(aV);
      }
      const aS = String(aV).toLowerCase(); const bS = String(bV).toLowerCase();
      if (aS < bS) return sortConfig.direction === "asc" ? -1 : 1;
      if (aS > bS) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [empresasFiltradas, sortConfig]);

  const colunasOrdenadas = useMemo(() => colunasOrdem.map(id => colunasDisponiveis.find(c => c.id === id)).filter(c => c && colunasVisiveis.includes(c.id)), [colunasOrdem, colunasVisiveis, colunasDisponiveis]);

  const columnPixelWidths = useMemo(() => Object.fromEntries(colunasOrdenadas.map(c => [c.id, Math.max(columnWidths[c.id] || c.width || 160, getMin(c))])), [colunasOrdenadas, columnWidths]);

  const totalTableWidth = useMemo(() => {
    const cols = colunasOrdenadas.reduce((t, c) => t + (columnPixelWidths[c.id] || 160), 0);
    return Math.max(isMobile ? 600 : 800, cols);
  }, [colunasOrdenadas, columnPixelWidths, isMobile]);

  const frozenOffsets = useMemo(() => {
    let left = 0;
    return colunasOrdenadas.reduce((acc, c, i) => { if (i < frozenColumnCount) { acc[c.id] = left; left += columnPixelWidths[c.id] || 160; } return acc; }, {});
  }, [colunasOrdenadas, columnPixelWidths, frozenColumnCount]);

  useEffect(() => { setFrozenColumnCount(cur => Math.min(cur, colunasOrdenadas.length)); }, [colunasOrdenadas.length]);

  const handleColumnLayoutChange = ({ visiveis, ordem, frozenColumnCount: next }) => {
    setColunasVisiveis(visiveis); setColunasOrdem(ordem);
    if (next !== undefined) setFrozenColumnCount(Math.max(0, Math.min(Number(next) || 0, visiveis.length)));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(visiveis));
    localStorage.setItem(ORDER_KEY, JSON.stringify(ordem));
  };

  useEffect(() => { onSelectionChange?.(selectedItems); }, [selectedItems, onSelectionChange]);

  useEffect(() => {
    if (!selectedRecordId) return;
    setSelectedItems(prev => prev.length === 1 && prev[0] === selectedRecordId ? prev : [selectedRecordId]);
    lastSelectedIdRef.current = selectedRecordId;
  }, [selectedRecordId]);

  useEffect(() => {
    setSelectedItems(prev => { const valid = prev.filter(id => empresas.some(e => e.id === id)); return valid.length === prev.length ? prev : valid; });
  }, [empresas]);

  useEffect(() => {
    const cols = colunasOrdenadas.filter(c => !c.fixo);
    const rows = empresasOrdenadas.map(e => cols.map(c => String(getFieldValue(e, c.id) ?? "")));
    const selected = empresasOrdenadas.filter(e => selectedItems.includes(e.id)).map(e => cols.map(c => String(getFieldValue(e, c.id) ?? "")));
    onVisibleDataChange?.({ columns: cols.map(c => ({ id: c.id, label: c.label, width: columnPixelWidths[c.id] || c.width || 160 })), rows, selectedRows: selected, totalRows: [], allColumns: cols.map(c => ({ id: c.id, label: c.label, width: columnPixelWidths[c.id] || c.width || 160 })), allRows: rows, allSelectedRows: selected, allTotalRows: [] });
  }, [colunasOrdenadas, empresasOrdenadas, selectedItems, onVisibleDataChange, columnPixelWidths]);

  const handleBodyScroll = e => { if (headerScrollRef.current) headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft; };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setScrollbarWidth(Math.max(0, el.offsetWidth - el.clientWidth));
  }, [empresasOrdenadas.length, colunasOrdenadas.length]);

  const toggleSelectItem = id => { setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); lastSelectedIdRef.current = id; };

  const handleRowSelect = (empresa, event) => {
    if (event?.target?.closest?.("button, input, [role='checkbox'], [data-radix-popper-content-wrapper]")) return;
    if (event?.shiftKey && lastSelectedIdRef.current) {
      const si = empresasOrdenadas.findIndex(e => e.id === lastSelectedIdRef.current);
      const ei = empresasOrdenadas.findIndex(e => e.id === empresa.id);
      if (si >= 0 && ei >= 0) { const [f, t] = [Math.min(si, ei), Math.max(si, ei)]; setSelectedItems(empresasOrdenadas.slice(f, t + 1).map(e => e.id)); return; }
    }
    if (event?.ctrlKey || event?.metaKey) { toggleSelectItem(empresa.id); return; }
    if (selectedItems.includes(empresa.id)) { setSelectedItems([]); lastSelectedIdRef.current = null; return; }
    setSelectedItems([empresa.id]); lastSelectedIdRef.current = empresa.id;
  };

  const handleRowTouch = (empresa, event) => {
    const hadMultiple = selectedItems.length > 1;
    const now = Date.now();
    if (lastTapRef.current.id === empresa.id && now - lastTapRef.current.time < 300) { event.preventDefault(); if (!hadMultiple) onEdit(empresa); }
    else handleRowSelect(empresa, event);
    lastTapRef.current = { id: empresa.id, time: now };
  };

  const renderFilterControl = colunaId => {
    const btnCls = `h-4 w-4 min-w-4 p-0 ${hasActiveFilter(colunaId) ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"}`;
    const coluna = colunasDisponiveis.find(c => c.id === colunaId);
    const options = columnOptions[colunaId] || [];
    const filterType = getColumnFilterType(coluna);
    const isRange = filterType === "number" || filterType === "date";
    const selected = filtroTemp.colunaId === colunaId ? filtroTemp.valores : getValoresFiltro(colunaId);
    const filtered = options.filter(o => String(o).toLowerCase().includes(buscaFiltroMenu.toLowerCase()));
    const allSel = filtered.length > 0 && filtered.every(o => selected.includes(o));
    return (
      <Popover open={menuFiltroAberto === colunaId} onOpenChange={open => { setMenuFiltroAberto(open ? colunaId : null); setBuscaFiltroMenu(""); setFiltroTemp(open ? { colunaId, valores: [...getValoresFiltro(colunaId)] } : { colunaId: null, valores: [] }); }}>
        <PopoverTrigger asChild><Button variant="ghost" size="icon" className={btnCls}><Filter className="w-3.5 h-3.5" /></Button></PopoverTrigger>
        <PopoverContent align="end" side="bottom" sideOffset={4} className="w-[290px] p-0 z-[9999] rounded-none">
          <div className="space-y-0.5 border-b px-1 py-1">
            <button type="button" className="flex items-center w-full h-8 text-xs hover:bg-slate-100 rounded pr-2 pl-2" onClick={() => { setSortConfig({ key: colunaId, direction: "asc" }); setMenuFiltroAberto(null); }}><ArrowDownAZ className="w-4 h-4 mr-2" /> Crescente</button>
            <button type="button" className="flex items-center w-full px-2 h-8 text-xs hover:bg-slate-100 rounded" onClick={() => { setSortConfig({ key: colunaId, direction: "desc" }); setMenuFiltroAberto(null); }}><ArrowUpZA className="w-4 h-4 mr-2" /> Decrescente</button>
            <button type="button" className={`flex items-center w-full px-2 h-8 text-xs rounded ${hasActiveFilter(colunaId) ? "hover:bg-slate-100 text-slate-700" : "text-slate-300 cursor-not-allowed"}`} disabled={!hasActiveFilter(colunaId)} onClick={() => { clearColumnFilter(colunaId); setMenuFiltroAberto(null); }}><X className="w-4 h-4 mr-2" /> Limpar filtro</button>
          </div>
          <div className="p-1 space-y-1">
            {isRange ?
              <div className="space-y-1"><div className="text-[11px] font-semibold text-slate-500">Entre</div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                  <Input type={filterType === "date" ? "date" : "number"} value={String(selected.find(i => String(i).startsWith("min:")) || "").replace("min:", "")} onChange={e => setFiltroTemp(prev => ({ ...prev, valores: [e.target.value ? `min:${e.target.value}` : "", ...prev.valores.filter(i => !String(i).startsWith("min:"))].filter(Boolean) }))} placeholder="De" className="h-[22px] text-xs rounded-none shadow-none focus-visible:ring-0 px-1" />
                  <span className="text-xs text-slate-500">a</span>
                  <Input type={filterType === "date" ? "date" : "number"} value={String(selected.find(i => String(i).startsWith("max:")) || "").replace("max:", "")} onChange={e => setFiltroTemp(prev => ({ ...prev, valores: [e.target.value ? `max:${e.target.value}` : "", ...prev.valores.filter(i => !String(i).startsWith("max:"))].filter(Boolean) }))} placeholder="Até" className="h-[22px] text-xs rounded-none shadow-none focus-visible:ring-0 px-1" />
                </div>
              </div> :
              <Input value={buscaFiltroMenu} onChange={e => setBuscaFiltroMenu(e.target.value)} placeholder="PESQUISAR" className="h-[22px] text-xs uppercase rounded-none shadow-none focus-visible:ring-0 px-1" />}
            <div className="border border-slate-300 rounded-none max-h-56 overflow-y-auto p-1 bg-white">
              <label className="flex h-8 items-center gap-2 px-2 py-0 text-xs text-slate-700 border-b border-slate-200">
                <Checkbox checked={allSel} onCheckedChange={checked => { setFiltroTemp(prev => { const rest = prev.valores.filter(v => !filtered.includes(v)); return { ...prev, valores: checked ? [...new Set([...rest, ...filtered])] : rest }; }); }} className="h-3.5 w-3.5 shrink-0" />
                <span>(Selecionar Tudo)</span>
              </label>
              {filtered.map(option => <label key={option} className="flex h-6 items-center gap-2 px-2 py-0 text-xs text-slate-700 hover:bg-slate-50"><Checkbox checked={selected.includes(option)} onCheckedChange={checked => { setFiltroTemp(prev => ({ ...prev, valores: checked ? [...prev.valores, option] : prev.valores.filter(i => i !== option) })); }} className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{option}</span></label>)}
            </div>
            <div className="flex items-center justify-end gap-0 pt-1">
              <Button variant="outline" size="icon" className="h-8 w-10 rounded-none border-slate-200 text-slate-800 hover:bg-slate-50" onClick={() => { setValoresFiltro(colunaId, filtroTemp.valores); setMenuFiltroAberto(null); setBuscaFiltroMenu(""); setFiltroTemp({ colunaId: null, valores: [] }); }}><Check className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-10 rounded-none -ml-px border-slate-200 text-slate-800 hover:bg-slate-50" onClick={() => { setMenuFiltroAberto(null); setBuscaFiltroMenu(""); setFiltroTemp({ colunaId: null, valores: [] }); }}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-white select-none">
      <Card className="h-full overflow-hidden rounded-none border-0 shadow-none">
        <CardContent className="h-full p-0 overflow-hidden rounded-none">
          <div className="relative h-full overflow-hidden flex flex-col">
            <div ref={headerScrollRef} className="flex-none w-full overflow-hidden bg-white" style={{ paddingRight: scrollbarWidth }}>
              <Table style={{ width: totalTableWidth, minWidth: totalTableWidth }} className="border-separate border-spacing-0 table-fixed select-none">
                <TableHeader className="bg-white shadow-[0_1px_0_0_#d1d5db]">
                  <TableRow className="bg-white">
                    {colunasOrdenadas.map((coluna, ci) => {
                      const width = columnPixelWidths[coluna.id] || 160;
                      const isFrozen = ci < frozenColumnCount;
                      const isResizing = resizeColumnId === coluna.id;
                      const fc = renderFilterControl(coluna.id);
                      return (
                        <TableHead key={coluna.id} style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[coluna.id] : undefined }} className={`group ${isFrozen ? "sticky z-40" : "relative"} align-middle text-gray-900 px-2 text-xs font-medium border-r border-b border-gray-300 bg-white whitespace-nowrap h-7 py-0 select-none cursor-pointer ${getColumnAlignClass(coluna)}`} onDoubleClick={() => setSortConfig(prev => ({ key: coluna.id, direction: prev.key === coluna.id && prev.direction === "asc" ? "desc" : "asc" }))}>
                          <div className="block w-full h-full leading-7 whitespace-nowrap overflow-hidden text-ellipsis">{coluna.label}</div>
                          {fc && <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-50 flex items-center gap-0.5 bg-white/95 pl-1 transition-opacity ${hasActiveFilter(coluna.id) || isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} onClick={e => e.stopPropagation()}>{fc}<button type="button" className={`h-5 w-4 flex items-center justify-center rounded cursor-col-resize ${isResizing ? "text-emerald-700 bg-emerald-100" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`} onMouseDown={e => startDragResize(e, coluna)} onTouchStart={e => startDragResize(e, coluna)} onClick={e => e.stopPropagation()} title="Redimensionar"><GripVertical className="w-3.5 h-3.5" /></button></div>}
                          {isResizing && <div className="absolute top-0 right-0 h-full w-5 z-50 flex items-center justify-center cursor-col-resize bg-lime-800" onMouseDown={e => startDragResize(e, coluna)} onTouchStart={e => startDragResize(e, coluna)} onClick={e => { e.stopPropagation(); setResizeColumnId(null); }} onDoubleClick={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}><GripVertical className="w-3.5 h-3.5 text-white" /></div>}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div ref={scrollContainerRef} tabIndex={0} onScroll={handleBodyScroll} className="relative flex-1 min-h-0 w-full overflow-auto outline-none">
              <Table ref={tableRef} style={{ width: totalTableWidth, minWidth: totalTableWidth }} className="border-separate border-spacing-0 table-fixed">
                <TableBody>
                  {empresasOrdenadas.length === 0 ?
                    <TableRow><TableCell colSpan={colunasOrdenadas.length} className="text-center py-8 text-xs text-slate-400 border border-gray-300">Nenhuma empresa encontrada</TableCell></TableRow> :
                    empresasOrdenadas.map((empresa, index) => (
                      <TableRow key={empresa.id} className={`${selectedItems.includes(empresa.id) ? "bg-green-500 hover:bg-green-600 text-white" : index % 2 === 0 ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-100"} transition-colors border-b cursor-pointer select-none`} onClick={e => handleRowSelect(empresa, e)} onDoubleClick={() => selectedItems.length <= 1 && onEdit(empresa)} onTouchEnd={e => handleRowTouch(empresa, e)}>
                        {colunasOrdenadas.map((coluna, ci) => {
                          const width = Math.max(columnWidths[coluna.id] || coluna.width || 160, getMin(coluna));
                          const isFrozen = ci < frozenColumnCount;
                          return (
                            <TableCell key={`${empresa.id}-${coluna.id}`} style={{ width, minWidth: width, maxWidth: width, left: isFrozen ? frozenOffsets[coluna.id] : undefined }} className={`py-1 text-xs align-middle border-r border-b whitespace-nowrap overflow-hidden select-none px-2 ${isFrozen ? "sticky z-20" : ""} ${getColumnAlignClass(coluna)} ${selectedItems.includes(empresa.id) ? "bg-green-500 text-white border-green-600" : index % 2 === 0 ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-white text-gray-700 border-gray-300"}`} title={String(getFieldValue(empresa, coluna.id) ?? "")}>
                              {getFieldValue(empresa, coluna.id)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      <ConfiguracaoColunasEmpresaDialog open={showConfigColunas} onOpenChange={setShowConfigColunas} colunasDisponiveis={colunasDisponiveis} colunasVisiveis={colunasVisiveis} colunasOrdem={colunasOrdem} frozenColumnCount={frozenColumnCount} onChange={handleColumnLayoutChange} onResetDefault={() => handleColumnLayoutChange({ visiveis: COLUNAS_BASE.filter(c => c.default).map(c => c.id), ordem: colunasDisponiveis.filter(c => !c.fixo).map(c => c.id) })} />
    </div>
  );
}