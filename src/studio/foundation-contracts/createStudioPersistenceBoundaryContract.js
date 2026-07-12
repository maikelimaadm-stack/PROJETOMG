import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

export const STUDIO_PERSISTENCE_STATES = [
  'noPersistence', 'memoryOnly', 'localReadOnly', 'localWriteDraft',
  'stagingReadOnly', 'stagingWriteControlled', 'productionRead', 'productionWriteControlled',
];

const STATE_SPEC = {
  noPersistence: { allowed: [], prohibited: ['any write'], requirements: [], gates: [] },
  memoryOnly: { allowed: ['in-memory draft'], prohibited: ['real I/O'], requirements: ['unit test'], gates: [] },
  localReadOnly: { allowed: ['synthetic local read'], prohibited: ['mutation', 'network'], requirements: ['no-network gate'], gates: ['g423-empresas-local-read-only-contract-pilot'] },
  localWriteDraft: { allowed: ['synthetic CRUD with testRunId'], prohibited: ['real data'], requirements: ['cleanup by id'], gates: [] },
  stagingReadOnly: { allowed: ['isolated staging read'], prohibited: ['mutation'], requirements: ['environment gate'], gates: [] },
  stagingWriteControlled: { allowed: ['synthetic CRUD in staging'], prohibited: ['production'], requirements: ['flag + rollback'], gates: [] },
  productionRead: { allowed: ['controlled production read'], prohibited: ['write'], requirements: ['explicit approval'], gates: [] },
  productionWriteControlled: { allowed: ['write with dedicated policy'], prohibited: ['no approval'], requirements: ['approval + dedicated gate'], gates: [] },
};

/**
 * The Persistence Boundary contract. Pure. Default noPersistence; schema/migration/
 * prisma/backend/mutation all off by default; production write requires an explicit
 * future plan; real data is never a fixture.
 *
 * @param {Object} [options]
 * @returns {Object} persistence boundary contract descriptor
 */
export function createStudioPersistenceBoundaryContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const body = {
    kind: 'studio-persistence-boundary-contract',
    states: [...STUDIO_PERSISTENCE_STATES],
    stateSpec: STATE_SPEC,
    defaultState: 'noPersistence',
    defaults: {
      schemaAllowed: false, migrationAllowed: false, prismaAllowed: false,
      backendAllowed: false, mutationAllowed: false,
    },
    realDataAsFixture: false,
    automaticSchemaOrMigration: false,
    productionWriteRequiresExplicitFuturePlan: true,
    rules: [
      'default noPersistence', 'schema/migration/prisma/backend/mutation off by default',
      'productionWriteControlled requires an explicit future plan',
      'real data is never a fixture', 'no automatic schema/migration',
    ],
  };
  return safeCloneGenericModel({ ...body, persistenceBoundaryDigest: createStudioContractDigest({ value: { states: STUDIO_PERSISTENCE_STATES, defaults: body.defaults } }) });
}

export default createStudioPersistenceBoundaryContract;
