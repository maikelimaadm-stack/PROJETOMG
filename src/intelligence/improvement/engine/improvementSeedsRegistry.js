import { listImprovementLoops } from "./improvementEngineStore.js";

const seedRegistry = new Map();

export function registerImprovementSeed(tenantId, partial) {
  const key = `${tenantId}:${partial.loopId ?? partial.source}`;
  seedRegistry.set(key, Object.freeze({ tenantId, ...partial, registeredAt: new Date().toISOString() }));
  return seedRegistry.get(key);
}

export function buildImprovementSeedsRegistry(tenantId = "default") {
  const loops = listImprovementLoops(tenantId, { limit: 10 });
  return Object.freeze({
    tenantId,
    seedCount: loops.length,
    seeds: Object.freeze(loops.map((l) => Object.freeze({ loopId: l.loopId, title: l.title }))),
    explainable: true,
  });
}

export default buildImprovementSeedsRegistry;
