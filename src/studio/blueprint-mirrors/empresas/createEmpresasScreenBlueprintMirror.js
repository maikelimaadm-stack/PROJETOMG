import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioCanonicalScreenContract } from '../../foundation-contracts/certification/createStudioCanonicalScreenContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * The REAL Empresas screens, observed from the module (TBLEMP table, FORMEMP form,
 * search view, toolbar), mirrored as reference-only against the certified Studio
 * screen contract. Mutation actions are mapped as `existingProductionBehavior/
 * referenceOnly`, never activated. Missing states become alignment gaps.
 */
const SOURCE_SCREENS = [
  { kind: 'table', source: 'src/modules/empresas/components/tblEmp.constants.js', present: true, note: 'production table (TBLEMP)' },
  { kind: 'form', source: 'src/modules/empresas/components/formEmp.constants.js', present: true, note: 'production form (FORMEMP)' },
  { kind: 'detail', source: 'form-detail', present: false, note: 'no dedicated detail screen observed → gap' },
];

const AREAS = [
  { area: 'filters', source: 'src/modules/empresas/components/tblEmp.filters.js', present: true },
  { area: 'toolbar', source: 'src/modules/empresas/config/modeloBase1/empresasToolbarConfig.js', present: true },
  { area: 'searchView', source: 'src/modules/empresas/config/modeloBase1/empresasSearchViewConfig.js', present: true },
  { area: 'preferencesLayout', source: 'src/modules/empresas/config/modeloBase1/empresasLayoutConfig.js', present: true, referenceOnly: true },
];

/**
 * Mirrors the Empresas screens. Pure, headless, reference-only. Never generates a
 * React component and never alters PAGEMP / ModeloBase1CadastroPage.
 *
 * @param {Object} [options]
 * @returns {Object} screen blueprint mirror
 */
export function createEmpresasScreenBlueprintMirror(options = {}) {
  void options;
  const studioScreen = createStudioCanonicalScreenContract();
  const allowedKinds = new Set(studioScreen.kindNames);

  const screens = SOURCE_SCREENS.map((s) => ({
    kind: s.kind,
    present: s.present,
    kindAllowed: allowedKinds.has(s.kind),
    generatesReactComponent: false,
    registersRoute: false,
    changesPagemp: false,
    changesModeloBase1CadastroPage: false,
    mutationActions: 'existingProductionBehavior/referenceOnly',
    source: s.source,
    note: s.note,
    alignmentStatus: s.present ? (allowedKinds.has(s.kind) ? 'aligned' : 'not_aligned') : 'not_aligned',
  }));

  // Required screen states — the read contract has no explicit empty/loading/error
  // metadata, so they are recorded as alignment gaps to confirm in the UI later.
  const requiredStates = studioScreen.requiredStates.map((st) => ({ state: st, confirmedInContract: false, alignmentStatus: 'needs_alignment' }));

  const mappedScreens = screens.filter((s) => s.present && s.kindAllowed).map((s) => s.kind);
  const unmappedScreens = screens.filter((s) => !s.present).map((s) => s.kind);
  const unsupportedScreens = screens.filter((s) => s.present && !s.kindAllowed).map((s) => s.kind);

  const body = {
    kind: 'empresas-screen-blueprint-mirror',
    screens,
    sourceScreens: SOURCE_SCREENS.map((s) => s.kind),
    mappedScreens,
    unmappedScreens,
    unsupportedScreens,
    areas: AREAS,
    requiredStates,
    generatesUi: false,
    registersRoute: false,
    alignmentStatus: unmappedScreens.length > 0 || requiredStates.some((s) => s.alignmentStatus !== 'aligned') ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, screenDigest: mirrorDigest({ screens: screens.map((s) => [s.kind, s.present, s.alignmentStatus]), areas: AREAS.map((a) => a.area) }) });
}

export default createEmpresasScreenBlueprintMirror;
