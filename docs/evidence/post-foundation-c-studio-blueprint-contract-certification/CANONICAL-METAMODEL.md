# CANONICAL METAMODEL

`createStudioCanonicalMetamodel()` certifica as 19 entidades conceituais do Studio,
anotadas com `safetyRules`, `allowedStatus` e `contractOnly: true`.

## Entidades (19)

StudioProject · StudioModel · StudioModule · StudioField · StudioFieldType ·
StudioScreen · StudioTable · StudioForm · StudioValidation · StudioRelationship ·
StudioPermission · StudioRoutePlan · StudioMenuPlan · StudioPersistenceBoundary ·
StudioRuntimeBinding · StudioDiagnostics · StudioGatePlan · StudioBlueprint ·
StudioVersion.

## Invariantes

Não gera schema/migration/backend/UI; não registra módulo; `contractOnly: true`.
Digest canônico determinístico.
