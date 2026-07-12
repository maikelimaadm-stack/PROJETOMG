import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasTenantFuzzMatrix } from '../hardening/createEmpresasTenantFuzzMatrix.js';
import { createEmpresasCanonicalFixtures } from './createEmpresasCanonicalFixtures.js';

const RULES = [
  'tenant is required',
  'empresaHeader is required when applicable',
  'tenant and header must be coherent',
  'tenant and token claim must be coherent',
  'erpEmpresaId must belong to the tenant',
  'list respects tenant',
  'getById respects tenant',
  'count respects tenant',
  'filters do not bypass tenant',
  'sort does not bypass tenant',
  'pagination does not bypass tenant',
  'runtime projection respects tenant',
  'fallback respects tenant',
  'invalid context fails closed',
  'no admin bypasses tenant',
  'tenant leakage invalidates certification',
];

/**
 * Canonical tenant rules + a live leak check over the certification fixtures.
 * Pure aside from local reads.
 *
 * @param {Object} [options]
 * @returns {Object} tenant rules descriptor
 */
export function createEmpresasCanonicalTenantRules(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const fixtures = isGenericModelPlainObject(o.fixtures) ? o.fixtures : createEmpresasCanonicalFixtures({ profile: 'certification-medium' });
  const fuzz = createEmpresasTenantFuzzMatrix({ dataset: { records: fixtures.records, tenants: fixtures.tenants } });

  const body = {
    kind: 'empresas-canonical-tenant-rules',
    rules: [...RULES],
    ruleCount: RULES.length,
    failClosed: true,
    tenantLeakageAllowed: false,
    certificationBlockerOnLeakage: true,
    tenantLeakageFound: fuzz.leakageFound === true,
    fuzzScenarioCount: fuzz.totalScenarios,
  };
  return safeCloneGenericModel({ ...body, tenantRulesDigest: createGenericModelChecksum({ value: { rules: RULES, leakage: body.tenantLeakageFound } }) });
}

export default createEmpresasCanonicalTenantRules;
