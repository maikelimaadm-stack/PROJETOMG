import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/feedback";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { useAuth } from "@/shared/contexts/AuthContext";
import { printCadastroTable, exportCadastroTableToExcel } from "@/framework/cadastro/exports/tableExportUtils";
import {
  getEmpPdfExportConfig,
  getEmpExcelExportConfig,
  saveEmpExcelExportConfig,
  saveEmpPdfExportConfig,
} from "@/modules/empresas/config/empPdfExportConfig";
import {
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasTablePanel,
} from "./PAGEMP.sections";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import SaveProgressOverlay from "@/shared/components/SaveProgressOverlay";

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

const patchEmpresasCache = (queryClient, updater) => {
  queryClient.setQueriesData({ queryKey: ["emp-cadastro"] }, (previous) => {
    if (!previous?.items) return previous;
    return updater(previous);
  });
};

export default function PAGEMP() {
  const {
    empresas: empresasSelector,
    selectedEmpresaId,
    upsertEmpresaInSelector,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
  } = useAuth();

  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
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
  const [querySort, setQuerySort] = useState({ key: "codempresa", direction: "asc" });
  const pendingDeleteIdsRef = useRef([]);
  const pendingCreatesRef = useRef(new Map());
  const previousScopeEmpresaIdRef = useRef(selectedEmpresaId);
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();

  useEffect(() => {
    if (previousScopeEmpresaIdRef.current === selectedEmpresaId) return;
    previousScopeEmpresaIdRef.current = selectedEmpresaId;
    setShowForm(false);
    setEditingEmp(null);
    setViewMode("table");
    setSelectedTableItems([]);
    setSelectedIndex(0);
    setQueryPage(1);
    setTableFilteredEmpresas(null);
  }, [selectedEmpresaId]);

  const { data: empresasResponse = DEFAULT_EMPRESAS_RESPONSE, isLoading, isFetching } = useQuery({
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
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const empresas = empresasResponse.items || [];
  const totalEmpresas = empresasResponse.total || 0;

  const { data: contadores = { empresas: totalEmpresas, registrosGlobais: 0 } } = useQuery({
    queryKey: ["metrics-contadores"],
    queryFn: () => MetricsApi.getContadores(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: { empresas: totalEmpresas, registrosGlobais: 0 },
  });
  const empresasLoading = isLoading && empresas.length === 0;
  const empresasFiltradasPainel = empresas;

  const handleFilteredEmpresasChange = useCallback((filtered) => {
    setTableFilteredEmpresas(filtered);
  }, []);

  const empresasNavegacao = tableFilteredEmpresas ?? empresasFiltradasPainel;

  const refreshNavRecord = useCallback((list, record, navListOverride) => {
    const navList = navListOverride ?? tableFilteredEmpresas ?? list;
    const fresh = findEmpresaInList(list, record) ?? record;
    const navIndex = navList.findIndex(
      (item) => item.id === fresh.id || Number(item.codempresa) === Number(fresh.codempresa)
    );
    return { fresh, navList, navIndex };
  }, [searchTerm, tableFilteredEmpresas]);

  const currentEmp = empresasNavegacao[selectedIndex] || empresasNavegacao[0] || null;
  const selectedTableEmp = selectedTableItems.length === 1 ? empresasNavegacao.find((e) => e.id === selectedTableItems[0]) : null;
  const hasActiveFilters = false;

  const stayOnRecordAfterSave = useCallback((savedRecord) => {
    const normalized = normalizeEmpresaRecord(savedRecord);
    const savedId = normalized?.id;

    if (!savedId) {
      setShowForm(true);
      setViewMode("record");
      return;
    }

    setReturnRecordAfterNew(null);
    setEditingEmp(normalized);
    setSelectedTableItems([savedId]);
    setShowForm(true);
    setViewMode("record");

    patchEmpresasCache(queryClient, (previous) => {
      const exists = previous.items.some((item) => item.id === savedId);
      const items = exists
        ? previous.items.map((item) => (item.id === savedId ? { ...item, ...normalized } : item))
        : [normalized, ...previous.items];
      return {
        ...previous,
        items,
        total: exists ? previous.total : previous.total + 1,
      };
    });

    const navList = tableFilteredEmpresas ?? empresasFiltradasPainel;
    const navIndex = navList.findIndex(
      (item) => item.id === savedId || Number(item.codempresa) === Number(normalized.codempresa)
    );
    if (navIndex >= 0) setSelectedIndex(navIndex);

    upsertEmpresaInSelector(normalized);
  }, [queryClient, tableFilteredEmpresas, empresasFiltradasPainel, upsertEmpresaInSelector]);

  const handleSubmit = useCallback((data) => {
    if (saveCycle.isSaving) return;

    const isUpdate = Boolean(
      editingEmp?.id && !isPendingRecordId(editingEmp.id) && !editingEmp._isDuplicate
    );

    try {
      const validatedData = empresasModuleDefinition.schema.parse(data);
      saveCycle.beginSave();

      if (isUpdate) {
        const optimistic = normalizeEmpresaRecord({ ...editingEmp, ...validatedData });
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
        const selectorSnapshot = empresasSelector;

        patchEmpresasCache(queryClient, (previous) => ({
          ...previous,
          items: previous.items.map((item) =>
            item.id === editingEmp.id ? { ...item, ...optimistic } : item
          ),
        }));
        upsertEmpresaInSelector(optimistic);
        setEditingEmp(optimistic);
        stayOnRecordAfterSave(optimistic);

        void moduleRepository
          .update(editingEmp.id, validatedData)
          .then((savedRecord) => {
            const normalized = normalizeEmpresaRecord(savedRecord);
            patchEmpresasCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.map((item) =>
                item.id === editingEmp.id ? { ...item, ...normalized } : item
              ),
            }));
            setEditingEmp(normalized);
            upsertEmpresaInSelector(normalized);
            showSuccess(`${moduleLabels.singular} atualizada!`);
          })
          .catch((error) => {
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            replaceEmpresasInSelector(selectorSnapshot);
            showError(
              resolveErrorMessage(
                error,
                `Não foi possível atualizar a ${moduleLabels.singular.toLowerCase()}.`
              )
            );
          })
          .finally(() => saveCycle.end());
        return;
      }

      const { _isDuplicate, ...clean } = validatedData;
      const pendingId = `pending-${crypto.randomUUID()}`;
      const optimistic = normalizeEmpresaRecord({
        ...clean,
        id: pendingId,
        _isPersisting: true,
      });
      const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
      const createEntry = { cancelled: false };
      pendingCreatesRef.current.set(pendingId, createEntry);

      patchEmpresasCache(queryClient, (previous) => ({
        ...previous,
        items: [optimistic, ...previous.items],
        total: previous.total + 1,
      }));
      patchMetricsCache(queryClient, { empresas: 1, registrosGlobais: 1 });
      stayOnRecordAfterSave(optimistic);
      setFormVersion((version) => version + 1);

      void moduleRepository
        .create(clean)
        .then(async (response) => {
          const normalized = normalizeEmpresaRecord(response?.item);
          pendingCreatesRef.current.delete(pendingId);

          if (createEntry.cancelled) {
            try {
              const deleteResponse = await moduleRepository.delete(normalized.id);
              if (deleteResponse?.contadores) {
                setMetricsCache(queryClient, deleteResponse.contadores);
              }
            } catch {
              // UI já removeu; servidor pode ter excluído ou falhado silenciosamente
            }
            return;
          }

          patchEmpresasCache(queryClient, (previous) => ({
            ...previous,
            items: previous.items.map((item) =>
              item.id === pendingId ? normalized : item
            ),
          }));
          setEditingEmp((current) =>
            current?.id === pendingId ? normalized : current
          );
          setSelectedTableItems((current) =>
            current.includes(pendingId) ? [normalized.id] : current
          );
          upsertEmpresaInSelector(normalized);
          setMetricsCache(queryClient, response?.contadores);
          showSuccess(`${moduleLabels.singular} cadastrada!`);
        })
        .catch((error) => {
          pendingCreatesRef.current.delete(pendingId);
          if (!createEntry.cancelled) {
            patchMetricsCache(queryClient, { empresas: -1, registrosGlobais: -1 });
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            patchEmpresasCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.filter((item) => item.id !== pendingId),
              total: Math.max(0, previous.total - 1),
            }));
            removeEmpresasFromSelector([pendingId]);
          }
          showError(
            resolveErrorMessage(
              error,
              `Não foi possível cadastrar a ${moduleLabels.singular.toLowerCase()}.`
            )
          );
        })
        .finally(() => saveCycle.end());
    } catch (error) {
      saveCycle.end();
      showError(
        resolveErrorMessage(
          error,
          isUpdate
            ? `Não foi possível atualizar a ${moduleLabels.singular.toLowerCase()}.`
            : `Não foi possível cadastrar a ${moduleLabels.singular.toLowerCase()}.`
        )
      );
    }
  }, [
    editingEmp,
    empresasSelector,
    queryClient,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
    saveCycle,
    stayOnRecordAfterSave,
    upsertEmpresaInSelector,
  ]);

  const handleEdit = (emp) => {
    if (!saveCycle.guardAction()) return;
    const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setSelectedTableItems([emp.id]);
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleNew = () => {
    if (!saveCycle.guardAction()) return;
    setReturnRecordAfterNew(showForm && viewMode === "record" ? editingEmp || currentEmp : null);
    setSelectedTableItems([]);
    setEditingEmp(null);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((p) => p + 1);
  };

  const handleDuplicate = (emp) => {
    if (!saveCycle.guardAction()) return;
    setReturnRecordAfterNew(showForm && viewMode === "record" ? emp : null);
    const { id, created_date, updated_date, created_by, codempresa, id_global, _isPersisting, ...dup } = emp;
    setEditingEmp({ ...dup, _isDuplicate: true });
    setShowForm(true);
    setViewMode("record");
    setFormVersion((p) => p + 1);
  };

  const handleRequestDelete = (ids) => {
    if (!saveCycle.guardAction()) return;
    const normalized = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    pendingDeleteIdsRef.current = normalized;
    setDeleteState({ open: true, ids: normalized });
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
      if (fresh?.id === editingEmp.id && fresh.updatedAt !== editingEmp.updatedAt) {
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
      }
    }
  }, [showForm, viewMode, empresasNavegacao, empresas, editingEmp?.id, editingEmp?.updatedAt, editingEmp?._isDuplicate, selectedIndex]);

  const handleTableSelectionChange = useCallback((ids) => {
    setSelectedTableItems((p) => { const same = p.length === ids.length && p.every((id, i) => id === ids[i]); return same ? p : ids; });
    if (ids.length === 1) { const i = empresasNavegacao.findIndex((e) => e.id === ids[0]); if (i >= 0) setSelectedIndex(i); }
  }, [empresasNavegacao]);

  const handleToggleView = () => {
    if (!saveCycle.guardAction()) return;
    if (showForm) { setShowForm(false); setEditingEmp(null); setViewMode("table"); return; }
    if (selectedTableItems.length > 1) return;
    const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
    if (!emp) return;
    const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const navigateRecord = (index) => {
    if (!showForm || !saveCycle.guardAction()) return;
    const ni = Math.min(Math.max(index, 0), Math.max(empresasNavegacao.length - 1, 0));
    setSelectedIndex(ni);
    if (empresasNavegacao[ni]) { setEditingEmp(empresasNavegacao[ni]); setSelectedTableItems([empresasNavegacao[ni].id]); }
  };

  const handleConfirmDelete = async () => {
    const ids = pendingDeleteIdsRef.current.length > 0 ? pendingDeleteIdsRef.current : deleteState.ids;
    if (ids.length === 0) {
      showError("Nenhum registro selecionado para exclusão.");
      throw new Error("Nenhum registro selecionado para exclusão.");
    }

    saveCycle.beginDelete();

    const wasOnForm = showForm && viewMode === "record";
    const deletedCurrentFromForm = wasOnForm && editingEmp?.id && ids.includes(editingEmp.id);
    const navListBeforeDelete = empresasNavegacao;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingEmp.id)
      : -1;

    const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
    const metricsSnapshot = queryClient.getQueryData(["metrics-contadores"]);
    const selectorSnapshot = empresasSelector;

    patchEmpresasCache(queryClient, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, previous.total - ids.length),
    }));
    patchMetricsCache(queryClient, { empresas: -ids.length });
    removeEmpresasFromSelector(ids);

    const list = navListBeforeDelete.filter((item) => !ids.includes(item.id));

    if (attachmentsRecord?.id && ids.includes(attachmentsRecord.id)) {
      setAttachmentsRecord(null);
    }

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

      if (wasOnForm && viewMode === "record" && !editingEmp?.id && !editingEmp?._isDuplicate) {
        setFormVersion((version) => version + 1);
      }
    }

    pendingDeleteIdsRef.current = [];
    setDeleteState({ open: false, ids: [] });

    const pendingIds = ids.filter((id) => isPendingRecordId(id));
    const persistedIds = ids.filter((id) => !isPendingRecordId(id));

    pendingIds.forEach((pendingId) => {
      const entry = pendingCreatesRef.current.get(pendingId);
      if (entry) entry.cancelled = true;
    });

    try {
      if (persistedIds.length === 0) {
        showSuccess(
          ids.length === 1
            ? `${moduleLabels.singular} excluída!`
            : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídas!`
        );
        return;
      }

      const results = await Promise.all(persistedIds.map((id) => moduleRepository.delete(id)));
      const lastContadores = results.filter((r) => r?.contadores).at(-1)?.contadores;
      if (lastContadores) setMetricsCache(queryClient, lastContadores);
      showSuccess(
        ids.length === 1
          ? `${moduleLabels.singular} excluída!`
          : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídas!`
      );
    } catch (error) {
      cacheSnapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (metricsSnapshot) {
        queryClient.setQueryData(["metrics-contadores"], metricsSnapshot);
      }
      replaceEmpresasInSelector(selectorSnapshot);
      showError(
        resolveErrorMessage(
          error,
          `Não foi possível excluir ${moduleLabels.singular.toLowerCase()}.`
        )
      );
      throw error;
    } finally {
      saveCycle.end();
    }
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

  return (
    <div className="cadastro-emp-scope relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <SaveProgressOverlay active={saveCycle.isSaving} message={saveCycle.saveMessage} />
      <EmpresasFormPanel
        showForm={showForm}
        formProps={{
          key: `form-${formVersion}`,
          initialData: editingEmp,
          recordKey: editingEmp?.id ?? (editingEmp?._isDuplicate ? "duplicate" : "new"),
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
          showCorporateCounters: true,
          empresasTotal: contadores.empresas ?? totalEmpresas,
          registrosGlobaisTotal: formatIdGlobal(contadores.registrosGlobais ?? 0) || "0",
          actionsLocked: saveCycle.isSaving,
        }}
      />

      <EmpresasTablePanel
        hidden={showForm}
        toolbarProps={{
          actionsLocked: saveCycle.isSaving,
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
          showCorporateCounters: true,
          empresasTotal: contadores.empresas ?? totalEmpresas,
          registrosGlobaisTotal: formatIdGlobal(contadores.registrosGlobais ?? 0) || "0",
        }}
        tableProps={{
          key: "tbl-emp",
          empresas: empresasFiltradasPainel,
          isLoadingEmpresas: empresasLoading,
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
            attachmentsRecord?.codempresa ||
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