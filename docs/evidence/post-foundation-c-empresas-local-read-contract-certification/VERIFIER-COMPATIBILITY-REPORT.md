# Verifier & Compatibility Report

## Verifier (`verifyEmpresasLocalReadCertification`)

Recomputa o `overallDigest` a partir dos digests do manifesto e checa 24+ invariantes. Qualquer
digest alterado → `overall-digest-matches` falha → `certified: false`. Exige exactParity, parityScore
1.0, zero blockers, no-leak/no-bypass/no-mutation e todos os flags read-only/local. Retorna
`{ valid, certified, status, checks[], failures[], safeToUseAsReference, nextSteps }`.

## Compatibility checker (`checkEmpresasContractCompatibility`)

Classifica candidato vs. certificado: **compatible / backward_compatible / breaking**.

Breaking (invalida certificação, exige major): remoção de campo obrigatório; mudança de identifier/
tenant field; shrink de allowlist de sort/filter; mudança de envelope; mudança de paginação; e
**qualquer** relaxamento de safety (mutation liberada, read-only removido, production/backend/prisma/
fetch abertos).

Backward compatible (minor): campo opcional adicionado; allowlist ampliada.
