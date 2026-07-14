import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';
import { RUNTIME_SHELL_ERROR_CODES } from './errors.js';

/**
 * Declares the ERROR BOUNDARY contract. Pure, metadata-only. Describes how a future shell
 * WOULD contain errors — failing closed, sanitized diagnostics, no secrets, no stack leak.
 * It catches nothing at runtime; it is a contract.
 *
 * @param {Object} [options]
 * @returns {Object} error boundary contract
 */
export function createDevPreviewRuntimeShellErrorBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'dev-preview-runtime-shell-error-boundary',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    knownErrors: [...RUNTIME_SHELL_ERROR_CODES],
    knownErrorCount: RUNTIME_SHELL_ERROR_CODES.length,
    failClosed: true,
    safeDiagnostics: true,
    noSecrets: true,
    noStackLeak: true,
    catchesRuntimeErrors: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, errorBoundaryDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellErrorBoundary;
