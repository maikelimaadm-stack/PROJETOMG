import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_CHECKPOINT_RECEIPT, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Records the manual enterprise checkpoint receipt. The receipt is APPROVED only when the injected
 * value exactly equals the required token. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createRouteMenuCheckpointReceipt(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const provided = typeof o.checkpointReceipt === 'string' ? o.checkpointReceipt : '';
  const approved = provided === REQUIRED_CHECKPOINT_RECEIPT;

  const core = {
    kind: 'route-menu-checkpoint-receipt',
    requiredCheckpoint: REQUIRED_CHECKPOINT_RECEIPT,
    approved,
    receiptPresent: provided.length > 0,
    fromManualEnterpriseCheckpoint: true,
  };
  return safeCloneGenericModel({ ...core, checkpointReceiptDigest: routeMenuDigest(core) });
}

export default createRouteMenuCheckpointReceipt;
