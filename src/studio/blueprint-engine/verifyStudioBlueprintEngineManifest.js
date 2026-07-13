import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { STUDIO_BLUEPRINT_ENGINE_VERSION, engineDigest } from './studioBlueprintEngineConfig.js';

const DIGEST_KEYS = ['draftDigest', 'normalizedDigest', 'validationDigest', 'safetyDigest', 'hardeningDigest'];

const CAPABILITY_INVARIANTS = [
  'uiEnabled', 'routeEnabled', 'menuEnabled', 'moduleRegistrationEnabled', 'backendEnabled',
  'prismaEnabled', 'migrationEnabled', 'productionEnabled', 'stagingEnabled', 'fetchEnabled',
  'mutationAllowed', 'persistenceEnabled', 'generatedModuleAllowed', 'rewriteEmpresas',
];

/**
 * Verifies an engine manifest: re-derives the overall digest (tamper detection), checks
 * every stage digest is present, and asserts the headless/contract-only invariants (all
 * side-effect capability flags false, headless true). Any altered digest → not safe.
 * Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.manifest]
 * @returns {Object} verification result
 */
export function verifyStudioBlueprintEngineManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const m = isGenericModelPlainObject(o.manifest) ? o.manifest : {};

  /** @type {{name: string, ok: boolean}[]} */ const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('manifest-present', m.kind === 'studio-blueprint-engine-manifest');
  check('engine-version-known', m.engineVersion === STUDIO_BLUEPRINT_ENGINE_VERSION);
  for (const k of DIGEST_KEYS) check(`${k}-present`, typeof m[k] === 'string' && m[k].length > 0);

  const recomputed = engineDigest({
    draftDigest: m.draftDigest, normalizedDigest: m.normalizedDigest, validationDigest: m.validationDigest,
    safetyDigest: m.safetyDigest, hardeningDigest: m.hardeningDigest, readiness: m.readiness,
  });
  check('overall-digest-matches', recomputed === m.overallDigest);

  check('headless', m.headless === true);
  for (const flag of CAPABILITY_INVARIANTS) check(`no-${flag}`, m[flag] === false);

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  const valid = failures.length === 0;
  const safe = valid && m.readiness === 'blueprint_processed';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-verification',
    valid,
    safeToUseAsEngineOutput: safe,
    readiness: safe ? 'blueprint_processed' : 'blocked',
    checks,
    failures,
    blockers: valid ? [] : failures,
  });
}

export default verifyStudioBlueprintEngineManifest;
