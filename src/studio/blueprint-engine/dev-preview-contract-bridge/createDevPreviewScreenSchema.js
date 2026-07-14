import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Builds metadata-only SCREEN SCHEMA for list/form/detail plus empty/loading/error/blocked
 * states. Pure. Everything is metadata; renders nothing.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox] a module preview sandbox contract
 * @returns {Object} screen schema metadata
 */
export function createDevPreviewScreenSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sandbox) ? o.sandbox : {};

  const state = (kind) => ({ kind, metadataOnly: true });

  const core = {
    kind: 'dev-preview-screen-schema',
    screenSchemaVersion: 'dev-preview-screen-schema@1.0.0',
    moduleId: String(s.moduleId ?? 'plannedModule'),
    screens: [
      { screenId: 'list', kind: 'table', metadataOnly: true },
      { screenId: 'form', kind: 'form', metadataOnly: true },
      { screenId: 'detail', kind: 'detail', readOnly: true, metadataOnly: true },
    ],
    states: {
      empty: state('empty'),
      loading: state('loading'),
      error: state('error'),
      blocked: state('blocked'),
    },
    requiredStates: ['empty', 'loading', 'error', 'blocked'],
    metadataOnly: true,
    componentCreated: false,
    routeCreated: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, screenSchemaDigest: bridgeDigest(core) });
}

export default createDevPreviewScreenSchema;
