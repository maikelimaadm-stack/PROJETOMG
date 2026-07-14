import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  DEV_PREVIEW_BRIDGE_NAME,
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_MODE,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
  bridgeDigest,
} from './devPreviewBridgeConfig.js';
import { createDevPreviewBridgeSession } from './createDevPreviewBridgeSession.js';
import { createDevPreviewRenderSchema } from './createDevPreviewRenderSchema.js';
import { createDevPreviewLayoutSchema } from './createDevPreviewLayoutSchema.js';
import { createDevPreviewScreenSchema } from './createDevPreviewScreenSchema.js';
import { createDevPreviewTableBridgeSchema } from './createDevPreviewTableBridgeSchema.js';
import { createDevPreviewFormBridgeSchema } from './createDevPreviewFormBridgeSchema.js';
import { createDevPreviewDetailBridgeSchema } from './createDevPreviewDetailBridgeSchema.js';
import { createDevPreviewFieldBridgeSchema } from './createDevPreviewFieldBridgeSchema.js';
import { createDevPreviewActionBridgeSchema } from './createDevPreviewActionBridgeSchema.js';
import { createDevPreviewPermissionBridgeSchema } from './createDevPreviewPermissionBridgeSchema.js';
import { createDevPreviewAllowedComponentContract } from './createDevPreviewAllowedComponentContract.js';
import { createDevPreviewVisualAdapterContract } from './createDevPreviewVisualAdapterContract.js';
import { createDevPreviewRoutePlanMetadata } from './createDevPreviewRoutePlanMetadata.js';
import { createDevPreviewMenuPlanMetadata } from './createDevPreviewPlacementPlanMetadata.js';
import { createDevPreviewRuntimeSafetyMetadata } from './createDevPreviewRuntimeSafetyMetadata.js';
import { createDevPreviewReadinessDecision } from './createDevPreviewReadinessDecision.js';
import { createDevPreviewBridgeManifest } from './createDevPreviewBridgeManifest.js';
import { verifyDevPreviewBridgeContract } from './verifyDevPreviewBridgeContract.js';
import { checkDevPreviewBridgeCompatibility } from './checkDevPreviewBridgeCompatibility.js';
import { createDevPreviewBridgeDiagnostics } from './createDevPreviewBridgeDiagnostics.js';
import { createDevPreviewBridgeFallback } from './createDevPreviewBridgeFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW CONTRACT BRIDGE from a Module Preview Sandbox
 * contract. Pure, deterministic, HEADLESS and CONTRACT-ONLY. Given the same sandbox it
 * always returns the same object graph and digest.
 *
 * It renders NO UI, creates NO React component / `.jsx` / `.tsx`, wires NO route / menu,
 * generates NO module, writes NO file under `src/modules`, and never touches backend /
 * Prisma / migration / network / production / staging, never mutates, never persists, never
 * rewrites Empresas. On an invalid/missing sandbox it returns a safe fallback and never
 * throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox] a module preview sandbox contract
 * @returns {Object} the dev preview contract bridge
 */
export function createStudioDevPreviewContractBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const sandbox = isGenericModelPlainObject(o.sandbox) ? o.sandbox : null;

  if (!sandbox) {
    return createDevPreviewBridgeFallback({ reason: 'invalid_or_missing_sandbox' });
  }

  const arg = { sandbox };

  const session = createDevPreviewBridgeSession(arg);
  const renderSchema = createDevPreviewRenderSchema(arg);
  const layoutSchema = createDevPreviewLayoutSchema(arg);
  const screenSchema = createDevPreviewScreenSchema(arg);
  const tableBridge = createDevPreviewTableBridgeSchema(arg);
  const formBridge = createDevPreviewFormBridgeSchema(arg);
  const detailBridge = createDevPreviewDetailBridgeSchema(arg);
  const fieldBridge = createDevPreviewFieldBridgeSchema(arg);
  const actionBridge = createDevPreviewActionBridgeSchema(arg);
  const permissionBridge = createDevPreviewPermissionBridgeSchema(arg);
  const allowedComponent = createDevPreviewAllowedComponentContract(arg);
  const visualAdapter = createDevPreviewVisualAdapterContract(arg);
  const routePlan = createDevPreviewRoutePlanMetadata(arg);
  const menuPlan = createDevPreviewMenuPlanMetadata(arg);
  const runtimeSafety = createDevPreviewRuntimeSafetyMetadata(arg);

  const parts = {
    session, renderSchema, layoutSchema, screenSchema, tableBridge, formBridge,
    detailBridge, fieldBridge, actionBridge, permissionBridge, allowedComponent,
    visualAdapter, routePlan, menuPlan, runtimeSafety,
  };

  const compatibility = checkDevPreviewBridgeCompatibility(arg);

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (fieldBridge.allComponentsAllowed === false) blockers.push('dev_preview_bridge_unknown_component');
  if (runtimeSafety.anySideEffect === true) blockers.push('dev_preview_bridge_runtime_safety_unsafe');

  const readiness = createDevPreviewReadinessDecision({ sandbox, blockers, warnings });
  const manifest = createDevPreviewBridgeManifest({ sandbox, parts: { ...parts, readiness } });

  const core = {
    kind: 'studio-dev-preview-contract-bridge',
    bridgeName: DEV_PREVIEW_BRIDGE_NAME,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    mode: DEV_PREVIEW_BRIDGE_MODE,
    moduleId: String(sandbox.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    renderSchema,
    layoutSchema,
    screenSchema,
    tableBridge,
    formBridge,
    detailBridge,
    fieldBridge,
    actionBridge,
    permissionBridge,
    allowedComponent,
    visualAdapter,
    routePlan,
    menuPlan,
    runtimeSafety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForDevPreviewBridge: readiness.readyForDevPreviewBridge === true,
    readyForDevPreviewVisualSlice: readiness.readyForDevPreviewVisualSlice === true,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };

  const bridge = safeCloneGenericModel({ ...core, overallDigest: bridgeDigest(core) });

  const verification = verifyDevPreviewBridgeContract({ bridge });
  const diagnostics = createDevPreviewBridgeDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...bridge,
    verification,
    diagnostics,
    bridgeDigest: bridgeDigest({ overallDigest: bridge.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewContractBridge;
