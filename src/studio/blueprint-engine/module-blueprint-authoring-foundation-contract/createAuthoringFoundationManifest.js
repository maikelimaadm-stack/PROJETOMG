import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_FOUNDATION_CONTRACT_NAME,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';
import { createAuthoringFoundationContractSession } from './createAuthoringFoundationContractSession.js';
import { createBlueprintDraftDescriptor } from './createBlueprintDraftDescriptor.js';
import { createFieldDraftDescriptor } from './createFieldDraftDescriptor.js';
import { createLayoutDraftDescriptor } from './createLayoutDraftDescriptor.js';
import { createRelationshipDraftDescriptor } from './createRelationshipDraftDescriptor.js';
import { createValidationIssueDescriptor } from './createValidationIssueDescriptor.js';
import { createAuthoringLifecycleContract } from './createAuthoringLifecycleContract.js';
import { createAuthoringOperationCatalog } from './createAuthoringOperationCatalog.js';
import { createAuthoringInvariantCatalog } from './createAuthoringInvariantCatalog.js';
import { createPreviewHandoffContract } from './createPreviewHandoffContract.js';
import { createCertificationCandidateHandoffContract } from './createCertificationCandidateHandoffContract.js';
import { createAuthoringSsotBoundaryContract } from './createAuthoringSsotBoundaryContract.js';
import { createPermissionTenancyBoundaryContract } from './createPermissionTenancyBoundaryContract.js';
import { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
import { createAuthoringManualEnablementGateContract } from './createAuthoringManualEnablementGateContract.js';
import { createAuthoringSafetyContract } from './createAuthoringSafetyContract.js';

/**
 * Builds the authoring-foundation contract manifest with deterministic digests for every part
 * (session, all descriptors, lifecycle, operation catalog, invariants, both handoffs, SSOT and
 * permission/tenancy boundaries, prototype prohibition, manual gate, safety, readiness). Pure — can
 * build standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.certifiedBlueprint]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createAuthoringFoundationManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.certifiedBlueprint) ? o.certifiedBlueprint : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createAuthoringFoundationContractSession({ certifiedBlueprint: b });
  const draftDescriptor = p.sampleDraft ?? createBlueprintDraftDescriptor({ moduleId: b.moduleId });
  const fieldDescriptor = createFieldDraftDescriptor({ key: 'sampleField', dataKind: 'text', order: 0 });
  const layoutDescriptor = createLayoutDraftDescriptor({ sectionId: 'sampleSection', order: 0 });
  const relationshipDescriptor = createRelationshipDraftDescriptor({ relationshipId: 'sampleRelationship' });
  const validationIssue = createValidationIssueDescriptor({ issueCode: 'SAMPLE', severity: 'info' });
  const lifecycle = p.lifecycle ?? createAuthoringLifecycleContract();
  const operationCatalog = p.operationCatalog ?? createAuthoringOperationCatalog();
  const invariantCatalog = p.invariantCatalog ?? createAuthoringInvariantCatalog();
  const previewHandoff = p.previewHandoff ?? createPreviewHandoffContract();
  const certificationCandidate = p.certificationCandidate ?? createCertificationCandidateHandoffContract();
  const ssotBoundary = p.ssotBoundary ?? createAuthoringSsotBoundaryContract();
  const permissionTenancy = p.permissionTenancy ?? createPermissionTenancyBoundaryContract();
  const prototypeRelinkProhibition = p.prototypeRelinkProhibition ?? createPrototypeRelinkProhibitionContract();
  const manualGate = p.manualGate ?? createAuthoringManualEnablementGateContract();
  const safety = p.safety ?? createAuthoringSafetyContract();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    draftDescriptor: draftDescriptor.blueprintDraftDigest,
    fieldDescriptor: fieldDescriptor.fieldDraftDigest,
    layoutDescriptor: layoutDescriptor.layoutDraftDigest,
    relationshipDescriptor: relationshipDescriptor.relationshipDraftDigest,
    validationIssue: validationIssue.validationIssueDigest,
    lifecycle: lifecycle.lifecycleDigest,
    operationCatalog: operationCatalog.operationCatalogDigest,
    invariants: invariantCatalog.invariantCatalogDigest,
    previewHandoff: previewHandoff.previewHandoffDigest,
    certificationCandidate: certificationCandidate.certificationCandidateDigest,
    ssotBoundary: ssotBoundary.ssotBoundaryDigest,
    permissionTenancy: permissionTenancy.permissionTenancyDigest,
    prototypeRelinkProhibition: prototypeRelinkProhibition.prototypeRelinkProhibitionDigest,
    manualGate: manualGate.manualEnablementGateDigest,
    safety: safety.safetyDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'authoring-foundation-contract-manifest',
    authoringFoundationContractName: AUTHORING_FOUNDATION_CONTRACT_NAME,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    upstream: {
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
      blueprintEngine: BLUEPRINT_ENGINE_VERSION,
      moduleReferencePlanner: MODULE_REFERENCE_PLANNER_VERSION,
      previewSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
    },
    parts,
    partCount: Object.keys(parts).length,
    capabilities: { ...AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: authoringFoundationDigest(core) });
}

export default createAuthoringFoundationManifest;
