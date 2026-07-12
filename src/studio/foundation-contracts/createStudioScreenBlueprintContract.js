import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** Screen kinds; the *Placeholder ones are planned/not-implemented. */
export const STUDIO_SCREEN_KINDS = ['table', 'form', 'detail', 'dashboardPlaceholder', 'kanbanPlaceholder', 'calendarPlaceholder'];
const PLANNED = new Set(['dashboardPlaceholder', 'kanbanPlaceholder', 'calendarPlaceholder']);

/**
 * The Screen Blueprint contract. Pure. NOT a React component; generates no UI.
 * Mutation actions are blocked by default; empty/loading/error states are required.
 *
 * @param {Object} [options]
 * @returns {Object} screen blueprint contract descriptor
 */
export function createStudioScreenBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const config = [
    'layout', 'table', 'form', 'filters', 'toolbar', 'actions', 'summaryCards', 'diagnostics',
    'emptyState', 'loadingState', 'errorState', 'permission', 'responsivePolicy',
  ];

  const kinds = STUDIO_SCREEN_KINDS.map((kind) => ({ kind, planned: PLANNED.has(kind), generatesReactComponent: false }));

  const body = {
    kind: 'studio-screen-blueprint-contract',
    kinds,
    kindNames: STUDIO_SCREEN_KINDS,
    config,
    generatesReactComponent: false,
    generatesUi: false,
    mutationActionsBlockedByDefault: true,
    requiredStates: ['emptyState', 'loadingState', 'errorState'],
    diagnosticsExposeSecrets: false,
    rules: [
      'screen is not a real React component this slice',
      'does not generate UI',
      'mutation actions blocked by default',
      'table/form depend on fields',
      'empty/loading/error states must exist',
      'diagnostics do not expose secrets',
    ],
  };
  return safeCloneGenericModel({ ...body, screenBlueprintDigest: createStudioContractDigest({ value: { kinds: STUDIO_SCREEN_KINDS, config } }) });
}

export default createStudioScreenBlueprintContract;
