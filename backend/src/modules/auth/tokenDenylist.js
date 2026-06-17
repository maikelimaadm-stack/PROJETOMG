import crypto from "node:crypto";

const DEFAULT_TTL_SECONDS = 8 * 60 * 60;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const revokedByJti = new Map();
const revokedByTokenHash = new Map();

const nowMs = () => Date.now();

const normalizeExpiryMs = (expSeconds) => {
  const expMs = Number(expSeconds) * 1000;
  if (Number.isFinite(expMs) && expMs > nowMs()) return expMs;
  return nowMs() + DEFAULT_TTL_SECONDS * 1000;
};

const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash("sha256").update(String(token)).digest("hex");
};

const purgeExpired = () => {
  const current = nowMs();
  for (const [key, expiresAt] of revokedByJti.entries()) {
    if (!Number.isFinite(expiresAt) || expiresAt <= current) revokedByJti.delete(key);
  }
  for (const [key, expiresAt] of revokedByTokenHash.entries()) {
    if (!Number.isFinite(expiresAt) || expiresAt <= current) revokedByTokenHash.delete(key);
  }
};

let cleanupHandle = null;

const ensureCleanupLoop = () => {
  if (cleanupHandle) return;
  cleanupHandle = setInterval(purgeExpired, CLEANUP_INTERVAL_MS);
  if (typeof cleanupHandle?.unref === "function") cleanupHandle.unref();
};

export const revokeAuthToken = ({ token = null, jti = null, exp = null } = {}) => {
  ensureCleanupLoop();
  const expiresAt = normalizeExpiryMs(exp);
  if (jti) revokedByJti.set(String(jti), expiresAt);
  const tokenHash = hashToken(token);
  if (tokenHash) revokedByTokenHash.set(tokenHash, expiresAt);
};

export const isAuthTokenRevoked = ({ token = null, jti = null } = {}) => {
  purgeExpired();
  if (jti && revokedByJti.has(String(jti))) return true;
  const tokenHash = hashToken(token);
  if (tokenHash && revokedByTokenHash.has(tokenHash)) return true;
  return false;
};

