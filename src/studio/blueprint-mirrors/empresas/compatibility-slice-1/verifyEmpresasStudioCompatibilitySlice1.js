import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  compatDigest,
} from './empresasStudioCompatibilitySlice1Config.js';

const DIGEST_KEYS = [
  'gapRegistryDigest', 'detailPlanDigest', 'stateCoverageDigest', 'writeCapabilityDigest',
  'persistenceBridgeDigest', 'backendPrismaReadinessDigest', 'preferenceLayoutDigest',
];

/**
 * Verifies a compatibility slice 1 package: re-derives the overall digest, checks every
 * plan digest is present, and asserts the headless/contract-only invariants (no
 * Empresas code change, no ui/route/menu/module/backend/prisma/production/staging/fetch/
 * mutation, no rewrite of Empresas, gaps tracked, zero untracked critical gaps). Any
 * altered digest → not safe. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.slice] the full slice package
 * @returns {Object} verification result
 */
export function verifyEmpresasStudioCompatibilitySlice1(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.slice) ? o.slice : {};
  const m = isGenericModelPlainObject(s.manifest) ? s.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('slice-version-known', s.sliceVersion === EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION);
  check('mirror-version-known', s.mirrorVersion === EMPRESAS_MIRROR_VERSION);
  check('blueprint-contract-version-known', s.blueprintContractVersion === STUDIO_BLUEPRINT_CONTRACT_VERSION);
  check('empresas-read-contract-version-known', s.empresasReadContractVersion === EMPRESAS_READ_CONTRACT_VERSION);
  check('manifest-present', m.kind === 'empresas-compatibility-slice1-manifest');

  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = compatDigest({
    gapRegistryDigest: m.gapRegistryDigest, detailPlanDigest: m.detailPlanDigest, stateCoverageDigest: m.stateCoverageDigest,
    writeCapabilityDigest: m.writeCapabilityDigest, persistenceBridgeDigest: m.persistenceBridgeDigest,
    backendPrismaReadinessDigest: m.backendPrismaReadinessDigest, preferenceLayoutDigest: m.preferenceLayoutDigest,
    readiness: m.readiness,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  // Headless / contract-only invariants (fail-closed).
  check('headless', s.headless === true);
  check('empresas-code-not-changed', s.empresasCodeChanged === false);
  check('no-ui', s.uiCreated === false);
  check('no-route', s.routeCreated === false);
  check('no-menu', s.menuCreated === false);
  check('no-module-registration', s.moduleRegistered === false);
  check('no-backend', s.backendAccessed === false);
  check('no-prisma', s.prismaAccessed === false);
  check('no-production', s.productionAccessed === false);
  check('no-staging', s.stagingAccessed === false);
  check('no-fetch', s.fetchUsed === false);
  check('no-mutation', s.mutationAllowed === false);
  check('no-rewrite-empresas', s.rewriteEmpresas === false);
  check('known-gaps-tracked', m.knownGapsTracked === true);
  check('no-untracked-critical-gaps', m.untrackedCriticalGaps === 0);
  check('blockers-zero', Array.isArray(m.blockers) && m.blockers.length === 0);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const safe = valid && m.readiness === 'compatibility_slice_1_complete';

  return safeCloneGenericModel({
    kind: 'empresas-compatibility-slice1-verification',
    valid,
    safeToUseAsCompatibilityReference: safe,
    readiness: safe ? 'compatibility_slice_1_complete' : 'blocked',
    checks,
    failures,
    warnings: [],
    blockers: valid ? [] : failures,
  });
}

export default verifyEmpresasStudioCompatibilitySlice1;
