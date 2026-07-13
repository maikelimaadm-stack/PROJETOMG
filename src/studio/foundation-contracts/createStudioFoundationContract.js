import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';
import {
  STUDIO_FOUNDATION_CONTRACT_NAME,
  STUDIO_FOUNDATION_CONTRACT_VERSION,
  STUDIO_FOUNDATION_ENVIRONMENT,
  STUDIO_HEADLESS_CAPABILITIES,
} from './studioFoundationContractsConfig.js';
import { createStudioMetamodelContract } from './createStudioMetamodelContract.js';
import { createStudioBlueprintContract } from './createStudioBlueprintContract.js';
import { createStudioModuleBlueprintContract } from './createStudioModuleBlueprintContract.js';
import { createStudioFieldBlueprintContract } from './createStudioFieldBlueprintContract.js';
import { createStudioScreenBlueprintContract } from './createStudioScreenBlueprintContract.js';
import { createStudioValidationBlueprintContract } from './createStudioValidationBlueprintContract.js';
import { createStudioPermissionBlueprintContract } from './createStudioPermissionBlueprintContract.js';
import { createStudioRouteMenuBlueprintContract } from './createStudioRouteMenuBlueprintContract.js';
import { createStudioPersistenceBoundaryContract } from './createStudioPersistenceBoundaryContract.js';
import { createStudioRuntimeBindingContract } from './createStudioRuntimeBindingContract.js';
import { createStudioSafetyPolicy } from './createStudioSafetyPolicy.js';
import { createStudioDiagnostics } from './createStudioDiagnostics.js';
import { createStudioContractManifest } from './createStudioContractManifest.js';
import { verifyStudioFoundationContracts } from './verifyStudioFoundationContracts.js';

/**
 * Top-level composer for the MAK Studio FOUNDATION CONTRACTS. Aggregates every
 * headless sub-contract, builds the manifest, and runs self-verification.
 *
 * Pure and deterministic. Registers nothing, renders nothing, touches no route/menu/
 * backend/Prisma/migration/network/production/staging, and never mutates. Reversible
 * by non-consumption.
 *
 * @param {Object} [options]
 * @returns {Object} the full Studio foundation contract package
 */
export function createStudioFoundationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const metamodel = createStudioMetamodelContract(o.metamodel);
  const blueprint = createStudioBlueprintContract(o.blueprint);
  const moduleBlueprint = createStudioModuleBlueprintContract(o.moduleBlueprint);
  const fieldBlueprint = createStudioFieldBlueprintContract(o.fieldBlueprint);
  const screenBlueprint = createStudioScreenBlueprintContract(o.screenBlueprint);
  const validationBlueprint = createStudioValidationBlueprintContract(o.validationBlueprint);
  const permissionBlueprint = createStudioPermissionBlueprintContract(o.permissionBlueprint);
  const routeMenu = createStudioRouteMenuBlueprintContract(o.routeMenu);
  const persistenceBoundary = createStudioPersistenceBoundaryContract(o.persistenceBoundary);
  const runtimeBinding = createStudioRuntimeBindingContract(o.runtimeBinding);
  const safetyPolicyFull = createStudioSafetyPolicy(o.safetyPolicy);
  // Drop the non-serializable check() so the foundation stays a pure data object.
  const safetyPolicy = safeCloneGenericModel(safetyPolicyFull);

  const blockers = [];
  const warnings = [];
  const diagnostics = createStudioDiagnostics({
    blockers,
    warnings,
    metamodelStatus: 'contract',
    blueprintStatus: 'contract',
    safetyStatus: 'enforced',
    compatibilityStatus: 'available',
  });

  const foundationDigest = createStudioContractDigest({ value: {
    name: STUDIO_FOUNDATION_CONTRACT_NAME,
    version: STUDIO_FOUNDATION_CONTRACT_VERSION,
    environment: STUDIO_FOUNDATION_ENVIRONMENT,
    capabilities: STUDIO_HEADLESS_CAPABILITIES,
  } });

  const manifest = createStudioContractManifest({
    foundationDigest,
    metamodel, blueprint, moduleBlueprint, fieldBlueprint, screenBlueprint,
    validationBlueprint, permissionBlueprint, routeMenu, persistenceBoundary,
    runtimeBinding, safetyPolicy, diagnostics,
    blockers, warnings,
  });

  const foundationStatus = manifest.status === 'foundation_contract_ready' && blockers.length === 0
    ? 'foundation_contract_ready'
    : 'blocked';

  const foundation = safeCloneGenericModel({
    kind: 'studio-foundation-contract',
    contractName: STUDIO_FOUNDATION_CONTRACT_NAME,
    contractVersion: STUDIO_FOUNDATION_CONTRACT_VERSION,
    environment: STUDIO_FOUNDATION_ENVIRONMENT,
    ...STUDIO_HEADLESS_CAPABILITIES,
    foundationStatus,
    metamodel,
    blueprint,
    moduleBlueprint,
    fieldBlueprint,
    screenBlueprint,
    validationBlueprint,
    permissionBlueprint,
    routeMenu,
    persistenceBoundary,
    runtimeBinding,
    safetyPolicy,
    safetyInvariants: safetyPolicy.invariants,
    diagnostics,
    foundationDigest,
    manifest,
    blockers,
    warnings,
    requiredGates: ['safety', 'persistence', 'route-menu'],
    nextAllowedStage: 'studio-blueprint-contract-hardening',
  });

  const verification = verifyStudioFoundationContracts({ foundation });
  return safeCloneGenericModel({ ...foundation, verification });
}

export default createStudioFoundationContract;
