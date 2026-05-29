import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SankhyaListToolbar from "@/components/common/SankhyaListToolbar";
import { toast } from "sonner";
import FORMEMP from "@/components/emp/FORMEMP";
import TBLEMP from "@/components/emp/TBLEMP";
import EmpConfiguracaoCamposDialog from "@/components/emp/EmpConfiguracaoCamposDialog";
import EmpConfiguracaoExportacaoDialog from "@/components/emp/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RegistroAnexosDialog from "@/components/common/RegistroAnexosDialog";
import empRepository from "@/components/emp/empRepository";
import { printEmpTable, exportEmpTableToExcel } from "@/components/emp/empTableExportUtils";
import { getEmpPdfExportConfig, getEmpExcelExportConfig } from "@/components/emp/empPdfExportConfig";

export default function PAGEMP() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
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
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const queryClient = useQueryClient();

  const { data: empresas = [] } = useQuery({
    queryKey: ["emp-cadastro"],
    queryFn: () => empRepository.list(),
    initialData: []
  });

  const currentEmp = empresas[selectedIndex] || empresas[0] || null;
  const selectedTableEmp = selectedTableItems.length === 1 ? empresas.find((e) => e.id === selectedTableItems[0]) : null;
  const hasActiveFilters = false;

  const createMutation = useMutation({
    mutationFn: (data) => empRepository.create(data),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
      setShowForm(false);
      setEditingEmp(null);
      setViewMode("table");
      toast.success("Empresa cadastrada!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => empRepository.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
      setShowForm(false);
      setEditingEmp(null);
      setViewMode("table");
      toast.success("Empresa atualizada!");
    }
  });

  const deleteMutation = useMutation({ mutationFn: (id) => empRepository.delete(id) });

  const handleSubmit = (data) => {
    if (editingEmp && !editingEmp._isDuplicate) {
      updateMutation.mutate({ id: editingEmp.id, data });
    } else {
      const { _isDuplicate, ...clean } = data;
      createMutation.mutate(clean);
    }
  };

  const handleEdit = (emp) => {
    const index = empresas.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setSelectedTableItems([emp.id]);
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const handleNew = () => {
    setReturnRecordAfterNew(showForm && viewMode === "record" ? editingEmp || currentEmp : null);
    setEditingEmp(null);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((p) => p + 1);
  };

  const handleDuplicate = (emp) => {
    setReturnRecordAfterNew(showForm && viewMode === "record" ? emp : null);
    const { id, created_date, updated_date, created_by, codigo_empresa, ...dup } = emp;
    setEditingEmp({ ...dup, _isDuplicate: true });
    setShowForm(true);
    setViewMode("record");
    setFormVersion((p) => p + 1);
  };

  const handleRequestDelete = (ids) => setDeleteState({ open: true, ids: Array.isArray(ids) ? ids : [ids] });
  const handleOpenConfigCampos = () => { setShowConfigCampos(true); };

  const handleTableSelectionChange = useCallback((ids) => {
    setSelectedTableItems((p) => { const same = p.length === ids.length && p.every((id, i) => id === ids[i]); return same ? p : ids; });
    if (ids.length === 1) { const i = empresas.findIndex((e) => e.id === ids[0]); if (i >= 0) setSelectedIndex(i); }
  }, [empresas]);

  const handleToggleView = () => {
    if (showForm) { setShowForm(false); setEditingEmp(null); setViewMode("table"); return; }
    if (selectedTableItems.length > 1) return;
    const emp = selectedTableEmp || currentEmp;
    if (!emp) return;
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const navigateRecord = (index) => {
    if (!showForm) return;
    const ni = Math.min(Math.max(index, 0), Math.max(empresas.length - 1, 0));
    setSelectedIndex(ni);
    if (empresas[ni]) { setEditingEmp(empresas[ni]); setSelectedTableItems([empresas[ni].id]); }
  };

  const handleConfirmDelete = async () => {
    const ids = deleteState.ids;
    setDeleteState({ open: false, ids: [] });
    let count = 0;
    for (const id of ids) { await deleteMutation.mutateAsync(id); count++; }
    if (count > 0) { await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] }); toast.success(count === 1 ? "Empresa excluída!" : `${count} empresas excluídas!`); }
  };

  const handleExportPdf = () => {
    const config = getEmpPdfExportConfig();
    const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const srcRows = config.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selRows = config.useConfiguredColumns ? visibleTableData.allSelectedRows || visibleTableData.selectedRows : visibleTableData.selectedRows;
    const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
    const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
    const filterRows = (rows = []) => rows.map((row) => selIdx.map((i) => row[i]));
    printEmpTable({ columns: selCols, rows: filterRows(selectedTableItems.length > 0 ? selRows || [] : srcRows || []), totalRows: [], title: `Cadastro de Empresas - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  const handleExportExcel = () => {
    const config = getEmpExcelExportConfig();
    const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const srcRows = config.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
    const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
    const filterRows = (rows = []) => rows.map((row) => selIdx.map((i) => row[i]));
    exportEmpTableToExcel({ columns: selCols, rows: filterRows(srcRows || []), totalRows: [], title: `Cadastro de Empresas - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  return (
    <div className="cadastro-emp-scope -mt-px p-0 md:p-0 bg-white h-[calc(100dvh-var(--app-content-offset,91px))] overflow-hidden">
      <style>{`.cadastro-emp-scope :where(.border, input, textarea, button, [role="button"], [data-radix-select-trigger]) { border-radius: 1.5px !important; }`}</style>

      {showConfigCampos && (
        <section className="w-full h-full bg-white overflow-hidden">
          <EmpConfiguracaoCamposDialog open={showConfigCampos} onOpenChange={setShowConfigCampos} inline />
        </section>
      )}

      {!showConfigCampos && showForm && (
        <div className="flex min-h-0 h-full w-full overflow-hidden">
          <div className="min-w-0 flex-1 h-full overflow-hidden">
            <FORMEMP
              key={`form-${formVersion}-${editingEmp?._isDuplicate ? "dup" : editingEmp ? "rec" : "new"}`}
              initialData={editingEmp}
              isEditing={!!editingEmp}
              onSubmit={handleSubmit}
              onCancel={() => {
                if (editingEmp && !editingEmp._isDuplicate) { setFormVersion((p) => p + 1); setViewMode("record"); return; }
                if ((editingEmp?._isDuplicate || !editingEmp) && returnRecordAfterNew) { setEditingEmp(returnRecordAfterNew); setShowForm(true); setViewMode("record"); setReturnRecordAfterNew(null); return; }
                setShowForm(false); setEditingEmp(null); setViewMode("table"); setReturnRecordAfterNew(null);
              }}
              onSettingsClick={handleOpenConfigCampos}
              onToggleView={handleToggleView}
              total={empresas.length} currentIndex={selectedIndex}
              onNew={handleNew}
              onFirst={() => navigateRecord(0)}
              onPrevious={() => navigateRecord(selectedIndex - 1)}
              onNext={() => navigateRecord(selectedIndex + 1)}
              onLast={() => navigateRecord(empresas.length - 1)}
              onDelete={() => editingEmp?.id && handleRequestDelete(editingEmp.id)}
              onDuplicate={() => editingEmp && handleDuplicate(editingEmp)}
              filterOpen={false} filterActive={false}
              onAttachClick={() => editingEmp?.id && setAttachmentsRecord(editingEmp)}
              attachDisabled={false}
            />
          </div>
        </div>
      )}

      <div className={showForm || showConfigCampos ? "hidden" : "flex min-h-0 h-full w-full overflow-hidden"}>
        <div className="min-w-0 flex-1 h-full overflow-hidden flex flex-col">
          <SankhyaListToolbar
            viewMode={viewMode}
            total={empresas.length}
            currentIndex={selectedIndex}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onNew={handleNew}
            onToggleView={handleToggleView}
            toggleViewDisabled={selectedTableItems.length > 1}
            filterActive={false}
            onDelete={() => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems)}
            onDuplicate={() => selectedTableEmp && handleDuplicate(selectedTableEmp)}
            onAttachClick={() => selectedTableEmp && setAttachmentsRecord(selectedTableEmp)}
            attachDisabled={selectedTableItems.length !== 1}
            onExportPdf={handleExportPdf}
            onConfigExportPdf={() => setShowConfigPdf(true)}
            onExportExcel={handleExportExcel}
            onConfigExportExcel={() => setShowConfigExcel(true)}
            onConfigColumns={() => setShowConfigColunas(true)}
            selectedCount={selectedTableItems.length}
            title="Cadastro de Empresas"
            recordLabel=""
          />
          <TBLEMP
            key="tbl-emp"
            empresas={empresas}
            onEdit={handleEdit}
            showConfigColunas={showConfigColunas}
            setShowConfigColunas={setShowConfigColunas}
            searchTerm={searchTerm}
            selectedRecordId={showForm ? editingEmp?.id : undefined}
            onSelectionChange={handleTableSelectionChange}
            onVisibleDataChange={setVisibleTableData}
          />
        </div>
      </div>

      <EmpConfiguracaoExportacaoDialog open={showConfigPdf} onOpenChange={setShowConfigPdf} columns={visibleTableData.allColumns || visibleTableData.columns || []} initialConfig={getEmpPdfExportConfig()} tipo="pdf" />
      <EmpConfiguracaoExportacaoDialog open={showConfigExcel} onOpenChange={setShowConfigExcel} columns={visibleTableData.allColumns || visibleTableData.columns || []} initialConfig={getEmpExcelExportConfig()} tipo="excel" />

      <RegistroAnexosDialog
        open={!!attachmentsRecord?.id}
        onOpenChange={(o) => { if (!o) setAttachmentsRecord(null); }}
        entityName="EmpresaCadastro"
        recordId={attachmentsRecord?.id}
        title={attachmentsRecord?.razao_social || attachmentsRecord?.codigo_empresa || "Empresa"}
      />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(o) => setDeleteState((p) => ({ ...p, open: o }))}
        title="Confirmar exclusão"
        description={deleteState.ids.length > 1 ? `Deseja excluir ${deleteState.ids.length} empresas?` : "Deseja excluir esta empresa?"}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}