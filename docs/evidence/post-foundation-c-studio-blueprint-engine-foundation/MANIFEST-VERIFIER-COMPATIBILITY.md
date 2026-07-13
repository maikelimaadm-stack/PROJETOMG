# Manifest · Verifier · Compatibility

## Manifest
`createStudioBlueprintManifest({ draft, normalized, validation, safety, hardening })`
agrega os digests de cada estágio (draftDigest, normalizedDigest, validationDigest,
safetyDigest, hardeningDigest) num `overallDigest` determinístico (`fnv1a-8hex`).
Readiness `blueprint_processed` quando não há blockers; `blocked` caso contrário.

## Verifier
`verifyStudioBlueprintEngineManifest({ manifest })` recomputa o `overallDigest` (detecção
de tampering), exige a presença de cada digest de estágio, e afirma as invariantes
headless: `headless === true` e todas as 14 flags de efeito colateral `=== false`.
Qualquer digest alterado ou flag invertida → `valid: false`.

## Compatibility
`checkStudioBlueprintEngineCompatibility({ current, next })` usa o diff estrutural e
classifica:
- **invalid** — algum lado não é objeto.
- **breaking** — campo/permissão removido, campo retipado, campo tornou-se required, ou
  moduleId/modelFamily mudou → `requiresMajorVersion: true`.
- **backward_compatible** — apenas adições (campo/permissão novos) → `requiresMinorVersion`.
- **compatible** — idênticos.
