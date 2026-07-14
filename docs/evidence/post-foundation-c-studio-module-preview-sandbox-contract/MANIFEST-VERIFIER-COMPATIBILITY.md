# Manifest · Verifier · Compatibility

## Manifest
`createModulePreviewSandboxManifest` agrega os digests (source blueprint/planner, session,
table/form/detail/field/action/permission preview, route-menu blocked, persistence blocked,
runtime binding, readiness) num `overallDigest` determinístico.
`readyForRealModuleGeneration`/`readyForProduction` sempre false.

## Verifier
`verifyModulePreviewSandboxContract` recomputa o overallDigest (tamper), exige cada digest,
e afirma: `headless` + `previewMetadataOnly` true, as 15 flags de efeito/UI/geração false,
`readyForRealModuleGeneration`/`readyForProduction` false, blockers zero.

## Compatibility
`checkModulePreviewSandboxCompatibility` classifica: compatible /
module_preview_sandbox_contract_ready / ready_for_dev_preview_contract /
needs_reference_plan_fix / needs_blueprint_fix / needs_empresas_alignment / needs_registry
/ blocked / invalid. Qualquer exposição (react/ui/route/menu/generation/file-write/backend/
prisma/persistence/mutation/rewrite Empresas), metadata unsafe, permission aberta ou tenant
ausente → `blocked`. `compatibleForRealModuleGeneration`/`compatibleForProduction` sempre false.
