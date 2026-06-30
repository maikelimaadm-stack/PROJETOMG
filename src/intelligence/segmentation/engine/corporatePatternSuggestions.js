import { buildAuthorizedGroupComparison } from "./authorizedGroupComparison.js";
import { buildCorporateBenchmarking } from "../../dna/engine/corporateBenchmarking.js";

/** Corporate pattern suggestions within authorized group */
export function buildCorporatePatternSuggestions(groupId, requestingTenantId) {
  const comparison = buildAuthorizedGroupComparison(groupId, requestingTenantId);
  if (!comparison.authorized) {
    return Object.freeze({
      authorized: false,
      suggestions: [],
      crossTenantMixingForbidden: true,
    });
  }

  const benchmarking = buildCorporateBenchmarking(groupId, requestingTenantId);
  const suggestions = [];

  if (comparison.referenceTenant && comparison.referenceTenant !== requestingTenantId) {
    suggestions.push(
      Object.freeze({
        type: "reference_company",
        tenantId: comparison.referenceTenant,
        label: "Empresa referência em maturidade avançada",
        because: "Maior score de maturidade no grupo autorizado.",
        replicable: true,
      })
    );
  }

  for (const ref of benchmarking.replicablePractices ?? []) {
    suggestions.push(
      Object.freeze({
        type: "replicable_practice",
        tenantId: ref.tenantId,
        label: ref.label,
        because: ref.because,
        replicable: true,
      })
    );
  }

  for (const sim of comparison.similarCompanies ?? []) {
    suggestions.push(
      Object.freeze({
        type: "similar_segment",
        tenantId: sim.tenantId,
        label: `Perfil semelhante: ${sim.segmentLabel}`,
        because: "Mesmo segmento operacional no grupo autorizado.",
        replicable: true,
      })
    );
  }

  return Object.freeze({
    authorized: true,
    groupId,
    suggestions: Object.freeze(suggestions.slice(0, 8)),
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default buildCorporatePatternSuggestions;
