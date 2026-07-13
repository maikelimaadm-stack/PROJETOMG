# Manifest · Verifier · Compatibility

## Manifest
`createModuleReferencePlannerManifest` agrega os digests de cada plano
(sourceBlueprintDigest, identityPlanDigest, filePlanDigest, screenPlanDigest,
fieldTableFormPlanDigest, permissionPlanDigest, routeMenuPlanDigest, persistencePlanDigest,
runtimeBindingPlanDigest, testGatePlanDigest, evidencePlanDigest, riskPlanDigest,
readinessDecisionDigest) num `overallDigest` determinístico. `readyForRealModuleGeneration`
sempre false.

## Verifier
`verifyModuleReferencePlan` recomputa o overallDigest (tamper), exige cada digest de
plano, e afirma as invariantes: `headless=true`, todas as 13 flags de efeito colateral
`false`, `readyForRealModuleGeneration=false`, `blockers` zero. Qualquer digest alterado
ou flag invertida → `valid:false`.

## Compatibility
`checkModuleReferencePlanCompatibility` classifica: `compatible`,
`ready_for_preview_sandbox`, `needs_empresas_alignment`, `needs_registry`, `blocked`,
`invalid`. `compatibleForRealModuleGeneration` sempre false. Qualquer exposição (module
generation / file write / route / menu / backend / prisma / persistence / mutation /
rewrite Empresas), blueprint/safety inválido, campo inválido, permission aberta ou tenant
ausente → `blocked`.
