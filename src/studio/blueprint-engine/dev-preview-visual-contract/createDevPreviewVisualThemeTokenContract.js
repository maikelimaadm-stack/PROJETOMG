import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VISUAL_THEME_TOKEN_GROUPS, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the VISUAL THEME TOKEN contract. Pure, metadata-only. Token groups (density,
 * spacing, radius, surface, text, border, semanticStatus) are described as abstract
 * contractual tokens — NOT real CSS, NOT required Tailwind classes, NOT a stylesheet.
 *
 * @param {Object} [options]
 * @returns {Object} visual theme token contract
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

export function createDevPreviewVisualThemeTokenContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const groups = VISUAL_THEME_TOKEN_GROUPS.map((group) => ({
    group,
    tokens: TOKENS[group] ?? [],
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-visual-theme-token-contract',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    groups,
    tokenGroups: [...VISUAL_THEME_TOKEN_GROUPS],
    realCss: false,
    requiredTailwindClasses: false,
    stylesheetCreated: false,
    cssRuntime: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualThemeTokenDigest: visualDigest(core) });
}

export default createDevPreviewVisualThemeTokenContract;
