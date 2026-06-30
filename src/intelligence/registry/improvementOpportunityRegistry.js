import { BUSINESS_EVENT_TYPES } from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";

const STORAGE_KEY = "mak-improvement-opportunities-v1";

function readRegistry() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeRegistry(items) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
}

/** Improvement opportunity registry — suggestions only, never auto-execution */
export function registerImprovementOpportunity(input) {
  const opportunity = Object.freeze({
    opportunityId: `imp-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    title: input.title,
    explanation: input.explanation,
    evidenceCount: input.evidenceCount ?? 1,
    patternId: input.patternId ?? null,
    status: "suggested",
    automatedExecutionForbidden: true,
    humanApprovalRequired: true,
    recordedAt: new Date().toISOString(),
  });

  const items = readRegistry().filter((o) => o.opportunityId !== opportunity.opportunityId);
  items.unshift(opportunity);
  writeRegistry(items);

  publishDomainEvent({
    tenantId: opportunity.tenantId,
    eventType: BUSINESS_EVENT_TYPES.IMPROVEMENT_SUGGESTED,
    eventCategory: "improvement.opportunity",
    source: "intelligence.improvement",
    payload: Object.freeze({
      opportunityId: opportunity.opportunityId,
      title: opportunity.title,
    }),
    businessSummary: opportunity.explanation,
    whatHappened: `Oportunidade de melhoria identificada: ${opportunity.title}.`,
    businessImpact: "Sugestão para evolução futura — requer decisão humana.",
  });

  return opportunity;
}

export function listImprovementOpportunities(tenantId = "default") {
  return readRegistry().filter((o) => o.tenantId === tenantId);
}

export default registerImprovementOpportunity;
