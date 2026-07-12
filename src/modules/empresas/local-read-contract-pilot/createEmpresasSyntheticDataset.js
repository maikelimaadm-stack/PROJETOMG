import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { EMPRESAS_LOCAL_READ_ENVIRONMENT } from './empresasLocalReadContractConfig.js';

/**
 * Two synthetic tenants (cliente_id) with synthetic empresa records. Everything is
 * fictional and deterministic — no real CNPJ/email/phone/address/company name, no
 * data copied from production. Mirrors the real `Empresa` field shape so the read
 * contract is realistic.
 */
const CIDADES = ['Vila Sintética', 'Cidade Fixture', 'Testópolis', 'Nova Amostra', 'Porto Mock'];
const ESTADOS = ['SP', 'MG', 'PR', 'RS', 'GO'];
const STATUSES = ['Ativa', 'Inativa'];

/** Deterministic synthetic CNPJ-shaped string (clearly not a real CNPJ). */
function syntheticCnpj(tenantSeq, i) {
  const base = String(90000000 + tenantSeq * 1000 + i).padStart(8, '0');
  return `00.${base.slice(0, 3)}.${base.slice(3, 6)}/0001-${String((i * 7) % 100).padStart(2, '0')}`;
}

function buildTenant(tenantKey, tenantSeq, clienteId, erpEmpresaId, count) {
  const records = [];
  for (let i = 1; i <= count; i += 1) {
    const codempresa = tenantSeq * 100 + i;
    const status = STATUSES[i % 2];
    records.push({
      id: `${clienteId}__emp_${String(i).padStart(3, '0')}`,
      cliente_id: clienteId,
      id_global: tenantSeq * 10000 + i,
      codempresa,
      razao_social: `MAK_TEST_${tenantKey}_EMPRESA_${String(i).padStart(3, '0')}`,
      nome_fantasia: `Fixture ${tenantKey} ${i}`,
      tipo_pessoa: i % 3 === 0 ? 'PF' : 'PJ',
      cpf_cnpj: syntheticCnpj(tenantSeq, i),
      telefone: null,
      email: null,
      cidade: CIDADES[i % CIDADES.length],
      estado: ESTADOS[i % ESTADOS.length],
      status,
      campos_personalizados: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      __fixture: {
        fixtureId: `${tenantKey}_${i}`,
        synthetic: true,
        tenantId: clienteId,
        erpEmpresaId,
        environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
        cleanupRequired: false,
        source: 'deterministic_fixture',
      },
    });
  }
  return { tenantKey, clienteId, erpEmpresaId, records };
}

/**
 * Builds the synthetic dataset. Deterministic; pure; safe copies only.
 *
 * @param {Object} [options]
 * @param {string} [options.testRunId]
 * @param {number} [options.tenantACount] default 8
 * @param {number} [options.tenantBCount] default 6
 * @returns {Object} dataset descriptor
 */
export function createEmpresasSyntheticDataset(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const testRunId = typeof o.testRunId === 'string' ? o.testRunId : 'RUN_LOCAL_0001';
  const aCount = Number.isInteger(o.tenantACount) && o.tenantACount > 0 ? o.tenantACount : 8;
  const bCount = Number.isInteger(o.tenantBCount) && o.tenantBCount > 0 ? o.tenantBCount : 6;

  const tenantA = buildTenant('TENANT_A', 1, 'MAK_TEST_CLIENTE_A', 'erp_test_A', aCount);
  const tenantB = buildTenant('TENANT_B', 2, 'MAK_TEST_CLIENTE_B', 'erp_test_B', bCount);
  const records = [...tenantA.records, ...tenantB.records];

  return safeCloneGenericModel({
    kind: 'empresas-synthetic-dataset',
    testRunId,
    synthetic: true,
    environment: EMPRESAS_LOCAL_READ_ENVIRONMENT,
    source: 'deterministic_fixture',
    tenants: [
      { tenantId: tenantA.clienteId, erpEmpresaId: tenantA.erpEmpresaId, count: aCount },
      { tenantId: tenantB.clienteId, erpEmpresaId: tenantB.erpEmpresaId, count: bCount },
    ],
    records,
    total: records.length,
    hasSensitiveData: false,
    localOnly: true,
    sent: false,
  });
}

export default createEmpresasSyntheticDataset;
