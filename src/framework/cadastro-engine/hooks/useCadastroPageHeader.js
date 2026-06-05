import { useEffect } from "react";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";

export function useCadastroPageHeader({
  recordMeta = null,
  operationLabel = null,
  requiredStatus = null,
  enabled = true,
}) {
  const { setPageHeader, clearPageHeader } = useErpPageHeader();

  const recordMetaKey = recordMeta
    ? `${recordMeta.codigo ?? ""}|${recordMeta.nome ?? ""}`
    : "";
  const requiredStatusKey = requiredStatus
    ? `${requiredStatus.filled ?? 0}/${requiredStatus.total ?? 0}`
    : "";

  useEffect(() => {
    if (!enabled) {
      clearPageHeader();
      return undefined;
    }

    setPageHeader({
      recordMeta,
      pageTitle: null,
      recordTitle: null,
      recordDetails: null,
      operationLabel,
      contextSuffix: null,
      requiredStatus,
    });

    return () => clearPageHeader();
  }, [
    clearPageHeader,
    enabled,
    operationLabel,
    recordMeta,
    recordMetaKey,
    requiredStatus,
    requiredStatusKey,
    setPageHeader,
  ]);
}
