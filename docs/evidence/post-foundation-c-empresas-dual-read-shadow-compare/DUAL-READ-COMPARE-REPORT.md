# DUAL READ COMPARE REPORT — EMPRESAS

## Objetivo

Entregar o primeiro mecanismo de comparação dual-read passiva para Empresas: medir divergências entre o snapshot legado e o snapshot runtime v2 read-only, de forma determinística, segura, reversível e sem side effects — sem alterar nada em produção, sem write, sem substituir a tela real.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE_ALLOW_PROD` (documentado, fail-closed por padrão).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`
- `legacySnapshot: null`, `runtimeV2Snapshot: null`
- diagnostics informam `flagStatus: 'off'`.

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'dual_read_shadow_compare'`
- gera snapshot legado normalizado + snapshot runtime v2 normalizado
- compara ambos, classifica differences, calcula summary + parityStatus
- write guard permanece ativo; nenhuma execução real.

## Legacy snapshot

- `sourceRuntime: 'legacy'`
- projection `runtime: 'legacy'` (tipos crus) + controlled dataset rows (mock, mascarado)
- normalizado para a forma dual-read compartilhada (table/columns/rows/form/fields/permissions/validations/actions/metadata/diagnostics)
- aceita snapshot injetado via `options.snapshot`.

## Runtime v2 snapshot

- `sourceRuntime: 'runtime-v2'`
- reusa `createEmpresasReadOnlyViewModel` (tipos canônicos, controlled dataset)
- inclui `writeGuard` + `blockedOperations`
- normalizado para a mesma forma.

## Comparison model

Compara: moduleId, table/form existence, columns, visibleColumns, row shape/count, fields, visibleFields, validations, permissions, actions, blocked operations (safety). Cada diferença: `id`, `path`, `category`, `severity`, `legacyValue`, `runtimeV2Value`, `message`, `recommendedAction`, `blocking`, `gate`.

## parityStatus

- `parity` — 0 diferenças
- `acceptable_drift` — diferenças sem critical/blocking
- `blocked` — há critical/blocking

## Differences / diagnostics

- summary agrega `totalDifferences`, `criticalCount`, `highCount`, `mediumCount`, `lowCount`, `infoCount`, `blockingCount`, `parityStatus`.
- diagnostics informam flag/snapshot/compare status, difference summary, readiness, rollback status, write guard status, limitations, warnings, noSideEffects.

## Blocked operations

`create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `save`, `submit`, `executeAction`, `startWorkflow`, `invokeConnector` — write guard ativo herdado do read-only candidate.

## Limitations

- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- nunca substitui a tela real
- nunca vira a fonte da verdade
- não remove/altera o runtime legado
- reversível por flag off.

## Next allowed step

- **Empresas Guarded Read UI Slice** quando `parity`/`acceptable_drift` (sem critical/blocking).
- **Empresas Dual Read Drift Resolution** quando `blocked`.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
