import { getContadoresFromCache } from "./counterService.js";

/** O(1) — contadores materializados + cache; sem COUNT(*) em tempo real. */
export const getContadores = async (scope) => getContadoresFromCache(scope);
