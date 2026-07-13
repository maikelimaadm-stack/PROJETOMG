import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_MODE,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
} from './studioBlueprintEngineConfig.js';

const READINESS = new Set(['blueprint_processed', 'needs_review', 'blocked', 'invalid', 'skipped']);

/**
 * Passive diagnostics for an engine run. Pure. Asserts headless/contract-only
 * invariants and never contains secrets.
 *
 * @param {Object} [options]
 * @returns {Object} diagnostics
 */
export function createStudioBlueprintDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const st = (k) => (typeof o[k] === 'string' ? o[k] : 'unknown');

  let readiness = 'blueprint_processed';
  if (blockers.length > 0) readiness = 'blocked';
  else if (warnings.length > 0) readiness = 'needs_review';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-diagnostics',
    diagnosticId: typeof o.diagnosticId === 'string' ? o.diagnosticId : 'studio-blueprint-engine',
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    mode: STUDIO_BLUEPRINT_ENGINE_MODE,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    normalizeStatus: st('normalizeStatus'),
    validationStatus: st('validationStatus'),
    safetyStatus: st('safetyStatus'),
    hardeningStatus: st('hardeningStatus'),
    manifestStatus: st('manifestStatus'),
    verifierStatus: st('verifierStatus'),
    compatibilityStatus: st('compatibilityStatus'),
    blockers,
    warnings,
    readiness: READINESS.has(readiness) ? readiness : 'skipped',
  });
}

export default createStudioBlueprintDiagnostics;
