# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the frozen
  capability flags and upstream contract versions.
- **Verifier:** checks the headless invariants (all side-effect capabilities false, headless
  & contractOnly true, metadataOnly). Never throws; returns blockers on violation.
- **Compatibility:** compares upstream sandbox/planner/engine versions; mismatches are
  WARNINGS, not blockers (graceful degradation), `blocked: false`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds
  no secrets.
