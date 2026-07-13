import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_ERROR_CODES, createStudioError } from '../errors.js';
import { STUDIO_HARDENING_ERROR_CODES, createStudioHardeningError } from '../hardening/errors.js';
import { STUDIO_CERTIFICATION_ERROR_CODES, createStudioCertificationError } from './errors.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical error catalog: base + hardening + certification codes, each
 * with a sanitized, side-effect-free descriptor. Pure.
 *
 * @param {Object} [options]
 * @returns {Object} canonical error catalog
 */
export function createStudioCanonicalErrorCatalog(options = {}) {
  void options;
  const entries = [
    ...STUDIO_ERROR_CODES.map((code) => ({ code, group: 'base', descriptor: createStudioError(code) })),
    ...STUDIO_HARDENING_ERROR_CODES.map((code) => ({ code, group: 'hardening', descriptor: createStudioHardeningError(code) })),
    ...STUDIO_CERTIFICATION_ERROR_CODES.map((code) => ({ code, group: 'certification', descriptor: createStudioCertificationError(code) })),
  ];

  const codes = entries.map((e) => e.code);
  const uniqueCodes = new Set(codes).size === codes.length;
  const allSanitized = entries.every((e) => e.descriptor.safe === true
    && e.descriptor.sideEffects === false
    && e.descriptor.productionAccessed === false
    && e.descriptor.mutationExecuted === false
    && e.descriptor.fetchUsed === false
    && !/jwt|token|DATABASE[_]URL|secret|password/i.test(JSON.stringify(e.descriptor)));

  const body = {
    kind: 'studio-canonical-error-catalog',
    entries,
    codes,
    codeCount: codes.length,
    baseCount: STUDIO_ERROR_CODES.length,
    hardeningCount: STUDIO_HARDENING_ERROR_CODES.length,
    certificationCount: STUDIO_CERTIFICATION_ERROR_CODES.length,
    uniqueCodes,
    allSanitized,
  };
  return safeCloneGenericModel({ ...body, canonicalErrorCatalogDigest: certificationDigest({ codes }) });
}

export default createStudioCanonicalErrorCatalog;
