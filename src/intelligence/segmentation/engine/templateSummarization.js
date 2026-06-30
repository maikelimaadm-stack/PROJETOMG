import { retrieveTemplatesByContext } from "./templateRetrieval.js";
import { getTemplateLibraryInfo } from "./templateCatalog.js";

export function summarizeTemplateLibrary(tenantId = "default") {
  const retrieved = retrieveTemplatesByContext(tenantId);
  const topMatch = retrieved.matches[0];

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    matchCount: retrieved.matches.length,
    catalogCount: retrieved.catalog.length,
    topTemplate: topMatch?.templateLabel ?? null,
    topCompatibility: topMatch?.compatibilityScore ?? 0,
    headline: topMatch
      ? `Template recomendado: ${topMatch.templateLabel} (${topMatch.compatibilityScore}% compatível).`
      : "Templates operacionais disponíveis para acelerar a evolução da empresa.",
    libraryInfo: getTemplateLibraryInfo(),
    explainable: true,
    belongsToEnterprise: true,
    autonomousApplicationForbidden: true,
  });
}

export default summarizeTemplateLibrary;
