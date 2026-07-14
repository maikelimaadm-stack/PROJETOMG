# Preflight — Studio Dev Preview Runtime UI

Part of the DEV-ONLY, ISOLATED Studio Dev Preview Runtime UI. Validates the implementation plan's manual gate, runtime UI contract + isolated runtime compatibility, virtual frame validity, and dev-only/no-production/no-staging. Fails closed in production.

This UI is dev-only and isolated; real React/JSX exists but confined to the authorized subtree;
no App wiring; no route/menu wiring; no real module; no backend/Prisma; no Empresas; no
src/modules; no production/staging; no real mutation; data is synthetic only; the old Studio
prototype was NOT imported or relinked.
