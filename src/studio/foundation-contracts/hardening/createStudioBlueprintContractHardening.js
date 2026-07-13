import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
  STUDIO_BASE_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT,
  STUDIO_HARDENING_HEADLESS_CAPABILITIES,
} from './studioBlueprintHardeningConfig.js';
import { createStudioBlueprintInvalidCaseMatrix } from './createStudioBlueprintInvalidCaseMatrix.js';
import { createStudioDangerousBlueprintMatrix } from './createStudioDangerousBlueprintMatrix.js';
import { createStudioFieldHardeningMatrix } from './createStudioFieldHardeningMatrix.js';
import { createStudioScreenHardeningMatrix } from './createStudioScreenHardeningMatrix.js';
import { createStudioValidationHardeningMatrix } from './createStudioValidationHardeningMatrix.js';
import { createStudioPermissionHardeningMatrix } from './createStudioPermissionHardeningMatrix.js';
import { createStudioRouteMenuHardeningMatrix } from './createStudioRouteMenuHardeningMatrix.js';
import { createStudioPersistenceTransitionMatrix } from './createStudioPersistenceTransitionMatrix.js';
import { createStudioRuntimeBindingHardeningMatrix } from './createStudioRuntimeBindingHardeningMatrix.js';
import { createStudioCompatibilityBreakingMatrix } from './createStudioCompatibilityBreakingMatrix.js';
import { createStudioDigestHardeningSuite } from './createStudioDigestHardeningSuite.js';
import { createStudioVerifierHardeningSuite } from './createStudioVerifierHardeningSuite.js';
import { createStudioSafetyInvariantRunner } from './createStudioSafetyInvariantRunner.js';
import { createStudioContractPerformanceBaseline } from './createStudioContractPerformanceBaseline.js';
import { createStudioBlueprintHardeningDiagnostics } from './createStudioBlueprintHardeningDiagnostics.js';

/**
 * Top-level aggregator for the MAK Studio BLUEPRINT CONTRACT HARDENING layer. Runs
 * every matrix/suite, collects blockers, and produces headless diagnostics. Pure and
 * deterministic. Registers nothing, renders nothing, touches no route/menu/backend/
 * Prisma/migration/network/production/staging, and never mutates.
 *
 * @param {Object} [options]
 * @returns {Object} the full hardening result
 */
export function createStudioBlueprintContractHardening(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const profile = typeof o.profile === 'string' ? o.profile : 'small';

  const invalidCases = createStudioBlueprintInvalidCaseMatrix();
  const dangerous = createStudioDangerousBlueprintMatrix();
  const fields = createStudioFieldHardeningMatrix();
  const screens = createStudioScreenHardeningMatrix();
  const validations = createStudioValidationHardeningMatrix();
  const permissions = createStudioPermissionHardeningMatrix();
  const routeMenu = createStudioRouteMenuHardeningMatrix();
  const persistence = createStudioPersistenceTransitionMatrix();
  const runtimeBinding = createStudioRuntimeBindingHardeningMatrix();
  const compatibility = createStudioCompatibilityBreakingMatrix();
  const digest = createStudioDigestHardeningSuite();
  const verifier = createStudioVerifierHardeningSuite();
  const safety = createStudioSafetyInvariantRunner();
  const performance = createStudioContractPerformanceBaseline({ profile });

  const parts = { invalidCases, dangerous, fields, screens, validations, permissions, routeMenu, persistence, runtimeBinding, compatibility, digest, verifier, safety };
  /** @type {string[]} */ const blockers = [];
  for (const [name, part] of Object.entries(parts)) {
    if (Array.isArray(part.blockers) && part.blockers.length > 0) blockers.push(`${name}: ${part.blockers.join(', ')}`);
  }
  if (performance.performanceStatus !== 'ok') blockers.push('performance: anomaly');

  const diagnostics = createStudioBlueprintHardeningDiagnostics({
    invalidCaseScenarios: invalidCases.scenarioCount,
    dangerousScenarios: dangerous.scenarioCount,
    fieldScenarios: fields.scenarioCount,
    screenScenarios: screens.scenarioCount,
    validationScenarios: validations.scenarioCount,
    permissionScenarios: permissions.scenarioCount,
    routeMenuScenarios: routeMenu.scenarioCount,
    persistenceTransitionScenarios: persistence.scenarioCount,
    runtimeBindingScenarios: runtimeBinding.scenarioCount,
    compatibilityScenarios: compatibility.scenarioCount,
    digestScenarios: digest.checkCount,
    verifierScenarios: verifier.scenarioCount,
    safetyInvariants: safety.invariantCount,
    exactSafety: safety.failed === 0,
    blockers,
  });

  const readiness = blockers.length === 0 ? 'blueprint_contract_hardened' : 'blocked';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-contract-hardening',
    hardeningVersion: STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
    contractVersion: STUDIO_BASE_CONTRACT_VERSION,
    environment: STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT,
    ...STUDIO_HARDENING_HEADLESS_CAPABILITIES,
    invalidCases,
    dangerous,
    fields,
    screens,
    validations,
    permissions,
    routeMenu,
    persistence,
    runtimeBinding,
    compatibility,
    digest,
    verifier,
    safety,
    performance,
    diagnostics,
    blockers,
    warnings: [],
    readiness,
    nextAllowedStage: 'studio-blueprint-contract-certification',
  });
}

export default createStudioBlueprintContractHardening;
