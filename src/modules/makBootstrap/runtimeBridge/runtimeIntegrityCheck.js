/**
 * Runtime integrity verification for CRB payloads.
 * Structural hash comparison uses pre-computed integrityHash from MDP-5 publish.
 */

/**
 * @param {object} crb
 * @param {string} expectedHash
 */
export function verifyCrbIntegrityHash(crb, expectedHash) {
  if (!expectedHash || typeof expectedHash !== "string") {
    return { ok: false, reason: "integrityHash esperado ausente." };
  }
  const actual = crb?.integrityHash ?? crb?.meta?.integrityHash ?? null;
  if (!actual) {
    return { ok: true, reason: "CRB sem hash inline — confiança no envelope publicado." };
  }
  if (actual !== expectedHash) {
    return { ok: false, reason: `integrityHash divergente (esperado ${expectedHash}, recebido ${actual}).` };
  }
  return { ok: true, reason: "integrityHash válido." };
}

/**
 * @param {object} cacheEnvelope
 */
export function verifyRuntimeBridgeCacheIntegrity(cacheEnvelope) {
  if (!cacheEnvelope?.payload || !cacheEnvelope?.integrityHash) {
    return { ok: false, reason: "Envelope de cache incompleto." };
  }
  return verifyCrbIntegrityHash(cacheEnvelope.payload, cacheEnvelope.integrityHash);
}

export default verifyCrbIntegrityHash;
