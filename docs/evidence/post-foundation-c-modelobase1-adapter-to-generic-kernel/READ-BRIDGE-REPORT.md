# READ BRIDGE REPORT

## ModeloBase1 runtimeReadModel → GenericModelReadModel
`mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel, moduleId, source })`:
- Sanitiza table/form (dropa fn/React, mascara sensível) via `sanitizeGenericModelPayload`.
- Constrói `GenericModelReadModel` (`modelId:modelobase1`, `modelType:cadastro`, `source`, `table:{columns,rows}`, `form:{fields}`, diagnostics/safety/fallback).
- Valida via `validateGenericModelReadModel`.
- **Inválido → retorna `fallback`** (createGenericModelFallback).

## GenericModelReadModel → ModeloBase1 state
`mapGenericModelReadToModeloBase1State({ readModel, writeBlocked })`:
- Reconstrói `{ moduleId, betaApplied, writeBlocked, source, table:{columns,visibleColumns,rows,rowCount}, form:{fields,visibleFields}, fallbackApplied, fallbackReason }`.
- **Preserva o shape esperado pelo ModeloBase1** (visibleColumns/visibleFields derivados; rowCount consistente).
- Sem read model → estado read-only de fallback.

## Validação
Usa `validateGenericModelReadModel` + `createGenericModelReadContract` + `sanitizeGenericModelPayload`. table/form opcionais mas coerentes; sem fn/React/pollution/target.

## Fallback
runtimeReadModel ausente/inválido → `createGenericModelFallback` (fallbackApplied, reversível). A tela continua no fluxo atual do ModeloBase1.

## Limitações
- Não perde compatibilidade: rows/columns/fields preservam shape.
- O adapter NÃO é usado pela UI ainda (fluxo atual permanece).
