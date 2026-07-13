import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_ENGINE_NAME,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_MODE,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_HARDENING_VERSION,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
  engineDigest,
} from './studioBlueprintEngineConfig.js';

/**
 * Builds the engine manifest for a processed blueprint, aggregating every stage digest
 * (draft/normalized/validation/safety/hardening) into a single `overallDigest`. Pure.
 * Readiness `blueprint_processed` when there are no blockers; `blocked` otherwise.
 *
 * @param {Object} [options]
 * @returns {Object} manifest descriptor
 */
export function createStudioBlueprintManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    draftDigest: get(o.draft, 'draftDigest'),
    normalizedDigest: get(o.normalized, 'normalizedDigest'),
    validationDigest: engineDigest(isGenericModelPlainObject(o.validation) ? o.validation : null),
    safetyDigest: engineDigest(isGenericModelPlainObject(o.safety) ? o.safety : null),
    hardeningDigest: engineDigest(isGenericModelPlainObject(o.hardening) ? o.hardening : null),
  };

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  if (get(o.validation, 'valid') === false) blockers.push('structural invalid');
  if (get(o.safety, 'safe') === false) blockers.push('safety violation');
  if (get(o.hardening, 'passed') === false) blockers.push('hardening violation');

  const readiness = blockers.length === 0 ? 'blueprint_processed' : 'blocked';
  const overallDigest = engineDigest({ ...digests, readiness });

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-manifest',
    manifestId: `${STUDIO_BLUEPRINT_ENGINE_NAME}@${STUDIO_BLUEPRINT_ENGINE_VERSION.split('@')[1]}#manifest`,
    engineName: STUDIO_BLUEPRINT_ENGINE_NAME,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    mode: STUDIO_BLUEPRINT_ENGINE_MODE,
    certificationVersion: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
    hardeningVersion: STUDIO_BLUEPRINT_HARDENING_VERSION,
    moduleId: get(o.normalized, 'moduleId') ?? get(o.draft, 'moduleId'),
    ...digests,
    overallDigest,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    blockers,
    warnings,
    readiness,
  });
}

export default createStudioBlueprintManifest;
