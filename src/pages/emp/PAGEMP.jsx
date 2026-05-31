import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SankhyaListToolbar from "@/components/emp/toolbars/EmpListToolbar";
import { toast } from "sonner";
import FORMEMP from "@/components/emp/FORMEMP";
import TBLEMP from "@/components/emp/TBLEMP";
import EmpConfiguracaoCamposDialog from "@/components/emp/EmpConfiguracaoCamposDialog";
import EmpConfiguracaoExportacaoDialog from "@/components/emp/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RegistroAnexosDialog from "@/components/common/RegistroAnexosDialog";
import empRepository from "@/components/emp/empRepository";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/components/emp/empCodigoUtils";
import { printEmpTable, exportEmpTableToExcel } from "@/components/emp/empTableExportUtils";
import { getEmpPdfExportConfig, getEmpExcelExportConfig } from "@/components/emp/empPdfExportConfig";

const getEmpSearchValues = (emp) => [
  emp.codigo_empresa,
  emp.razao_social,
  emp.nome_fantasia,
  emp.tipo_pessoa,
  emp.cpf_cnpj,
  emp.inscricao_estadual,
  emp.telefone,
  emp.whatsapp,
  emp.email,
  emp.cep,
  emp.endereco,
  emp.numero,
  emp.bairro,
  emp.cidade,
  emp.estado,
  emp.observacoes,
  emp.status,
  ...Object.values(emp.campos_personalizados || {})
];

const filterEmpresasBySearch = (items, term) => {
  const termo = String(term || "").toLowerCase().trim();
  if (!termo) return items;
  return items.filter((emp) =>
    getEmpSearchValues(emp).some((value) => String(value || "").toLowerCase().includes(termo))
  );
};

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
  const [tableFilteredEmpresas, setTableFilteredEmpresas] = useState(null);
  const queryClient = useQueryClient();

  const { data: empresas = [] } = useQuery({
    queryKey: ["emp-cadastro"],
    queryFn: () => empRepository.list(),
    initialData: []
  });

  const empresasFiltradasPainel = useMemo(
    () => filterEmpresasBySearch(empresas, searchTerm),
    [empresas, searchTerm]
  );

  const empresasNavegacao = showForm
    ? empresasFiltradasPainel
    : (tableFilteredEmpresas ?? empresasFiltradasPainel);

  const currentEmp = empresasNavegacao[selectedIndex] || empresasNavegacao[0] || null;
  const selectedTableEmp = selectedTableItems.length === 1 ? empresasNavegacao.find((e) => e.id === selectedTableItems[0]) : null;
  const hasActiveFilters = false;

  const stayOnRecordAfterSave = useCallback(async (savedRecord) => {
    const normalized = normalizeEmpresaRecord(savedRecord);
    const savedId = normalized?.id;
    const savedCodigo = Number(normalized?.codigo_empresa);

    if (!savedId && !(Number.isFinite(savedCodigo) && savedCodigo > 0)) {
      setShowForm(true);
      setViewMode("record");
      return;
    }

    setReturnRecordAfterNew(null);
    setEditingEmp(normalized);
    if (savedId) setSelectedTableItems([savedId]);
    setShowForm(true);
    setViewMode("record");

    await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });

    const list = await queryClient.fetchQuery({
      queryKey: ["emp-cadastro"],
      queryFn: () => empRepository.list()
    });
    const fresh = findEmpresaInList(list, normalized) ?? normalized;
    setEditingEmp(fresh);
    if (fresh?.id) setSelectedTableItems([fresh.id]);

    const filtered = filterEmpresasBySearch(list, searchTerm);
    const navIndex = filtered.findIndex(
      (item) => item.id === fresh.id || Number(item.codigo_empresa) === Number(fresh.codigo_empresa)
    );
    if (navIndex >= 0) setSelectedIndex(navIndex);
  }, [queryClient, searchTerm]);

  const deleteMutation = useMutation({ mutationFn: (id) => empRepository.delete(id) });

  const handleSubmit = useCallback(async (data) => {
    const isUpdate = Boolean(editingEmp && !editingEmp._isDuplicate);

    try {
      let savedRecord;

      if (isUpdate) {
        savedRecord = await empRepository.update(editingEmp.id, data);
        toast.success("Empresa atualizada!");
      } else {
        const { _isDuplicate, ...clean } = data;
        savedRecord = await empRepository.create(clean);
        toast.success("Empresa cadastrada!");
      }

      await stayOnRecordAfterSave(savedRecord);
      setFormVersion((version) => version + 1);
    } catch {
      toast.error(isUpdate ? "Não foi possível atualizar a empresa." : "Não foi possível cadastrar a empresa.");
    }
  }, [editingEmp, stayOnRecordAfterSave]);

  const handleEdit = (emp) => {
    const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
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

  useEffect(() => {
    if (!showForm || viewMode !== "record" || !editingEmp || editingEmp?._isDuplicate) return;
    if (empresasNavegacao.length === 0) return;

    const currentFilteredIndex = editingEmp.id
      ? empresasNavegacao.findIndex((item) => item.id === editingEmp.id)
      : -1;

    if (currentFilteredIndex >= 0) {
      if (selectedIndex !== currentFilteredIndex) setSelectedIndex(currentFilteredIndex);
      const fresh = empresasNavegacao[currentFilteredIndex];
      if (fresh?.id === editingEmp.id && fresh.updated_date !== editingEmp.updated_date) {
        setEditingEmp(fresh);
      }
    }
  }, [showForm, viewMode, empresasNavegacao, editingEmp?.id, editingEmp?.updated_date, editingEmp?._isDuplicate, selectedIndex]);

  const handleTableSelectionChange = useCallback((ids) => {
    setSelectedTableItems((p) => { const same = p.length === ids.length && p.every((id, i) => id === ids[i]); return same ? p : ids; });
    if (ids.length === 1) { const i = empresasNavegacao.findIndex((e) => e.id === ids[0]); if (i >= 0) setSelectedIndex(i); }
  }, [empresasNavegacao]);

  const handleToggleView = () => {
    if (showForm) { setShowForm(false); setEditingEmp(null); setViewMode("table"); return; }
    if (selectedTableItems.length > 1) return;
    const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
    if (!emp) return;
    const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const navigateRecord = (index) => {
    if (!showForm) return;
    const ni = Math.min(Math.max(index, 0), Math.max(empresasNavegacao.length - 1, 0));
    setSelectedIndex(ni);
    if (empresasNavegacao[ni]) { setEditingEmp(empresasNavegacao[ni]); setSelectedTableItems([empresasNavegacao[ni].id]); }
  };

  const handleConfirmDelete = async () => {
    const ids = deleteState.ids;
    setDeleteState({ open: false, ids: [] });
    if (ids.length === 0) return;

    const wasOnForm = showForm && viewMode === "record";
    const deletedCurrentFromForm = wasOnForm && editingEmp?.id && ids.includes(editingEmp.id);
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? empresasNavegacao.findIndex((item) => item.id === editingEmp.id)
      : -1;

    let count = 0;
    for (const id of ids) {
      await deleteMutation.mutateAsync(id);
      count++;
    }

    if (count === 0) return;

    if (attachmentsRecord?.id && ids.includes(attachmentsRecord.id)) {
      setAttachmentsRecord(null);
    }

    await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });

    const list = await queryClient.fetchQuery({
      queryKey: ["emp-cadastro"],
      queryFn: () => empRepository.list()
    });
    const filtered = filterEmpresasBySearch(list, searchTerm);

    if (deletedCurrentFromForm) {
      if (filtered.length === 0) {
        setShowForm(false);
        setEditingEmp(null);
        setViewMode("table");
        setSelectedTableItems([]);
        setSelectedIndex(0);
      } else {
        const nextIndex = Math.min(Math.max(navIndexBeforeDelete, 0), filtered.length - 1);
        const nextEmp = filtered[nextIndex];
        setEditingEmp(nextEmp);
        setSelectedIndex(nextIndex);
        setSelectedTableItems([nextEmp.id]);
        setShowForm(true);
        setViewMode("record");
        setFormVersion((version) => version + 1);
      }
    } else {
      setSelectedTableItems((prev) => prev.filter((id) => !ids.includes(id)));

      if (showForm && viewMode === "record" && editingEmp?.id) {
        const fresh = findEmpresaInList(filtered, editingEmp);
        if (fresh) {
          setEditingEmp(fresh);
          const idx = filtered.findIndex((item) => item.id === fresh.id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      } else if (filtered.length === 0) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((prev) => Math.min(prev, filtered.length - 1));
      }
    }

    toast.success(count === 1 ? "Empresa excluída!" : `${count} empresas excluídas!`);
  };

  const handleExportPdf = () => {
    const config = getEmpPdfExportConfig();
    const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const srcRows = config.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selRows = config.useConfiguredColumns ? visibleTableData.allSelectedRows || visibleTableData.selectedRows : visibleTableData.selectedRows;
    const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
    const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
    const filterRows = (rows = []) => rows.map((row) => selIdx.map((i) => row[i]));
    const totalRows = visibleTableData.totalRows?.length ? visibleTableData.totalRows.map((row) => selIdx.map((i) => row[i])) : [];
    printEmpTable({ columns: selCols, rows: filterRows(selectedTableItems.length > 0 ? selRows || [] : srcRows || []), totalRows, title: `Cadastro de Empresas - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  const handleExportExcel = () => {
    const config = getEmpExcelExportConfig();
    const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const srcRows = config.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
    const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
    const filterRows = (rows = []) => rows.map((row) => selIdx.map((i) => row[i]));
    const totalRows = visibleTableData.totalRows?.length ? visibleTableData.totalRows.map((row) => selIdx.map((i) => row[i])) : [];
    exportEmpTableToExcel({ columns: selCols, rows: filterRows(srcRows || []), totalRows, title: `Cadastro de Empresas - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  return (
    <div className="cadastro-emp-scope -mt-px p-0 md:p-0 bg-white h-full min-h-0 overflow-hidden flex flex-col">

      {showConfigCampos && (
        <section className="w-full h-full bg-white overflow-hidden">
          <EmpConfiguracaoCamposDialog open={showConfigCampos} onOpenChange={setShowConfigCampos} inline />
        </section>
      )}

      {!showConfigCampos && showForm && (
        <div className="flex min-h-0 h-full w-full overflow-hidden">
          <div className="min-w-0 flex-1 h-full overflow-hidden">
            <FORMEMP
              key={`form-${formVersion}-${editingEmp?.id ?? "new"}`}
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
              total={empresasNavegacao.length} currentIndex={selectedIndex}
              onNew={handleNew}
              onFirst={() => navigateRecord(0)}
              onPrevious={() => navigateRecord(selectedIndex - 1)}
              onNext={() => navigateRecord(selectedIndex + 1)}
              onLast={() => navigateRecord(empresasNavegacao.length - 1)}
              onDelete={() => editingEmp?.id && handleRequestDelete(editingEmp.id)}
              onDuplicate={() => editingEmp && handleDuplicate(editingEmp)}
              filterOpen={false} filterActive={false}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onAttachClick={() => editingEmp?.id && setAttachmentsRecord(editingEmp)}
              attachDisabled={false}
            />
          </div>
        </div>
      )}

      <div className={showForm || showConfigCampos ? "hidden" : "flex min-h-0 flex-1 w-full overflow-hidden"}>
        <div className="min-w-0 flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-none shrink-0">
          <SankhyaListToolbar
            viewMode={viewMode}
            total={empresasNavegacao.length}
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
          </div>
          <TBLEMP
            key="tbl-emp"
            empresas={empresasFiltradasPainel}
            onEdit={handleEdit}
            showConfigColunas={showConfigColunas}
            setShowConfigColunas={setShowConfigColunas}
            searchTerm={searchTerm}
            selectedRecordId={showForm ? editingEmp?.id : undefined}
            onSelectionChange={handleTableSelectionChange}
            onVisibleDataChange={setVisibleTableData}
            onFilteredEmpresasChange={setTableFilteredEmpresas}
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