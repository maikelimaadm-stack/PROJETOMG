import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_VISUAL_PLACEHOLDER_KINDS, BLOCKED_VISUAL_PLACEHOLDER_KINDS, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the contractual COMPONENT PLACEHOLDER REGISTRY. Pure, metadata-only. Each entry is
 * a plain contract token (name + intent), NOT a real component: it imports nothing, references
 * no real component path, and creates no JSX/TSX/DOM. It also enumerates the permanently
 * BLOCKED placeholder kinds (real component / router / menu / dom / fetch / mutation).
 *
 * @param {Object} [options]
 * @returns {Object} component placeholder registry contract
 */
const INTENT = {
  VisualContainerPlaceholder: 'layout-container',
  VisualSectionPlaceholder: 'layout-section',
  VisualTablePlaceholder: 'data-table',
  VisualFormPlaceholder: 'data-form',
  VisualDetailPlaceholder: 'read-only-detail',
  VisualFieldPlaceholder: 'field',
  VisualLabelPlaceholder: 'read-only-label',
  VisualInputPlaceholder: 'text-input',
  VisualSelectPlaceholder: 'select-input',
  VisualDatePlaceholder: 'date-input',
  VisualNumberPlaceholder: 'number-input',
  VisualTextPlaceholder: 'text',
  VisualBooleanPlaceholder: 'boolean-input',
  VisualBadgePlaceholder: 'status-badge',
  VisualButtonPlaceholder: 'action-button',
  VisualEmptyStatePlaceholder: 'empty-state',
  VisualBlockedStatePlaceholder: 'blocked-state',
  VisualLoadingStatePlaceholder: 'loading-state',
  VisualErrorStatePlaceholder: 'error-state',
};

export function createDevPreviewVisualComponentPlaceholderRegistry(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const entries = ALLOWED_VISUAL_PLACEHOLDER_KINDS.map((name) => ({
    name,
    intent: INTENT[name] ?? 'generic',
    isRealComponent: false,
    importsComponent: false,
    referencesComponentPath: false,
    jsx: false,
    tsx: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-visual-component-placeholder-registry',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    entries,
    allowedKinds: [...ALLOWED_VISUAL_PLACEHOLDER_KINDS],
    blockedKinds: [...BLOCKED_VISUAL_PLACEHOLDER_KINDS],
    allowedCount: ALLOWED_VISUAL_PLACEHOLDER_KINDS.length,
    blockedCount: BLOCKED_VISUAL_PLACEHOLDER_KINDS.length,
    placeholderOnly: true,
    realComponentCreated: false,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, placeholderRegistryDigest: visualDigest(core) });
}

/** @param {string} kind @returns {boolean} */
export function isAllowedVisualPlaceholderKind(kind) {
  return ALLOWED_VISUAL_PLACEHOLDER_KINDS.includes(kind) && !BLOCKED_VISUAL_PLACEHOLDER_KINDS.includes(kind);
}

export default createDevPreviewVisualComponentPlaceholderRegistry;
