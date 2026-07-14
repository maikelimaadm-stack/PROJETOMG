# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the capability flags and
  upstream contract versions.
- **Verifier:** checks the dev-only invariants (all forbidden capabilities false; headless, devOnly,
  isolated, syntheticDataOnly, isolatedRuntimeImplemented true) and detects React/JSX/TSX/DOM/
  CSS-runtime attempts, route/menu attempts, backend/Prisma attempts, mutation/persistence/
  production/staging attempts, real data read/write attempts, unsafe `renderAllowed:true`, a missing
  or over-broad manual gate, and an unsafe virtual frame. Never throws.
- **Compatibility:** compares upstream implementation-plan/runtime-shell/visual versions; mismatches
  are WARNINGS. It NEVER authorizes the UI runtime, route/menu integration, real module generation,
  or production; `status: ready_for_future_dev_preview_runtime_ui_contract_when_explicitly_authorized`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds no secrets.
