import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_SCREEN_KINDS } from '../createStudioScreenBlueprintContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

const PLANNED = new Set(['dashboardPlaceholder', 'kanbanPlaceholder', 'calendarPlaceholder']);
const CONFIG = [
  'layout', 'table', 'form', 'filters', 'toolbar', 'actions', 'summaryCards', 'diagnostics',
  'emptyState', 'loadingState', 'errorState', 'permission', 'responsivePolicy',
];

/**
 * Certifies the canonical screen contract. Pure. A screen never generates a React
 * component, registers a route, or changes App.jsx; mutation actions are blocked by
 * default; empty/loading/error states are required.
 *
 * @param {Object} [options]
 * @returns {Object} canonical screen contract
 */
export function createStudioCanonicalScreenContract(options = {}) {
  void options;
  const kinds = STUDIO_SCREEN_KINDS.map((kind) => ({ kind, planned: PLANNED.has(kind), generatesReactComponent: false }));

  const body = {
    kind: 'studio-canonical-screen-contract',
    kinds,
    kindNames: [...STUDIO_SCREEN_KINDS],
    config: CONFIG,
    generatesReactComponent: false,
    generatesUi: false,
    registersRoute: false,
    changesAppJsx: false,
    mutationActionsBlockedByDefault: true,
    requiredStates: ['emptyState', 'loadingState', 'errorState'],
    diagnosticsExposeSecrets: false,
  };
  return safeCloneGenericModel({ ...body, canonicalScreenContractDigest: certificationDigest({ kinds: STUDIO_SCREEN_KINDS, config: CONFIG }) });
}

export default createStudioCanonicalScreenContract;
