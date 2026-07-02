/** @typedef {'pending'|'building'|'resolved'|'failed'} DependencyState */

export const DependencyLifecycle = Object.freeze({
  PENDING: /** @type {DependencyState} */ ('pending'),
  BUILDING: /** @type {DependencyState} */ ('building'),
  RESOLVED: /** @type {DependencyState} */ ('resolved'),
  FAILED: /** @type {DependencyState} */ ('failed'),
});
