import { getTemplateCatalog, getTemplateLibraryInfo } from "./templateCatalog.js";

export function buildTemplateLibrary() {
  return Object.freeze({
    ...getTemplateLibraryInfo(),
    templates: getTemplateCatalog(),
    builtAt: new Date().toISOString(),
  });
}

export default buildTemplateLibrary;
