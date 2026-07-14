import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Produces the VIRTUAL PREVIEW FRAME — a pure JSON/metadata object describing what a preview
 * WOULD show, from synthetic data + resolved placeholders. Pure. It contains NO React element,
 * NO JSX, NO DOM node, NO runtime CSS, NO route object, NO menu object, NO module file — only
 * metadata.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @param {Object} [options.syntheticData]
 * @param {Object} [options.placeholders]
 * @returns {Object} virtual preview frame
 */
export function createIsolatedRuntimeVirtualFrame(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const synthetic = isGenericModelPlainObject(o.syntheticData) ? o.syntheticData : {};
  const placeholders = isGenericModelPlainObject(o.placeholders) ? o.placeholders : {};
  const moduleId = String(plan.moduleId ?? 'plannedModule');

  const syntheticRows = Array.isArray(synthetic.syntheticRows) ? synthetic.syntheticRows : [];
  const syntheticFields = Array.isArray(synthetic.syntheticFields) ? synthetic.syntheticFields : [];
  const resolved = Array.isArray(placeholders.resolved) ? placeholders.resolved : [];

  const core = {
    kind: 'isolated-runtime-virtual-frame',
    frameId: runtimeDigest({ moduleId, source: plan.overallDigest ?? null, purpose: 'virtual-frame' }),
    frameVersion: 'isolated-runtime-virtual-frame@1.0.0',
    moduleId,
    sourceDigests: {
      implementationPlan: typeof plan.overallDigest === 'string' ? plan.overallDigest : null,
      syntheticData: typeof synthetic.syntheticDataDigest === 'string' ? synthetic.syntheticDataDigest : null,
      placeholders: typeof placeholders.placeholderResolverDigest === 'string' ? placeholders.placeholderResolverDigest : null,
    },
    screenKind: 'list',
    sections: [
      { section: 'toolbar', placeholderKind: 'VisualContainerPlaceholder' },
      { section: 'table', placeholderKind: 'VisualTablePlaceholder' },
    ],
    slots: resolved.map((r) => ({ slot: r.kind, resolvedTo: r.resolvedTo })),
    placeholders: resolved.map((r) => r.kind),
    syntheticRows,
    syntheticFields,
    blockedActions: [
      { action: 'create', blocked: true, reason: 'mutation_blocked' },
      { action: 'update', blocked: true, reason: 'mutation_blocked' },
      { action: 'delete', blocked: true, reason: 'mutation_blocked' },
    ],
    permissionHints: { defaultDeny: true, tenantRequired: true, permissionRequired: true },
    state: 'ready',
    reactElement: false,
    jsx: false,
    domNode: false,
    cssRuntime: false,
    routeObject: false,
    menuObject: false,
    moduleFile: false,
    diagnostics: { passive: true, virtual: true },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, virtualFrameDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeVirtualFrame;
