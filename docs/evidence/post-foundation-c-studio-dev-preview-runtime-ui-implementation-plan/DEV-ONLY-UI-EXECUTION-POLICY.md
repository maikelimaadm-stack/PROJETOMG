# Dev-Only UI Execution Policy — Studio Dev Preview Runtime UI Implementation Plan

Part of the HEADLESS, PLAN-ONLY Studio Dev Preview Runtime UI Implementation Plan. This document describes **planned metadata only** — it
implements nothing. No React/JSX/TSX/DOM/CSS runtime, no route/placement/menu, no module, no
backend/Prisma, no Empresas, no production/staging, no mutation, no real data. Data stays
synthetic/metadata-only. Reversible by non-consumption.

`devOnly:true`; production/staging not allowed; requires an explicit future slice, a manual gate, the runtime UI contract, the isolated runtime and the virtual frame. `policyImplemented:false`.
