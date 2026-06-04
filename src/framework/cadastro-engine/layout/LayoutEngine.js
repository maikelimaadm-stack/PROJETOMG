import {
  countKnownLayoutFields,
  countLayoutFields,
  createEmptyLayoutConfig,
  ensureLayoutFields,
  mergeSavedFormLayout,
  normalizeFieldLayoutConfig,
  normalizeLayoutConfig,
  pickLayoutConfig,
  pruneLayoutToKnownFields,
  sanitizeLayoutFieldPlacements,
} from "@/framework/cadastro/layouts/empFormLayoutStore.js";
import {
  LAYOUT_CONFIG_VERSION_V3,
  migrateV2ToV3,
  resolveLayoutConfig,
} from "@/framework/cadastro/layouts/layoutConfigV3.js";
import { countRequiredFormFields } from "@/framework/cadastro/layouts/empFormLayoutMetrics.js";
import {
  getPanelCardsForRender,
  groupCardsIntoRows,
  initCardsByPanel,
  buildLayoutV3FromCards,
  flattenLayoutFromCards,
} from "@/framework/cadastro/layouts/empFormLayoutCards.js";
import {
  getCardRowsForRender,
  packFieldIdsIntoRows,
  normalizeCardRows,
  flattenRowsToFieldIds,
} from "@/framework/cadastro/layouts/empFormLayoutRows.js";
import { getCachedCardRows } from "./layoutCache.js";

export class LayoutEngine {
  /** @param {import('../core/CadastroModuleConfig.js').CadastroModuleConfig} config */
  constructor(config) {
    this.config = config;
  }

  getDefaultConfig() {
    return this.config.getDefaultLayoutConfig();
  }

  normalize(source, options = {}) {
    const defaults = this.getDefaultConfig();
    return normalizeLayoutConfig(source, {
      basePanels: options.basePanels || this.config.basePanels || defaults.panels,
      defaultLayout: options.defaultLayout || this.config.defaultFlatLayout || defaults.layout,
      camposPersonalizadosCount: options.camposPersonalizadosCount ?? 0,
      mergeNewCustomFields: options.mergeNewCustomFields ?? false,
    });
  }

  ensureFields(saved, options = {}) {
    const defaults = this.getDefaultConfig();
    return ensureLayoutFields(saved, defaults, {
      knownFieldIds: options.knownFieldIds,
    });
  }

  pick(config) {
    return pickLayoutConfig(config);
  }

  countRequired(params) {
    return countRequiredFormFields(params);
  }

  getCardsForRender(params) {
    return getPanelCardsForRender(params);
  }

  groupCardsIntoRows(cards) {
    return groupCardsIntoRows(cards);
  }

  getCardRows(card, fieldSizes, fields, containerWidthPx) {
    return getCachedCardRows(card, fieldSizes, fields, containerWidthPx);
  }

  initCardsByPanel(params) {
    return initCardsByPanel(params);
  }

  buildLayoutV3FromCards(cardsByPanel) {
    return buildLayoutV3FromCards(cardsByPanel);
  }
}

export {
  countKnownLayoutFields,
  countLayoutFields,
  createEmptyLayoutConfig,
  mergeSavedFormLayout,
  normalizeFieldLayoutConfig,
  pruneLayoutToKnownFields,
  sanitizeLayoutFieldPlacements,
  LAYOUT_CONFIG_VERSION_V3,
  migrateV2ToV3,
  resolveLayoutConfig,
  packFieldIdsIntoRows,
  normalizeCardRows,
  flattenRowsToFieldIds,
  flattenLayoutFromCards,
};
