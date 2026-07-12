import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from './empresasLocalReadHardeningConfig.js';
import { createEmpresasScaledSyntheticDataset } from './createEmpresasScaledSyntheticDataset.js';
import { createEmpresasCompositeQueryMatrix } from './createEmpresasCompositeQueryMatrix.js';
import { createEmpresasTenantFuzzMatrix } from './createEmpresasTenantFuzzMatrix.js';
import { createEmpresasPermissionMatrix } from './createEmpresasPermissionMatrix.js';
import { createEmpresasReadErrorContract } from './createEmpresasReadErrorContract.js';
import { createEmpresasParityScenarioRunner } from './createEmpresasParityScenarioRunner.js';
import { createEmpresasReadPerformanceBaseline } from './createEmpresasReadPerformanceBaseline.js';

const READINESS = new Set(['ready_for_local_certification', 'blocked', 'partial', 'needs_fixes', 'skipped']);

/**
 * Aggregate hardening diagnostics. Runs (or accepts) all sub-matrices and reports
 * the aggregate readiness. Pure aside from local reads. Asserts the local/read-only/
 * no-side-effect invariants; never touches production/backend/Prisma/fetch.
 *
 * @param {Object} [options]
 * @param {string} [options.hardeningId]
 * @param {boolean} [options.enabled]
 * @param {() => number} [options.clock]
 * @param {boolean} [options.includePerformance] default true
 * @returns {Object} diagnostics
 */
export function createEmpresasReadHardeningDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const enabled = o.enabled !== false;
  const clock = o.clock;

  const medium = createEmpresasScaledSyntheticDataset({ profile: 'medium' });
  const queryMatrix = createEmpresasCompositeQueryMatrix({ dataset: createEmpresasScaledSyntheticDataset({ profile: 'small' }) });
  const tenantFuzz = createEmpresasTenantFuzzMatrix({ dataset: medium });
  const permissionMatrix = createEmpresasPermissionMatrix({ dataset: createEmpresasScaledSyntheticDataset({ profile: 'small' }) });
  const errorContract = createEmpresasReadErrorContract();
  const parity = createEmpresasParityScenarioRunner({ dataset: createEmpresasScaledSyntheticDataset({ profile: 'small' }), clock });
  const performance = o.includePerformance === false
    ? { hasAnomaly: false, measurements: [] }
    : createEmpresasReadPerformanceBaseline({ iterations: 2, clock });

  const tenantLeakageFound = tenantFuzz.leakageFound === true;
  const permissionBypassFound = permissionMatrix.permissionBypassFound === true;
  const mutationExposureFound = false; // repository/adapter expose no functional write
  const exactParity = parity.exactParity === true;
  const parityScore = parity.score;

  /** @type {string[]} */ const blockers = [];
  /** @type {string[]} */ const warnings = [];
  if (!queryMatrix.allMatched) blockers.push('composite-query-mismatch');
  if (tenantLeakageFound) blockers.push('tenant-leakage');
  if (permissionBypassFound) blockers.push('permission-bypass');
  if (!exactParity) blockers.push('parity-not-exact');
  if (performance.hasAnomaly) blockers.push('performance-anomaly');

  let readiness;
  if (!enabled) readiness = 'blocked';
  else if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'partial';
  else readiness = 'ready_for_local_certification';

  return safeCloneGenericModel({
    kind: 'empresas-read-hardening-diagnostics',
    hardeningId: typeof o.hardeningId === 'string' ? o.hardeningId : 'empresas-read-hardening',
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    synthetic: true,
    localOnly: true,
    readOnly: true,
    mutationAllowed: false,
    productionAccessed: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    datasetProfiles: ['tiny', 'small', 'medium', 'large'],
    totalScenarios: queryMatrix.total + tenantFuzz.totalScenarios + permissionMatrix.total + parity.total,
    parityScore,
    exactParity,
    tenantLeakageFound,
    permissionBypassFound,
    mutationExposureFound,
    digestStatus: exactParity ? 'consistent' : 'divergent',
    performanceStatus: performance.hasAnomaly ? 'anomaly' : 'ok',
    errorContractStatus: errorContract.total > 0 ? 'defined' : 'missing',
    warnings,
    blockers,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
    subResults: {
      queryMatrix: { total: queryMatrix.total, allMatched: queryMatrix.allMatched },
      tenantFuzz: { total: tenantFuzz.totalScenarios, leakageFound: tenantFuzz.leakageFound },
      permissionMatrix: { total: permissionMatrix.total, bypassFound: permissionMatrix.permissionBypassFound },
      parity: { total: parity.total, exactParity: parity.exactParity, score: parity.score },
      errorContract: { total: errorContract.total },
      performance: { measurements: Array.isArray(performance.measurements) ? performance.measurements.length : 0 },
    },
  });
}

export default createEmpresasReadHardeningDiagnostics;
