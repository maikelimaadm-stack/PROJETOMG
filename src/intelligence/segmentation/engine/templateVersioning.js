const templateVersionRegistry = {};

export function registerTemplateVersion(templateId) {
  const next = (templateVersionRegistry[templateId] ?? 0) + 1;
  templateVersionRegistry[templateId] = next;
  return Object.freeze({ templateId, version: next, registeredAt: new Date().toISOString() });
}

export default { registerTemplateVersion };
