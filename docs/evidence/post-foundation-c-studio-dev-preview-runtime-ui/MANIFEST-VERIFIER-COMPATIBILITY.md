# Manifest / Verifier / Compatibility — Studio Dev Preview Runtime UI

Part of the DEV-ONLY, ISOLATED Studio Dev Preview Runtime UI. Manifest holds deterministic digests for every part. Verifier detects old-prototype import, App/pages/components import, ReactDOM/createRoot, window/document, .tsx/.css attempts, route/menu attempts, backend/prisma attempts, real mutation/navigation/submit/save, production/staging, real data read/write, forbidden-flag inversion (including domRuntimeCreated true). Compatibility never authorizes route/menu integration, real module generation or production.

This UI is dev-only and isolated; real React/JSX exists but confined to the authorized subtree;
no App wiring; no route/menu wiring; no real module; no backend/Prisma; no Empresas; no
src/modules; no production/staging; no real mutation; data is synthetic only; the old Studio
prototype was NOT imported or relinked.
