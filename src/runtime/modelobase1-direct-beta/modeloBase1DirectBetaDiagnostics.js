import { isPlainObject, safeClone } from '../shadow/pilots/tableFormProjection.js';

/**
 * Summarizes the ModeloBase1 DIRECT BETA activation state for both screens
 * (Empresas + Campos Personalizados). Pure, deterministic, passive — it inspects
 * the injectable read model descriptors and reports flags, injection state,
 * read-only invariants and readiness. No React, no IO, no side effects.
 *
 * @param {Object} [input]
 * @param {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel|null} [input.empresas]
 * @param {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel|null} [input.cadcps]
 * @returns {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaDiagnostics}
 */
export function createModeloBase1DirectBetaDiagnostics(input = {}) {
  const empresas = isPlainObject(input) ? input.empresas ?? null : null;
  const cadcps = isPlainObject(input) ? input.cadcps ?? null : null;

  const screens = [
    describeScreen('empresas', 'Empresas', empresas),
    describeScreen('cadcps', 'Campos Personalizados', cadcps),
  ];

  const injectedCount = screens.filter((s) => s.injected).length;
  const anyEnabled = injectedCount > 0;
  const allReadOnly = screens.every((s) => s.readOnly && s.writeActionsBlocked);
  const usesRealData = screens.some((s) => s.usesRealData);

  return safeClone({
    kind: 'modelobase1-direct-beta-diagnostics',
    screens,
    injectedCount,
    anyEnabled,
    allReadOnly,
    usesRealData,
    invariants: {
      sameModeloBase1Engine: true, // both screens consume ModeloBase1CadastroPage
      writeBlockedEverywhere: allReadOnly,
      noRealData: usesRealData === false,
      reversibleByFlag: true,
    },
    readinessStatus: allReadOnly && usesRealData === false ? 'ready_for_next_slice' : 'needs_fixes',
    nextAllowedStep: 'Phase 2 — ModeloBase1 Runtime Wiring',
  });
}

/**
 * @param {string} moduleId
 * @param {string} moduleName
 * @param {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel|null} readModel
 */
function describeScreen(moduleId, moduleName, readModel) {
  const injected = Boolean(readModel && readModel.enabled && readModel.injected);
  return {
    moduleId,
    moduleName,
    flag: readModel?.betaFlag ?? null,
    enabled: Boolean(readModel?.enabled),
    injected,
    productionBlocked: Boolean(readModel?.productionBlocked),
    readOnly: readModel ? readModel.readOnly !== false : true,
    writeActionsBlocked: readModel ? readModel.writeActionsBlocked !== false : true,
    usesRealData: Boolean(readModel?.usesRealData),
    source: readModel?.source ?? null,
    injectedAt: readModel?.injectedAt ?? null,
    fallback: injected ? false : true,
  };
}

export default createModeloBase1DirectBetaDiagnostics;
