import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VISUAL_INTERACTION_KINDS, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the VISUAL INTERACTION contract. Pure, metadata-only. Read-side interactions
 * (read/openDetail/filter/sort/paginate/cancel) are described as metadata; every mutating
 * interaction is a permanently blocked* entry — no real handler, no mutation, nothing executes.
 *
 * @param {Object} [options]
 * @returns {Object} visual interaction contract
 */
export function createDevPreviewVisualInteractionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const interactions = VISUAL_INTERACTION_KINDS.map((interaction) => {
    const blocked = interaction.startsWith('blocked');
    return {
      interaction,
      kind: blocked ? 'mutation' : 'read',
      mutation: blocked,
      enabled: false,
      hasRealHandler: false,
      blocked,
      metadataOnly: true,
    };
  });

  const core = {
    kind: 'dev-preview-visual-interaction-contract',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    interactions,
    interactionKinds: [...VISUAL_INTERACTION_KINDS],
    anyEnabled: false,
    anyMutationEnabled: false,
    anyRealHandler: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualInteractionDigest: visualDigest(core) });
}

export default createDevPreviewVisualInteractionContract;
