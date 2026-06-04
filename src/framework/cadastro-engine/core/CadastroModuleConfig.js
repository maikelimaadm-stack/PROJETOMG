/**
 * Configuração declarativa de um módulo de cadastro corporativo.
 * @typedef {Object} CadastroModuleConfig
 * @property {string} moduleId
 * @property {string} entityName
 * @property {string} screenKey — chave em UsuarioPreferencia (ex: empresas.form_layout)
 * @property {string} storagePrefix — segmento em localStorage (ex: emp)
 * @property {() => object} getDefaultLayoutConfig
 * @property {Array<{ id: string, label: string, hidden?: boolean, order?: number }>} basePanels
 * @property {Record<string, string[]>} defaultFlatLayout
 * @property {string} [mainTabId]
 * @property {string[]} [systemPanelIds]
 * @property {() => Promise<object[]>} [customFieldProvider]
 * @property {string} [customFieldsQueryKey]
 * @property {(sources: object[]) => Promise<Record<string, object[]>>} [optionsProvider]
 * @property {(campos: object[]) => import('zod').ZodObject} [validatorProvider]
 * @property {string[]} [nativeRequiredFieldNames]
 * @property {string} [legacyGlobalStorageKey] — migração cadastro_emp_form_layout_config
 */

const REQUIRED = ["moduleId", "entityName", "screenKey", "storagePrefix", "getDefaultLayoutConfig"];

/**
 * @param {CadastroModuleConfig} config
 * @returns {CadastroModuleConfig}
 */
export function createCadastroModuleConfig(config) {
  REQUIRED.forEach((key) => {
    if (!config?.[key]) {
      throw new Error(`CadastroModuleConfig: "${key}" é obrigatório.`);
    }
  });

  return Object.freeze({
    mainTabId: "principais",
    systemPanelIds: [],
    customFieldsQueryKey: `${config.moduleId}-campos-personalizados`,
    nativeRequiredFieldNames: [],
    ...config,
  });
}

export function getLayoutStorageKeysForModule(config, userId) {
  const prefix = config.storagePrefix;
  if (!userId) {
    return {
      layoutKey: config.legacyGlobalStorageKey || `cadastro_${prefix}_form_layout_config`,
      aggregationKey: `cadastro_${prefix}_table_aggregation_config`,
      legacyKey: config.legacyGlobalStorageKey || `cadastro_${prefix}_form_layout_config`,
    };
  }
  return {
    layoutKey: `cadastro:${userId}:${prefix}:form_layout_config`,
    aggregationKey: `cadastro:${userId}:${prefix}:table_aggregation_config`,
    legacyKey: `cadastro:${userId}:${prefix}:form_layout_config`,
  };
}

export function getLayoutUpdatedEventName(moduleId) {
  return `cadastro-layout-updated:${moduleId}`;
}

export function getLayoutHydratedEventName(moduleId) {
  return `cadastro-layout-hydrated:${moduleId}`;
}
