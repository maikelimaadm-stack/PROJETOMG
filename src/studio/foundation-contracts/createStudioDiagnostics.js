import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { STUDIO_FOUNDATION_CONTRACTS_VERSION, STUDIO_FOUNDATION_ENVIRONMENT, STUDIO_HEADLESS_CAPABILITIES } from './studioFoundationContractsConfig.js';

const READINESS = new Set(['foundation_contract_ready', 'blocked', 'invalid', 'needs_fixes', 'skipped']);

/**
 * Passive diagnostics for the Studio foundation contracts. Pure. Asserts headless/
 * no-side-effect invariants. Never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createStudioDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];

  let readiness = 'foundation_contract_ready';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_fixes';

  return safeCloneGenericModel({
    kind: 'studio-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'studio-foundation-contracts',
    contractVersion: STUDIO_FOUNDATION_CONTRACTS_VERSION,
    environment: STUDIO_FOUNDATION_ENVIRONMENT,
    ...STUDIO_HEADLESS_CAPABILITIES,
    metamodelStatus: typeof o.metamodelStatus === 'string' ? o.metamodelStatus : 'contract',
    blueprintStatus: typeof o.blueprintStatus === 'string' ? o.blueprintStatus : 'contract',
    safetyStatus: typeof o.safetyStatus === 'string' ? o.safetyStatus : 'enforced',
    compatibilityStatus: typeof o.compatibilityStatus === 'string' ? o.compatibilityStatus : 'not_run',
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createStudioDiagnostics;
