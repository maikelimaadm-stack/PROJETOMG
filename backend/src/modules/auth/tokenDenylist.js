import crypto from "node:crypto";
import { tieredCache } from "../../cache/tieredCache.js";

const DEFAULT_TTL_SECONDS = 8 * 60 * 60;
const DENYLIST_KEY_PREFIX = "auth:denylist";

const nowMs = () => Date.now();

const normalizeTtlMs = (expSeconds) => {
  const expMs = Number(expSeconds) * 1000;
  if (Number.isFinite(expMs) && expMs > nowMs()) return expMs - nowMs();
  return DEFAULT_TTL_SECONDS * 1000;
};

const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash("sha256").update(String(token)).digest("hex");
};

const jtiKey = (jti) => `${DENYLIST_KEY_PREFIX}:jti:${jti}`;
const tokenHashKey = (tokenHash) => `${DENYLIST_KEY_PREFIX}:token:${tokenHash}`;

export const revokeAuthToken = async ({ token = null, jti = null, exp = null } = {}) => {
  const ttlMs = Math.max(1_000, normalizeTtlMs(exp));
  const writes = [];
  if (jti) {
    writes.push(tieredCache.set(jtiKey(String(jti)), true, ttlMs));
  }
  const tokenHash = hashToken(token);
  if (tokenHash) {
    writes.push(tieredCache.set(tokenHashKey(tokenHash), true, ttlMs));
  }
  if (writes.length === 0) return;
  await Promise.allSettled(writes);
};

export const isAuthTokenRevoked = async ({ token = null, jti = null } = {}) => {
  if (jti) {
    const revokedByJti = await tieredCache.get(jtiKey(String(jti)));
    if (revokedByJti) return true;
  }
  const tokenHash = hashToken(token);
  if (tokenHash) {
    const revokedByHash = await tieredCache.get(tokenHashKey(tokenHash));
    if (revokedByHash) return true;
  }
  return false;
};

