# CERTIFICATION MANIFEST

`createStudioBlueprintCertificationManifest()` agrega todos os digests canônicos:

metamodelDigest · blueprintContractDigest · moduleBlueprintDigest · fieldContractDigest ·
screenContractDigest · validationContractDigest · permissionContractDigest ·
routeMenuContractDigest · persistenceBoundaryDigest · runtimeBindingDigest ·
safetyInvariantsDigest · errorCatalogDigest · compatibilityRulesDigest ·
hardeningBaselineDigest.

`overallDigest = digest({ ...digests, status, exactSafety })`. Status
`certified_headless_blueprint_contract` quando exactSafety e sem blockers. Contém
manifestId, nomes/versões, todas as flags headless, e `nextSteps`.
