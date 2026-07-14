# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the frozen
  capability flags and upstream contract versions.
- **Verifier:** checks the headless invariants (all side-effect capabilities false; headless,
  contractOnly & metadataOnly true) and detects React/JSX/TSX/DOM/CSS-runtime attempts,
  route/menu attempts, backend/Prisma attempts, mutation/persistence/production/staging
  attempts, real data read/write attempts, unsafe event handlers, and unsafe `renderAllowed:true`.
  Never throws.
- **Compatibility:** compares upstream visual/bridge/engine versions; mismatches are WARNINGS,
  not blockers. It NEVER authorizes the runtime implementation, real module generation, or
  production; `status: ready_for_future_dev_preview_runtime_implementation_contract`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds no secrets.
