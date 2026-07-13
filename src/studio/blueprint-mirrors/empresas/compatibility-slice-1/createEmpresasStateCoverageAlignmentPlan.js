import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Each state the Studio screen contract expects, with its current coverage in Empresas/
 * ModeloBase1 and where it could be resolved. Security states are fail-closed.
 */
const STATES = [
  { state: 'emptyState', currentCoverage: 'referenceOnly', source: 'ModeloBase1 table', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: false },
  { state: 'loadingState', currentCoverage: 'referenceOnly', source: 'ModeloBase1 table', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: false },
  { state: 'errorState', currentCoverage: 'referenceOnly', source: 'ModeloBase1 table', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: false },
  { state: 'unauthorizedState', currentCoverage: 'gap', source: 'auth guard (documented)', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: true },
  { state: 'tenantMismatchState', currentCoverage: 'referenceOnly', source: 'read contract tenant_mismatch outcome', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: true },
  { state: 'permissionDeniedState', currentCoverage: 'referenceOnly', source: 'read contract permission_denied outcome', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: true },
  { state: 'validationErrorState', currentCoverage: 'referenceOnly', source: 'empresasSchema (documented)', canResolveInUI: false, canResolveInModeloBase1: true, requiresBackend: false, security: false },
  { state: 'fallbackState', currentCoverage: 'aligned', source: 'mirror fallback (headless)', canResolveInUI: false, canResolveInModeloBase1: false, requiresBackend: false, security: true },
  { state: 'diagnosticsState', currentCoverage: 'aligned', source: 'mirror diagnostics (headless)', canResolveInUI: false, canResolveInModeloBase1: false, requiresBackend: false, security: false },
];

/**
 * Builds the state coverage alignment plan. Pure, contract-only. Does not change UI.
 * Security states are fail-closed.
 *
 * @param {Object} [options]
 * @returns {Object} state coverage alignment plan
 */
export function createEmpresasStateCoverageAlignmentPlan(options = {}) {
  void options;
  const states = STATES.map((s) => ({
    state: s.state,
    currentCoverage: s.currentCoverage,
    source: s.source,
    expectedCoverage: 'aligned',
    severity: s.security ? 'medium' : 'low',
    canResolveInUI: s.canResolveInUI,
    canResolveInModeloBase1: s.canResolveInModeloBase1,
    requiresBackend: s.requiresBackend,
    failClosed: s.security ? true : undefined,
    alignmentStatus: s.currentCoverage === 'aligned' ? 'aligned' : (s.currentCoverage === 'gap' ? 'gap' : 'referenceOnly'),
    recommendedFutureSlice: s.currentCoverage === 'gap' ? 'EMPRESAS STUDIO COMPATIBILITY SLICE 2' : null,
  }));

  const body = {
    kind: 'empresas-state-coverage-alignment-plan',
    states,
    stateCount: states.length,
    gaps: states.filter((s) => s.alignmentStatus === 'gap').map((s) => s.state),
    securityStatesFailClosed: states.filter((s) => s.failClosed === true).map((s) => s.state),
    changesUi: false,
    alignmentStatus: states.some((s) => s.alignmentStatus === 'gap') ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, stateCoverageDigest: compatDigest({ states: states.map((s) => [s.state, s.currentCoverage]) }) });
}

export default createEmpresasStateCoverageAlignmentPlan;
