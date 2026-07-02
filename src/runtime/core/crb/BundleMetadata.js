/**
 * CRB metadata extraction.
 */
export class BundleMetadata {
  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   */
  static extract(crb) {
    return Object.freeze({
      bundleId: crb.bundleId,
      definitionVersionId: crb.definitionVersionId,
      tenantId: crb.tenantId,
      moduleId: crb.moduleId,
      crbVersion: crb.crbVersion,
      objectCount: crb.metadata?.objectCount ?? crb.objects?.length ?? 0,
      semver: crb.metadata?.semver ?? null,
      engines: crb.capabilities?.engines ?? [],
    });
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {import('../../types/crb.js').EnvironmentPin} pin
   */
  static validateDefinitionVersion(crb, pin) {
    if (crb.definitionVersionId !== pin.definitionVersionId) {
      return {
        valid: false,
        error: `DefinitionVersion mismatch: ${crb.definitionVersionId} ≠ ${pin.definitionVersionId}`,
      };
    }
    return { valid: true };
  }
}
