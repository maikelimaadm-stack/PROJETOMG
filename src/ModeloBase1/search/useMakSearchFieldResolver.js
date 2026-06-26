import { useMemo } from "react";
import { useModeloBase1Config } from "@/ModeloBase1/config";
import { createSearchFieldResolver } from "@/framework/mak/search/makSearchView.utils.js";

/** Resolvedor metadata-driven de campos para Search/Cards. */
export function useMakSearchFieldResolver() {
  const config = useModeloBase1Config();
  const searchMeta = config.makModule?.metadata?.search ?? {};
  const searchView = config.searchView ?? {};

  return useMemo(
    () =>
      createSearchFieldResolver({
        codeField: searchMeta.codeField ?? searchMeta.primaryField ?? "codigo",
        titleField: searchMeta.titleField ?? "nome",
        formatFieldValue: searchView.formatSearchFieldValue,
      }),
    [searchMeta.codeField, searchMeta.primaryField, searchMeta.titleField, searchView.formatSearchFieldValue]
  );
}

export default useMakSearchFieldResolver;
