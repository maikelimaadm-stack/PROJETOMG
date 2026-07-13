# VERIFIER & COMPATIBILITY REPORT

## Verifier

`verifyEmpresasBlueprintMirror({ mirror })` recomputa o `overallDigest`, confere a
presença de todos os digests de mirror, e reafirma as invariantes headless/reference-only
(no ui/route/menu/module/backend/prisma/production/staging/fetch/mutation e **no rewrite
of Empresas**). Retorna `{ valid, safeToUseAsMirrorReference, readiness, checks,
failures, warnings, blockers }`. Qualquer digest alterado ou flag ligada → `valid: false`.

## Compatibility checker

`checkEmpresasBlueprintMirrorCompatibility({ mirror })` classifica compatible /
partially_compatible / needs_alignment / blocked / invalid. Qualquer exposição
acidental (UI/rota/menu/módulo/backend/Prisma/mutation) ou tentativa de reescrever
Empresas resulta em `blocked`. Caso contrário, reflete a auditoria de alinhamento
(neste slice: `partially_compatible`, com next slice recomendado
`EMPRESAS STUDIO COMPATIBILITY SLICE 1`).
