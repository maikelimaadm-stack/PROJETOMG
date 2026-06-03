import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

export default function ErpConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  closeOnOutside = true,
  onConfirm,
  onCancel,
}) {
  const isDestructive = variant === "destructive" || variant === "danger";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
    >
      <DialogContent
        className="erp-confirm-dialog max-w-md rounded-lg border border-slate-200 bg-white p-0 shadow-xl"
        onInteractOutside={(event) => {
          if (!closeOnOutside) event.preventDefault();
        }}
      >
        <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-slate-900">{title}</DialogTitle>
          {message ? (
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
              {message}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 px-5 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="min-w-[96px]">
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            className="min-w-[96px]"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
