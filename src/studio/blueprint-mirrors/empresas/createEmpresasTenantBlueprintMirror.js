import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createEmpresasCanonicalContract } from '../../../modules/empresas/local-read-contract-pilot/certification/createEmpresasCanonicalContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * The real multi-tenant surface of Empresas, mapped as reference-only. `cliente_id` is
 * the certified tenant field; `erp_empresa_id`/`empresaHeader` are the known
 * multiempresa scoping signals (documented, not certified in the read contract). No
 * real JWT is used and no endpoint is called.
 */
const TENANT_SIGNALS = [
  { signal: 'cliente_id', source: 'empresas-local-read-contract@1.0.0', certified: true, role: 'primary tenant field (protected)' },
  { signal: 'erp_empresa_id', source: 'multiempresa scope', certified: false, role: 'ERP-empresa scoping (documented)' },
  { signal: 'empresaHeader', source: 'request header', certified: false, role: 'active-empresa header (documented)' },
];

/**
 * Mirrors the Empresas tenant/multiempresa scope against the certified read contract.
 * Pure, headless, reference-only. tenantRequired/permissionRequired true; tenant never
 * bypassed; admin never bypasses tenant; no real JWT, no endpoint.
 *
 * @param {Object} [options]
 * @returns {Object} tenant blueprint mirror
 */
export function createEmpresasTenantBlueprintMirror(options = {}) {
  void options;
  const contract = createEmpresasCanonicalContract();
  const certifiedTenantFields = contract.record.tenantFields;

  const signals = TENANT_SIGNALS.map((s) => ({
    ...s,
    mapped: s.certified,
    alignmentStatus: s.certified ? 'aligned' : 'needs_alignment',
  }));

  const scope = {
    list: 'tenant-scoped (contract)',
    getById: 'tenant-scoped (contract: tenant_mismatch outcome)',
    count: 'tenant-scoped (contract)',
    preference: 'tenant + user scoped (documented)',
    permission: 'tenant + permission scoped (contract)',
  };

  const gaps = signals.filter((s) => !s.certified).map((s) => ({ signal: s.signal, note: `${s.role} not certified in read contract` }));

  const body = {
    kind: 'empresas-tenant-blueprint-mirror',
    signals,
    certifiedTenantFields: [...certifiedTenantFields],
    scope,
    tenantRequired: true,
    permissionRequired: true,
    tenantEverBypassed: false,
    adminBypassesTenant: false,
    realJwtUsed: false,
    endpointCalled: false,
    isolationRules: ['no cross-tenant read', 'no cross-tenant write (n/a here)', 'header + token + permission all required'],
    gaps,
    alignmentStatus: gaps.length > 0 ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, tenantDigest: mirrorDigest({ signals: signals.map((s) => [s.signal, s.certified]) }) });
}

export default createEmpresasTenantBlueprintMirror;
