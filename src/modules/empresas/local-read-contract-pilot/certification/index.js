/**
 * Barrel for the Empresas LOCAL READ CONTRACT CERTIFICATION layer — pure, React-free,
 * node-importable. Turns the proven local read-only behavior into a versioned,
 * verifiable, immutable reference: canonical contract, canonical fixtures, query and
 * error catalogs, tenant/permission rules, a parity baseline, a local performance
 * envelope, a certification manifest, a verifier and a compatibility checker. It
 * NEVER touches a real backend/Prisma/fetch/Railway/production/staging, NEVER mutates,
 * NEVER uses real data, and is NEVER auto-consumed by the app. Reversible by
 * non-consumption. Next step is Empresas Staging Read-Only Readiness Audit.
 */

export { createEmpresasLocalReadContractCertification } from './createEmpresasLocalReadContractCertification.js';
export { createEmpresasCertificationManifest } from './createEmpresasCertificationManifest.js';
export { createEmpresasCanonicalContract } from './createEmpresasCanonicalContract.js';
export { createEmpresasCanonicalFixtures, createEmpresasCanonicalFixtureSet, EMPRESAS_CERTIFICATION_FIXTURE_VERSION } from './createEmpresasCanonicalFixtures.js';
export { createEmpresasCanonicalQueryCatalog } from './createEmpresasCanonicalQueryCatalog.js';
export { createEmpresasCanonicalErrorCatalog } from './createEmpresasCanonicalErrorCatalog.js';
export { createEmpresasCanonicalTenantRules } from './createEmpresasCanonicalTenantRules.js';
export { createEmpresasCanonicalPermissionRules } from './createEmpresasCanonicalPermissionRules.js';
export { createEmpresasCanonicalParityBaseline } from './createEmpresasCanonicalParityBaseline.js';
export { createEmpresasLocalPerformanceEnvelope } from './createEmpresasLocalPerformanceEnvelope.js';
export { verifyEmpresasLocalReadCertification } from './verifyEmpresasLocalReadCertification.js';
export { checkEmpresasContractCompatibility } from './checkEmpresasContractCompatibility.js';
export { createEmpresasCertificationDiagnostics } from './createEmpresasCertificationDiagnostics.js';
export { createEmpresasCertificationFallback, EMPRESAS_CERTIFICATION_FALLBACK_SCENARIOS } from './createEmpresasCertificationFallback.js';
export {
  isEmpresasLocalReadContractCertificationEnabled,
  isEmpresasLocalReadCertificationVerifyEnabled,
  isEmpresasLocalReadCompatibilityCheckEnabled,
  EMPRESAS_CONTRACT_NAME,
  EMPRESAS_CONTRACT_VERSION,
  EMPRESAS_CONTRACT_ID,
  EMPRESAS_CERTIFICATION_VERSION,
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_LOCAL_READ_CONTRACT_CERTIFICATION_FLAG,
} from './empresasLocalReadCertificationConfig.js';
export { EmpresasCertificationError, empresasCertificationError } from './errors.js';
