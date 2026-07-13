# CANONICAL BLUEPRINT CONTRACT

`createStudioCanonicalBlueprintContract()` certifica o envelope + os 7 estados de
ciclo de vida.

## Envelope

blueprintId · blueprintVersion · blueprintType · status · owner · modelFamily ·
modelType · module · fields · screens · validations · permissions · routeMenu ·
persistenceBoundary · runtimeBinding · diagnostics · gates · compatibility ·
publicationPolicy · safetyPolicy.

## Estados canônicos

draft · validated · previewable · certified_local · ready_for_staging · blocked ·
deprecated.

## Regras

draft não registra módulo · validated não entra em produção · previewable continua
dev/beta/sandbox · certified_local não é produção · ready_for_staging não acessa
staging automaticamente · blocked falha fechado · deprecated não gera módulo novo.
`anyStateRegistersModule: false`, `anyStateAllowsProduction: false`.
