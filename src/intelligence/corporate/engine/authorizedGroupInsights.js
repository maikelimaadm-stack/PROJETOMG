import { retrieveAdoptionsByContext } from "../../adoption/engine/adoptionRetrieval.js";
import { isTenantAuthorizedInGroup } from "../../dna/engine/businessDnaStore.js";

export function buildAuthorizedGroupInsights(groupId, tenantId = "default") {
  if (!isTenantAuthorizedInGroup(groupId, tenantId)) {
    return Object.freeze({
      groupId,
      tenantId,
      authorized: false,
      insights: [],
      reason: "Tenant não autorizado neste escopo de grupo.",
    });
  }

  const adoptionData = retrieveAdoptionsByContext(tenantId);
  const insights = [
    Object.freeze({
      id: `insight-${groupId}-adoption`,
      label: "Progresso de adoção do grupo",
      value: `${adoptionData.progress.overallProgressPercent}%`,
      because: "Consolidado apenas de empresas autorizadas.",
    }),
    Object.freeze({
      id: `insight-${groupId}-accepted`,
      label: "Recomendações aceitas",
      value: adoptionData.statusBreakdown.acceptedCount,
      because: "Adoções confirmadas pela empresa.",
    }),
  ];

  return Object.freeze({
    groupId,
    tenantId,
    authorized: true,
    insights,
    explainable: true,
  });
}

export default buildAuthorizedGroupInsights;
