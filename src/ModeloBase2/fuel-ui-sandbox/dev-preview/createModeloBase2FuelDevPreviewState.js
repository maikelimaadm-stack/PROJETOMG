import { isGenericModelPlainObject } from '../../../runtime/generic-model/index.js';
import { createModeloBase2FuelSandboxSession } from '../createModeloBase2FuelSandboxSession.js';
import { createModeloBase2FuelSandboxActions } from '../createModeloBase2FuelSandboxActions.js';
import { resolveModeloBase2FuelDevPreviewAccess } from './resolveModeloBase2FuelDevPreviewAccess.js';
import { createModeloBase2FuelDevPreviewFixtures } from './createModeloBase2FuelDevPreviewFixtures.js';
import { createModeloBase2FuelDevPreviewDiagnostics } from './createModeloBase2FuelDevPreviewDiagnostics.js';
import { MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH } from './modeloBase2FuelDevPreviewConfig.js';
import { MODELOBASE2_DEFAULT_CREATED_AT } from '../modeloBase2FuelUiSandboxConfig.js';
import { fuelDevPreviewError } from './errors.js';

/**
 * Builds the DEV PREVIEW STATE for the fuel route: a sandbox session seeded with
 * deterministic fixtures, plus the derived view model, actions, access and
 * diagnostics. Pure aside from the sandbox session's local state. No backend/
 * Prisma/fetch/runtimeBridge/storage; never sends; never real-persists.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {'empty'|'basic'|'withDraft'|'withEvents'} [options.mode]
 * @param {Record<string, unknown>} [options.env]
 * @param {() => string} [options.clock]
 * @returns {Object} preview state
 */
export function createModeloBase2FuelDevPreviewState(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelDevPreviewError('MAK-MB2-FUEL-DPR-001', 'createModeloBase2FuelDevPreviewState() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'combustivel';
  const mode = typeof options.mode === 'string' ? options.mode : 'basic';
  const clock = typeof options.clock === 'function' ? options.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const previewId = `fuel-dev-preview-${moduleId}`;

  const access = resolveModeloBase2FuelDevPreviewAccess({ env: isGenericModelPlainObject(options.env) ? options.env : {} });
  const fixtures = createModeloBase2FuelDevPreviewFixtures({ mode });
  const session = createModeloBase2FuelSandboxSession({ moduleId, enabled: access.allowed, clock });
  const actions = createModeloBase2FuelSandboxActions({ moduleId });

  // Seed the session deterministically from the fixtures (local only, in memory).
  for (const step of fixtures.seedActions) {
    session.dispatchAction(step.action, step.payload);
  }

  const viewModel = session.getViewModel();
  const diagnostics = createModeloBase2FuelDevPreviewDiagnostics({ previewId, access, fixtureMode: mode, warnings: access.warnings });

  return {
    kind: 'modelobase2-fuel-dev-preview-state',
    previewId,
    routePath: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
    access,
    session,
    viewModel,
    actions,
    fixtures,
    diagnostics,
    localOnly: true,
    sent: false,
    persistenceReal: false,
  };
}

export default createModeloBase2FuelDevPreviewState;
