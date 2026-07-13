import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODULE_REFERENCE_PLANNER_NAME,
  MODULE_REFERENCE_PLANNER_VERSION,
  MODULE_REFERENCE_PLANNER_MODE,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
} from './moduleReferencePlannerConfig.js';
import { createStudioBlueprintEngine } from '../index.js';
import { createModuleIdentityPlan } from './createModuleIdentityPlan.js';
import { createModuleFilePlan } from './createModuleFilePlan.js';
import { createModuleScreenPlan } from './createModuleScreenPlan.js';
import { createModuleFieldTableFormPlan } from './createModuleFieldTableFormPlan.js';
import { createModulePermissionPlan } from './createModulePermissionPlan.js';
import { createModuleRouteMenuPlan } from './createModuleRouteMenuPlan.js';
import { createModulePersistencePlan } from './createModulePersistencePlan.js';
import { createModuleRuntimeBindingPlan } from './createModuleRuntimeBindingPlan.js';
import { createModuleTestGatePlan } from './createModuleTestGatePlan.js';
import { createModuleEvidencePlan } from './createModuleEvidencePlan.js';
import { createModuleRiskPlan } from './createModuleRiskPlan.js';
import { createModuleReadinessDecision } from './createModuleReadinessDecision.js';
import { createModuleReferencePlannerManifest } from './createModuleReferencePlannerManifest.js';
import { verifyModuleReferencePlan } from './verifyModuleReferencePlan.js';
import { checkModuleReferencePlanCompatibility } from './checkModuleReferencePlanCompatibility.js';
import { createModuleReferencePlannerDiagnostics } from './createModuleReferencePlannerDiagnostics.js';
import { createModuleReferencePlannerFallback } from './createModuleReferencePlannerFallback.js';

/**
 * Root composer for the STUDIO BLUEPRINT MODULE REFERENCE PLANNER. Receives a blueprint
 * (or a Studio Blueprint Engine run) and turns it into a full REFERENCE PLAN: identity,
 * files, screens, fields/table/form, permissions, route/menu, persistence, runtime
 * binding, tests/gates, evidence, risks, readiness — plus manifest, verifier,
 * compatibility, diagnostics and fallback. Pure, headless, contract-only. NEVER generates
 * a module, writes any file under `src/modules`, renders UI, registers a route/menu/
 * module, touches backend/Prisma/migration/network/production/staging, mutates, persists,
 * or rewrites Empresas.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] a draft/normalized blueprint description
 * @param {Object} [options.engine] an existing Studio Blueprint Engine run (optional)
 * @returns {Object} the full module reference plan package
 */
export function createStudioBlueprintModuleReferencePlanner(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const engine = isGenericModelPlainObject(o.engine)
    ? o.engine
    : createStudioBlueprintEngine({ blueprint: isGenericModelPlainObject(o.blueprint) ? o.blueprint : {} });

  const blueprint = isGenericModelPlainObject(engine.normalized) ? engine.normalized : {};
  const blueprintValid = engine.validation ? engine.validation.valid === true : false;
  const safetyOk = engine.safety ? engine.safety.safe === true : false;
  const sourceBlueprintDigest = typeof engine.overallDigest === 'string' ? engine.overallDigest : null;

  const identityPlan = createModuleIdentityPlan({
    blueprint,
    sourceBlueprintId: blueprint.blueprintId,
    sourceBlueprintVersion: engine.engineVersion,
    sourceEngineManifest: sourceBlueprintDigest,
    sourceReadiness: engine.readiness,
  });
  const filePlan = createModuleFilePlan({ blueprint });
  const screenPlan = createModuleScreenPlan({ blueprint });
  const fieldTableFormPlan = createModuleFieldTableFormPlan({ blueprint });
  const permissionPlan = createModulePermissionPlan({ blueprint });
  const routeMenuPlan = createModuleRouteMenuPlan({ blueprint });
  const persistencePlan = createModulePersistencePlan({ blueprint });
  const runtimeBindingPlan = createModuleRuntimeBindingPlan({ blueprint });
  const testGatePlan = createModuleTestGatePlan({ blueprint });
  const evidencePlan = createModuleEvidencePlan({ blueprint });
  const riskPlan = createModuleRiskPlan();

  const blockers = [];
  const warnings = [];
  if (!blueprintValid) blockers.push('blueprint not valid');
  if (!safetyOk) blockers.push('safety not ok');
  if (fieldTableFormPlan.hasInvalidField) blockers.push('invalid field in plan');

  const readinessDecision = createModuleReadinessDecision({
    blueprintValid,
    safetyOk,
    routeMenuPlan,
    persistencePlan,
    permissionPlan,
    fieldTableFormPlan,
    blockers: [...blockers],
    warnings: [...warnings],
  });

  const manifest = createModuleReferencePlannerManifest({
    sourceBlueprintDigest,
    identityPlan, filePlan, screenPlan, fieldTableFormPlan, permissionPlan, routeMenuPlan,
    persistencePlan, runtimeBindingPlan, testGatePlan, evidencePlan, riskPlan, readinessDecision,
    blockers, warnings,
  });

  const readiness = blockers.length === 0 ? 'module_reference_plan_ready' : 'blocked';

  const plan = safeCloneGenericModel({
    kind: 'studio-blueprint-module-reference-plan',
    plannerName: MODULE_REFERENCE_PLANNER_NAME,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: MODULE_REFERENCE_PLANNER_MODE,
    ...MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
    moduleId: identityPlan.moduleId,
    blueprintValid,
    safetyOk,
    sourceBlueprintDigest,
    sourceModuleReferenceOnly: runtimeBindingPlan.sourceModuleReferenceOnly,
    identityPlan,
    filePlan,
    screenPlan,
    fieldTableFormPlan,
    permissionPlan,
    routeMenuPlan,
    persistencePlan,
    runtimeBindingPlan,
    testGatePlan,
    evidencePlan,
    riskPlan,
    readinessDecision,
    manifest,
    readyForPreviewSandbox: readinessDecision.readyForPreviewSandbox,
    readyForRealModuleGeneration: false,
    blockers,
    warnings,
    readiness,
  });

  const verifierResult = verifyModuleReferencePlan({ plan });
  const compatibilityResult = checkModuleReferencePlanCompatibility({ plan });

  const diagnostics = createModuleReferencePlannerDiagnostics({
    identityPlanStatus: identityPlan.statusPlan,
    filePlanStatus: filePlan.generationAllowedNow ? 'unsafe' : 'plannedOnly',
    screenPlanStatus: screenPlan.generatesReactComponent ? 'unsafe' : 'plannedOnly',
    fieldTableFormPlanStatus: fieldTableFormPlan.hasInvalidField ? 'invalid' : 'plannedOnly',
    permissionPlanStatus: permissionPlan.failClosed ? 'failClosed' : 'unsafe',
    routeMenuPlanStatus: routeMenuPlan.routeCreated || routeMenuPlan.menuCreated ? 'exposed' : 'plannedOnly',
    persistencePlanStatus: persistencePlan.realPersistenceBlocked ? 'blocked' : 'unsafe',
    runtimeBindingPlanStatus: runtimeBindingPlan.activatesProduction ? 'unsafe' : 'plannedOnly',
    testGatePlanStatus: 'plannedOnly',
    evidencePlanStatus: 'plannedOnly',
    riskPlanStatus: riskPlan.allMitigated ? 'mitigated' : 'open',
    readinessDecisionStatus: readinessDecision.readiness,
    compatibilityStatus: compatibilityResult.compatibilityStatus,
    readyForPreviewSandbox: readinessDecision.readyForPreviewSandbox,
    blockers,
    warnings,
  });

  const fallback = createModuleReferencePlannerFallback({ scenario: 'flag_off' });

  return safeCloneGenericModel({
    ...plan,
    verifierResult,
    verification: verifierResult,
    compatibilityResult,
    compatibilityStatus: compatibilityResult.compatibilityStatus,
    diagnostics,
    fallback,
    safeToUseAsModuleReferencePlan: verifierResult.safeToUseAsModuleReferencePlan,
    overallDigest: manifest.overallDigest,
    nextAllowedStage: compatibilityResult.recommendedNextSlice,
  });
}

export default createStudioBlueprintModuleReferencePlanner;
