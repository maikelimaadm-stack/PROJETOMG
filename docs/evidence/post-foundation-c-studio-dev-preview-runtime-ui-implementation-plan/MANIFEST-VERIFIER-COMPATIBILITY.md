# Manifest / Verifier / Compatibility — Studio Dev Preview Runtime UI Implementation Plan

Part of the HEADLESS, PLAN-ONLY Studio Dev Preview Runtime UI Implementation Plan. This document describes **planned metadata only** — it
implements nothing. No React/JSX/TSX/DOM/CSS runtime, no route/placement/menu, no module, no
backend/Prisma, no Empresas, no production/staging, no mutation, no real data. Data stays
synthetic/metadata-only. Reversible by non-consumption.

Manifest holds deterministic digests for every plan part. Verifier detects runtimeUiImplemented true, React/JSX/TSX/DOM/CSS attempts, route/placement attempts, backend/prisma attempts, mutation/persistence attempts, real data read/write attempts, unsafe realRenderAllowed/componentAdapterImplemented/handlersCreated, missing manual gate and forbidden-flag inversion. Compatibility never authorizes a real implementation slice, route/placement integration, module generation or production.
