import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the CANONICALIZATION contract. Stable, key-ordered, array-order-preserving, locale/timezone
 * independent; ambient clock and randomness forbidden. Not implemented here. Metadata only.
 * @returns {Object}
 */
export function createBridgeCanonicalizationContract() {
  const core = {
    kind: 'bridge-canonicalization-contract',
    stableSerializationRequired: true,
    keyOrderingRequired: true,
    arrayOrderingPreserved: true,
    localeIndependent: true,
    timezoneIndependent: true,
    ambientClockForbidden: true,
    randomnessForbidden: true,
    canonicalizationImplemented: false,
  };
  return safeCloneGenericModel({ ...core, canonicalizationContractDigest: bridgeDigest(core) });
}

export default createBridgeCanonicalizationContract;
