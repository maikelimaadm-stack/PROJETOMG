import { createDnaProfile, upsertDnaProfile } from "./businessDnaStore.js";
import { buildDnaLineage } from "./businessDnaLineage.js";
import { registerDnaVersion } from "./businessDnaVersioning.js";
import { appendDnaAuditEntry } from "./businessDnaAuditTrail.js";

export function buildBusinessDnaProfile(ctx, maturity) {
  const traits = [];
  if ((ctx.memorySummary?.recordCount ?? 0) > 0) traits.push("Operação registrada e rastreável");
  if ((ctx.graphSummary?.nodeCount ?? 0) > 0) traits.push("Conhecimento organizacional conectado");
  if ((ctx.consultingSummary?.recommendationCount ?? 0) > 0) traits.push("Orientada a melhoria contínua");
  if ((ctx.decisionSummary?.decisionCount ?? 0) > 0) traits.push("Decisões estruturadas e explicáveis");

  const profile = createDnaProfile({
    tenantId: ctx.tenantId,
    title: "Identidade operacional da empresa",
    summary: `Empresa com maturidade ${maturity.overallLevel} em ${maturity.capabilities.length} domínios de capacidade.`,
    identityStatement: traits.length
      ? `Esta organização opera com: ${traits.join("; ")}.`
      : "Identidade operacional em formação a partir da memória e evolução da empresa.",
    maturityLevel: maturity.overallLevel,
    lineage: buildDnaLineage({
      memoryIds: [],
      evolutionIds: [],
    }),
    evidenceRefs: maturity.capabilities.map((c) =>
      Object.freeze({ type: "dna.maturity", refId: c.recordId, label: c.label })
    ),
  });
  registerDnaVersion(ctx.tenantId, profile.profileId);
  upsertDnaProfile(profile);
  appendDnaAuditEntry({
    tenantId: ctx.tenantId,
    action: "profile_created",
    entityId: profile.profileId,
    entityType: "profile",
  });
  return profile;
}

export default buildBusinessDnaProfile;
