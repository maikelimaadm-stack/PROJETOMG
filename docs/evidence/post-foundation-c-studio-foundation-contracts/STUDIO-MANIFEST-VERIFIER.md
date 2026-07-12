# STUDIO MANIFEST & VERIFIER

## Manifest

`createStudioContractManifest(...)` agrega os digests de cada sub-contrato:

`foundationDigest`, `metamodelDigest`, `blueprintDigest`, `moduleBlueprintDigest`,
`fieldBlueprintDigest`, `screenBlueprintDigest`, `validationBlueprintDigest`,
`permissionBlueprintDigest`, `routeMenuDigest`, `persistenceBoundaryDigest`,
`runtimeBindingDigest`, `safetyPolicyDigest`, `diagnosticsDigest`.

O `overallDigest = digest({ ...digests, status })`. Status
`foundation_contract_ready` quando `blockers.length === 0`.

## Verifier

`verifyStudioFoundationContracts({ foundation })`:

1. Checa versão, presença e forma de cada sub-contrato.
2. Confere que todos os digests estão presentes.
3. **Recomputa** o `overallDigest` e compara — digest adulterado ⇒ inválido
   (detecção de tampering).
4. Reafirma as invariantes headless (no-ui/route/menu/backend/prisma/migration/
   fetch/production/mutation/module-registration, default-deny, fail-closed,
   blockers=0).

Retorna `{ valid, status, readiness, checks, failures, warnings,
safeToUseAsFoundationReference }`. Um pacote íntegro tem `valid: true`,
`status: 'foundation_contract_ready'` e `safeToUseAsFoundationReference: true`.
