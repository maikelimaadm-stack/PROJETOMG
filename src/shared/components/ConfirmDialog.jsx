import React, { useEffect, useState } from "react";
import ErpConfirmModal from "@/shared/feedback/ErpConfirmModal";

/**
 * Wrapper declarativo — usa o mesmo modal centralizado do ERP.
 * Para fluxos imperativos prefira confirmAction() de @/shared/feedback.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar exclusão",
  description = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
  onConfirm,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  variant = "destructive",
  closeOnOutside = true,
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm?.();
      onOpenChange?.(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ErpConfirmModal
      open={open}
      title={title}
      message={description}
      confirmText={busy ? "Aguarde..." : confirmText}
      cancelText={cancelText}
      variant={variant}
      closeOnOutside={closeOnOutside && !busy}
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange?.(false)}
    />
  );
}
