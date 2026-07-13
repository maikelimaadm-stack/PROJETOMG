import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  mirrorDigest,
} from './empresasBlueprintMirrorConfig.js';

const DIGEST_KEYS = [
  'fieldDigest', 'screenDigest', 'tableFormDigest', 'filterSortDigest', 'permissionDigest',
  'tenantDigest', 'persistenceBoundaryDigest', 'runtimeBindingDigest', 'alignmentAuditDigest',
];

/**
 * Verifies an Empresas blueprint mirror package: re-derives the overall digest, checks
 * every mirror digest is present, and asserts the headless/reference-only invariants
 * (no ui/route/menu/module/backend/prisma/production/staging/fetch/mutation and no
 * rewrite of Empresas). Any altered digest → not safe. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.mirror] the full mirror package
 * @returns {Object} verification result
 */
export function verifyEmpresasBlueprintMirror(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mir = isGenericModelPlainObject(o.mirror) ? o.mirror : {};
  const m = isGenericModelPlainObject(mir.manifest) ? mir.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('mirror-version-known', mir.mirrorVersion === EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION);
  check('blueprint-contract-version-known', mir.blueprintContractVersion === STUDIO_BLUEPRINT_CONTRACT_VERSION);
  check('empresas-read-contract-version-known', mir.empresasReadContractVersion === EMPRESAS_READ_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'empresas-blueprint-mirror-manifest');

  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = mirrorDigest({
    fieldDigest: m.fieldDigest, screenDigest: m.screenDigest, tableFormDigest: m.tableFormDigest,
    filterSortDigest: m.filterSortDigest, permissionDigest: m.permissionDigest, tenantDigest: m.tenantDigest,
    persistenceBoundaryDigest: m.persistenceBoundaryDigest, runtimeBindingDigest: m.runtimeBindingDigest,
    alignmentAuditDigest: m.alignmentAuditDigest, readiness: m.readiness,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  // Headless / reference-only invariants (fail-closed).
  check('headless', mir.headless === true);
  check('no-ui', mir.uiCreated === false);
  check('no-route', mir.routeCreated === false);
  check('no-menu', mir.menuCreated === false);
  check('no-module-registration', mir.moduleRegistered === false);
  check('no-backend', mir.backendAccessed === false);
  check('no-prisma', mir.prismaAccessed === false);
  check('no-production', mir.productionAccessed === false);
  check('no-staging', mir.stagingAccessed === false);
  check('no-fetch', mir.fetchUsed === false);
  check('no-mutation', mir.mutationAllowed === false);
  check('no-rewrite-empresas', mir.rewriteEmpresas === false);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const safe = valid && m.readiness === 'blueprint_mirror_created';

  return safeCloneGenericModel({
    kind: 'empresas-blueprint-mirror-verification',
    valid,
    safeToUseAsMirrorReference: safe,
    readiness: safe ? 'blueprint_mirror_created' : 'blocked',
    checks,
    failures,
    warnings: [],
    blockers: valid ? [] : failures,
  });
}

export default verifyEmpresasBlueprintMirror;
