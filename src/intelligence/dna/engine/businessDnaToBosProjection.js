/**
 * Business DNA → BOS projection — business vocabulary only.
 */
import { summarizeBusinessDnaEngine } from "./businessDnaSummarization.js";
import { retrieveLatestBusinessDna } from "./businessDnaRetrieval.js";
import { analyzeBusinessDnaContext } from "./evolutionToDnaIngestion.js";
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { computeDnaCapabilityMaturity } from "./businessDnaMaturityModel.js";
import { buildCapabilityRadar } from "./businessDnaCapabilityRadar.js";
import { buildDnaMaturityTimeline } from "./businessDnaMaturityRegistry.js";

/** Business DNA-to-BOS projections — organizational identity, never technical */
export function buildBusinessDnaBosProjection(tenantId = "default") {
  let summary = summarizeBusinessDnaEngine(tenantId);
  if (summary.profileCount === 0) {
    analyzeBusinessDnaContext(tenantId);
    summary = summarizeBusinessDnaEngine(tenantId);
  }

  const ctx = assembleBusinessDnaContext(tenantId);
  const maturity = computeDnaCapabilityMaturity(ctx);
  const radar = buildCapabilityRadar(maturity);
  const timeline = buildDnaMaturityTimeline(tenantId);
  const retrieved = retrieveLatestBusinessDna(tenantId);
  const profile = retrieved.profile;
  const fingerprint = retrieved.fingerprint;

  const maturityByCapability = maturity.capabilities.map((c) =>
    Object.freeze({
      id: c.domainId,
      label: c.label,
      level: c.level,
      score: c.score,
    })
  );

  const operationalPatterns = retrieved.operationalPatterns.slice(0, 5).map((p) =>
    Object.freeze({
      id: p.patternId,
      label: p.label,
      context: p.description,
    })
  );

  const culturalPatterns = retrieved.culturalPatterns.slice(0, 5).map((p) =>
    Object.freeze({
      id: p.patternId,
      label: p.label,
      context: p.description,
    })
  );

  const milestones = retrieved.milestones.slice(0, 5).map((m) =>
    Object.freeze({
      id: m.milestoneId,
      label: m.label,
      description: m.description,
      status: m.status,
    })
  );

  const growthSignals = retrieved.growthSignals.slice(0, 5).map((s) =>
    Object.freeze({
      id: s.signalId,
      label: s.label,
      context: s.description,
    })
  );

  const fingerprintTraits = (fingerprint?.traits ?? []).slice(0, 6).map((t) =>
    Object.freeze({
      id: t.id,
      label: t.label,
      because: t.because,
    })
  );

  return Object.freeze({
    hasDna: summary.profileCount > 0 || maturity.capabilities.length > 0,
    summary: summary.headline,
    dnaSummary: summary,
    identityHeadline: profile?.title ?? "Identidade operacional da empresa",
    identityNarrative: profile?.identityStatement ?? summary.headline,
    whoIsThisCompany: profile?.summary ?? summary.headline,
    howThisCompanyWorks: profile?.identityStatement ?? "",
    maturityLevel: maturity.overallLevel,
    maturityByCapability,
    capabilityRadar: radar,
    operationalPatterns,
    culturalPatterns,
    milestones,
    growthSignals,
    fingerprintTraits,
    fingerprintLabel: fingerprint?.label ?? "Fingerprint organizacional",
    whereMatured: summary.strengths,
    whereNeedsEvolution: summary.gaps,
    maturityTimeline: timeline.entries ?? [],
    explainable: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildBusinessDnaBosProjection;
