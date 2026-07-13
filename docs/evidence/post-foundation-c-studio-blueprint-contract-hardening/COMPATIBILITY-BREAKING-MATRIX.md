# COMPATIBILITY BREAKING MATRIX

`createStudioCompatibilityBreakingMatrix()` — 22 cenários; `allMatched: true`.
`invalidClassification: invalid`, `identicalClassification: compatible`.

## Breaking (força major version)

ui/route/menu/production/backend/prisma/migration/fetch/mutation/generatedModule/
marketplace false→true · defaultDeny/failClosed/tenantRequired/permissionRequired
true→false · delete default false→true · protected editable false→true ·
error code removido · blueprint status removido · metamodel entity removida ·
contractVersion alterado sem política · persistence default vira write.

## Backward compatible (minor)

optional field disabled adicionado · novo error code · planned field type disabled ·
planned screen kind disabled.

`classifyStudioCompatibility(current, next)` estende o compatibility checker da fundação.
