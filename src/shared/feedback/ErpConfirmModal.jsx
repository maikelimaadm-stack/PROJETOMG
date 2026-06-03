import React from "react";
import { AlertTriangle, HelpCircle, Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/utils";

const VARIANT_ICONS = {
  default: HelpCircle,
  info: Info,
  warning: AlertTriangle,
  destructive: Trash2,
  danger: Trash2,
};

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
  const Icon = VARIANT_ICONS[variant] || VARIANT_ICONS.default;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
    >
      <DialogContent
        className="erp-confirm-dialog erp-confirm-dialog--modern max-w-md rounded-xl border border-slate-200 bg-white/95 p-0 shadow-2xl backdrop-blur-md"
        onInteractOutside={(event) => {
          if (!closeOnOutside) event.preventDefault();
        }}
        onEscapeKeyDown={() => onCancel?.()}
      >
        <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "erp-confirm-dialog__icon-wrap",
                isDestructive && "erp-confirm-dialog__icon-wrap--danger"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
          <DialogTitle className="text-base font-semibold text-slate-900">{title}</DialogTitle>
          {message ? (
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
              {message}
            </DialogDescription>
          ) : null}
            </div>
          </div>
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
