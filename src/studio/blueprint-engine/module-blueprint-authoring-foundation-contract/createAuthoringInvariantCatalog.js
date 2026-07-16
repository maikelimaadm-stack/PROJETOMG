import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_INVARIANT_IDS, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/** Human-readable statements for each declared invariant (metadata only). */
const INVARIANT_STATEMENTS = Object.freeze({
  draft_id_deterministic: 'A draft id is a pure function of its moduleId; same input -> same id.',
  field_keys_unique: 'Field draft keys are unique within a draft.',
  field_order_non_negative: 'Field draft order indices are integers >= 0.',
  layout_section_ids_unique: 'Layout section ids are unique within a draft.',
  relationship_ids_unique: 'Relationship draft ids are unique within a draft.',
  relationship_endpoints_known: 'Every relationship draft references known endpoints.',
  no_production_flags: 'No descriptor carries a production/staging flag set true.',
  no_persistence_descriptors: 'No descriptor declares persistence.',
  no_backend_descriptors: 'No descriptor declares backend access.',
  no_prisma_descriptors: 'No descriptor declares Prisma access.',
  no_real_data_references: 'No descriptor binds to real data.',
  no_app_router_menu_descriptors: 'No descriptor declares App/router/menu wiring.',
  no_old_prototype_references: 'No descriptor references the old Studio prototype paths.',
  no_self_certification: 'A draft can never self-certify or overwrite the certified contract.',
  no_module_generation_authorization: 'No descriptor authorizes module generation or file writes.',
});

/**
 * The AUTHORING INVARIANT CATALOG — enumerates the structural invariants the foundation declares over
 * any future authoring draft. Descriptors only; this layer enforces nothing at runtime — it states the
 * invariants a future runtime slice must uphold. Metadata only. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createAuthoringInvariantCatalog() {
  const invariants = AUTHORING_INVARIANT_IDS.map((id) => ({
    id,
    kind: 'authoring-invariant-descriptor',
    statement: INVARIANT_STATEMENTS[id] ?? `Invariant: ${id}`,
    mandatory: true,
    enforcedByThisLayer: false,
    requiredOfFutureRuntime: true,
  }));

  const core = {
    kind: 'authoring-invariant-catalog',
    invariants,
    invariantIds: [...AUTHORING_INVARIANT_IDS],
    invariantCount: invariants.length,
    allMandatory: true,
    enforcedByThisLayer: false,
    catalogOnly: true,
  };
  return safeCloneGenericModel({ ...core, invariantCatalogDigest: authoringFoundationDigest(core) });
}

export default createAuthoringInvariantCatalog;
