# Parity Digest Report

`createEmpresasParityDigest({ result, query, context })` — FNV-1a determinístico.

## Considera

IDs (ordem) · recordCount · total · ok/empty/reason · page · pageSize · sort · direction · search ·
filters · tenantId · empresaHeader · permissionOutcome.

## Resultado

`{ algorithm: 'fnv-1a', digest, normalizedInput, recordCount, tenantScopeDigest, queryDigest,
resultDigest }`.

## Propriedades (verificadas)

- mesma entrada → mesmo digest;
- ordem diferente → digest diferente;
- tenant diferente → digest diferente;
- permission outcome diferente → digest diferente;
- página diferente → digest diferente;
- nenhum secret entra no digest;
- entrada não é mutada.

## Nota técnica

`createGenericModelChecksum` recebe `{ value }`. As chamadas do digest usam `{ value: ... }` para que
o hash reflita o conteúdo real (evita hash constante).
