import { useLayoutEffect } from "react";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";
import { useCadastroPageHeader } from "@/framework/cadastro-engine/hooks/useCadastroPageHeader";

export default function CadastroPageChrome({
  toolbar = null,
  tabs = null,
  recordMeta = null,
  operationLabel = null,
  requiredStatus = null,
  enabled = true,
  children,
}) {
  const { setPageHeader } = useErpPageHeader();

  useCadastroPageHeader({
    enabled,
    recordMeta,
    operationLabel,
    requiredStatus,
  });

  useLayoutEffect(() => {
    if (!enabled) {
      setPageHeader({ unifiedChrome: false, toolbar: null, tabs: null });
      return undefined;
    }

    setPageHeader({ unifiedChrome: true, toolbar, tabs });

    return () => {
      setPageHeader({ unifiedChrome: false, toolbar: null, tabs: null });
    };
  }, [enabled, toolbar, tabs, setPageHeader]);

  return children;
}
