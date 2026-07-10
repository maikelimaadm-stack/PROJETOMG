/**
 * @typedef {Object} RuntimeV2DevPreviewRouteModel
 * @property {string} routePath Always "/__dev/runtime-v2/previews".
 * @property {boolean} enabled
 * @property {boolean} devOnly
 * @property {boolean} productionBlocked
 * @property {'production'|'development'} environment
 * @property {boolean} hubEnabled
 * @property {boolean} datasetEnabled
 * @property {{ routeFlag: string, routeEnabled: boolean, hubEnabled: boolean, datasetEnabled: boolean }} flags
 * @property {{ banner: string, mocked: boolean, inMainMenu: boolean, publicRoute: boolean }} status
 * @property {string[]} warnings
 * @property {string[]} limitations
 * @property {import('./dev-preview-hub.js').RuntimeV2DevPreviewHubModel|null} hubModel
 */

export {};
