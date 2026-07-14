# Quality & Scalability Notes — Studio Dev Preview Runtime UI

Part of the DEV-ONLY, ISOLATED Studio Dev Preview Runtime UI. Pure/deterministic .js core with a confined .jsx render layer; FNV-1a digests; fail-closed. The .jsx graph is kept out of the pure .js import graph so node --test stays JSX-free. Technical debt: prior slices' local branch-relative scope checks (KNOWN_PRIOR_GATE_SCOPE_LIMITATION).

This UI is dev-only and isolated; real React/JSX exists but confined to the authorized subtree;
no App wiring; no route/menu wiring; no real module; no backend/Prisma; no Empresas; no
src/modules; no production/staging; no real mutation; data is synthetic only; the old Studio
prototype was NOT imported or relinked.
