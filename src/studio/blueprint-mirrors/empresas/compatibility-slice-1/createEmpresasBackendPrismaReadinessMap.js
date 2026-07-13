import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Documental-only readiness map for the Empresas backend/Prisma reality. Pure. Reads
 * nothing from a database, executes no Prisma, calls no backend, uses no secrets. The
 * Prisma schema may be read as TEXT elsewhere but is never altered or executed.
 */
const ITEMS = [
  { item: 'existingBackendApi', currentState: 'present (Fastify REST /api/empresas)', evidenceSource: 'mirror persistence + module docs', confidence: 'high', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
  { item: 'existingPrismaSchema', currentState: 'present (Empresa model, tenant unique constraints)', evidenceSource: 'backend/prisma/schema.prisma (text only)', confidence: 'high', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
  { item: 'existingRestApi', currentState: 'present (paginated list envelope)', evidenceSource: 'empresas-local-read-contract@1.0.0', confidence: 'high', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
  { item: 'existingJwt', currentState: 'present (tokenStore, multiempresa claims)', evidenceSource: 'module docs (documented)', confidence: 'medium', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
  { item: 'existingTenantColumns', currentState: 'present (cliente_id + unique constraints)', evidenceSource: 'read contract tenant fields', confidence: 'high', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
  { item: 'existingPermissionModel', currentState: 'present (PermissaoEmpresa, documented)', evidenceSource: 'module docs', confidence: 'medium', requiresMigration: false, requiresBackendChange: false, requiresPrismaChange: false },
];

/**
 * Builds the backend/Prisma readiness map (documentation only). Pure. Slice 1 keeps
 * every `requiresMigration` false; real backend/Prisma changes are deferred to a
 * dedicated future readiness slice.
 *
 * @param {Object} [options]
 * @returns {Object} backend/Prisma readiness map
 */
export function createEmpresasBackendPrismaReadinessMap(options = {}) {
  void options;
  const items = ITEMS.map((i) => ({
    ...i,
    risk: i.confidence === 'high' ? 'low' : 'medium',
    futureSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 6',
  }));

  const body = {
    kind: 'empresas-backend-prisma-readiness-map',
    items,
    itemCount: items.length,
    knownPersistenceRisks: [
      'aligning to Studio noPersistence default would wrongly imply removing production persistence',
      'any write path must preserve tenant isolation + fail-closed permissions',
    ],
    futureReadinessChecks: ['schema drift check (text-only)', 'tenant constraint audit', 'permission model audit', 'staging environment readiness'],
    futureAllowedChanges: ['documented readiness (contract-only)'],
    futureForbiddenChanges: ['migration in Slice 1', 'auto schema change', 'production write', 'real backend/prisma access'],
    requiresMigration: false,
    prismaExecuted: false,
    backendCalled: false,
    databaseRead: false,
    usesSecrets: false,
    schemaAlteredThisSlice: false,
    alignmentStatus: 'documented_readiness_only',
  };
  return safeCloneGenericModel({ ...body, backendPrismaReadinessDigest: compatDigest({ items: items.map((i) => [i.item, i.confidence]) }) });
}

export default createEmpresasBackendPrismaReadinessMap;
