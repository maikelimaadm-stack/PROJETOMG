import { EXTENSION_PROTECTED_FIELDS, DEFAULT_BRIDGE_RESOURCE_LIMITS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject, isNonEmptyString } from './normalizeBridgeInput.js';

const NAMESPACE_RE = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/; // dotted namespace, e.g. "acme.pricing".
const PROTECTED = new Set(EXTENSION_PROTECTED_FIELDS);
const CAPABILITY_OVERRIDE = new Set(['canonical', 'certified', 'productExposed', 'moduleGenerated', 'realDataAttached', 'previewMounted', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'productionAccessed']);

/**
 * Validates bridge extensions against the contract policy: namespaced + schema'd only; unknown/unnamespaced
 * rejected; duplicate namespaces rejected; extensions may NEVER override protected/critical fields or
 * capability flags; per-extension limit enforced. Fail-closed on a missing schema. Pure.
 * @param {Object} options @returns {Object}
 */
export function validateBridgeExtensions(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const extensions = Array.isArray(o.extensions) ? o.extensions : [];
  const schemas = isPlainObject(o.extensionSchemas) ? o.extensionSchemas : {};
  const maxExtensions = Number.isFinite(o.maxExtensions) ? o.maxExtensions : DEFAULT_BRIDGE_RESOURCE_LIMITS.maxExtensions;
  const issues = [];
  const seen = new Set();

  if (extensions.length > maxExtensions) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSIONS_TOO_MANY', severity: 'blocker', stage: 'source_shape_validation', path: 'extensions', message: `Too many extensions (${extensions.length} > ${maxExtensions}).` }));
  }

  extensions.forEach((ext, i) => {
    const e = isPlainObject(ext) ? ext : {};
    const ns = e.namespace;
    const path = `extensions[${i}]`;
    if (!isNonEmptyString(ns) || !NAMESPACE_RE.test(ns)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSION_UNNAMESPACED_FORBIDDEN', severity: 'blocker', stage: 'source_shape_validation', path, message: 'Extension must declare a valid dotted namespace.' }));
      return;
    }
    if (seen.has(ns)) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSION_DUPLICATE_NAMESPACE', severity: 'blocker', stage: 'source_shape_validation', path, message: `Duplicate extension namespace "${ns}".` }));
      return;
    }
    seen.add(ns);
    if (!isPlainObject(schemas[ns])) {
      issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSION_MISSING_SCHEMA', severity: 'blocker', stage: 'source_shape_validation', path, message: `No known schema for extension namespace "${ns}" (fail-closed).` }));
      return;
    }
    const fields = isPlainObject(e.fields) ? e.fields : {};
    for (const key of Object.keys(fields)) {
      if (PROTECTED.has(key)) {
        issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', severity: 'blocker', stage: 'source_shape_validation', path: `${path}.fields.${key}`, message: `Extension may not override protected field "${key}".` }));
      } else if (CAPABILITY_OVERRIDE.has(key)) {
        issues.push(createBridgeIssue({ issueCode: 'BRIDGE_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN', severity: 'blocker', stage: 'source_shape_validation', path: `${path}.fields.${key}`, message: `Extension may not override capability flag "${key}".` }));
      }
    }
  });

  // Deterministic ordering of accepted namespaces.
  const acceptedNamespaces = [...seen].sort();
  return { ok: !issues.some((i) => i.blocksBridge), issues, acceptedNamespaces };
}

export default validateBridgeExtensions;
