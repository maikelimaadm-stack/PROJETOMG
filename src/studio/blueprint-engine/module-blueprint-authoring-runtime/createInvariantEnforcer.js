import { AUTHORING_INVARIANT_IDS, FORBIDDEN_PROTOTYPE_PATHS } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createValidationIssue } from './createValidationIssue.js';
import { stableSerialize } from './stableSerialize.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** The invariant enforcer descriptor (pure data). @returns {Object} */
export function createInvariantEnforcer() {
  const core = {
    kind: 'authoring-invariant-enforcer',
    invariantIds: [...AUTHORING_INVARIANT_IDS],
    invariantCount: AUTHORING_INVARIANT_IDS.length,
    allFailClosed: true,
    invariantEnforcementImplemented: true,
    silentAutoCorrection: false,
  };
  return Object.freeze({ ...core, invariantEnforcerDigest: createDeterministicDigest(core) });
}

/**
 * Enforces the structural invariants over a draft snapshot, returning a deterministic issue list
 * (fail-closed; never auto-corrects). Pure.
 * @param {Object} draft @param {string} stage @returns {Object[]}
 */
export function enforceAuthoringInvariants(draft, stage = 'shape_validation') {
  const d = isPlainObject(draft) ? draft : {};
  const issues = [];
  const fields = Array.isArray(d.fields) ? d.fields : [];
  const layout = Array.isArray(d.layout) ? d.layout : [];
  const rels = Array.isArray(d.relationships) ? d.relationships : [];
  const push = (issueCode, severity, path, message) => issues.push(createValidationIssue({ issueCode, severity, stage, path, message }));

  // field_keys_unique
  const fkeys = fields.map((f) => (f && f.fieldKey) || (f && f.key));
  if (new Set(fkeys).size !== fkeys.length) push('field_keys_unique', 'blocker', 'fields', 'Field keys must be unique');
  // field_order_non_negative
  if (fields.some((f) => !(Number.isFinite(Number(f && f.order)) && Number(f.order) >= 0))) push('field_order_non_negative', 'error', 'fields.order', 'Field order must be a non-negative integer');
  // layout_section_ids_unique
  const sids = layout.map((l) => l && l.sectionId);
  if (new Set(sids).size !== sids.length) push('layout_section_ids_unique', 'blocker', 'layout', 'Layout section ids must be unique');
  // relationship_ids_unique
  const rids = rels.map((r) => r && r.relationshipId);
  if (new Set(rids).size !== rids.length) push('relationship_ids_unique', 'blocker', 'relationships', 'Relationship ids must be unique');
  // relationship_endpoints_known
  if (rels.some((r) => !r || !r.sourceDraftEntity || !r.targetDraftEntity)) push('relationship_endpoints_known', 'error', 'relationships.endpoints', 'Relationship source/target must be known');

  const serialized = stableSerialize(d);
  // no_production_flags
  if (/"(production|staging|deployed)"\s*:\s*true/.test(serialized)) push('no_production_flags', 'blocker', 'draft', 'No production flags allowed');
  // no_persistence_descriptors
  if (/"(persisted|persistence|storage)"\s*:\s*true/.test(serialized)) push('no_persistence_descriptors', 'blocker', 'draft', 'No persistence descriptors allowed');
  // no_backend_descriptors
  if (/"backend[A-Za-z]*"\s*:\s*true/.test(serialized)) push('no_backend_descriptors', 'blocker', 'draft', 'No backend descriptors allowed');
  // no_prisma_descriptors
  if (/"prisma[A-Za-z]*"\s*:\s*true/i.test(serialized)) push('no_prisma_descriptors', 'blocker', 'draft', 'No Prisma descriptors allowed');
  // no_real_data_references
  if (/"(realData[A-Za-z]*|rewriteEmpresas)"\s*:\s*true/.test(serialized)) push('no_real_data_references', 'blocker', 'draft', 'No real-data references allowed');
  // no_app_router_menu_descriptors
  if (/"(routeCreated|menuCreated|productExposed|appTouched)"\s*:\s*true/.test(serialized)) push('no_app_router_menu_descriptors', 'blocker', 'draft', 'No App/router/menu descriptors allowed');
  // no_old_prototype_references
  if (FORBIDDEN_PROTOTYPE_PATHS.some((p) => serialized.includes(p))) push('no_old_prototype_references', 'blocker', 'draft', 'No old-prototype references allowed');
  // no_self_certification
  if (/"(certified|selfCertified|canonical)"\s*:\s*true/.test(serialized)) push('no_self_certification', 'blocker', 'draft', 'No self-certification allowed');
  // no_module_generation_authorization
  if (/"(moduleGenerated|moduleRegistered|generated)"\s*:\s*true/.test(serialized)) push('no_module_generation_authorization', 'blocker', 'draft', 'No module-generation authorization allowed');

  return issues;
}

export default createInvariantEnforcer;
