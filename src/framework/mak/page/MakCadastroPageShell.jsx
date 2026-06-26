import React, { memo } from "react";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { MakModuleProvider } from "@/framework/mak/runtime/MakModuleContext.jsx";
import { MakActionBar, MakMobileViewBar } from "@/framework/mak/layout";
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
} from "@/framework/mak/page/MakCadastroPage.jsx";
import { useMakCadastroPage } from "@/framework/mak/page/useMakCadastroPage.js";

function MakCadastroPageContent() {
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

  const selectedRecord =
    selectedTableItems.length === 1 ? records.find((r) => r.id === selectedTableItems[0]) : null;

  return (
    <div className={`cadastro-${module.moduleId}-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden`}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mg-subtoolbar-stack">
            <MakActionBar
              viewMode={viewMode === "formulario" ? "formulario" : viewMode}
              onViewModeChange={setViewMode}
              searchInputValue={searchDraft}
              onSearchInputChange={setSearchDraft}
              onNew={makPermissions.canCreate ? handleNew : undefined}
              onToggleView={
                makPermissions.canEdit && selectedRecord
                  ? () => handleEdit(selectedRecord)
                  : undefined
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
          </div>

          <div className="mg-view-stack flex min-h-0 flex-1 flex-col overflow-hidden">
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

            {!showForm && viewMode === "cards" ? (
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

            {!showForm && viewMode !== "cards" && viewMode !== "formulario" ? (
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
          </div>
        </div>
      </div>

      <MakMobileViewBar viewMode={viewMode} onViewModeChange={setViewMode} />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => setDeleteState((prev) => ({ ...prev, open }))}
        title="Confirmar exclusão"
        description={
          deleteState.ids.length > 1
            ? `Deseja excluir ${deleteState.ids.length} ${labels.plural.toLowerCase()}?`
            : `Deseja excluir esta ${labels.singular.toLowerCase()}?`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

/**
 * Página declarativa de cadastro MAK — montada exclusivamente via runtime + metadata.
 */
function MakCadastroPageShell({ module }) {
  if (!module) {
    throw new Error("MakCadastroPageShell: prop `module` is required");
  }
  return (
    <MakModuleProvider module={module}>
      <MakCadastroPageContent />
    </MakModuleProvider>
  );
}

export default memo(MakCadastroPageShell);
