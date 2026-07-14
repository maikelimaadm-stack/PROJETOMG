import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the THEME PROJECTION contract — metadata-only. Describes abstract theme token groups.
 * No real CSS, no required Tailwind, no stylesheet, no runtime CSS.
 *
 * @param {Object} [options]
 * @returns {Object} theme projection contract
 */
const TOKENS = {
  density: ['comfortable', 'compact'],
  spacing: ['xs', 'sm', 'md', 'lg', 'xl'],
  radius: ['none', 'sm', 'md', 'lg', 'full'],
  surface: ['base', 'raised', 'sunken', 'overlay'],
  text: ['primary', 'secondary', 'muted', 'inverse'],
  border: ['subtle', 'default', 'strong'],
  semanticStatus: ['neutral', 'info', 'success', 'warning', 'danger'],
};

export function createRuntimeUiThemeProjectionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const groups = Object.entries(TOKENS).map(([group, tokens]) => ({ group, tokens: [...tokens], metadataOnly: true }));

  const core = {
    kind: 'runtime-ui-theme-projection-contract',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    groups,
    tokenGroups: groups.map((g) => g.group),
    realCss: false,
    requiredTailwind: false,
    stylesheetCreated: false,
    cssRuntime: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, themeProjectionDigest: uiContractDigest(core) });
}

export default createRuntimeUiThemeProjectionContract;
