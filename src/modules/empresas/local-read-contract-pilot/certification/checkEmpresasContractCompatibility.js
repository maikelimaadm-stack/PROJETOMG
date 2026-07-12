import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

/** Deep-ish equality on the parts that matter for compatibility. */
function arr(x) { return Array.isArray(x) ? x : []; }
function setEq(a, b) { const A = new Set(arr(a)); const B = new Set(arr(b)); return A.size === B.size && [...A].every((v) => B.has(v)); }
function removed(a, b) { const B = new Set(arr(b)); return arr(a).filter((v) => !B.has(v)); }
function added(a, b) { const A = new Set(arr(a)); return arr(b).filter((v) => !A.has(v)); }

/**
 * Compares a certified canonical contract against a candidate contract and
 * classifies the change. Any change that relaxes mutation policy or opens
 * production is BREAKING and blocked. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.certifiedContract]
 * @param {Object} [options.candidateContract]
 * @returns {Object} compatibility result
 */
export function checkEmpresasContractCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const cert = isGenericModelPlainObject(o.certifiedContract) ? o.certifiedContract : {};
  const cand = isGenericModelPlainObject(o.candidateContract) ? o.candidateContract : {};
  const cr = isGenericModelPlainObject(cert.record) ? cert.record : {};
  const dr = isGenericModelPlainObject(cand.record) ? cand.record : {};

  /** @type {string[]} */ const breakingChanges = [];
  /** @type {string[]} */ const compatibleChanges = [];
  /** @type {string[]} */ const warnings = [];

  // Required field removed → breaking.
  const reqRemoved = removed(cr.requiredFields, dr.requiredFields);
  if (reqRemoved.length) breakingChanges.push(`required-field-removed:${reqRemoved.join(',')}`);
  // Identifier / tenant field change → breaking.
  if (!setEq(cr.identifierFields, dr.identifierFields)) breakingChanges.push('identifier-changed');
  if (!setEq(cr.tenantFields, dr.tenantFields)) breakingChanges.push('tenant-field-changed');
  // Allowlist shrink → breaking; grow → compatible (minor).
  if (removed(cr.sortableFields, dr.sortableFields).length) breakingChanges.push('sort-allowlist-shrunk');
  else if (added(cr.sortableFields, dr.sortableFields).length) compatibleChanges.push('sort-allowlist-grown');
  if (removed(cr.filterableFields, dr.filterableFields).length) breakingChanges.push('filter-allowlist-shrunk');
  else if (added(cr.filterableFields, dr.filterableFields).length) compatibleChanges.push('filter-allowlist-grown');
  // Envelope change → breaking.
  if (!setEq((cert.listEnvelope || {}).fields, (cand.listEnvelope || {}).fields)) breakingChanges.push('envelope-changed');
  // Pagination semantics → breaking.
  if ((cert.query || {}).maxPageSize !== (cand.query || {}).maxPageSize) breakingChanges.push('pagination-semantics-changed');
  // Optional field added → compatible.
  const optAdded = added(cr.optionalFields, dr.optionalFields);
  if (optAdded.length) compatibleChanges.push(`optional-field-added:${optAdded.join(',')}`);
  // Safety relaxations → always breaking + blocked.
  const cs = isGenericModelPlainObject(cert.safety) ? cert.safety : {};
  const ds = isGenericModelPlainObject(cand.safety) ? cand.safety : {};
  if (ds.mutationAllowed === true && cs.mutationAllowed === false) breakingChanges.push('mutation-policy-relaxed');
  if (ds.readOnly === false && cs.readOnly === true) breakingChanges.push('read-only-relaxed');
  if (ds.productionAccessed === true && cs.productionAccessed === false) breakingChanges.push('production-access-opened');
  if (ds.backendAccessed === true) breakingChanges.push('backend-access-opened');
  if (ds.prismaAccessed === true) breakingChanges.push('prisma-access-opened');
  if (ds.fetchUsed === true) breakingChanges.push('fetch-opened');

  const breaking = breakingChanges.length > 0;
  const identical = !breaking && compatibleChanges.length === 0;
  let classification;
  if (breaking) classification = 'breaking';
  else if (identical) classification = 'compatible';
  else classification = 'backward_compatible';

  return safeCloneGenericModel({
    kind: 'empresas-contract-compatibility',
    compatible: !breaking,
    classification,
    breakingChanges,
    compatibleChanges,
    warnings,
    requiresMajorVersion: breaking,
    requiresMinorVersion: !breaking && compatibleChanges.some((c) => c.startsWith('optional-field-added') || c.endsWith('-grown')),
    requiresPatchVersion: !breaking && compatibleChanges.length === 0,
    certificationInvalidated: breaking,
  });
}

export default checkEmpresasContractCompatibility;
