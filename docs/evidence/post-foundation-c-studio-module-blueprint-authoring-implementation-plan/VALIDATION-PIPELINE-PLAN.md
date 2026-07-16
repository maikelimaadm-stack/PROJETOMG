# Validation Pipeline Plan

`createValidationPipelinePlan()` plans 11 deterministic, fail-closed stages: `shape_validation`,
`identifier_validation`, `lifecycle_validation`, `field_uniqueness_validation`, `layout_validation`,
`relationship_validation`, `ssot_boundary_validation`, `permission_tenancy_boundary_validation`,
`prototype_reference_validation`, `production_flag_validation`, `module_generation_validation`.

`failClosed:true`, `deterministicIssues:true`, `blockerStopsPreview:true`,
`blockerStopsCertificationCandidate:true`. Severities: `info|warning|error|blocker`.
Not implemented in this slice.
