import { isGenericModelPlainObject, safeCloneGenericModel, GENERIC_MODEL_SCHEMA_VERSION } from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelDomainSchema } from './createModeloBase2FuelDomainSchema.js';
import { createModeloBase2FuelOperationalAdapter } from './createModeloBase2FuelOperationalAdapter.js';
import { createModeloBase2FuelDiagnostics } from './createModeloBase2FuelDiagnostics.js';
import { createModeloBase2FuelFallback } from './createModeloBase2FuelFallback.js';
import { resolveModeloBase2FuelHeadlessConfig } from './modeloBase2FuelHeadlessConfig.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
  FUEL_HEADLESS_MODE,
  FUEL_MODULE_ID,
  FUEL_COMMAND_TYPES,
  FUEL_EVENT_TYPES,
} from './modeloBase2FuelHeadlessConfig.js';
import { fuelError } from './errors.js';

/**
 * The top-level ModeloBase2 FUEL HEADLESS CANDIDATE. The first real-domain candidate
 * on the operational runtime — but HEADLESS: no UI/route/menu/src-modules, no
 * backend/Prisma/fetch/runtimeBridge, no real persistence, never sends. Dangerous
 * capabilities false. Reversible by non-consumption. Prepares a future fuel UI slice.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @param {() => string} [options.clock]
 * @returns {Object} candidate
 */
export function createModeloBase2FuelHeadlessCandidate(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelError('MAK-MB2-FUEL-001', 'createModeloBase2FuelHeadlessCandidate() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : FUEL_MODULE_ID;
  const config = resolveModeloBase2FuelHeadlessConfig({ moduleId, env: options.env });
  const candidateId = `fuel-candidate-${moduleId}`;

  const schema = createModeloBase2FuelDomainSchema();
  const adapter = createModeloBase2FuelOperationalAdapter({ moduleId, clock: options.clock });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-fuel-headless-candidate',
    candidateId,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    mode: FUEL_HEADLESS_MODE,
    enabled: config.candidateEnabled,
    capabilities: adapter.capabilities, // dangerous ones stay false
    genericKernelVersion: GENERIC_MODEL_SCHEMA_VERSION,
    supportedCommands: [...FUEL_COMMAND_TYPES],
    supportedEvents: [...FUEL_EVENT_TYPES],
    schemaFields: schema.fields.map((f) => f.id),
    limitations: [
      'headless — NO real UI/route/menu/src-modules',
      'domain is minimal (date/machine/liters/hourmeter); no financial/stock/device/sync',
      'local + memory-only (persistenceReal:false); events never sent',
      'does NOT touch real modules, ModeloBase1, Empresas/cadcps, backend/Prisma/runtimeBridge',
    ],
    nextSteps: ['ModeloBase2 Fuel UI Readiness', 'Fuel Beta UI Sandbox'],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });

  return {
    ...descriptor,
    schema,
    adapter,
    diagnostics: createModeloBase2FuelDiagnostics({ candidateId, moduleId, draft: {}, status: 'idle' }),
    fallback: (input) => createModeloBase2FuelFallback({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    dispatch: (fuelCommand) => adapter.dispatch(fuelCommand),
    getReadState: () => adapter.getReadState(),
    getState: () => adapter.getState(),
    getDiagnostics: () => adapter.getDiagnostics(),
    createSnapshot: () => adapter.createSnapshot(),
    restoreSnapshot: (fuelSnapshot) => adapter.restoreSnapshot(fuelSnapshot),
    reset: () => adapter.reset(),
  };
}

export default createModeloBase2FuelHeadlessCandidate;
