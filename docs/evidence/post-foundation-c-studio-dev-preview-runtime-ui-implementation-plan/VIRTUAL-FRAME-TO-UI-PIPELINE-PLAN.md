# Virtual-Frame-to-UI Pipeline Plan — Studio Dev Preview Runtime UI Implementation Plan

Part of the HEADLESS, PLAN-ONLY Studio Dev Preview Runtime UI Implementation Plan. This document describes **planned metadata only** — it
implements nothing. No React/JSX/TSX/DOM/CSS runtime, no route/placement/menu, no module, no
backend/Prisma, no Empresas, no production/staging, no mutation, no real data. Data stays
synthetic/metadata-only. Reversible by non-consumption.

7 planned steps (loadVirtualFrame … emitSafeDiagnostics). `pipelineImplemented:false`, `realRenderAllowed:false`; a future explicit runtime UI implementation slice is required.
