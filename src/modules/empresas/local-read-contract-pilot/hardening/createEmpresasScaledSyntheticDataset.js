import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_LOCAL_READ_ENVIRONMENT,
  EMPRESAS_DATASET_PROFILES,
  EMPRESAS_DATASET_MAX,
  EMPRESAS_HARDENING_SOURCE,
} from './empresasLocalReadHardeningConfig.js';
import { empresasReadHardeningError } from './errors.js';

const CIDADES = ['Vila Sintética', 'Cidade Fixture', 'Testópolis', 'Nova Amostra', 'Porto Mock', 'Aldeia Seed'];
const ESTADOS = ['SP', 'MG', 'PR', 'RS', 'GO', 'BA'];
const STATUSES = ['Ativa', 'Inativa'];

/** Deterministic tenant count per profile (>= 4 for medium/large). */
function tenantCountFor(profile, size) {
  if (profile === 'tiny') return Math.min(2, Math.max(1, size));
  if (profile === 'small') return 2;
  return 4;
}

function syntheticCnpj(t, i) {
  const base = String(90000000 + t * 10000 + i).padStart(8, '0');
  return `00.${base.slice(0, 3)}.${base.slice(3, 6)}/0001-${String((i * 7) % 100).padStart(2, '0')}`;
}

/**
 * Builds a SCALED, deterministic, synthetic dataset for hardening. Same record
 * shape as the real `Empresa`. No real data. Distributes `size` records across
 * `tenantCount` synthetic tenants (round-robin). Pure; safe copies only.
 *
 * @param {Object} [options]
 * @param {'tiny'|'small'|'medium'|'large'} [options.profile]
 * @param {number} [options.size] explicit size (else derived from profile)
 * @param {number} [options.seed]
 * @param {string} [options.testRunId]
 * @returns {Object} dataset descriptor
 */
export function createEmpresasScaledSyntheticDataset(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const profile = typeof o.profile === 'string' && o.profile in EMPRESAS_DATASET_PROFILES ? o.profile : 'small';
  const size = Number.isInteger(o.size) && o.size >= 0 ? o.size : EMPRESAS_DATASET_PROFILES[profile];
  if (size > EMPRESAS_DATASET_MAX) {
    throw empresasReadHardeningError('MAK-EMP-HARD-002', `dataset size ${size} exceeds cap ${EMPRESAS_DATASET_MAX}`);
  }
  const seed = Number.isInteger(o.seed) ? o.seed : 1;
  const testRunId = typeof o.testRunId === 'string' ? o.testRunId : `RUN_HARD_${profile}_${seed}`;
  const tenantCount = tenantCountFor(profile, size);

  const tenants = [];
  for (let t = 0; t < tenantCount; t += 1) {
    tenants.push({
      tenantId: `MAK_TEST_CLIENTE_${String.fromCharCode(65 + t)}`,
      erpEmpresaId: `erp_test_${String.fromCharCode(65 + t)}`,
      count: 0,
    });
  }

  const records = [];
  for (let i = 0; i < size; i += 1) {
    const t = i % tenantCount;
    const tenant = tenants[t];
    tenant.count += 1;
    const nSeq = tenant.count;
    const codempresa = (t + 1) * 100000 + nSeq;
    records.push({
      id: `${tenant.tenantId}__emp_${String(nSeq).padStart(5, '0')}`,
      cliente_id: tenant.tenantId,
      id_global: (t + 1) * 1000000 + nSeq,
      codempresa,
      // Deterministic name mixing seed + index so ordering varies but is stable.
      razao_social: `MAK_TEST_${tenant.tenantId}_EMP_${String((nSeq * 7 + seed) % 1000).padStart(4, '0')}`,
      nome_fantasia: `Fixture ${String.fromCharCode(65 + t)}-${nSeq}`,
      tipo_pessoa: nSeq % 3 === 0 ? 'PF' : 'PJ',
      cpf_cnpj: syntheticCnpj(t, nSeq),
      telefone: null,
      email: null,
      cidade: CIDADES[(nSeq + seed) % CIDADES.length],
      estado: ESTADOS[(nSeq + t) % ESTADOS.length],
      status: STATUSES[nSeq % 2],
      campos_personalizados: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      __fixture: {
        fixtureId: `${tenant.tenantId}_${nSeq}`,
        seed,
        synthetic: true,
        tenantId: tenant.tenantId,
        erpEmpresaId: tenant.erpEmpresaId,
        environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
        datasetProfile: profile,
        source: EMPRESAS_HARDENING_SOURCE,
      },
    });
  }

  return safeCloneGenericModel({
    kind: 'empresas-scaled-synthetic-dataset',
    testRunId,
    seed,
    datasetProfile: profile,
    synthetic: true,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    source: EMPRESAS_HARDENING_SOURCE,
    tenants: tenants.map((t) => ({ tenantId: t.tenantId, erpEmpresaId: t.erpEmpresaId, count: t.count })),
    records,
    total: records.length,
    hasSensitiveData: false,
    localOnly: true,
    sent: false,
  });
}

/**
 * Builds a valid read context for a synthetic tenant of a scaled dataset.
 * @param {Object} tenant { tenantId, erpEmpresaId }
 * @returns {Object} synthetic tenant context (read-allowed)
 */
export function contextForScaledTenant(tenant) {
  const t = isGenericModelPlainObject(tenant) ? tenant : {};
  return safeCloneGenericModel({
    kind: 'empresas-synthetic-tenant-context',
    synthetic: true,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    tenantId: t.tenantId,
    clienteId: t.tenantId,
    erpEmpresaId: t.erpEmpresaId,
    empresaHeader: t.erpEmpresaId,
    userId: 'MAK_TEST_USER',
    permissions: ['empresas.read'],
    tokenClaims: { sub: 'MAK_TEST_USER', scope: 'empresas.read', tenantId: t.tenantId, exp: '2999-01-01T00:00:00.000Z', synthetic: true },
    valid: true,
    reason: 'valid',
  });
}

export default createEmpresasScaledSyntheticDataset;
