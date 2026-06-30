import { getTemplateCatalog } from "./templateCatalog.js";
import { listTemplateMatches } from "./segmentationEngineStore.js";

export function retrieveTemplatesByContext(tenantId = "default", options = {}) {
  const matches = listTemplateMatches(tenantId, { limit: options.limit ?? 20 });
  const catalog = getTemplateCatalog();

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    matches,
    catalog: catalog.slice(0, options.catalogLimit ?? 10),
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export default retrieveTemplatesByContext;
