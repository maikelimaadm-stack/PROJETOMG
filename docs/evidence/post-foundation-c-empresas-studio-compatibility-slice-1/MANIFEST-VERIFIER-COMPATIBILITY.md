# MANIFEST, VERIFIER & COMPATIBILITY

## Manifest

`createEmpresasCompatibilitySlice1Manifest()` agrega os digests: gapRegistry · detailPlan ·
stateCoverage · writeCapability · persistenceBridge · backendPrismaReadiness ·
preferenceLayout. `overallDigest` determinístico; readiness
`compatibility_slice_1_complete` quando sem blockers e sem untracked critical gaps.

## Verifier

`verifyEmpresasStudioCompatibilitySlice1({ slice })` recomputa o overallDigest, confere
todos os digests, e reafirma as invariantes headless/contract-only (empresasCodeChanged
false, no ui/route/menu/module/backend/prisma/production/staging/fetch/mutation, no
rewrite Empresas, gaps tracked, untrackedCriticalGaps 0). Qualquer digest alterado ou
flag ligada → `valid: false`.

## Compatibility checker

`checkEmpresasStudioCompatibilitySlice1({ slice })` classifica
compatibility_slice_1_complete / needs_empresas_alignment / needs_ui_alignment /
needs_backend_prisma_readiness / blocked / invalid. Bloqueia: exposição de Empresas code
change/UI/route/menu/module/backend/Prisma/mutation/rewrite; gap sem plano; migration
sugerida na Slice 1; backend/Prisma tratado como mudança real.
