# Relationship Draft Descriptor

`createRelationshipDraftDescriptor(...)` — metadata only. No foreign key, join, query, cascade, or
persistence; no real relationship created.

Fields: `relationshipId`, `sourceDraftEntity`, `targetDraftEntity`, `relationshipKind`,
`cardinality` (one of `one_to_one|one_to_many|many_to_one|many_to_many|unknown`), `required`,
`cascadePolicy:'none'`, `resolved:false`, `synthetic:true`, `canonical:false`,
`foreignKeyCreated:false`, `joinCreated:false`, `queryCreated:false`, `persisted:false`,
`relationshipDraftDigest`.
