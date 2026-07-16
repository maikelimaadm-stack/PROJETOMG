# Authoring Operation Catalog

`createAuthoringOperationCatalog()` enumerates 16 authorable FUTURE operations as **descriptors only**
(none implemented): `createDraft`, `renameDraft`, `describeDraft`, `addFieldDraft`, `updateFieldDraft`,
`removeFieldDraft`, `reorderFieldDraft`, `addLayoutSectionDraft`, `updateLayoutSectionDraft`,
`removeLayoutSectionDraft`, `addRelationshipDraft`, `removeRelationshipDraft`, `requestValidation`,
`requestSyntheticPreviewHandoff`, `requestCertificationCandidateHandoff`, `discardDraft`.

Each operation declares: `operationId`, `allowedLifecycleStates`, `forbiddenLifecycleStates`,
`requiredInputs`, `producesNewRevision`, `sideEffectsAllowed:false`, `persistenceAllowed:false`,
`moduleWriteAllowed:false`, and `requiresFutureCheckpoint`.

`anyImplemented`, `anyMutatesCertifiedContract`, `anyGeneratesModule`, `anySideEffectsAllowed`,
`anyPersistenceAllowed`, `anyModuleWriteAllowed` are all `false`.
