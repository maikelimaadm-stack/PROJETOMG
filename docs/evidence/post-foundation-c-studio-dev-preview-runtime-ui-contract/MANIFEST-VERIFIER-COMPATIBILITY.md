# Manifest / Verifier / Compatibility / Diagnostics

- **Manifest:** self-describing digest summary of every produced part plus the capability flags and
  upstream contract versions.
- **Verifier:** checks the headless invariants (all forbidden capabilities false; headless,
  contractOnly, metadataOnly, uiContractOnly, virtualFrameDriven true) and detects React/JSX/TSX/
  DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma attempts, mutation/persistence/
  production/staging attempts, real data read/write attempts, unsafe `renderAllowed:true`,
  `bindingAllowed:true`, `handlerCreated:true`, and an unsafe UI node. Never throws.
- **Compatibility:** compares upstream isolated-runtime/implementation-plan/visual versions;
  mismatches are WARNINGS. It NEVER authorizes the UI implementation, route/menu integration, real
  module generation, or production; `status:
  ready_for_future_runtime_ui_implementation_slice_when_explicitly_authorized`.
- **Diagnostics:** passive aggregation of verification + compatibility; logs nothing, holds no secrets.
