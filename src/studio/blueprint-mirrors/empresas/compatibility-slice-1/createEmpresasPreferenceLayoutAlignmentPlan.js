import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Plan for aligning Empresas preferences/layout to the Studio screen contract. Pure,
 * contract-only, reference-only. Does NOT change real preferences, UsuarioPreferencia,
 * localStorage, or the UI.
 */
const ITEMS = [
  { item: 'columnPreferences', source: 'ModeloBase1 table state', currentState: 'referenceOnly' },
  { item: 'filterPreferences', source: 'empresasSearchViewConfig / tblEmp.filters', currentState: 'referenceOnly' },
  { item: 'sortPreferences', source: 'ModeloBase1 table state', currentState: 'referenceOnly' },
  { item: 'layoutPreferences', source: 'empresasLayoutConfig', currentState: 'referenceOnly' },
  { item: 'formPreferences', source: 'formEmp.constants', currentState: 'referenceOnly' },
  { item: 'tableStatePreferences', source: 'ModeloBase1 table state', currentState: 'referenceOnly' },
  { item: 'usuarioPreferenciaReference', source: 'UsuarioPreferencia (documented)', currentState: 'referenceOnly' },
  { item: 'localPreferences', source: 'local storage (documented, if any)', currentState: 'referenceOnly' },
];

/**
 * Builds the preferences/layout alignment plan. Pure, contract-only, reference-only.
 *
 * @param {Object} [options]
 * @returns {Object} preferences/layout alignment plan
 */
export function createEmpresasPreferenceLayoutAlignmentPlan(options = {}) {
  void options;
  const items = ITEMS.map((i) => ({
    item: i.item,
    currentState: i.currentState,
    source: i.source,
    expectedStudioState: 'mirrored to Studio screen contract (referenceOnly)',
    alignmentStatus: 'referenceOnly',
    risk: 'altering real preferences would change UX unexpectedly',
    recommendedFutureSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 3',
  }));

  const body = {
    kind: 'empresas-preference-layout-alignment-plan',
    items,
    itemCount: items.length,
    changesRealPreferences: false,
    changesUsuarioPreferencia: false,
    changesLocalStorage: false,
    changesUi: false,
    alignmentStatus: 'referenceOnly',
  };
  return safeCloneGenericModel({ ...body, preferenceLayoutDigest: compatDigest({ items: items.map((i) => [i.item, i.currentState]) }) });
}

export default createEmpresasPreferenceLayoutAlignmentPlan;
