# BLUEPRINT INVALID CASE MATRIX

`createStudioBlueprintInvalidCaseMatrix()` — 22 cenários; todos bloqueados
(`allBlocked: true`). Pure, sem efeitos colaterais.

## Casos

null · undefined · string · array · function · prototype pollution ·
missing blueprintId/blueprintVersion/blueprintType · invalid status ·
invalid modelFamily · missing/invalid modelType · missing module ·
fields not array · missing permissions · missing persistenceBoundary ·
missing runtimeBinding · unknown keys (strict) · circular reference ·
oversized blueprint (> limite local) · dangerous defaults.

## Resultado por cenário

`valid:false`, `blocked:true`, `safeToUse:false`, `sideEffects:false`,
`noUi/noRoute/noMenu/noBackend/noPrisma/noMigration/noProduction/noMutation/noFetch:true`,
`errorCode` tipado, `reasons` sanitizadas.

`evaluateStudioBlueprintValidity(blueprint, { strict })` é o classificador reutilizável.
Circular reference e função são detectadas de forma segura (sem executar / sem estourar).
