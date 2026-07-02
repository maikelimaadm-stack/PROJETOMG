import { createHash, createHmac } from 'node:crypto';

export const MMM_CRB_VERSION = 'mmm-crb-v1';
export const MMM_PUBLISH_PIPELINE_VERSION = 'mmm-publish-v1';
export const MMM_SIGNATURE_VERSION = 'mmm-sig-v1';

/** @param {unknown} payload */
export const hashPayload = (payload) =>
  createHash('sha256').update(JSON.stringify(payload)).digest('hex');

/**
 * @param {import('../../types/crb.js').CrbPayload} crb
 */
export function computeIntegrityHash(crb) {
  const integrityBase = {
    contentHash: crb.contentHash,
    registries: crb.registries,
    routes: crb.route,
    menu: crb.menu ?? [],
    pipelineVersion: MMM_PUBLISH_PIPELINE_VERSION,
    crbVersion: MMM_CRB_VERSION,
  };
  return hashPayload(integrityBase);
}

/**
 * @param {string} integrityHash
 * @param {string} [signingKey]
 */
export function signIntegrityHash(integrityHash, signingKey) {
  const key = signingKey ?? process.env.MMM_SIGNING_KEY ?? process.env.JWT_SECRET ?? 'mmm-dev-signing-key';
  const signature = createHmac('sha256', key).update(integrityHash).digest('hex');
  return `${MMM_SIGNATURE_VERSION}:${signature}`;
}

/**
 * @param {string} integrityHash
 * @param {string|null|undefined} signatureRef
 * @param {string} [signingKey]
 */
export function verifySignature(integrityHash, signatureRef, signingKey) {
  if (!signatureRef?.startsWith(`${MMM_SIGNATURE_VERSION}:`)) return false;
  return signIntegrityHash(integrityHash, signingKey) === signatureRef;
}

/** CRB registry bucket → Universal Registry type (V13–V20) */
export const CRB_REGISTRY_MAP = Object.freeze({
  layout: 'layout',
  field: 'field',
  validation: 'validation',
  permission: 'permission',
  action: 'action',
  workflow: 'workflow',
  formula: 'handler',
  event: 'handler',
  baseTemplate: 'layout',
});

export const V13_V20_ENGINES = Object.freeze(['V13', 'V14', 'V16', 'V17', 'V18', 'V19', 'V20']);
