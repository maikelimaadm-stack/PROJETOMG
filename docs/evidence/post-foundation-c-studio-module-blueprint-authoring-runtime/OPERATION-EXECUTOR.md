# Operation Executor

`executeAuthoringOperation({ session, operation })` executes ONLY the 16 allow-listed operations:
`createDraft`, `renameDraft`, `describeDraft`, `addFieldDraft`, `updateFieldDraft`, `removeFieldDraft`,
`reorderFieldDraft`, `addLayoutSectionDraft`, `updateLayoutSectionDraft`, `removeLayoutSectionDraft`,
`addRelationshipDraft`, `removeRelationshipDraft`, `requestValidation`, `requestSyntheticPreviewHandoff`,
`requestCertificationCandidateHandoff`, `discardDraft`.

Each operation validates lifecycle, inputs and resource limits, produces a NEW immutable snapshot,
increments the revision only for revision-producing operations, never mutates the previous snapshot,
and emits a deterministic operation receipt — with NO side effects. An **unknown operation fails
closed** (`AUTHORING_RUNTIME_UNKNOWN_OPERATION`, no revision increment, no partial state). Discard is
terminal (further mutable ops rejected).
