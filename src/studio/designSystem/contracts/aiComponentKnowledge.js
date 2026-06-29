/**
 * AI Component Knowledge — structured knowledge for future IA Platform (L6).
 * Stored inside Component Manifest; IA consults this instead of inferring behavior.
 */

/**
 * @param {object} input
 * @returns {object}
 */
export function buildAiComponentKnowledge(input = {}) {
  return Object.freeze({
    description: input.description ?? "",
    examples: Object.freeze([...(input.examples ?? [])]),
    limitations: Object.freeze([...(input.limitations ?? [])]),
    bestPractices: Object.freeze([...(input.bestPractices ?? [])]),
    documentationUrl: input.documentationUrl ?? null,
    suggestions: Object.freeze([...(input.suggestions ?? [])]),
    contextHints: Object.freeze([...(input.contextHints ?? [])]),
  });
}

export default buildAiComponentKnowledge;
