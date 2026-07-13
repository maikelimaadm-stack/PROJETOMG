import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
} from './modulePreviewSandboxConfig.js';
import { createStudioBlueprintModuleReferencePlanner } from '../module-reference-planner/index.js';
import { createModulePreviewSandboxSession } from './createModulePreviewSandboxSession.js';
import { createModulePreviewTableMetadata } from './createModulePreviewTableMetadata.js';
import { createModulePreviewFormMetadata } from './createModulePreviewFormMetadata.js';
import { createModulePreviewDetailMetadata } from './createModulePreviewDetailMetadata.js';
import { createModulePreviewFieldMetadata } from './createModulePreviewFieldMetadata.js';
import { createModulePreviewActionMetadata } from './createModulePreviewActionMetadata.js';
import { createModulePreviewPermissionMetadata } from './createModulePreviewPermissionMetadata.js';
import { createModulePreviewRouteBlockedMetadata } from './createModulePreviewRouteBlockedMetadata.js';
import { createModulePreviewPersistenceBlockedMetadata } from './createModulePreviewPersistenceBlockedMetadata.js';
import { createModulePreviewRuntimeBindingMetadata } from './createModulePreviewRuntimeBindingMetadata.js';
import { createModulePreviewReadinessDecision } from './createModulePreviewReadinessDecision.js';
import { createModulePreviewSandboxManifest } from './createModulePreviewSandboxManifest.js';
import { verifyModulePreviewSandboxContract } from './verifyModulePreviewSandboxContract.js';
import { checkModulePreviewSandboxCompatibility } from './checkModulePreviewSandboxCompatibility.js';
import { createModulePreviewSandboxDiagnostics } from './createModulePreviewSandboxDiagnostics.js';
import { createModulePreviewSandboxFallback } from './createModulePreviewSandboxFallback.js';

/**
 * Root composer for the STUDIO MODULE PREVIEW SANDBOX CONTRACT. Consumes the Module
 * Reference Planner (which consumes the Blueprint Engine) as a headless contract and
 * produces preview METADATA only: session, table/form/detail/field/action/permission
 * previews, route-menu/persistence "blocked" metadata, runtime binding metadata, readiness
 * decision, manifest, verifier, compatibility, diagnostics and fallback. Pure, headless,
 * preview-metadata-only. NEVER creates UI/React components/routes/menus/modules, writes
 * files under `src/modules`, touches backend/Prisma/migration/network/production/staging,
 * mutates, persists, or rewrites Empresas.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] a draft/normalized blueprint description
 * @param {Object} [options.plan] an existing module reference plan (optional)
 * @returns {Object} the full preview sandbox contract package
 */
export function createStudioModulePreviewSandboxContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const plan = isGenericModelPlainObject(o.plan)
    ? o.plan
    : createStudioBlueprintModuleReferencePlanner({ blueprint: isGenericModelPlainObject(o.blueprint) ? o.blueprint : {} });

  const plannerValid = plan.readiness === 'module_reference_plan_ready' && (plan.blockers ? plan.blockers.length === 0 : true);
  const blueprintValid = plan.blueprintValid !== false;
  const sourceBlueprintDigest = typeof plan.sourceBlueprintDigest === 'string' ? plan.sourceBlueprintDigest : null;
  const sourcePlannerDigest = typeof plan.overallDigest === 'string' ? plan.overallDigest : null;

  const session = createModulePreviewSandboxSession({ plan });
  const tablePreviewMetadata = createModulePreviewTableMetadata({ plan });
  const formPreviewMetadata = createModulePreviewFormMetadata({ plan });
  const detailPreviewMetadata = createModulePreviewDetailMetadata({ plan });
  const fieldPreviewMetadata = createModulePreviewFieldMetadata({ plan });
  const actionPreviewMetadata = createModulePreviewActionMetadata({ plan });
  const permissionPreviewMetadata = createModulePreviewPermissionMetadata({ plan });
  const routeMenuBlockedMetadata = createModulePreviewRouteBlockedMetadata({ plan });
  const persistenceBlockedMetadata = createModulePreviewPersistenceBlockedMetadata({ plan });
  const runtimeBindingMetadata = createModulePreviewRuntimeBindingMetadata({ plan });

  const blockers = [];
  const warnings = [];
  if (!plannerValid) blockers.push('reference plan not valid');
  if (fieldPreviewMetadata.hasUnsafeField) blockers.push('unsafe field in preview');
  const metadataSafe = fieldPreviewMetadata.hasUnsafeField === false
    && tablePreviewMetadata.mutationAllowed === false
    && formPreviewMetadata.mutationAllowed === false
    && detailPreviewMetadata.readOnly === true;

  const readinessDecision = createModulePreviewReadinessDecision({
    plannerValid,
    metadataSafe,
    fieldPreview: fieldPreviewMetadata,
    routeMenuBlocked: routeMenuBlockedMetadata,
    persistenceBlocked: persistenceBlockedMetadata,
    permission: permissionPreviewMetadata,
    blockers: [...blockers],
    warnings: [...warnings],
  });

  const manifest = createModulePreviewSandboxManifest({
    sourceBlueprintDigest,
    sourcePlannerDigest,
    session,
    tablePreview: tablePreviewMetadata,
    formPreview: formPreviewMetadata,
    detailPreview: detailPreviewMetadata,
    fieldPreview: fieldPreviewMetadata,
    actionPreview: actionPreviewMetadata,
    permissionPreview: permissionPreviewMetadata,
    routeMenuBlocked: routeMenuBlockedMetadata,
    persistenceBlocked: persistenceBlockedMetadata,
    runtimeBinding: runtimeBindingMetadata,
    readinessDecision,
    blockers,
    warnings,
  });

  const readiness = blockers.length === 0 ? 'module_preview_sandbox_contract_ready' : 'blocked';

  const contract = safeCloneGenericModel({
    kind: 'studio-module-preview-sandbox-contract',
    sandboxName: MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_PREVIEW_SANDBOX_MODE,
    ...MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
    moduleId: plan.moduleId,
    plannerValid,
    blueprintValid,
    sourceBlueprintDigest,
    sandboxSession: session,
    tablePreviewMetadata,
    formPreviewMetadata,
    detailPreviewMetadata,
    fieldPreviewMetadata,
    actionPreviewMetadata,
    permissionPreviewMetadata,
    routeMenuBlockedMetadata,
    persistenceBlockedMetadata,
    runtimeBindingMetadata,
    readinessDecision,
    manifest,
    readyForPreviewSandbox: readinessDecision.readyForPreviewSandbox,
    readyForDevPreviewContract: readinessDecision.readyForDevPreviewContract,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    readiness,
  });

  const verifierResult = verifyModulePreviewSandboxContract({ contract });
  const compatibilityResult = checkModulePreviewSandboxCompatibility({ contract });

  const diagnostics = createModulePreviewSandboxDiagnostics({
    sessionStatus: 'metadata',
    tablePreviewStatus: tablePreviewMetadata.mutationAllowed ? 'unsafe' : 'previewOnly',
    formPreviewStatus: formPreviewMetadata.mutationAllowed ? 'unsafe' : 'previewOnly',
    detailPreviewStatus: detailPreviewMetadata.readOnly ? 'previewOnly' : 'unsafe',
    fieldPreviewStatus: fieldPreviewMetadata.hasUnsafeField ? 'unsafe' : 'previewOnly',
    actionPreviewStatus: actionPreviewMetadata.anyMutationEnabled ? 'unsafe' : 'previewOnly',
    permissionPreviewStatus: permissionPreviewMetadata.failClosed ? 'failClosed' : 'unsafe',
    routeMenuBlockedStatus: routeMenuBlockedMetadata.blockedNow ? 'blocked' : 'exposed',
    persistenceBlockedStatus: persistenceBlockedMetadata.blockedNow ? 'blocked' : 'exposed',
    runtimeBindingStatus: runtimeBindingMetadata.bindingCreated ? 'unsafe' : 'previewOnly',
    readinessDecisionStatus: readinessDecision.readiness,
    compatibilityStatus: compatibilityResult.compatibilityStatus,
    readyForPreviewSandbox: readinessDecision.readyForPreviewSandbox,
    readyForDevPreviewContract: readinessDecision.readyForDevPreviewContract,
    blockers,
    warnings,
  });

  const fallback = createModulePreviewSandboxFallback({ scenario: 'flag_off' });

  return safeCloneGenericModel({
    ...contract,
    verifierResult,
    verification: verifierResult,
    compatibilityResult,
    compatibilityStatus: compatibilityResult.compatibilityStatus,
    diagnostics,
    fallback,
    safeToUseAsPreviewSandboxContract: verifierResult.safeToUseAsPreviewSandboxContract,
    overallDigest: manifest.overallDigest,
    nextAllowedStage: compatibilityResult.recommendedNextSlice,
  });
}

export default createStudioModulePreviewSandboxContract;
