# READONLY CANDIDATE REPORT — EMPRESAS

## Objetivo

Entregar o primeiro candidato real de **leitura** do runtime v2 para Empresas: uma camada que produz um modelo read-only do módulo, reutilizando projection/preview/dataset/shadow já existentes, protegida por feature flag e com write real impossível. Não substitui a tela real, não vira fonte da verdade, não altera backend/Prisma, não remove o runtime legado.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_READONLY`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_READONLY_ALLOW_PROD` (documentado, fail-closed por padrão).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`
- `viewModel: null`
- `source: 'skipped'`
- diagnostics informam `flagStatus: 'off'`
- nenhuma UI/rota/menu alterada; nenhum backend; nenhum write.

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed)
- diagnostics informam `flagStatus: 'blocked-in-production'`

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'read_only_candidate'`
- gera `viewModel` read-only (table + form + rows controladas)
- write actions/workflows aparecem como **bloqueadas** (metadata)
- sem execução real.

## View model

- **table:** columns, visibleColumns, rows (controlled dataset), rowCount
- **form:** fields, visibleFields, permissionsApplied
- **permissions/validations:** metadata por campo
- **actions/workflows:** metadata com `blocked: true`
- **writeActionsBlocked:** true
- **datasetDiagnostics:** resumo do dataset controlado (mascarado)
- **emptyState:** informado quando sem linhas (structural-only)
- **source:** `controlled-dev-dataset` (ou `structural-only` quando `includeRows:false`)
- **sem React element, sem handler com side effect, sem dados reais.**

## Diagnostics

- flag status · readiness status (`read_only_candidate`) · source status · projection status · dataset status · shadow status
- blocked operations (11) + count
- limitations · warnings · differences
- rollback status (`available`)
- dados sensíveis mascarados.

## Blocked operations

`create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `save`, `submit`, `executeAction`, `startWorkflow`, `invokeConnector` — todas bloqueadas com código estruturado. Ver `WRITE-GUARD-REPORT.md`.

## Limitations

- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais, sem backend, sem Prisma/MMM
- nunca substitui a tela real de Empresas
- nunca vira a fonte da verdade
- não remove nem altera o runtime legado
- reversível por flag off.

## Next allowed step

**Post-Foundation C — Empresas Dual Read Shadow Compare**, condicionado a: read-only candidate PASS, writeGuard PASS, route activation PASS, preview hub PASS, controlled dataset PASS, Empresas shadow PASS, Empresas table/form shadow PASS, migration planning PASS, rollback available, sem blockers críticos.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- remover o runtime legado
- alterar backend/Prisma
- Studio/Marketplace
- iniciar Foundation D/E.
