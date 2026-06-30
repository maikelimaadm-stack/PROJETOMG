export function createBusinessComputedEvolutionMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-evolution-metadata-v1",
    evolutionPolicy: partial.evolutionPolicy ?? "intent_driven_regeneration",
    lastEvolvedAt: partial.lastEvolvedAt ?? null,
    evolutionReason: partial.evolutionReason ?? null,
    continuousImprovementHook: partial.continuousImprovementHook ?? "extension_point_only",
    suggestionEngineHook: partial.suggestionEngineHook ?? "extension_point_only",
  });
}

export default createBusinessComputedEvolutionMetadata;
