export function createBusinessWorkflowPublishingMetadata(partial = {}) {
  return Object.freeze({ publishable: partial.publishable !== false, status: partial.status ?? "internal" });
}

export function createBusinessWorkflowMarketplaceMetadata(partial = {}) {
  return Object.freeze({ marketplaceReady: false, packageId: partial.packageId ?? null });
}

export function createBusinessWorkflowKnowledgeMetadata(partial = {}) {
  return Object.freeze({ linkedConcepts: Object.freeze([...(partial.linkedConcepts ?? [])]) });
}

export function createBusinessWorkflowEvolutionMetadata(partial = {}) {
  return Object.freeze({ evolutionCandidates: Object.freeze([...(partial.evolutionCandidates ?? [])]) });
}

export default createBusinessWorkflowPublishingMetadata;
