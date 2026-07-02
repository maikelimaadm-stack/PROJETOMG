/**
 * Route metadata extraction from CRB entries.
 */
export class RouteMetadata {
  /**
   * @param {import('../../types/router.js').RouteEntry} entry
   */
  static extract(entry) {
    return Object.freeze({
      path: entry.path,
      screenId: entry.screenId ?? entry.objectId,
      layoutId: entry.layoutId ?? null,
      moduleId: entry.moduleId ?? null,
      applicationId: entry.applicationId ?? null,
    });
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {string} applicationId
   * @returns {import('../../types/router.js').RouteEntry[]}
   */
  static fromCrb(crb, applicationId) {
    return (crb.route ?? []).map((route) => {
      const record = /** @type {{objectId: string, path: string, moduleId?: string}} */ (route);
      const layoutCode = `${crb.moduleId ?? record.moduleId ?? 'app'}_layout`;
      return {
        path: record.path,
        objectId: record.objectId,
        screenId: record.objectId,
        layoutId: layoutCode,
        moduleId: record.moduleId ?? crb.moduleId,
        applicationId,
      };
    });
  }
}
