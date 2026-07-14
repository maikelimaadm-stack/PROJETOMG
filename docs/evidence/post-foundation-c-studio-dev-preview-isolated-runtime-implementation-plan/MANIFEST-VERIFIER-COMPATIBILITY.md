# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the frozen
  capability flags and upstream contract versions.
- **Verifier:** checks the headless invariants (all side-effect capabilities false, including
  `runtimeImplemented`; headless, contractOnly, metadataOnly & planOnly true) and detects
  React/JSX/TSX/DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma attempts,
  mutation/persistence/production/staging attempts, real data read/write attempts, unsafe
  `renderAllowed:true`, unsafe `rolloutAllowed:true`, a missing manual gate, and implemented
  phases/adapter. Never throws.
- **Compatibility:** compares upstream runtime-shell/visual/engine versions; mismatches are
  WARNINGS, not blockers. It NEVER authorizes the implementation slice, real module generation,
  or production; `status: ready_for_future_isolated_runtime_implementation_slice_when_explicitly_authorized`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds no secrets.
