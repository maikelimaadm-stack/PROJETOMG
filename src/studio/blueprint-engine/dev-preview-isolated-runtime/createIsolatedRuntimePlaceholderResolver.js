import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Resolves contractual placeholders into metadata-only objects. Pure. Each resolved placeholder
 * is a plain descriptor (kind + intent), NEVER a real component: it imports no component,
 * references no component path, creates no JSX/TSX, and produces no real render function.
 *
 * @param {Object} [options]
 * @param {string[]} [options.placeholderKinds]
 * @returns {Object} resolved placeholders descriptor
 */
const DEFAULT_KINDS = [
  'VisualContainerPlaceholder', 'VisualSectionPlaceholder', 'VisualTablePlaceholder',
  'VisualFormPlaceholder', 'VisualDetailPlaceholder', 'VisualLabelPlaceholder',
  'VisualInputPlaceholder', 'VisualButtonPlaceholder', 'VisualEmptyStatePlaceholder',
  'VisualBlockedStatePlaceholder',
];

export function createIsolatedRuntimePlaceholderResolver(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const kinds = Array.isArray(o.placeholderKinds) && o.placeholderKinds.length > 0
    ? o.placeholderKinds.filter((k) => typeof k === 'string')
    : DEFAULT_KINDS;

  const resolved = kinds.map((kind) => ({
    kind,
    resolvedTo: `metadata:${kind}`,
    isRealComponent: false,
    importsComponent: false,
    referencesComponentPath: false,
    jsx: false,
    tsx: false,
    hasRealRenderFn: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-placeholder-resolver',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    resolved,
    resolvedCount: resolved.length,
    anyRealComponent: resolved.some((r) => r.isRealComponent === true),
    anyRealRenderFn: resolved.some((r) => r.hasRealRenderFn === true),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, placeholderResolverDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimePlaceholderResolver;
