/** @typedef {'pending'|'registered'|'ready'|'failed'} RouteState */

export const RouteLifecycle = Object.freeze({
  PENDING: /** @type {RouteState} */ ('pending'),
  REGISTERED: /** @type {RouteState} */ ('registered'),
  READY: /** @type {RouteState} */ ('ready'),
  FAILED: /** @type {RouteState} */ ('failed'),
});
