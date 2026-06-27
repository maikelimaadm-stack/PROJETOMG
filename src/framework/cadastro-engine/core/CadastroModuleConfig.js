import {
  getActiveUserPreferencesScope,
  resolveFormLayoutStorageKey,
  resolveLegacyFormLayoutStorageKey,
} from "@/shared/preferences/userPreferencesScope.js";

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
 * @property {string[]} [fixedPanelIds] — painéis imutáveis no configurador
 * @property {string[]} [fixedVisibleFieldIds] — campos sempre visíveis no configurador
 * @property {boolean} [brandTheme] — tema visual do configurador de layout
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
    fixedPanelIds: [],
    fixedVisibleFieldIds: [],
    brandTheme: true,
    ...config,
  });
}

export function getLayoutStorageKeysForModule(config, userId, clienteId) {
  const prefix = config.storagePrefix;
  const scope = getActiveUserPreferencesScope();
  const resolvedUserId = userId || scope.userId;
  const resolvedClienteId = clienteId || scope.clienteId;

  if (!resolvedUserId) {
    return {
      layoutKey: config.legacyGlobalStorageKey || `cadastro_${prefix}_form_layout_config`,
      aggregationKey: `cadastro_${prefix}_table_aggregation_config`,
      legacyKey: config.legacyGlobalStorageKey || `cadastro_${prefix}_form_layout_config`,
    };
  }

  const layoutKey = resolveFormLayoutStorageKey({
    userId: resolvedUserId,
    clienteId: resolvedClienteId,
    storagePrefix: prefix,
  });
  const legacyUserKey = resolveLegacyFormLayoutStorageKey({
    userId: resolvedUserId,
    storagePrefix: prefix,
  });

  return {
    layoutKey,
    aggregationKey: resolvedClienteId
      ? `cadastro:${resolvedClienteId}:${resolvedUserId}:${prefix}:table_aggregation_config`
      : `cadastro:${resolvedUserId}:${prefix}:table_aggregation_config`,
    legacyKey: legacyUserKey,
  };
}

export function getLayoutUpdatedEventName(moduleId) {
  return `cadastro-layout-updated:${moduleId}`;
}

export function getLayoutHydratedEventName(moduleId) {
  return `cadastro-layout-hydrated:${moduleId}`;
}
