import { useEffect } from "react";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";

export function useCadastroPageHeader({
  pageTitle = null,
  recordDetails = null,
  operationLabel = null,
  requiredStatus = null,
  enabled = true,
}) {
  const { setPageHeader, clearPageHeader } = useErpPageHeader();

  const recordDetailsKey = recordDetails
    ? `${recordDetails.codigo ?? ""}|${recordDetails.nome ?? ""}`
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
      pageTitle,
      recordMeta: null,
      recordTitle: null,
      recordDetails,
      operationLabel,
      contextSuffix: null,
      requiredStatus,
    });

    return () => clearPageHeader();
  }, [
    clearPageHeader,
    enabled,
    operationLabel,
    pageTitle,
    recordDetails,
    recordDetailsKey,
    requiredStatus,
    requiredStatusKey,
    setPageHeader,
  ]);
}
