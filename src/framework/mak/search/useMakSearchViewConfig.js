import { useMemo } from "react";
import { useMakModule } from "@/framework/mak/runtime/MakModuleContext.jsx";
import {
  MAK_CARDS_LAYOUT_DEFAULT,
  MAK_CARDS_LAYOUT_OPTIONS,
  MAK_SEARCH_DROPDOWN_MAX_FIELDS,
  countSearchDropdownVisibleFields,
  defaultGetSearchFieldValue,
  getDefaultCardVisFields,
} from "./makSearchView.utils.js";

/**
 * Config de pesquisa/cards via metadata do módulo (Foundation).
 */
export function useMakSearchViewConfig(overrides = {}) {
  const module = useMakModule();
  const searchMeta = module?.metadata?.search ?? {};

  return useMemo(
    () => ({
      defaultFields: overrides.defaultFields ?? searchMeta.defaultFields ?? [],
      cardsLayoutDefault:
        overrides.cardsLayoutDefault ?? searchMeta.cardsLayoutDefault ?? MAK_CARDS_LAYOUT_DEFAULT,
      cardsLayoutOptions:
        overrides.cardsLayoutOptions ?? searchMeta.cardsLayoutOptions ?? MAK_CARDS_LAYOUT_OPTIONS,
      dropdownMaxFields:
        overrides.dropdownMaxFields ??
        searchMeta.dropdownMaxFields ??
        MAK_SEARCH_DROPDOWN_MAX_FIELDS,
      getFieldValue:
        overrides.getFieldValue ?? searchMeta.getFieldValue ?? defaultGetSearchFieldValue,
      getDefaultCardVisFields:
        overrides.getDefaultCardVisFields ??
        searchMeta.getDefaultCardVisFields ??
        getDefaultCardVisFields,
      countDropdownVisibleFields:
        overrides.countDropdownVisibleFields ??
        searchMeta.countDropdownVisibleFields ??
        countSearchDropdownVisibleFields,
    }),
    [module?.moduleId, overrides, searchMeta]
  );
}
