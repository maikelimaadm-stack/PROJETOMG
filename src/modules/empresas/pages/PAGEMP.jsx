import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { printCadastroTable, exportCadastroTableToExcel } from "@/framework/cadastro/exports/tableExportUtils";
import {
  getEmpPdfExportConfig,
  getEmpExcelExportConfig,
  saveEmpExcelExportConfig,
  saveEmpPdfExportConfig,
} from "@/modules/empresas/config/empPdfExportConfig";
import {
  EmpresasCamposOnlyPanel,
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasTablePanel,
} from "./PAGEMP.sections";

const DEFAULT_EMPRESAS_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

const moduleRepository = empresasModuleDefinition.repository;
const moduleLabels = {
  singular: empresasModuleDefinition.singularLabel,
  plural: empresasModuleDefinition.pluralLabel,
  title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
};

export default function PAGEMP() {
  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [showConfigCampos, setShowConfigCampos] = useState(false);
  const [configCamposInitialField, setConfigCamposInitialField] = useState(null);
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
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [querySort, setQuerySort] = useState({ key: "codigo_empresa", direction: "asc" });
  const queryClient = useQueryClient();

  const { data: empresasResponse = DEFAULT_EMPRESAS_RESPONSE } = useQuery({
    queryKey: ["emp-cadastro", queryPage, queryPageSize, searchTerm, querySort.key, querySort.direction],
    queryFn: () =>
      moduleRepository.listPage({
        page: queryPage,
        pageSize: queryPageSize,
        search: searchTerm,
        sortBy: querySort.key,
        sortDir: querySort.direction,
      }),
    placeholderData: (previous) => previous ?? DEFAULT_EMPRESAS_RESPONSE,
  });

  const empresas = empresasResponse.items || [];
  const totalEmpresas = empresasResponse.total || 0;
  const empresasFiltradasPainel = empresas;

  const handleFilteredEmpresasChange = useCallback((filtered) => {
    setTableFilteredEmpresas(filtered);
  }, []);

  const empresasNavegacao = tableFilteredEmpresas ?? empresasFiltradasPainel;

  const refreshNavRecord = useCallback((list, record, navListOverride) => {
    const navList = navListOverride ?? tableFilteredEmpresas ?? list;
    const fresh = findEmpresaInList(list, record) ?? record;
    const navIndex = navList.findIndex(
      (item) => item.id === fresh.id || Number(item.codigo_empresa) === Number(fresh.codigo_empresa)
    );
    return { fresh, navList, navIndex };
  }, [searchTerm, tableFilteredEmpresas]);

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

    const latestPage = await queryClient.fetchQuery({
      queryKey: ["emp-cadastro", queryPage, queryPageSize, searchTerm, querySort.key, querySort.direction],
      queryFn: () =>
        moduleRepository.listPage({
          page: queryPage,
          pageSize: queryPageSize,
          search: searchTerm,
          sortBy: querySort.key,
          sortDir: querySort.direction,
        }),
    });
    const list = latestPage.items || [];
    const { fresh, navIndex } = refreshNavRecord(list, normalized);
    setEditingEmp(fresh);
    if (fresh?.id) setSelectedTableItems([fresh.id]);
    if (navIndex >= 0) setSelectedIndex(navIndex);
  }, [queryClient, refreshNavRecord, queryPage, queryPageSize, searchTerm, querySort.key, querySort.direction]);

  const handleSubmit = useCallback(async (data) => {
    const isUpdate = Boolean(editingEmp && !editingEmp._isDuplicate);

    try {
      const validatedData = empresasModuleDefinition.schema.parse(data);
      let savedRecord;

      if (isUpdate) {
        savedRecord = await moduleRepository.update(editingEmp.id, validatedData);
        toast.success(`${moduleLabels.singular} atualizada!`);
      } else {
        const { _isDuplicate, ...clean } = validatedData;
        savedRecord = await moduleRepository.create(clean);
        toast.success(`${moduleLabels.singular} cadastrada!`);
      }

      await stayOnRecordAfterSave(savedRecord);
      setFormVersion((version) => version + 1);
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          isUpdate
            ? `Não foi possível atualizar a ${moduleLabels.singular.toLowerCase()}.`
            : `Não foi possível cadastrar a ${moduleLabels.singular.toLowerCase()}.`
        )
      );
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
  const handleOpenConfigCampos = (fieldName = null) => {
    setConfigCamposInitialField(fieldName || null);
    setShowConfigCampos(true);
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setQueryPage(1);
  }, []);

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
      return;
    }

    const stillExists = empresas.some((item) => item.id === editingEmp.id);
    if (!stillExists && empresasNavegacao.length > 0) {
      const fallbackIndex = Math.min(Math.max(selectedIndex, 0), empresasNavegacao.length - 1);
      const fallbackEmp = empresasNavegacao[fallbackIndex];
      if (fallbackEmp) {
        setEditingEmp(fallbackEmp);
        setSelectedIndex(fallbackIndex);
        setSelectedTableItems([fallbackEmp.id]);
        setFormVersion((version) => version + 1);
      }
    }
  }, [showForm, viewMode, empresasNavegacao, empresas, editingEmp?.id, editingEmp?.updated_date, editingEmp?._isDuplicate, selectedIndex]);

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
    const navListBeforeDelete = empresasNavegacao;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingEmp.id)
      : -1;

    try {
      for (const id of ids) {
        await moduleRepository.delete(id);
      }
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          `Não foi possível excluir ${moduleLabels.singular.toLowerCase()}.`
        )
      );
      return;
    }

    if (attachmentsRecord?.id && ids.includes(attachmentsRecord.id)) {
      setAttachmentsRecord(null);
    }

    await queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });

    const latestPage = await queryClient.fetchQuery({
      queryKey: ["emp-cadastro", queryPage, queryPageSize, searchTerm, querySort.key, querySort.direction],
      queryFn: () =>
        moduleRepository.listPage({
          page: queryPage,
          pageSize: queryPageSize,
          search: searchTerm,
          sortBy: querySort.key,
          sortDir: querySort.direction,
        }),
    });
    const list = latestPage.items || [];

    if (deletedCurrentFromForm) {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findEmpresaInList(list, item))
        .filter(Boolean);

      if (remainingNav.length === 0) {
        setShowForm(false);
        setEditingEmp(null);
        setViewMode("table");
        setSelectedTableItems([]);
        setSelectedIndex(0);
      } else {
        const nextIndex = Math.min(Math.max(navIndexBeforeDelete, 0), remainingNav.length - 1);
        const nextEmp = remainingNav[nextIndex];
        setEditingEmp(nextEmp);
        setSelectedIndex(nextIndex);
        setSelectedTableItems([nextEmp.id]);
        setShowForm(true);
        setViewMode("record");
        setFormVersion((version) => version + 1);
      }
    } else {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findEmpresaInList(list, item))
        .filter(Boolean);

      setSelectedTableItems((prev) => prev.filter((id) => !ids.includes(id)));

      if (showForm && viewMode === "record" && editingEmp?.id && !ids.includes(editingEmp.id)) {
        const { fresh, navIndex } = refreshNavRecord(list, editingEmp, remainingNav);
        if (fresh) {
          setEditingEmp(fresh);
          if (navIndex >= 0) setSelectedIndex(navIndex);
        }
      } else if (remainingNav.length === 0) {
        setSelectedIndex(0);
      } else if (selectedTableItems.some((id) => ids.includes(id))) {
        const nextIndex = Math.min(
          Math.max(navListBeforeDelete.findIndex((item) => ids.includes(item.id)), 0),
          remainingNav.length - 1
        );
        setSelectedIndex(nextIndex);
        if (remainingNav[nextIndex]?.id) setSelectedTableItems([remainingNav[nextIndex].id]);
      } else {
        setSelectedIndex((prev) => Math.min(prev, remainingNav.length - 1));
      }
    }

    toast.success(
      ids.length === 1
        ? `${moduleLabels.singular} excluída!`
        : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídas!`
    );
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
    printCadastroTable({ columns: selCols, rows: filterRows(selectedTableItems.length > 0 ? selRows || [] : srcRows || []), totalRows, title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  const handleExportExcel = () => {
    const config = getEmpExcelExportConfig();
    const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
    const srcRows = config.useConfiguredColumns ? visibleTableData.allRows || visibleTableData.rows : visibleTableData.rows;
    const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
    const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
    const filterRows = (rows = []) => rows.map((row) => selIdx.map((i) => row[i]));
    const totalRows = visibleTableData.totalRows?.length ? visibleTableData.totalRows.map((row) => selIdx.map((i) => row[i])) : [];
    exportCadastroTableToExcel({ columns: selCols, rows: filterRows(srcRows || []), totalRows, title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}` });
  };

  const configCamposProps = {
    open: showConfigCampos,
    onOpenChange: (nextOpen) => {
      setShowConfigCampos(nextOpen);
      if (!nextOpen) setConfigCamposInitialField(null);
    },
    initialFieldName: configCamposInitialField,
    inline: true,
    repository: moduleRepository,
  };

  return (
    <div className="cadastro-emp-scope -mt-px p-0 md:p-0 bg-white h-full min-h-0 overflow-hidden flex flex-col">
      <EmpresasFormPanel
        showForm={showForm}
        showConfigCampos={showConfigCampos}
        formProps={{
          key: `form-${formVersion}-${editingEmp?.id ?? "new"}`,
          initialData: editingEmp,
          isEditing: !!editingEmp,
          onSubmit: handleSubmit,
          onCancel: () => {
            if (editingEmp && !editingEmp._isDuplicate) {
              setFormVersion((p) => p + 1);
              setViewMode("record");
              return;
            }
            if ((editingEmp?._isDuplicate || !editingEmp) && returnRecordAfterNew) {
              setEditingEmp(returnRecordAfterNew);
              setShowForm(true);
              setViewMode("record");
              setReturnRecordAfterNew(null);
              return;
            }
            setShowForm(false);
            setEditingEmp(null);
            setViewMode("table");
            setReturnRecordAfterNew(null);
          },
          onSettingsClick: handleOpenConfigCampos,
          onToggleView: handleToggleView,
          total: empresasNavegacao.length,
          currentIndex: selectedIndex,
          onNew: handleNew,
          onFirst: () => navigateRecord(0),
          onPrevious: () => navigateRecord(selectedIndex - 1),
          onNext: () => navigateRecord(selectedIndex + 1),
          onLast: () => navigateRecord(empresasNavegacao.length - 1),
          onDelete: () => editingEmp?.id && handleRequestDelete(editingEmp.id),
          onDuplicate: () => editingEmp && handleDuplicate(editingEmp),
          filterOpen: false,
          filterActive: false,
          searchValue: searchTerm,
          onSearchChange: handleSearchChange,
          onAttachClick: () => editingEmp?.id && setAttachmentsRecord(editingEmp),
          attachDisabled: false,
        }}
        configCamposProps={configCamposProps}
      />

      <EmpresasCamposOnlyPanel
        showForm={showForm}
        showConfigCampos={showConfigCampos}
        configCamposProps={configCamposProps}
      />

      <EmpresasTablePanel
        hidden={showForm || showConfigCampos}
        toolbarProps={{
          viewMode,
          total: totalEmpresas,
          currentIndex: selectedIndex,
          searchValue: searchTerm,
          onSearchChange: handleSearchChange,
          onNew: handleNew,
          onToggleView: handleToggleView,
          toggleViewDisabled: selectedTableItems.length > 1,
          filterActive: false,
          onDelete: () => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems),
          onDuplicate: () => selectedTableEmp && handleDuplicate(selectedTableEmp),
          onAttachClick: () => selectedTableEmp && setAttachmentsRecord(selectedTableEmp),
          attachDisabled: selectedTableItems.length !== 1,
          onExportPdf: handleExportPdf,
          onConfigExportPdf: () => setShowConfigPdf(true),
          onExportExcel: handleExportExcel,
          onConfigExportExcel: () => setShowConfigExcel(true),
          onConfigColumns: () => setShowConfigColunas(true),
          selectedCount: selectedTableItems.length,
          title: moduleLabels.title,
          recordLabel: "",
        }}
        tableProps={{
          key: "tbl-emp",
          empresas: empresasFiltradasPainel,
          onEdit: handleEdit,
          showConfigColunas,
          setShowConfigColunas,
          searchTerm: "",
          selectedRecordId: showForm ? editingEmp?.id : undefined,
          onSelectionChange: handleTableSelectionChange,
          onVisibleDataChange: setVisibleTableData,
          onFilteredEmpresasChange: handleFilteredEmpresasChange,
          serverPage: queryPage,
          serverPageSize: queryPageSize,
          serverTotal: totalEmpresas,
          onServerPageChange: setQueryPage,
          onServerPageSizeChange: (nextPageSize) => {
            setQueryPageSize(nextPageSize);
            setQueryPage(1);
          },
          onServerSortChange: (nextSort) => {
            setQuerySort(nextSort);
            setQueryPage(1);
          },
          moduleTitle: moduleLabels.title,
        }}
      />

      <EmpresasDialogs
        exportPdfProps={{
          open: showConfigPdf,
          onOpenChange: setShowConfigPdf,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: getEmpPdfExportConfig(),
          tipo: "pdf",
          onSaveConfig: (config) => saveEmpPdfExportConfig(config),
        }}
        exportExcelProps={{
          open: showConfigExcel,
          onOpenChange: setShowConfigExcel,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: getEmpExcelExportConfig(),
          tipo: "excel",
          onSaveConfig: (config) => saveEmpExcelExportConfig(config),
        }}
        anexosProps={{
          open: !!attachmentsRecord?.id,
          onOpenChange: (open) => {
            if (!open) setAttachmentsRecord(null);
          },
          entityName: empresasModuleDefinition.entityName,
          recordId: attachmentsRecord?.id,
          title:
            attachmentsRecord?.razao_social ||
            attachmentsRecord?.codigo_empresa ||
            moduleLabels.singular,
        }}
        confirmDeleteProps={{
          open: deleteState.open,
          onOpenChange: (open) => setDeleteState((previous) => ({ ...previous, open })),
          title: "Confirmar exclusão",
          description:
            deleteState.ids.length > 1
              ? `Deseja excluir ${deleteState.ids.length} ${moduleLabels.plural.toLowerCase()}?`
              : `Deseja excluir esta ${moduleLabels.singular.toLowerCase()}?`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          variant: "destructive",
          onConfirm: handleConfirmDelete,
        }}
      />
    </div>
  );
}