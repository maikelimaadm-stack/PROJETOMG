import { deepFreeze } from './deepFreeze.js';

/**
 * EXTENSIBILITY PLAN — namespace/schema/duplicate/override/prototype rules for future runtime extensions.
 * Declaration only. No extension may enable any privileged capability.
 */
export const EXTENSIBILITY_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-extensibility-plan',
  namespaceRequired: true,
  schemaRequired: true,
  duplicateForbidden: true,
  overrideForbidden: true,
  prototypeMutationForbidden: true,
  // No extension may set any of these to true.
  forbiddenCapabilityOverrides: deepFreeze([
    'canonical', 'certified', 'moduleGenerated', 'productExposed', 'previewMounted', 'realDataAttached',
    'routeCreated', 'menuCreated', 'persistence', 'network', 'backend', 'Prisma', 'production',
  ]),
  issueCodes: deepFreeze([
    'RUNTIME_EXTENSION_UNNAMESPACED_FORBIDDEN', 'RUNTIME_EXTENSION_MISSING_SCHEMA',
    'RUNTIME_EXTENSION_DUPLICATE_FORBIDDEN', 'RUNTIME_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN',
    'RUNTIME_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN',
  ]),
  extensionsImplemented: false,
});

export default EXTENSIBILITY_PLAN;
