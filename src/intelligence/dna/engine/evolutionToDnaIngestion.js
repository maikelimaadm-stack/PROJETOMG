/**
 * Evolution → Business DNA ingestion — tenant-scoped identity analysis.
 */
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { computeDnaCapabilityMaturity } from "./businessDnaMaturityModel.js";
import { buildBusinessDnaProfile } from "./businessDnaProfile.js";
import { buildBusinessDnaFingerprint } from "./businessDnaFingerprint.js";
import { buildCapabilityRadar } from "./businessDnaCapabilityRadar.js";
import { registerDnaGrowthSignals } from "./businessDnaGrowthSignals.js";
import { buildDnaMaturityTimeline } from "./businessDnaMaturityRegistry.js";
import { registerDnaMilestones } from "./businessDnaMilestonesRegistry.js";
import { registerOperationalPattern, registerCulturalPattern } from "./businessDnaPatterns.js";
import { explainDnaProfile, explainDnaFingerprint } from "./businessDnaExplainability.js";
import { registerBusinessDnaSeed } from "./businessDnaSeedsRegistry.js";
import { appendDnaAuditEntry } from "./businessDnaAuditTrail.js";
import { BUSINESS_DNA_ENGINE_VERSION, DNA_OWNERSHIP } from "./businessDnaContracts.js";
import { ingestDnaToSegmentation } from "../../segmentation/engine/dnaToSegmentationIngestion.js";

/** Analyze full intelligence stack and produce Business DNA artifacts */
export function analyzeBusinessDnaContext(tenantId = "default") {
  const ctx = assembleBusinessDnaContext(tenantId);
  const maturity = computeDnaCapabilityMaturity(ctx);
  const profile = buildBusinessDnaProfile(ctx, maturity);
  const fingerprint = buildBusinessDnaFingerprint(ctx, maturity);
  const capabilityRadar = buildCapabilityRadar(maturity);
  const growthSignals = registerDnaGrowthSignals(tenantId, maturity, ctx);
  const maturityTimeline = buildDnaMaturityTimeline(tenantId);
  const milestones = registerDnaMilestones(tenantId, maturity, ctx.timeline);

  const operationalPatterns = [];
  for (const pat of (ctx.patterns ?? []).slice(0, 3)) {
    operationalPatterns.push(
      registerOperationalPattern(tenantId, {
        label: pat.label ?? pat.title ?? "Padrão operacional recorrente",
        description: pat.description ?? pat.summary ?? "",
        occurrences: pat.count ?? 1,
      })
    );
  }

  const culturalPatterns = [];
  if ((ctx.consultingSummary?.recommendationCount ?? 0) > 0) {
    culturalPatterns.push(
      registerCulturalPattern(tenantId, {
        label: "Cultura de melhoria contínua",
        description: "Organização orientada a recomendações e evolução estruturada.",
      })
    );
  }
  if ((ctx.decisionSummary?.decisionCount ?? 0) > 0) {
    culturalPatterns.push(
      registerCulturalPattern(tenantId, {
        label: "Decisões estruturadas",
        description: "Operação com decisões registradas e explicáveis.",
      })
    );
  }

  registerBusinessDnaSeed(tenantId, {
    source: "evolution_to_dna_ingestion",
    profileId: profile.profileId,
  });

  appendDnaAuditEntry({
    tenantId,
    action: "dna_context_analyzed",
    entityId: profile.profileId,
    entityType: "analysis",
  });

  try {
    ingestDnaToSegmentation(tenantId);
  } catch {
    // non-blocking — segmentation must not break DNA pipeline
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: BUSINESS_DNA_ENGINE_VERSION,
    profile,
    fingerprint,
    capabilityRadar,
    growthSignals,
    maturityTimeline,
    milestones,
    operationalPatterns,
    culturalPatterns,
    explainability: Object.freeze({
      profile: explainDnaProfile(profile),
      fingerprint: explainDnaFingerprint(fingerprint),
    }),
    ...DNA_OWNERSHIP,
    explainable: true,
  });
}

export function ingestEvolutionToBusinessDna(tenantId = "default") {
  return analyzeBusinessDnaContext(tenantId);
}

export function replayBusinessDnaFromStack(tenantId = "default") {
  return analyzeBusinessDnaContext(tenantId);
}

export default { analyzeBusinessDnaContext, ingestEvolutionToBusinessDna, replayBusinessDnaFromStack };
