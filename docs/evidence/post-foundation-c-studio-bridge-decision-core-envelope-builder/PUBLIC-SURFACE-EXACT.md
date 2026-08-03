# Superfície pública exata

O índice público expõe exatamente 47 chaves, comparadas por igualdade de conjunto contra `PUBLIC_INDEX_EXPORT_ALLOWLIST` num teste e num check de gate dedicados.

Nenhum helper de execução parcial é exportado. Verificado explicitamente para: `executeBuilderValidationPipeline`, `BOUNDARY_STAGE_VALIDATORS`, `PIPELINE_STAGE_PROOF_MATRIX`, `evaluateBuilderCompatibilitySnapshot`, `digestManifestParts`, `MANIFEST_PART_NAMES`, `IDENTITY_ARCHITECTURE`, `BuilderIssueConstructionError`, `extractBridgeDecisionCore`, `recomputeBridgeDecisionDigest`, `constructCoreEnvelope`, `makeIssue`, `normalizeIssues`, `safeCloneAndNormalize`, `normalizeBuilderConfig`, `validateTargetDescriptor`, `createBuilderDecision`, `createBuilderRejection`, `createEmergencyBuilderRejection`.

Nenhum test seam existe no índice — os testes importam módulos internos diretamente por caminho.

O verificador de compatibilidade separa três afirmações em vez de uma só:

- `contractSnapshotExact` — snapshot vs upstreams;
- `factorySurfaceExact` — resultado vivo da factory é exatamente `{ build }`;
- `publicIndexSurfaceVerifiedByDedicatedTestAndGate` — a superfície do índice é verificada fora do verificador, porque importá-lo de dentro criaria ciclo de módulo.
