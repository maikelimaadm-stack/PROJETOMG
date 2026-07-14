import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the UI LAYOUT contract — metadata-only. Describes layoutKind / density / regions /
 * ordering / responsivePlanMetadata. No real CSS, no required Tailwind, no DOM.
 *
 * @param {Object} [options]
 * @param {Object} [options.frameMapping]
 * @returns {Object} layout contract
 */
export function createRuntimeUiLayoutContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mapping = isGenericModelPlainObject(o.frameMapping) ? o.frameMapping : {};
  const moduleId = String(mapping.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule');
  const sections = Array.isArray(mapping.sections) ? mapping.sections : [];

  const core = {
    kind: 'runtime-ui-layout-contract',
    layoutId: `layout:${moduleId}`,
    moduleId,
    layoutKind: 'cadastro-standard',
    density: 'comfortable',
    regions: sections.map((s, i) => ({ region: s.section, order: i, metadataOnly: true })),
    ordering: sections.map((s) => s.section),
    responsivePlanMetadata: { breakpoints: ['sm', 'md', 'lg'], collapseBelow: 'md', metadataOnly: true },
    realCss: false,
    requiredTailwind: false,
    dom: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, layoutContractDigest: uiContractDigest(core) });
}

export default createRuntimeUiLayoutContract;
