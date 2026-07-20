import {
  CRITICAL_SOURCE_FIELDS, SOURCE_BOUNDARY_FIELDS, SOURCE_HANDOFF_VERSION_FIELDS, SOURCE_HANDOFF_DIGEST_FIELDS,
  REAL_HANDOFF_FIELDS, FORBIDDEN_LEGACY_SOURCE_FIELDS, SOURCE_HANDOFF_KIND, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Required fields (real) a valid handoff must carry. */
const REQUIRED_FIELDS = Object.freeze([
  'handoffKind', 'handoffVersion', 'runtimeVersion', 'targetSandboxVersion', 'draftId', 'draftRevision',
  'synthetic', 'immutable', 'validated', 'previewPayloadCreated', 'payload', 'ok', 'handoffDigest',
]);

/**
 * SOURCE VALIDATION PLAN — plans (does not implement) strict shape validation of the REAL
 * `synthetic_preview_candidate` handoff. Real field names only (no invented aliases): explicit version
 * fields + `handoffDigest`; no `upstreamVersions`, no generic `digest`. Metadata only. @returns {Object}
 */
export function createSourceValidationPlan() {
  const requiredAllReal = REQUIRED_FIELDS.every((f) => REAL_HANDOFF_FIELDS.includes(f));
  const core = {
    kind: 'bridge-source-validation-plan',
    handoffKind: SOURCE_HANDOFF_KIND,
    realHandoffFields: [...REAL_HANDOFF_FIELDS],
    requiredFields: [...REQUIRED_FIELDS],
    criticalFields: [...CRITICAL_SOURCE_FIELDS],
    criticalFieldCount: CRITICAL_SOURCE_FIELDS.length,
    boundaryFields: [...SOURCE_BOUNDARY_FIELDS],
    versionFields: [...SOURCE_HANDOFF_VERSION_FIELDS],
    digestFields: [...SOURCE_HANDOFF_DIGEST_FIELDS],
    forbiddenLegacySourceFields: [...FORBIDDEN_LEGACY_SOURCE_FIELDS],
    expected: {
      synthetic: true, immutable: true, validated: true, previewMounted: false,
      realDataAttached: false, routeCreated: false, menuCreated: false, productExposed: false, ok: true,
    },
    sourceValidationPlanned: true,
    sourceValidationImplemented: false,
    strictSourceShape: true,
    unknownCriticalFieldsRejected: true,
    missingCriticalFieldsFailClosed: true,
    sourceValidationSideEffectsAllowed: false,
    // Alignment guarantees.
    realSourceFieldNamesRequired: true,
    legacyInventedSourceFieldAliasesAllowed: false,
    upstreamVersionsSourceFieldAllowed: false,
    genericDigestSourceFieldAllowed: false,
    everyRequiredFieldExistsInRealHandoff: requiredAllReal,
  };
  return safeCloneGenericModel({ ...core, sourceValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceValidationPlan;
