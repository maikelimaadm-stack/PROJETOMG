/**
 * Business DNA summarization — BOS-friendly organizational identity summary.
 */
import { retrieveBusinessDnaByContext } from "./businessDnaRetrieval.js";
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { computeDnaCapabilityMaturity } from "./businessDnaMaturityModel.js";
import { DNA_OWNERSHIP } from "./businessDnaContracts.js";

export function summarizeBusinessDnaEngine(tenantId = "default") {
  const retrieved = retrieveBusinessDnaByContext(tenantId);
  const ctx = assembleBusinessDnaContext(tenantId);
  const maturity = computeDnaCapabilityMaturity(ctx);
  const profile = retrieved.profiles[0];
  const fingerprint = retrieved.fingerprints[0];
  const avgScore =
    maturity.capabilities.reduce((s, c) => s + c.score, 0) / (maturity.capabilities.length || 1);

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    profileCount: retrieved.profiles.length,
    fingerprintCount: retrieved.fingerprints.length,
    patternCount: retrieved.patterns.length,
    maturityLevel: maturity.overallLevel,
    averageMaturityScore: Math.round(avgScore * 10) / 10,
    headline: profile
      ? profile.identityStatement
      : "Identidade operacional em formação — a plataforma está observando padrões da empresa.",
    strengths: maturity.capabilities.filter((c) => c.score >= 2).map((c) => c.label),
    gaps: maturity.needsMaturation.map((c) => c.label),
    fingerprintTraits: fingerprint?.traits ?? [],
    growthSignalCount: retrieved.growthSignals.length,
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    surveillanceForbidden: true,
    autonomousExecutionForbidden: true,
    ...DNA_OWNERSHIP,
  });
}

export default summarizeBusinessDnaEngine;
