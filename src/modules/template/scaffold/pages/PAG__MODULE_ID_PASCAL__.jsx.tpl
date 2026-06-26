import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/feedback";
/** Módulos MG completos devem seguir o padrão Empresas (MakToolbar/MakCadastroPage). */
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";
import EmpConfiguracaoCamposDialog from "@/framework/cadastro/configurators/EmpConfiguracaoCamposDialog";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import { printCadastroTable, exportCadastroTableToExcel } from "@/framework/cadastro/exports/tableExportUtils";
import FORM__MODULE_ID_PASCAL__ from "@/modules/__MODULE_ID__/components/FORM__MODULE_ID_PASCAL__";
import TBL__MODULE_ID_PASCAL__ from "@/modules/__MODULE_ID__/components/TBL__MODULE_ID_PASCAL__";
import { __MODULE_ID_PASCAL__ModuleDefinition } from "@/modules/__MODULE_ID__/config/moduleDefinition";
import {
  get__MODULE_ID_PASCAL__ExcelExportConfig,
  get__MODULE_ID_PASCAL__PdfExportConfig,
  save__MODULE_ID_PASCAL__ExcelExportConfig,
  save__MODULE_ID_PASCAL__PdfExportConfig,
} from "@/modules/__MODULE_ID__/config/exportConfig";

const DEFAULT_RESPONSE = { items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 };
const repository = __MODULE_ID_PASCAL__ModuleDefinition.repository;
const labels = {
  title: `Cadastro de ${__MODULE_ID_PASCAL__ModuleDefinition.pluralLabel}`,
  singular: __MODULE_ID_PASCAL__ModuleDefinition.singularLabel,
  plural: __MODULE_ID_PASCAL__ModuleDefinition.pluralLabel,
};

export default function PAG__MODULE_ID_PASCAL__() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [attachmentsRecord, setAttachmentsRecord] = useState(null);
  const [showConfigFields, setShowConfigFields] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const queryClient = useQueryClient();

  const { data = DEFAULT_RESPONSE } = useQuery({
    queryKey: ["__MODULE_ID__", queryPage, queryPageSize, search],
    queryFn: () => repository.listPage({ page: queryPage, pageSize: queryPageSize, search }),
    placeholderData: (previous) => previous ?? DEFAULT_RESPONSE,
  });

  const items = data.items || [];
  const selectedItem = selectedIds.length === 1 ? items.find((item) => item.id === selectedIds[0]) : null;

  const refreshList = useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ["__MODULE_ID__"] });
    },
    [queryClient]
  );

  const handleSubmit = async (payload) => {
    try {
      if (editingItem?.id) {
        await repository.update(editingItem.id, payload);
        showSuccess(`${labels.singular} atualizada!`);
      } else {
        await repository.create(payload);
        showSuccess(`${labels.singular} cadastrada!`);
      }
      setShowForm(false);
      setEditingItem(null);
      await refreshList();
    } catch {
      showError(`Falha ao salvar ${labels.singular.toLowerCase()}.`);
    }
  };

  const handleDelete = async () => {
    const ids = deleteState.ids;
    setDeleteState({ open: false, ids: [] });
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => repository.delete(id)));
      setSelectedIds([]);
      setShowForm(false);
      setEditingItem(null);
      await refreshList();
      showSuccess("Registros excluídos.");
    } catch {
      showError("Falha ao excluir registros.");
    }
  };

  const handleExportPdf = () => {
    const config = get__MODULE_ID_PASCAL__PdfExportConfig();
    const columns = visibleTableData.allColumns || visibleTableData.columns || [];
    const rows = visibleTableData.allRows || visibleTableData.rows || [];
    const selectedColumns = config.useConfiguredColumns && config.columnIds.length
      ? columns.filter((column) => config.columnIds.includes(column.id))
      : columns;
    const indexes = selectedColumns.map((column) => columns.findIndex((item) => item.id === column.id));
    const mappedRows = rows.map((row) => indexes.map((index) => row[index]));
    printCadastroTable({ columns: selectedColumns, rows: mappedRows, title: labels.title });
  };

  const handleExportExcel = () => {
    const config = get__MODULE_ID_PASCAL__ExcelExportConfig();
    const columns = visibleTableData.allColumns || visibleTableData.columns || [];
    const rows = visibleTableData.allRows || visibleTableData.rows || [];
    const selectedColumns = config.useConfiguredColumns && config.columnIds.length
      ? columns.filter((column) => config.columnIds.includes(column.id))
      : columns;
    const indexes = selectedColumns.map((column) => columns.findIndex((item) => item.id === column.id));
    const mappedRows = rows.map((row) => indexes.map((index) => row[index]));
    exportCadastroTableToExcel({ columns: selectedColumns, rows: mappedRows, title: labels.title });
  };

  return (
    <div className="cadastro-emp-scope h-full min-h-0 overflow-hidden flex flex-col">
      {showForm ? (
        <FORM__MODULE_ID_PASCAL__
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
          onSettingsClick={() => setShowConfigFields(true)}
          onToggleView={() => { setShowForm(false); setEditingItem(null); }}
          onAttachClick={() => editingItem?.id && setAttachmentsRecord(editingItem)}
          onDelete={() => editingItem?.id && setDeleteState({ open: true, ids: [editingItem.id] })}
          onDuplicate={() => editingItem && setEditingItem({ ...editingItem, id: undefined })}
          onNew={() => setEditingItem(null)}
          total={items.length}
          currentIndex={Math.max(0, items.findIndex((item) => item.id === editingItem?.id))}
          onFirst={() => setEditingItem(items[0] || null)}
          onPrevious={() => {
            const current = items.findIndex((item) => item.id === editingItem?.id);
            setEditingItem(items[Math.max(0, current - 1)] || null);
          }}
          onNext={() => {
            const current = items.findIndex((item) => item.id === editingItem?.id);
            setEditingItem(items[Math.min(items.length - 1, current + 1)] || null);
          }}
          onLast={() => setEditingItem(items[items.length - 1] || null)}
          searchValue={search}
          onSearchChange={(value) => { setSearch(value); setQueryPage(1); }}
        />
      ) : (
        <EmpSplitToolbarLayout
          className="flex-1"
          contentClassName="emp-table-card"
          toolbar={
            <SankhyaListToolbar
              viewMode="table"
              total={data.total || 0}
              currentIndex={0}
              searchValue={search}
              onSearchChange={(value) => { setSearch(value); setQueryPage(1); }}
              onNew={() => { setEditingItem(null); setShowForm(true); }}
              onToggleView={() => {
                if (selectedItem) {
                  setEditingItem(selectedItem);
                  setShowForm(true);
                }
              }}
              toggleViewDisabled={selectedIds.length !== 1}
              filterActive={false}
              onDelete={() => setDeleteState({ open: true, ids: selectedIds })}
              onDuplicate={() => selectedItem && setEditingItem({ ...selectedItem, id: undefined })}
              onAttachClick={() => selectedItem && setAttachmentsRecord(selectedItem)}
              attachDisabled={selectedIds.length !== 1}
              onExportPdf={handleExportPdf}
              onConfigExportPdf={() => setShowConfigPdf(true)}
              onExportExcel={handleExportExcel}
              onConfigExportExcel={() => setShowConfigExcel(true)}
              onConfigColumns={() => setShowConfigFields(true)}
              selectedCount={selectedIds.length}
              title={labels.title}
              recordLabel=""
            />
          }
        >
          <TBL__MODULE_ID_PASCAL__
            items={items}
            onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
            onVisibleDataChange={setVisibleTableData}
            page={queryPage}
            pageSize={queryPageSize}
            total={data.total || 0}
            onPageChange={setQueryPage}
            onPageSizeChange={(nextPageSize) => {
              setQueryPageSize(nextPageSize);
              setQueryPage(1);
            }}
            onSelectionChange={setSelectedIds}
          />
        </EmpSplitToolbarLayout>
      )}

      <EmpConfiguracaoCamposDialog
        open={showConfigFields}
        onOpenChange={setShowConfigFields}
        repository={repository}
      />

      <EmpConfiguracaoExportacaoDialog
        open={showConfigPdf}
        onOpenChange={setShowConfigPdf}
        columns={visibleTableData.allColumns || visibleTableData.columns || []}
        initialConfig={get__MODULE_ID_PASCAL__PdfExportConfig()}
        tipo="pdf"
        onSaveConfig={(config) => save__MODULE_ID_PASCAL__PdfExportConfig(config)}
      />

      <EmpConfiguracaoExportacaoDialog
        open={showConfigExcel}
        onOpenChange={setShowConfigExcel}
        columns={visibleTableData.allColumns || visibleTableData.columns || []}
        initialConfig={get__MODULE_ID_PASCAL__ExcelExportConfig()}
        tipo="excel"
        onSaveConfig={(config) => save__MODULE_ID_PASCAL__ExcelExportConfig(config)}
      />

      <RegistroAnexosDialog
        open={Boolean(attachmentsRecord?.id)}
        onOpenChange={(nextOpen) => { if (!nextOpen) setAttachmentsRecord(null); }}
        entityName="__ENTITY_NAME__"
        recordId={attachmentsRecord?.id}
        title={attachmentsRecord?.nome || labels.singular}
      />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(nextOpen) => setDeleteState((prev) => ({ ...prev, open: nextOpen }))}
        title="Confirmar exclusão"
        description="Deseja excluir os registros selecionados?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

