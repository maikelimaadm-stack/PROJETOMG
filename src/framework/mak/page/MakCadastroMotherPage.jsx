import React, { memo, useMemo } from "react";
import { MakModuleProvider } from "@/framework/mak/runtime/MakModuleContext.jsx";
import { MakActionBar, MakMobileViewBar, MakTablePanelStrip } from "@/framework/mak/layout";
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
} from "@/framework/mak/page/MakCadastroPage.jsx";
import { useMakCadastroPage } from "@/framework/mak/page/useMakCadastroPage.js";
import MakCadastroMotherLayout from "@/framework/mak/page/MakCadastroMotherLayout.jsx";
import MakCadastroMotherDialogs from "@/framework/mak/page/MakCadastroMotherDialogs.jsx";
import { resolveMakMotherPageMetadata } from "@/framework/mak/page/makMotherPage.constants.js";
import MakErrorState from "@/framework/mak/ux/MakErrorState.jsx";
import MakLoadingState from "@/framework/mak/ux/MakLoadingState.jsx";

function MakCadastroMotherPageContent() {
  const page = useMakCadastroPage();
  const {
    module,
    makPermissions,
    labels,
    showForm,
    viewMode,
    setViewMode,
    searchDraft,
    setSearchDraft,
    debouncedSearch,
    records,
    totalRecords,
    recordsLoading,
    recordsFetching,
    isListError,
    listErrorMessage,
    refetchList,
    editingRecord,
    selectedTableItems,
    setSelectedTableItems,
    formVersion,
    showConfigColunas,
    setShowConfigColunas,
    deleteState,
    setDeleteState,
    saveCycle,
    handleEdit,
    handleNew,
    handleSubmit,
    handleConfirmDelete,
    handleRequestDelete,
    handleColumnFiltersChange,
    handleServerPageChange,
    handleServerPageSizeChange,
    handleServerSortChange,
    formCancel,
    queryPage,
    queryPageSize,
  } = page;

  const pageMeta = resolveMakMotherPageMetadata(module.metadata);
  const CardsPanelStrip = module.components?.CardsPanelStrip;
  const TablePanelStrip = module.components?.TablePanelStrip ?? MakTablePanelStrip;

  const selectedRecord =
    selectedTableItems.length === 1 ? records.find((r) => r.id === selectedTableItems[0]) : null;

  const activeViewMode = viewMode === "formulario" ? "formulario" : viewMode;

  const panelStrip = useMemo(() => {
    if (showForm) return null;
    if (activeViewMode === "cards" && pageMeta.showCardsStrip && CardsPanelStrip) {
      return (
        <CardsPanelStrip
          records={records}
          disabled={saveCycle.isSaving || recordsLoading}
        />
      );
    }
    if (activeViewMode !== "cards" && pageMeta.showTableStrip) {
      return (
        <TablePanelStrip
          empresas={records}
          onConfigColumns={() => setShowConfigColunas(true)}
          disabled={saveCycle.isSaving || recordsLoading}
        />
      );
    }
    return null;
  }, [
    showForm,
    activeViewMode,
    pageMeta.showCardsStrip,
    pageMeta.showTableStrip,
    CardsPanelStrip,
    TablePanelStrip,
    records,
    saveCycle.isSaving,
    recordsLoading,
    setShowConfigColunas,
  ]);

  const statusBanner =
    isListError && !recordsLoading ? (
      <MakErrorState
        title={`Erro ao carregar ${labels.plural.toLowerCase()}`}
        description={listErrorMessage}
        onRetry={() => refetchList?.()}
        className="border-b border-rose-100 bg-rose-50/60 py-4"
      />
    ) : null;

  const showInitialLoading = recordsLoading && records.length === 0 && !isListError;

  const viewStack = showInitialLoading ? (
    <MakLoadingState label={`Carregando ${labels.plural.toLowerCase()}...`} />
  ) : (
    <>
      {showForm ? (
        <div className="mg-view-layer mg-view-layer--form mg-view-layer--active flex min-h-0 flex-1 flex-col overflow-hidden">
          <MakFormPanel
            formProps={{
              key: editingRecord?.id ?? `new-${formVersion}`,
              initialData: editingRecord,
              recordKey: editingRecord?.id ?? "new",
              resetSeed: formVersion,
              isEditing: !!editingRecord,
              onSubmit: handleSubmit,
              onCancel: formCancel,
              hideToolbar: true,
              onToggleView: formCancel,
            }}
          />
        </div>
      ) : null}

      {!showForm && activeViewMode === "cards" ? (
        <div className="mg-view-layer mg-view-layer--cards mg-view-layer--active flex min-h-0 flex-1 flex-col overflow-hidden">
          <MakSearchPanel
            searchProps={{
              records,
              searchTerm: debouncedSearch,
              onEdit: handleEdit,
              isLoading: recordsLoading,
            }}
          />
        </div>
      ) : null}

      {!showForm && activeViewMode !== "cards" && activeViewMode !== "formulario" ? (
        <div className="mg-view-layer mg-view-layer--table mg-view-layer--active flex min-h-0 flex-1 flex-col overflow-hidden">
          <MakTablePanel
            tableProps={{
              key: `tbl-${module.moduleId}`,
              empresas: records,
              isLoadingEmpresas: recordsLoading,
              isFetchingEmpresas: recordsFetching,
              onEdit: handleEdit,
              showConfigColunas,
              setShowConfigColunas,
              searchTerm: "",
              selectedIds: selectedTableItems,
              onSelectionChange: setSelectedTableItems,
              onVisibleDataChange: page.setVisibleTableData,
              onFilteredEmpresasChange: () => {},
              onServerColumnFiltersChange: handleColumnFiltersChange,
              serverPage: queryPage,
              serverPageSize: queryPageSize,
              serverTotal: totalRecords,
              onServerPageChange: handleServerPageChange,
              onServerPageSizeChange: handleServerPageSizeChange,
              onServerSortChange: handleServerSortChange,
              moduleTitle: labels.title,
              mgPrototype: true,
              selectedCount: selectedTableItems.length,
              listedCount: records.length,
              filteredCount: records.length,
              totalCount: totalRecords,
            }}
          />
        </div>
      ) : null}
    </>
  );

  const toolbar = pageMeta.showToolbar ? (
    <MakActionBar
      viewMode={activeViewMode}
      onViewModeChange={setViewMode}
      searchInputValue={searchDraft}
      onSearchInputChange={setSearchDraft}
      onNew={makPermissions.canCreate ? handleNew : undefined}
      onToggleView={
        makPermissions.canEdit && selectedRecord ? () => handleEdit(selectedRecord) : undefined
      }
      toggleViewDisabled={selectedTableItems.length !== 1}
      onDelete={
        makPermissions.canDelete && selectedTableItems.length > 0
          ? () => handleRequestDelete(selectedTableItems)
          : undefined
      }
      onConfigColumns={() => setShowConfigColunas(true)}
      selectedCount={selectedTableItems.length}
      title={labels.title}
      recordLabel=""
      actionsLocked={saveCycle.isSaving}
    />
  ) : null;

  const mobileBar =
    pageMeta.showMobileViewBar ? (
      <MakMobileViewBar viewMode={viewMode} onViewModeChange={setViewMode} />
    ) : null;

  const dialogs = (
    <MakCadastroMotherDialogs
      deleteState={deleteState}
      setDeleteState={setDeleteState}
      onConfirmDelete={handleConfirmDelete}
      showDeleteDialog={pageMeta.showDeleteDialog}
    />
  );

  return (
    <MakCadastroMotherLayout
      moduleId={module.moduleId}
      toolbar={toolbar}
      panelStrip={panelStrip}
      viewStack={viewStack}
      mobileBar={mobileBar}
      dialogs={dialogs}
      statusBanner={statusBanner}
    />
  );
}

/**
 * Tela Mãe Visual MAK — referência oficial de cadastro da plataforma.
 *
 * Consumida por todos os módulos via Runtime + Metadata.
 * Edite MakCadastroMotherLayout / MakCadastroMotherPage para evoluir a UI global.
 */
function MakCadastroMotherPage({ module }) {
  if (!module) {
    throw new Error("MakCadastroMotherPage: prop `module` is required");
  }
  return (
    <MakModuleProvider module={module}>
      <MakCadastroMotherPageContent />
    </MakModuleProvider>
  );
}

export default memo(MakCadastroMotherPage);
