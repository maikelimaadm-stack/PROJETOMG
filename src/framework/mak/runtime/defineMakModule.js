import { createMakRuntime } from "./createMakRuntime.js";

/**
 * Define módulo MAK com metadata declarativa (tabela, formulário, listagem, prefs).
 * @param {object} moduleDefinition — contrato cadastro/MAK
 * @param {object} [metadata] — table, form, list, preferences
 * @param {object} [extensions] — normalizeRecord, findRecordInList, export, etc.
 * @param {object} [preferencesAdapter] — adapter read/write scoped
 */
export function defineMakModule(
  moduleDefinition,
  metadata = {},
  extensions = {},
  preferencesAdapter = null
) {
  return createMakRuntime(moduleDefinition, {
    metadata,
    extensions,
    preferencesAdapter,
  });
}
