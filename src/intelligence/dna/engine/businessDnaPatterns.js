import { DNA_PATTERN_TYPES } from "./businessDnaContracts.js";
import { upsertDnaPattern } from "./businessDnaStore.js";

export function registerOperationalPattern(tenantId, input) {
  const pattern = Object.freeze({
    patternId: input.patternId ?? `bpat-${tenantId}-${Date.now()}`,
    tenantId,
    patternType: DNA_PATTERN_TYPES.OPERATIONAL,
    label: input.label ?? "Padrão operacional",
    description: input.description ?? "",
    occurrences: input.occurrences ?? 1,
    explainable: true,
    organizationalScope: true,
    individualProfilingForbidden: true,
    recordedAt: new Date().toISOString(),
  });
  upsertDnaPattern(pattern);
  return pattern;
}

export function registerCulturalPattern(tenantId, input) {
  const pattern = Object.freeze({
    patternId: input.patternId ?? `bcult-${tenantId}-${Date.now()}`,
    tenantId,
    patternType: DNA_PATTERN_TYPES.CULTURAL,
    label: input.label ?? "Padrão cultural operacional",
    description: input.description ?? "",
    occurrences: input.occurrences ?? 1,
    explainable: true,
    organizationalScope: true,
    individualProfilingForbidden: true,
    recordedAt: new Date().toISOString(),
  });
  upsertDnaPattern(pattern);
  return pattern;
}

export default { registerOperationalPattern, registerCulturalPattern };
