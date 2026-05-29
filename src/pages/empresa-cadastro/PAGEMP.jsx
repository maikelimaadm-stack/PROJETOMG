// PAGEMP = Página de Cadastro de Empresas
import React, { useCallback, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SankhyaListToolbar from "@/components/common/SankhyaListToolbar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RegistroAnexosDialog from "@/components/common/RegistroAnexosDialog";
import TBLEMP from "@/components/empresa-cadastro/TBLEMP";
import FRMEMP from "@/components/empresa-cadastro/FRMEMP";
import CMPSEMP from "@/components/empresa-cadastro/CMPSEMP";
import ConfiguracaoExportacaoPdfLotesDialog from "@/components/lotes/ConfiguracaoExportacaoPdfLotesDialog";
import empresaCadastroRepository from "@/components/empresa-cadastro/empresaCadastroRepository";
import {
  getEmpresaPdfExportConfig,
  getEmpresaExcelExportConfig,
  printEmpresaTable,
  exportEmpresaToExcel,
  PDF_EXPORT_KEY,
  EXCEL_EXPORT_KEY
} from "@/components/empresa-cadastro/empresaExportUtils";

export default function PAGEMP() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [showConfigCampos, setShowConfigCampos] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTableItems, setSelectedTableItems] = useState([]);
  const [formVersion, setFormVersion] = useState(0);
  const [returnRecordAfterNew, setReturnRecordAfterNew] = useState(null);
  const [attachmentsRecord, setAttachmentsRecord] = useState(null);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [], selectedRows: [], totalRows: [] });
  const queryClient = useQueryClient();

  const { data: empresas = [] } = useQuery({
    queryKey: ["emp-cadastro"],
    queryFn: () => empresaCadastroRepository.list(),
    initialData: []
  });

  const hasActiveFilters = false;
  const empresasFiltradas = empresas;

  const createMutation = useMutation({
    mutationFn: data => empresaCadastroRepository.create(data),
    onSuccess: created => {
      queryClient.setQueryData(["emp-cadastro"], cur => [created, ...(cur || [])]);
      queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
      setShowForm(false); setEditingEmpresa(null);
      toast.success("Empresa cadastrada!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => empresaCadastroRepository.update(id, data),
    onSuccess: updated => {
      queryClient.setQueryData(["emp-cadastro"], cur => (cur || []).map(e => e.id === updated.id ? updated : e));
      queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
      setShowForm(false); setEditingEmpresa(null);
      toast.success("Empresa atualizada!");
    }
  });

  const deleteMutation = useMutation({ mutationFn: id => empresaCadastroRepository.delete(id) });

  const handleSubmit = data => {
    if (editingEmpresa && !editingEmpresa._isDuplicate) {
      updateMutation.mutate({ id: editingEmpresa.id, data });
    } else {
      const { _isDuplicate, ...clean } = data;
      createMutation.mutate(clean);
    }
  };

  const handleEdit = empresa => {
    const idx = empresasFiltradas.findIndex(e => e.id === empresa.id);
    if (idx >= 0) setSelectedIndex(idx);
    setSelectedTableItems([empresa.id]);
    setEditingEmpresa(empresa);
    setShowForm(true);
    setViewMode("record");
  };

  const handleNew = () => {
    setReturnRecordAfterNew(showForm && viewMode === "record" ? editingEmpresa || currentEmpresa : null);
    setEditingEmpresa(null); setShowForm(true); setViewMode("record");
    setPendingAttachments([]); setFormVersion(prev => prev + 1);
  };

  const handleDuplicate = empresa => {
    setReturnRecordAfterNew(showForm && viewMode === "record" ? empresa : null);
    const { id, created_date, updated_date, created_by, codigo_empresa, ...dup } = empresa;
    setEditingEmpresa({ ...dup, _isDuplicate: true });
    setShowForm(true); setViewMode("record"); setFormVersion(prev => prev + 1);
  };

  const currentEmpresa = empresasFiltradas[selectedIndex] || empresasFiltradas[0] || null;
  const selectedTableEmpresa = selectedTableItems.length === 1 ? empresasFiltradas.find(e => e.id === selectedTableItems[0]) : null;

  const navigateRecord = idx => {
    if (!showForm) return;
    const next = Math.min(Math.max(idx, 0), Math.max(empresasFiltradas.length - 1, 0));
    setSelectedIndex(next);
    if (empresasFiltradas[next]) { setEditingEmpresa(empresasFiltradas[next]); setSelectedTableItems([empresasFiltradas[next].id]); }
  };

  const handleToggleView = () => {
    if (showForm) { setShowForm(false); setEditingEmpresa(null); setViewMode("table"); return; }
    if (selectedTableItems.length > 1) return;
    const emp = selectedTableEmpresa || currentEmpresa;
    if (!emp) return;
    setEditingEmpresa(emp); setShowForm(true); setViewMode("record");
  };

  const handleTableSelectionChange = useCallback(ids => {
    setSelectedTableItems(prev => { const same = prev.length === ids.length && prev.every((id, i) => id === ids[i]); return same ? prev : ids; });
    if (ids.length === 1) { const idx = empresasFiltradas.findIndex(e => e.id === ids[0]); if (idx >= 0) setSelectedIndex(idx); }
  }, [empresasFiltradas]);

  const handleConfirmDelete = async () => {
    const ids = deleteState.ids;
    setDeleteState({ open: false, ids: [] });
    let count = 0;
    for (const id of ids) { try { await deleteMutation.mutateAsync(id); count++; } catch {} }
    if (count > 0) {
      await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
      toast.success(count === 1 ? "Empresa excluída!" : `${count} empresas excluídas!`);
    }
  };

  const handleOpenConfigCampos = () => { setShowConfigCampos(true); };

  const handleExportPdf = () => {
    const cfg = getEmpresaPdfExportConfig();
    const src = cfg.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const rows = cfg.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selRows = cfg.useConfiguredColumns ? visibleTableData.allSelectedRows || visibleTableData.selectedRows : visibleTableData.selectedRows;
    const cols = cfg.useConfiguredColumns && cfg.columnIds.length ? src.filter(c => cfg.columnIds.includes(c.id)) : src;
    const idxs = cols.map(c => src.findIndex(s => s.id === c.id));
    const filterRows = r => (r || []).map(row => idxs.map(i => row[i]));
    printEmpresaTable({ columns: cols, rows: filterRows(selectedTableItems.length > 0 ? selRows : rows), totalRows: [] });
  };

  const handleExportExcel = () => {
    const cfg = getEmpresaExcelExportConfig();
    const src = cfg.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const rows = cfg.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selRows = cfg.useConfiguredColumns ? visibleTableData.allSelectedRows || visibleTableData.selectedRows : visibleTableData.selectedRows;
    const cols = cfg.useConfiguredColumns && cfg.columnIds.length ? src.filter(c => cfg.columnIds.includes(c.id)) : src;
    const idxs = cols.map(c => src.findIndex(s => s.id === c.id));
    const filterRows = r => (r || []).map(row => idxs.map(i => row[i]));
    exportEmpresaToExcel({ columns: cols, rows: filterRows(selectedTableItems.length > 0 ? selRows : rows), totalRows: [] });
  };

  return (
    <div className="emp-cadastro-scope -mt-px p-0 md:p-0 bg-white h-[calc(100dvh-var(--app-content-offset,91px))] overflow-hidden">
      <style>{`.emp-cadastro-scope :where(.border,input,textarea,button,[role="button"],[data-radix-select-trigger]){border-radius:1.5px!important}`}</style>

      {showConfigCampos && (
        <section className="w-full h-full bg-white overflow-hidden">
          <CMPSEMP open={showConfigCampos} onOpenChange={setShowConfigCampos} inline />
        </section>
      )}

      {!showConfigCampos && showForm && (
        <div className="flex min-h-0 h-full w-full overflow-hidden">
          <div className="min-w-0 flex-1 h-full overflow-hidden">
            <FRMEMP
              key={`form-${formVersion}-${editingEmpresa?._isDuplicate ? "dup" : editingEmpresa ? "edit" : "new"}`}
              initialData={editingEmpresa}
              isEditing={!!editingEmpresa}
              onSubmit={handleSubmit}
              onCancel={() => {
                if (editingEmpresa && !editingEmpresa._isDuplicate) { setFormVersion(p => p + 1); setViewMode("record"); return; }
                if (returnRecordAfterNew) { setEditingEmpresa(returnRecordAfterNew); setShowForm(true); setViewMode("record"); setReturnRecordAfterNew(null); return; }
                setShowForm(false); setEditingEmpresa(null); setViewMode("table"); setReturnRecordAfterNew(null); setPendingAttachments([]);
              }}
              onSettingsClick={handleOpenConfigCampos}
              onToggleView={handleToggleView}
              total={empresasFiltradas.length} currentIndex={selectedIndex}
              onNew={handleNew}
              onFirst={() => navigateRecord(0)} onPrevious={() => navigateRecord(selectedIndex - 1)}
              onNext={() => navigateRecord(selectedIndex + 1)} onLast={() => navigateRecord(empresasFiltradas.length - 1)}
              onDelete={() => editingEmpresa?.id && setDeleteState({ open: true, ids: [editingEmpresa.id] })}
              onDuplicate={() => editingEmpresa && handleDuplicate(editingEmpresa)}
              onAttachClick={() => editingEmpresa?.id ? setAttachmentsRecord(editingEmpresa) : undefined}
              attachDisabled={!editingEmpresa?.id}
            />
          </div>
        </div>
      )}

      <div className={showForm || showConfigCampos ? "hidden" : "flex min-h-0 h-full w-full overflow-hidden"}>
        <div className="min-w-0 flex-1 h-full overflow-hidden flex flex-col">
          <SankhyaListToolbar
            viewMode={viewMode}
            total={empresasFiltradas.length} currentIndex={selectedIndex}
            searchValue={searchTerm} onSearchChange={setSearchTerm}
            onNew={handleNew} onToggleView={handleToggleView}
            toggleViewDisabled={selectedTableItems.length > 1}
            filterActive={hasActiveFilters}
            onFirst={() => navigateRecord(0)} onPrevious={() => navigateRecord(selectedIndex - 1)}
            onNext={() => navigateRecord(selectedIndex + 1)} onLast={() => navigateRecord(empresasFiltradas.length - 1)}
            onDelete={() => selectedTableItems.length > 0 && setDeleteState({ open: true, ids: selectedTableItems })}
            onDuplicate={() => selectedTableEmpresa && handleDuplicate(selectedTableEmpresa)}
            onAttachClick={() => selectedTableEmpresa && setAttachmentsRecord(selectedTableEmpresa)}
            attachDisabled={selectedTableItems.length !== 1}
            onExportPdf={handleExportPdf}
            onConfigExportPdf={() => setShowConfigPdf(true)}
            onExportExcel={handleExportExcel}
            onConfigExportExcel={() => setShowConfigExcel(true)}
            onConfigColumns={() => setShowConfigColunas(true)}
            selectedCount={selectedTableItems.length}
            title="Cadastro de Empresas"
            recordLabel="" />
          <TBLEMP
            key="table"
            empresas={empresasFiltradas}
            onEdit={handleEdit}
            showConfigColunas={showConfigColunas}
            setShowConfigColunas={setShowConfigColunas}
            searchTerm={searchTerm}
            selectedRecordId={showForm ? editingEmpresa?.id : undefined}
            onSelectionChange={handleTableSelectionChange}
            onVisibleDataChange={setVisibleTableData} />
        </div>
      </div>

      <ConfiguracaoExportacaoPdfLotesDialog
        open={showConfigPdf} onOpenChange={setShowConfigPdf}
        columns={visibleTableData.allColumns || visibleTableData.columns || []}
        initialConfig={getEmpresaPdfExportConfig()}
        tipo="pdf"
        storageKey={PDF_EXPORT_KEY} />

      <ConfiguracaoExportacaoPdfLotesDialog
        open={showConfigExcel} onOpenChange={setShowConfigExcel}
        columns={visibleTableData.allColumns || visibleTableData.columns || []}
        initialConfig={getEmpresaExcelExportConfig()}
        tipo="excel"
        storageKey={EXCEL_EXPORT_KEY} />

      <RegistroAnexosDialog
        open={!!attachmentsRecord?.id}
        onOpenChange={o => { if (!o) setAttachmentsRecord(null); }}
        entityName="EmpresaCadastro"
        recordId={attachmentsRecord?.id}
        title={attachmentsRecord?.razao_social || attachmentsRecord?.nome_fantasia || "Empresa"}
        pendingAnexos={pendingAttachments}
        onPendingChange={setPendingAttachments} />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={o => setDeleteState(prev => ({ ...prev, open: o }))}
        title="Confirmar exclusão"
        description={deleteState.ids.length > 1 ? `Deseja excluir ${deleteState.ids.length} empresas?` : "Deseja excluir esta empresa?"}
        confirmText="Excluir" cancelText="Cancelar" variant="destructive"
        onConfirm={handleConfirmDelete} />
    </div>
  );
}