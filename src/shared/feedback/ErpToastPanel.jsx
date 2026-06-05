import { AlertTriangle, Check, Info, X } from "lucide-react";
import { toast } from "sonner";

const TOAST_META = {
  success: { title: "Sucesso!", Icon: Check },
  info: { title: "Informação", Icon: Info },
  warning: { title: "Atenção", Icon: AlertTriangle },
  error: { title: "Erro", Icon: X },
};

export function ErpToastPanel({ toastId, type = "info", message = "" }) {
  const meta = TOAST_META[type] || TOAST_META.info;
  const Icon = meta.Icon;

  return (
    <div className={`erp-toast-panel erp-toast-panel--${type}`}>
      <div className={`erp-toast-panel__icon-badge erp-toast-panel__icon-badge--${type}`}>
        <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      </div>
      <div className="erp-toast-panel__content">
        <p className="erp-toast-panel__message">{meta.title}</p>
        {message ? <p className="erp-toast-panel__description">{message}</p> : null}
      </div>
      <button
        type="button"
        className="erp-toast-panel__close"
        onClick={() => toast.dismiss(toastId)}
        aria-label="Fechar aviso"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
