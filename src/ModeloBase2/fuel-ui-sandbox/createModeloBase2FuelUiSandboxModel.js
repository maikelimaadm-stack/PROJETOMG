import { isGenericModelPlainObject, safeCloneGenericModel, GENERIC_MODEL_SCHEMA_VERSION } from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelSandboxSession } from './createModeloBase2FuelSandboxSession.js';
import { createModeloBase2FuelSandboxActions } from './createModeloBase2FuelSandboxActions.js';
import { createModeloBase2FuelSandboxDiagnostics } from './createModeloBase2FuelSandboxDiagnostics.js';
import { createModeloBase2FuelFallback } from '../fuel-headless/createModeloBase2FuelFallback.js';
import { resolveModeloBase2FuelUiSandboxConfig } from './modeloBase2FuelUiSandboxConfig.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
  FUEL_UI_SANDBOX_MODE,
  FUEL_MODULE_ID,
} from './modeloBase2FuelUiSandboxConfig.js';
import { fuelUiSandboxError } from './errors.js';

/**
 * The top-level ModeloBase2 FUEL BETA UI SANDBOX MODEL. A dev-only, ISOLATED beta
 * surface over the fuel headless candidate — NEVER mounted in the app, NO route/
 * menu, no src/modules, no backend/Prisma/fetch/runtimeBridge, no real persistence.
 * React is confined to the sandbox components. Dangerous capabilities false.
 * Reversible by non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @param {() => string} [options.clock]
 * @returns {Object} sandbox model
 */
export function createModeloBase2FuelUiSandboxModel(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelUiSandboxError('MAK-MB2-FUEL-UI-001', 'createModeloBase2FuelUiSandboxModel() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : FUEL_MODULE_ID;
  const config = resolveModeloBase2FuelUiSandboxConfig({ moduleId, env: options.env });
  const sandboxId = `fuel-sandbox-${moduleId}`;

  const session = createModeloBase2FuelSandboxSession({ moduleId, enabled: config.sandboxEnabled, clock: options.clock });
  const actions = createModeloBase2FuelSandboxActions({ moduleId });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-fuel-ui-sandbox-model',
    sandboxId,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    mode: FUEL_UI_SANDBOX_MODE,
    enabled: config.sandboxEnabled,
    capabilities: session.candidate.capabilities, // dangerous ones stay false
    genericKernelVersion: GENERIC_MODEL_SCHEMA_VERSION,
    supportedActions: actions.actions,
    // Structural invariants — never mounted / registered.
    uiMountedInApp: false,
    routeRegistered: false,
    menuRegistered: false,
    limitations: [
      'dev-only sandbox — NEVER mounted in the app; no route/menu',
      'not a real module; UI is a beta preview only',
      'local + memory-only (persistenceReal:false); events never sent',
      'does NOT touch src/modules, ModeloBase1, Empresas/cadcps, backend/Prisma/runtimeBridge',
    ],
    nextSteps: ['ModeloBase2 Fuel Dev Preview Route', 'Fuel Module Shell Readiness'],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });

  return {
    ...descriptor,
    headlessCandidate: session.candidate,
    session,
    actions,
    viewModel: session.getViewModel(),
    diagnostics: createModeloBase2FuelSandboxDiagnostics({ sandboxId, moduleId, enabled: config.sandboxEnabled, readState: session.candidate.getReadState(), status: 'idle' }),
    fallback: (input) => createModeloBase2FuelFallback({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    dispatch: (actionType, payload) => session.dispatchAction(actionType, payload),
    getViewModel: () => session.getViewModel(),
    getDiagnostics: () => session.getDiagnostics(),
  };
}

export default createModeloBase2FuelUiSandboxModel;
