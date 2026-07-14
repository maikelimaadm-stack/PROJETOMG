# Runtime UI Session — Studio Dev Preview Runtime UI

Part of the DEV-ONLY, ISOLATED Studio Dev Preview Runtime UI. Deterministic dev-only session: stable sessionId, upstream version references, mode dev_only_isolated_runtime_ui, devOnly/isolated/syntheticDataOnly/virtualFrameDriven true, no storage/fetch/persistence/side-effects.

This UI is dev-only and isolated; real React/JSX exists but confined to the authorized subtree;
no App wiring; no route/menu wiring; no real module; no backend/Prisma; no Empresas; no
src/modules; no production/staging; no real mutation; data is synthetic only; the old Studio
prototype was NOT imported or relinked.
