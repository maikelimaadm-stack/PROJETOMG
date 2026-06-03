import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { TOAST_DURATION_MS } from "./erpNotifications";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ErpToastContent({ toastId, type = "info", message, description }) {
  const duration = TOAST_DURATION_MS[type] || 4000;
  const [progress, setProgress] = useState(100);
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <div className={cn("erp-toast-panel", `erp-toast-panel--${type}`)}>
      <Icon className="erp-toast-panel__icon" aria-hidden />
      <div className="erp-toast-panel__body">
        <p className="erp-toast-panel__message">{message}</p>
        {description ? <p className="erp-toast-panel__description">{description}</p> : null}
      </div>
      <button
        type="button"
        className="erp-toast-panel__close"
        aria-label="Fechar"
        onClick={() => toast.dismiss(toastId)}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="erp-toast-panel__progress-track" aria-hidden>
        <div className="erp-toast-panel__progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
