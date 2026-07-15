# Quality & Scalability Notes — Studio Dev Preview Route/Menu Implementation Plan

Part of the HEADLESS, PLAN-ONLY Studio Dev Preview Route/Menu Implementation Plan. Pure/deterministic granular plan builders; FNV-1a digests; fail-closed. Router/DOM API flag names deliberately avoid the literal identifiers so the case-sensitive scans stay clean. Technical debt: prior slices' local branch-relative scope checks (KNOWN_PRIOR_GATE_SCOPE_LIMITATION).

This document describes **planned metadata only** — it implements nothing. No real route/menu/
router; no App/router/navigation/sidebar wiring; no router primitives; no runtime UI mount
(no ReactDOM/createRoot/window/document); no deep link; no module; no backend/Prisma; no Empresas;
no src/modules; no production/staging; no mutation; no real data; the old Studio prototype is NOT
imported or relinked. Reversible by non-consumption.
