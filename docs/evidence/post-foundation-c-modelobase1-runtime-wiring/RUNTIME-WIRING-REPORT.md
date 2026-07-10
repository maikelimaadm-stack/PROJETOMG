# RUNTIME WIRING REPORT — ModeloBase1 Runtime Wiring

## Objetivo

O Direct Beta criou o read model em `config.runtimeReadModel`. Este slice faz o **engine do ModeloBase1 consumi-lo de verdade** — leitura beta read-only quando a flag liga, fallback total quando desliga.

## Ponto de integração no ModeloBase1

O **menor ponto possível**: `ModeloBase1CadastroPageContent` (o componente de conteúdo do engine), logo após `useModeloBase1Config()`.

```
const config = useModeloBase1Config();
const runtimeRead = useModeloBase1RuntimeReadModel(config);  // ← novo
```

Nenhuma reescrita do engine. O hook encapsula toda a lógica (detect/validate/resolve/apply/fallback). O engine passa a expor:
- **write block:** `blockRuntimeReadWrite(op)` gateia `handleNew`, `handleDuplicate`, `handleRequestDelete` e `guardedHandleSubmit`.
- **read state:** banner read-only beta (`data-mb1-runtime-read="beta"`) consome `runtimeRead.source`; `runtimeRead.table/form/diagnostics` ficam disponíveis para consumo.

## Como `runtimeReadModel` é validado

Duas camadas puras:

1. **Descritor** (`validateModeloBase1RuntimeReadModel`): exige `moduleId`, `moduleName`, `readOnly === true`, `injectedAt`, `source`, `resolve()`, e um write guard que **bloqueia** as 11 operações de escrita (ou `writeActionsBlocked === true`); rejeita `usesRealData === true`, funções/React/pollution no corpo de dados, e referências a backend/fetch/Prisma/storage.
2. **Payload resolvido** (`validateModeloBase1RuntimeReadPayload`): após `resolve()`, exige pureza/serializável (sem funções/handlers/React elements), sem prototype pollution, sem valores sensíveis não mascarados, sem referências proibidas.

## Como table/form são aplicados

`applyModeloBase1RuntimeReadModel({ config })` (async):
- resolve o descritor (`resolveModeloBase1RuntimeReadModel`);
- valida o descritor; se inválido → fallback;
- `await readModel.resolve()`; se lançar → fallback (`resolve-failed`);
- valida o payload; se inseguro → fallback (`unsafe-payload`);
- aplica `table` (columns/visibleColumns/rows/rowCount) e `form` (fields) via `safeClone`, marca `tableApplied`/`formApplied`, `source: 'runtime-v2-beta'`, `writeBlocked: true`, e anexa `diagnostics`.

Retorno é sempre uma **cópia segura** (plain, serializável).

## Como write é bloqueado

- No **model**: o write guard (`createEmpresasReadOnlyWriteGuard` / `createDirectBetaWriteGuard`) bloqueia create/update/delete/save/submit/bulk*/executeAction/startWorkflow/invokeConnector.
- No **engine**: quando `runtimeRead.writeBlocked`, os handlers de escrita retornam cedo (com `showInfo`), antes de qualquer chamada real. O submit real (`handleSubmit`) é envolvido por `guardedHandleSubmit`.

## Como fallback funciona

Qualquer um destes → estado de fallback (tela legada, `writeBlocked: false`, `betaApplied: false`):
`runtime-read-model-absent` · `runtime-read-model-disabled` · `invalid-read-model:*` · `resolve-failed` · `unsafe-payload:*` · `apply-error`.

Com a flag off (padrão), `resolution.present === false` → o hook retorna fallback **síncrono** (sem async, sem efeito) — engine byte-idêntico.

## Limitations

- **Fase de render:** o engine consome o read state para **write-block + diagnostics + banner + disponibilização de table/form**. A **substituição integral do grid live** (trocar as linhas do react-query pelas linhas beta) é deliberadamente deixada para a próxima fase, para não arriscar regressão na tela real — o read model resolvido já fica disponível para esse consumo.
- cadcps deriva estrutura do controlled dataset (sem descritor runtime v2 próprio ainda).

## Próximo passo recomendado

**ModeloBase1 Controlled Local Write Plan** ou **ModeloBase1 Beta UI Hardening** — evoluir o consumo do grid a partir de `runtimeRead.table/form` e, depois, introduzir write local controlado atrás de flag + write guard explícito.
