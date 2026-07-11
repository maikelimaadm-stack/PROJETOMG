import { isGenericModelPlainObject, safeCloneGenericModel, GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_SHELL_MODULE_ID,
  FUEL_DOMAIN,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_MODULE_PLANNED_ROUTE_PATH,
  FUEL_MODULE_PLANNED_MENU_GROUP,
  FUEL_MODULE_PLANNED_MENU_LABEL,
  FUEL_MODULE_ALLOWED_PERMISSIONS,
  FUEL_MODULE_BLOCKED_PERMISSIONS,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
} from './modeloBase2FuelModuleShellConfig.js';

/**
 * The domain commands the FUTURE fuel module will expose (local/simulated only).
 * Mirrors the fuel-headless command surface minus the diagnostics inspector.
 */
export const FUEL_MODULE_CONTRACT_COMMANDS = [
  'createFuelDraft',
  'appendFuelEntry',
  'updateFuelEntry',
  'removeFuelEntry',
  'validateFuelDraft',
  'saveFuelDraft',
  'submitFuelDraft',
  'createFuelSnapshot',
  'restoreFuelSnapshot',
  'resetFuelDraft',
];

/** The domain events the FUTURE fuel module will emit (local only, never sent). */
export const FUEL_MODULE_CONTRACT_EVENTS = [
  'fuel.draft.created',
  'fuel.entry.added',
  'fuel.entry.updated',
  'fuel.entry.removed',
  'fuel.draft.validated',
  'fuel.draft.saved',
  'fuel.draft.submitted.simulated',
  'fuel.snapshot.created',
  'fuel.snapshot.restored',
  'fuel.draft.reset',
];

/**
 * Builds the CONTRACT for the future fuel module. Pure; React-free. Declares the
 * shape the module WILL have (capabilities/commands/events/ui/route/menu/
 * permissions/persistence/safety) without registering anything. Dangerous
 * capabilities stay false; local/sent/persistenceReal safe.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} module contract descriptor
 */
export function createModeloBase2FuelModuleContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_SHELL_MODULE_ID;

  const capabilities = {
    read: true,
    localWrite: true,
    localPersistenceValidation: true,
    eventAppend: true,
    devPreview: true,
    betaModuleShell: true,
    backendWrite: false,
    connector: false,
    workflow: false,
    marketplacePublish: false,
  };

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-contract',
    moduleId,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    capabilities,
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
    commands: [...FUEL_MODULE_CONTRACT_COMMANDS],
    events: [...FUEL_MODULE_CONTRACT_EVENTS],
    readState: { source: 'modelobase2-fuel-headless', localOnly: true, persistenceReal: false },
    uiShell: { component: 'ModeloBase2FuelSandboxShell', reused: true, registered: false },
    route: { plannedRoutePath: FUEL_MODULE_PLANNED_ROUTE_PATH, devPreviewRoutePath: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH, registered: false },
    menu: { plannedGroup: FUEL_MODULE_PLANNED_MENU_GROUP, plannedLabel: FUEL_MODULE_PLANNED_MENU_LABEL, registered: false },
    permissions: { allowed: [...FUEL_MODULE_ALLOWED_PERMISSIONS], blocked: [...FUEL_MODULE_BLOCKED_PERMISSIONS], registered: false },
    persistence: { mode: 'memory_validation', persistenceReal: false, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false },
    diagnostics: { available: true },
    fallback: { available: true, passive: true },
    safety: {
      moduleRegistered: false,
      routeRegistered: false,
      menuRegistered: false,
      backendRegistered: false,
      localOnly: true,
      sent: false,
      persistenceReal: false,
    },
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModuleContract;
