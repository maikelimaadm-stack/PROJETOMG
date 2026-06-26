import { assertMakModuleConfig, resolveMakModuleLabels } from "@/framework/mak/module/MakModuleConfig.js";
import { createMakListCache } from "@/framework/mak/data/createMakListCache.js";
import { createMakPreferencesEngine } from "@/framework/mak/preferences/MakPreferencesEngine.js";

/**
 * Cria runtime MAK genérico a partir de definição declarativa de módulo.
 * Proibido: runtimes específicos por módulo (clientesMakRuntime, etc.).
 *
 * @param {import('@/framework/mak/module/MakModuleConfig.js').MakModuleConfig} moduleDefinition
 * @param {{
 *   metadata?: object,
 *   extensions?: object,
 *   preferencesAdapter?: object,
 * }} [options]
 */
export function createMakRuntime(moduleDefinition, options = {}) {
  const { metadata = {}, extensions = {}, preferencesAdapter = null } = options;
  assertMakModuleConfig(moduleDefinition);

  const moduleId = moduleDefinition.moduleId;
  const labels = {
    ...resolveMakModuleLabels(moduleDefinition),
    title: `Cadastro de ${moduleDefinition.pluralLabel}`,
  };

  const listMeta = metadata.list ?? {};
  const listQueryKey = listMeta.queryKey ?? [`${moduleId}-cadastro`];
  const defaultPageSize = listMeta.defaultPageSize ?? 100;

  const patchListCache =
    extensions.patchListCache ??
    createMakListCache({ queryKey: listQueryKey, defaultPageSize });

  const preferences = preferencesAdapter
    ? createMakPreferencesEngine(preferencesAdapter)
    : null;

  return Object.freeze({
    moduleId,
    definition: moduleDefinition,
    metadata,
    labels,
    /** @deprecated V5 alias — prefer labels */
    moduleLabels: labels,
    /** @deprecated V5 alias — prefer definition */
    moduleDefinition,
    listQueryKey,
    defaultPageSize,
    patchListCache,
    preferences,
    repository: extensions.repository ?? moduleDefinition.repository,
    schema: extensions.schema ?? moduleDefinition.schema ?? null,
    entityName: moduleDefinition.entityName,
    metricsEntityKey: extensions.metricsEntityKey ?? moduleId,
    components: extensions.components ?? {},
    cadastroConfig: extensions.cadastroConfig ?? null,
    normalizeRecord: extensions.normalizeRecord ?? ((r) => r),
    findRecordInList: extensions.findRecordInList ?? ((list, record) => record),
    getPdfExportConfig: extensions.getPdfExportConfig ?? (() => ({})),
    buildExportRows: extensions.buildExportRows ?? (() => []),
    attachmentPersistErrorMessage:
      extensions.attachmentPersistErrorMessage ??
      "Registro cadastrado, mas alguns anexos não puderam ser salvos.",
    ...extensions,
  });
}
