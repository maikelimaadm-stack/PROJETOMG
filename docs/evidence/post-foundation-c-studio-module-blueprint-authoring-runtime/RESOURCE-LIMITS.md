# Resource Limits

`createAuthoringResourceLimits(overrides)` builds a frozen policy with conservative defaults:
`maxDraftsPerSession:8`, `maxOperationsPerSession:500`, `maxRevisionsPerDraft:200`,
`maxFieldsPerDraft:250`, `maxLayoutSectionsPerDraft:100`, `maxRelationshipsPerDraft:250`,
`maxValidationIssuesPerRun:1000`, `maxStringLength:10000`, `maxSerializedSnapshotBytes:2_000_000`.

Overrides are accepted only as non-negative integers (invalid → default). Enforcement
(`enforceAuthoringResourceLimits`, `enforceStringLength`, `enforceSerializedSnapshotBytes`) is
**fail-closed** with a deterministic `issueCode`, **no silent truncation**, no persistence, and no
external cleanup. Discard releases only in-memory session references.
