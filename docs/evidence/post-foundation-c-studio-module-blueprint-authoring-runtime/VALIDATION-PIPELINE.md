# Validation Pipeline

`runValidationPipeline({ draft, limits })` runs 11 fixed-order, deterministic, fail-closed stages:
`shape_validation`, `identifier_validation`, `lifecycle_validation`, `field_uniqueness_validation`,
`layout_validation`, `relationship_validation`, `ssot_boundary_validation`,
`permission_tenancy_boundary_validation`, `prototype_reference_validation`, `production_flag_validation`,
`module_generation_validation`.

Issues carry `issueCode`, `severity` (`info|warning|error|blocker`), `stage`, `path`, `message`,
`deterministic:true`, `blocksPreview`, `blocksCertificationCandidate`. Issues are ordered by
stage→path→code. `maxValidationIssuesPerRun` is respected (fail-closed, no silent truncation). A
`blocker`/`error` stops preview and certification-candidate handoff. No I/O, no ambient environment.
