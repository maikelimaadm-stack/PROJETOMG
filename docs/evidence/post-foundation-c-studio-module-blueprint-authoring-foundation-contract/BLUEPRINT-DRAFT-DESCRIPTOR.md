# Blueprint Draft Descriptor

`createBlueprintDraftDescriptor(...)` describes a **temporary, NON-CANONICAL** authoring draft. It
aggregates field/layout/relationship draft descriptors under a deterministic `draftId`.

Fields: `draftId`, `draftVersion`, `draftName`, `draftLabel`, `draftDescription`, `moduleIntent`,
`schemaVersion`, `lifecycleState`, `revision`, `synthetic:true`, `canonical:false`, `certified:false`,
`generated:false`, `registered:false`, plus uniqueness flags (`fieldKeysUnique`, `sectionIdsUnique`,
`relationshipIdsUnique`) and the nested descriptor arrays.

A draft is NEVER canonical, NEVER certified/generated/registered, NEVER self-certifies, NEVER
overwrites the certified contract, NEVER registers a module, NEVER generates files, NEVER publishes.
