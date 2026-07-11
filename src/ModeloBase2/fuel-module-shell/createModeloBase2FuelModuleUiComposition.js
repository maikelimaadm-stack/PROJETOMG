import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { isModeloBase2FuelModuleShellPreviewEnabled } from './modeloBase2FuelModuleShellConfig.js';

/**
 * Builds the UI COMPOSITION READINESS for the future fuel module. Pure; React-free
 * (only NAMES the React components it will reuse — it never imports them). The
 * components already exist in the fuel-ui-sandbox; this layer declares reuse and
 * what is still missing for production. Nothing is mounted/registered.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} ui composition descriptor
 */
export function createModeloBase2FuelModuleUiComposition(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const previewEnabled = isModeloBase2FuelModuleShellPreviewEnabled(env);

  const reuses = [
    'ModeloBase2FuelSandboxShell',
    'ModeloBase2FuelEntryForm',
    'ModeloBase2FuelEntriesTable',
    'ModeloBase2FuelEventTimeline',
    'ModeloBase2FuelDiagnosticsPanel',
    'ModeloBase2FuelStatusBadges',
  ];

  const missingForProduction = [
    'persistence decision',
    'permission integration',
    'route registration',
    'menu registration',
    'real module location',
    'sync/backend policy',
  ];

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-ui-composition',
    shellComponent: 'ModeloBase2FuelSandboxShell',
    reuses,
    viewModelSource: 'modelobase2-fuel-ui-sandbox',
    previewEnabled,
    componentAvailable: true,
    // The shell is renderable, but the MODULE is not production-ready.
    moduleShellReady: true,
    mountedInApp: false,
    routeRegistered: false,
    menuRegistered: false,
    productionReady: false,
    missingForProduction,
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModuleUiComposition;
