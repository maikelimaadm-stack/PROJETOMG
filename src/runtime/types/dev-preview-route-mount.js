/**
 * Deterministic, plain mount plan for the dev-only runtime v2 preview route.
 * @typedef {Object} RuntimeV2DevPreviewRouteMountPlan
 * @property {string} path Always "/__dev/runtime-v2/previews".
 * @property {boolean} shouldMount True only in a dev environment with the route flag on.
 * @property {boolean} devOnly
 * @property {boolean} inMainMenu Always false.
 * @property {boolean} publicRoute Always false.
 * @property {boolean} production Whether the detected environment is production.
 * @property {string} reason Human-readable mount decision.
 */

export {};
