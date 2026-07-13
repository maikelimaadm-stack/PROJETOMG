# EMPRESAS MIRROR MANIFEST

`createEmpresasBlueprintMirrorManifest()` agrega os digests dos mirrors:

fieldDigest · screenDigest · tableFormDigest · filterSortDigest · permissionDigest ·
tenantDigest · persistenceBoundaryDigest · runtimeBindingDigest · alignmentAuditDigest.

`overallDigest = mirrorDigest({ ...digests, readiness })`. Readiness
`blueprint_mirror_created` quando não há blockers. Contém manifestId, versões (mirror /
studio blueprint / empresas read), sourceModule/modelType/modelFamily, e todas as flags
headless/reference-only (uiCreated/routeCreated/menuCreated/moduleRegistered/
backendAccessed/prismaAccessed/productionAccessed/stagingAccessed/fetchUsed/
mutationAllowed/rewriteEmpresas — todas false).
