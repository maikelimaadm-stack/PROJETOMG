import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_CHECKPOINT_RECEIPT, appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Verifies the checkpoint receipt required to mount the dev-only route. Strict equality with the
 * authorized value — no permissive fallback. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createStudioDevPreviewCheckpointReceipt(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const approved = o.checkpointReceipt === REQUIRED_CHECKPOINT_RECEIPT;

  const core = {
    kind: 'app-integration-checkpoint-receipt',
    requiredReceipt: REQUIRED_CHECKPOINT_RECEIPT,
    approved,
    reason: approved ? 'approved' : 'checkpoint_missing_or_invalid',
  };
  return safeCloneGenericModel({ ...core, checkpointReceiptDigest: appIntegrationDigest(core) });
}

export default createStudioDevPreviewCheckpointReceipt;
