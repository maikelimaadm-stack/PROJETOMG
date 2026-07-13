# VERIFIER & COMPATIBILITY REPORT

## Verifier

`verifyStudioBlueprintContractCertification({ certification })` recomputa o
`overallDigest`, confere presença de todos os digests canônicos, exige exactSafety +
blockers/warnings zero, e reafirma as invariantes headless (no ui/route/menu/module/
backend/prisma/migration/production/staging/fetch/mutation + default-deny/fail-closed/
tenant/permission).

Retorna `{ valid, certified, status, readiness, safeToUseAsBlueprintReference, checks,
failures, warnings }`. Um pacote íntegro: `certified: true`,
`safeToUseAsBlueprintReference: true`. Qualquer digest alterado → `valid: false`.

## Compatibility checker

`checkStudioBlueprintCertificationCompatibility({ certified, candidate })` classifica
compatible / backward_compatible / conditionally_compatible / breaking / invalid.
Qualquer liberação de UI/rota/menu/backend/Prisma/migration/production/staging/fetch/
mutation, ou relaxamento de guard/safety, é **breaking** e define
`certificationInvalidated: true`.
