# Authoring Invariants

`createAuthoringInvariantCatalog()` declares 15 structural invariants a future runtime must uphold
(this layer enforces none at runtime):

`draft_id_deterministic`, `field_keys_unique`, `field_order_non_negative`,
`layout_section_ids_unique`, `relationship_ids_unique`, `relationship_endpoints_known`,
`no_production_flags`, `no_persistence_descriptors`, `no_backend_descriptors`,
`no_prisma_descriptors`, `no_real_data_references`, `no_app_router_menu_descriptors`,
`no_old_prototype_references`, `no_self_certification`, `no_module_generation_authorization`.

Each invariant is `mandatory:true`, `enforcedByThisLayer:false`, `requiredOfFutureRuntime:true`, with
a human-readable statement.
