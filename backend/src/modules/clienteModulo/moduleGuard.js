import { clienteModuloService } from "./clienteModuloService.js";

const MODULE_GUARD_TTL_MS = 30_000;
const moduleStatusCache = new Map();

const buildKey = (clienteId, modulo) => `${clienteId}:${modulo}`;

const readCache = (clienteId, modulo) => {
  const key = buildKey(clienteId, modulo);
  const entry = moduleStatusCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    moduleStatusCache.delete(key);
    return null;
  }
  return entry.value;
};

const writeCache = (clienteId, modulo, value) => {
  moduleStatusCache.set(buildKey(clienteId, modulo), {
    value: Boolean(value),
    expiresAt: Date.now() + MODULE_GUARD_TTL_MS,
  });
};

export const ensureModuloAtivo = async (scope, modulo) => {
  const normalizedModulo = String(modulo || "").trim().toUpperCase();
  if (!normalizedModulo) return;
  const cached = readCache(scope.clienteId, normalizedModulo);
  if (cached === true) return;
  const isActive =
    cached != null
      ? cached
      : await clienteModuloService.isModuloAtivo(scope.clienteId, normalizedModulo);
  writeCache(scope.clienteId, normalizedModulo, isActive);
  if (!isActive) {
    const error = new Error(`Módulo ${normalizedModulo} inativo para este cliente.`);
    error.statusCode = 403;
    throw error;
  }
};

export const clearModuloGuardCache = (clienteId, modulo) => {
  if (!clienteId && !modulo) {
    moduleStatusCache.clear();
    return;
  }
  const normalizedModulo = String(modulo || "").trim().toUpperCase();
  if (clienteId && normalizedModulo) {
    moduleStatusCache.delete(buildKey(clienteId, normalizedModulo));
  }
};
