import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasParityScenarioRunner } from '../hardening/createEmpresasParityScenarioRunner.js';
import { contextForScaledTenant } from '../hardening/createEmpresasScaledSyntheticDataset.js';
import { createEmpresasCanonicalFixtures } from './createEmpresasCanonicalFixtures.js';
import { EMPRESAS_CONTRACT_VERSION } from './empresasLocalReadCertificationConfig.js';

/**
 * The canonical parity baseline: runs the parity scenario runner (repository × API
 * adapter × runtime projection) over the certification-small fixture and records
 * the exact-parity verdict + a deterministic certification digest. Pure aside from
 * local reads; injectable clock keeps it non-flaky.
 *
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @returns {Object} parity baseline descriptor
 */
export function createEmpresasCanonicalParityBaseline(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const fixtures = isGenericModelPlainObject(o.fixtures) ? o.fixtures : createEmpresasCanonicalFixtures({ profile: 'certification-small' });
  const dataset = { records: fixtures.records, tenants: fixtures.tenants };
  const context = contextForScaledTenant(fixtures.tenants[0]);
  const suite = createEmpresasParityScenarioRunner({ dataset, context, clock: o.clock || (() => 0) });

  const scenarios = suite.scenarios.map((s) => ({
    scenarioId: s.scenarioId,
    repositoryDigest: s.repositoryDigest,
    apiDigest: s.apiDigest,
    runtimeDigest: s.runtimeDigest,
    equal: s.equal,
    score: s.score,
    differences: s.differences,
  }));

  const body = {
    kind: 'empresas-canonical-parity-baseline',
    contractVersion: EMPRESAS_CONTRACT_VERSION,
    scenarioCount: scenarios.length,
    essentialScenarioCount: scenarios.length,
    passed: suite.passed,
    failed: suite.failed,
    exactParity: suite.exactParity,
    parityScore: suite.score,
    blockers: suite.blockers,
    warnings: suite.warnings,
    scenarios,
  };
  return safeCloneGenericModel({ ...body, certificationDigest: createGenericModelChecksum({ value: scenarios.map((s) => [s.scenarioId, s.repositoryDigest, s.equal]) }) });
}

export default createEmpresasCanonicalParityBaseline;
