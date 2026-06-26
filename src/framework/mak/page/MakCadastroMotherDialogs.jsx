import React, { memo } from "react";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";

/**
 * Dialogs padrão da Tela Mãe — extensível via module.components.MotherDialogs.
 */
function MakCadastroMotherDialogs({
  deleteState,
  setDeleteState,
  onConfirmDelete,
  showDeleteDialog = true,
}) {
  const module = useMakModuleRequired();
  const labels = module.labels;
  const ExtraDialogs = module.components?.MotherDialogs;

  return (
    <>
      {showDeleteDialog ? (
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
          onConfirm={onConfirmDelete}
        />
      ) : null}
      {ExtraDialogs ? <ExtraDialogs /> : null}
    </>
  );
}

export default memo(MakCadastroMotherDialogs);
