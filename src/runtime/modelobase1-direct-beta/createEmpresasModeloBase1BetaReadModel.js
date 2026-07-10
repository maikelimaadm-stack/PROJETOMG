import { isPlainObject } from '../shadow/pilots/tableFormProjection.js';
import { createEmpresasReadOnlyViewModel } from '../migration/empresas-readonly/createEmpresasReadOnlyViewModel.js';
import { createEmpresasReadOnlyWriteGuard } from '../migration/empresas-readonly/empresasReadOnlyWriteGuard.js';
import { EMPRESAS_READONLY_FLAG } from '../migration/empresas-readonly/empresasReadOnlyConfig.js';
import { createModeloBase1DirectBetaReadModel } from './createModeloBase1DirectBetaReadModel.js';
import {
  EMPRESAS_MODELOBASE1_BETA_FLAG,
  isEmpresasModeloBase1BetaEnabled,
  isEmpresasModeloBase1BetaProductionBlocked,
} from './modeloBase1DirectBetaConfig.js';

/**
 * When the Empresas beta is on, the underlying read-only candidate's own write
 * guard should report writes as blocked with its canonical "write blocked" code
 * (003) rather than "flag disabled" (001). We compose an env that turns the
 * read-only candidate flag on WITHOUT touching production fail-closed behavior
 * (the beta's own gate already decided enablement). This never enables any
 * write — the guard blocks every write-shaped operation regardless.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
function composeReadOnlyEnv(env) {
  return { ...(env ?? {}), [EMPRESAS_READONLY_FLAG]: 'true' };
}

/**
 * Builds the Empresas ModeloBase1 DIRECT BETA read model. Reuses the existing
 * Empresas Read-Only Candidate view model (runtime v2 projection + controlled
 * dev dataset) as the read source and the Empresas read-only write guard to
 * block every write. Behind the `MAK_MODELOBASE1_EMPRESAS_BETA` flag; off by
 * default; fail-closed in production. Read-only in this phase.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env] Explicit env (for testing).
 * @param {boolean} [options.includeRows] Attach controlled-dataset rows. Default true.
 * @returns {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel}
 */
export function createEmpresasModeloBase1BetaReadModel(options = {}) {
  const env = isPlainObject(options) ? options.env : undefined;
  const includeRows = isPlainObject(options) ? options.includeRows !== false : true;
  const enabled = isEmpresasModeloBase1BetaEnabled(env);
  const productionBlocked = isEmpresasModeloBase1BetaProductionBlocked(env);
  const writeGuard = createEmpresasReadOnlyWriteGuard({ env: composeReadOnlyEnv(env) });

  return createModeloBase1DirectBetaReadModel({
    moduleId: 'empresas',
    moduleName: 'Empresas',
    enabled,
    productionBlocked,
    source: 'empresas-readonly-view-model + controlled-dev-dataset',
    betaFlag: EMPRESAS_MODELOBASE1_BETA_FLAG,
    writeGuard,
    resolveViewModel: () => createEmpresasReadOnlyViewModel({ includeRows }),
  });
}

export default createEmpresasModeloBase1BetaReadModel;
