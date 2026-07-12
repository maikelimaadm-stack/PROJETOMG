# Runtime Projection & Parity

## Projeção (`createEmpresasRuntimeReadProjection`)

Payload compatível com runtime-v2 read model: `moduleId`, `modelType`, `items`/`records`, `total`,
`page`, `pageSize`, `sort`, `direction`, `filters`, `search`, `tenantScope`, `diagnostics`,
`fallbackMetadata`, `source: local_read_contract_pilot`. **Read-only**: `writePathTouched:false`,
`prismaAccessed:false`, `backendAccessed:false`, `fetchUsed:false`, `productionAccessed:false`.

## Paridade (`compareEmpresasReadParity`)

Compara o resultado legacy-like (repository.list) com a projeção runtime. Verifica:
contagem, IDs+ordem, total, page, pageSize, e paridade campo-a-campo por registro. Usa digest
FNV-1a (`createGenericModelChecksum`) dos itens em cada lado.

Resultado: `{ equal, score, differences[], blockers[], warnings[], legacyDigest, runtimeDigest,
safeToProceed }`.

Critério: **nenhuma divergência silenciosa** — qualquer diferença vira blocker e `safeToProceed:false`.
Nos cenários essenciais o score é **1.0** (paridade exata).
