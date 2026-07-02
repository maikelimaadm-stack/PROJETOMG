/** @typedef {'anonymous'|'authenticated'|'refreshing'|'destroyed'} SessionStateValue */

export const SessionState = Object.freeze({
  ANONYMOUS: /** @type {SessionStateValue} */ ('anonymous'),
  AUTHENTICATED: /** @type {SessionStateValue} */ ('authenticated'),
  REFRESHING: /** @type {SessionStateValue} */ ('refreshing'),
  DESTROYED: /** @type {SessionStateValue} */ ('destroyed'),
});
