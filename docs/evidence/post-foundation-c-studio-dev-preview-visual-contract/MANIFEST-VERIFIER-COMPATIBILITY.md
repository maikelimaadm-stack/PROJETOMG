# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the frozen
  capability flags and upstream contract versions.
- **Verifier:** checks the headless invariants (all side-effect capabilities false; headless,
  contractOnly & metadataOnly true) and detects React/JSX/TSX/DOM/CSS-runtime attempts,
  route/menu attempts, backend/Prisma attempts, mutation/persistence/production/staging
  attempts, unknown/forbidden placeholder kinds and unsafe interactions. Never throws.
- **Compatibility:** compares upstream bridge/sandbox/engine versions; mismatches are WARNINGS,
  not blockers (graceful degradation). It NEVER authorizes the visual runtime, real module
  generation, or production; `status: ready_for_future_dev_preview_visual_runtime_contract`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds no secrets.
