import { BRIDGE_VALIDATION_STAGES, DEFAULT_BRIDGE_RESOURCE_LIMITS, FORBIDDEN_PROTOTYPE_PATHS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { sortBridgeIssues } from './sortBridgeIssues.js';
import { validateStrictDraftIdentity } from './validateStrictDraftIdentity.js';
import { validateSourceHandoffShape } from './validateSourceHandoffShape.js';
import { validateSourceVersionTuple } from './validateSourceVersionTuple.js';
import { recomputeAndValidateHandoffDigest } from './recomputeAndValidateHandoffDigest.js';
import { validateSourceSyntheticBoundary } from './validateSourceSyntheticBoundary.js';
import { validateSourceSsotBoundary } from './validateSourceSsotBoundary.js';
import { validateBridgeExtensions } from './validateBridgeExtensions.js';
import { enforceBridgeResourceLimits } from './enforceBridgeResourceLimits.js';
import { executeBridgeFieldMappings } from './executeBridgeFieldMappings.js';
import { createTargetPreviewSandboxDescriptor } from './createTargetPreviewSandboxDescriptor.js';
import { validateTargetDescriptor } from './validateTargetDescriptor.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Runs the deterministic 13-stage validation pipeline atomically. Collects issues across all source-side
 * stages; if any blocking issue exists, it produces NO target (fail-closed, no partial state). Otherwise it
 * executes the contract mappings, builds the synthetic target descriptor, and runs the target-side stages;
 * any target-side blocker discards the target entirely. Pure — never mutates inputs. @param {Object} options
 * @returns {Object}
 */
export function createBridgeValidationPipeline(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const sourceHandoff = isPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const expectedDraftId = o.expectedDraftId;
  const expectedVersions = isPlainObject(o.expectedVersions) ? o.expectedVersions : {};
  const limits = isPlainObject(o.limits) ? o.limits : DEFAULT_BRIDGE_RESOURCE_LIMITS;
  const extensions = Array.isArray(o.extensions) ? o.extensions : [];
  const extensionSchemas = isPlainObject(o.extensionSchemas) ? o.extensionSchemas : {};
  const maxValidationIssues = Number.isFinite(limits.maxValidationIssues) ? limits.maxValidationIssues : DEFAULT_BRIDGE_RESOURCE_LIMITS.maxValidationIssues;

  let issues = [];
  const stageResults = {};
  const push = (stage, res) => { stageResults[stage] = { ok: res.ok, issueCount: res.issues.length }; issues.push(...res.issues); };

  // Stage 1: source_shape_validation (+ extensions + resource limits are shape-level guards).
  push('source_shape_validation', validateSourceHandoffShape(sourceHandoff));
  push('source_shape_validation', validateBridgeExtensions({ extensions, extensionSchemas, maxExtensions: limits.maxExtensions }));
  push('source_shape_validation', enforceBridgeResourceLimits({ sourceHandoff, limits }));
  // Stage 2: source_identity_validation (BEFORE any mapping/build — strict, no findDraft).
  push('source_identity_validation', validateStrictDraftIdentity({ sourceHandoff, expectedDraftId }));
  // Stage 3: source_version_validation.
  push('source_version_validation', validateSourceVersionTuple({ sourceHandoff, expectedVersions }));
  // Stage 4: source_digest_validation.
  push('source_digest_validation', recomputeAndValidateHandoffDigest(sourceHandoff));
  // Stage 5: source_synthetic_boundary_validation.
  push('source_synthetic_boundary_validation', validateSourceSyntheticBoundary(sourceHandoff));
  // Stage 6: source_ssot_boundary_validation.
  push('source_ssot_boundary_validation', validateSourceSsotBoundary(sourceHandoff));

  const sourceBlocked = issues.some((i) => i.blocksBridge);

  let mapped = null;
  let targetDescriptor = null;
  if (!sourceBlocked) {
    // Stage 7: mapping_contract_validation (execute contract mappings).
    const mapRes = executeBridgeFieldMappings({ sourceHandoff });
    push('mapping_contract_validation', mapRes);
    if (!issues.some((i) => i.blocksBridge)) {
      mapped = mapRes.mapped;
      // Build target atomically, then run target-side stages.
      const built = createTargetPreviewSandboxDescriptor({ mapped });
      // Stages 8-9: target_version_validation + target_shape_validation (validateTargetDescriptor covers both).
      const tgtRes = validateTargetDescriptor(built);
      for (const iss of tgtRes.issues) issues.push(iss);
      stageResults.target_version_validation = { ok: !tgtRes.issues.some((i) => i.stage === 'target_version_validation' && i.blocksBridge), issueCount: tgtRes.issues.filter((i) => i.stage === 'target_version_validation').length };
      stageResults.target_shape_validation = { ok: !tgtRes.issues.some((i) => i.stage === 'target_shape_validation' && i.blocksBridge), issueCount: tgtRes.issues.filter((i) => i.stage === 'target_shape_validation').length };
      // Stages 10-13: product/module/certification/prototype (assert descriptor + mapped stay inert).
      push('product_exposure_validation', assertNoProductExposure(built));
      push('module_generation_validation', assertNoModuleGeneration(built));
      push('certification_boundary_validation', assertNoCertification(built));
      push('prototype_reference_validation', assertNoPrototypeReference(sourceHandoff, built));
      if (!issues.some((i) => i.blocksBridge)) {
        targetDescriptor = built;
      }
    }
  }

  // Max issues guard (deterministic; excess is itself a blocker).
  if (issues.length > maxValidationIssues) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_VALIDATION_ISSUES_TOO_MANY', severity: 'blocker', stage: 'source_shape_validation', path: 'issues', message: `Too many validation issues (${issues.length} > ${maxValidationIssues}).` }));
    targetDescriptor = null;
    mapped = null;
  }

  const sorted = sortBridgeIssues(issues);
  const blocked = sorted.some((i) => i.blocksBridge);
  // Fail-closed: any blocking issue discards the target atomically (no partial descriptor).
  const finalTarget = blocked ? null : targetDescriptor;
  return {
    kind: 'bridge-validation-pipeline-result',
    stages: [...BRIDGE_VALIDATION_STAGES],
    stageCount: BRIDGE_VALIDATION_STAGES.length,
    stageResults,
    issues: sorted,
    issueCount: sorted.length,
    blocked,
    mapped: blocked ? null : mapped,
    targetDescriptor: finalTarget,
    targetDescriptorCreated: finalTarget !== null,
  };
}

function assertNoProductExposure(d) {
  const issues = [];
  if (d.productExposed === true) issues.push(createBridgeIssue({ issueCode: 'BRIDGE_PRODUCT_EXPOSURE_FORBIDDEN', severity: 'blocker', stage: 'product_exposure_validation', path: 'target.productExposed', message: 'Product exposure is forbidden.' }));
  return { ok: issues.length === 0, issues };
}
function assertNoModuleGeneration(d) {
  const issues = [];
  if (d.moduleGenerated === true) issues.push(createBridgeIssue({ issueCode: 'BRIDGE_MODULE_GENERATION_FORBIDDEN', severity: 'blocker', stage: 'module_generation_validation', path: 'target.moduleGenerated', message: 'Module generation is forbidden.' }));
  return { ok: issues.length === 0, issues };
}
function assertNoCertification(d) {
  const issues = [];
  if (d.certified === true || d.certificationPerformed === true) issues.push(createBridgeIssue({ issueCode: 'BRIDGE_CERTIFICATION_FORBIDDEN', severity: 'blocker', stage: 'certification_boundary_validation', path: 'target.certified', message: 'Certification is forbidden.' }));
  return { ok: issues.length === 0, issues };
}
function assertNoPrototypeReference(source, target) {
  const issues = [];
  let serialized = '';
  try { serialized = JSON.stringify(source) + JSON.stringify(target); } catch { serialized = ''; }
  if (FORBIDDEN_PROTOTYPE_PATHS.some((p) => serialized.includes(p))) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_PROTOTYPE_REFERENCE_FORBIDDEN', severity: 'blocker', stage: 'prototype_reference_validation', path: 'target', message: 'Old Studio prototype references are forbidden.' }));
  }
  return { ok: issues.length === 0, issues };
}

export default createBridgeValidationPipeline;
