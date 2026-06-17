import { tieredCache } from "../../cache/tieredCache.js";

const SESSION_EMPRESAS_TTL_MS = 8 * 60 * 60 * 1000;

const key = (userId) => `session:empresas:${userId}`;

export const setSessionEmpresas = (userId, payload) => {
  return tieredCache.set(
    key(userId),
    {
      items: payload.items || [],
      total: payload.total ?? 0,
      hasMore: Boolean(payload.hasMore),
    },
    SESSION_EMPRESAS_TTL_MS
  );
};

export const getSessionEmpresas = (userId) => tieredCache.get(key(userId));

export const clearSessionEmpresas = (userId) => {
  return tieredCache.delete(key(userId));
};
