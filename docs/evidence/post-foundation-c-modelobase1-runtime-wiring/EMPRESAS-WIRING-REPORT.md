# EMPRESAS WIRING REPORT — ModeloBase1 Runtime Wiring

## Flag

`MAK_MODELOBASE1_EMPRESAS_BETA` (umbrella `MAK_MODELOBASE1_DIRECT_BETA`) — off por padrão; fail-closed em produção salvo `_ALLOW_PROD`.

## Comportamento OFF

- `/CadastroEmpresas` mantém o comportamento atual, byte-idêntico.
- `empresasModeloBase1Config` passa `runtimeReadModel: null` → o builder não anexa a chave.
- O hook `useModeloBase1RuntimeReadModel` retorna fallback síncrono (`writeBlocked: false`, `betaApplied: false`).
- Write real (criar/editar/excluir/salvar) funciona normalmente.

## Comportamento ON

- `/CadastroEmpresas` consome `config.runtimeReadModel`.
- O engine detecta/valida/resolve/aplica o read model beta:
  - `table`: colunas do descritor Empresas + linhas do controlled dataset (mock, mascarado).
  - `form`: fields do runtime v2.
  - `diagnostics`: `betaApplied`, `tableApplied`, `formApplied`, `writeBlocked`, `protectedScopes`.
  - `source: 'runtime-v2-beta'`.
- Banner read-only beta é exibido.
- **Write real bloqueado**: `handleNew`/`handleDuplicate`/`handleRequestDelete`/`guardedHandleSubmit` retornam cedo.
- Se algo falhar (resolve/validação) → fallback para a config atual (a tela não quebra).

## Read model usado

`createEmpresasModeloBase1BetaReadModel` (Direct Beta) → reutiliza:
- `createEmpresasReadOnlyViewModel` (projeção runtime v2 read-only)
- `createEmpresasControlledDataset` (dados mock mascarados)
- `createEmpresasReadOnlyWriteGuard` (11 operações bloqueadas, códigos EMP-READONLY-003)

## Fallback

Flag off / model inválido / resolve falha / payload inseguro → tela legada de Empresas, sem qualquer leitura runtime v2. Reversível por flag ou revert.

## Write guard

Ativo. `writeGuard.attempt(op)` retorna `{ ok:false, blocked:true }` para create/update/delete/save/submit/bulk*/executeAction/startWorkflow/invokeConnector.

## Limitações

- Rota, App.jsx, backend e Prisma **não** alterados.
- A substituição do grid live pela leitura beta fica para a próxima fase; nesta fase o read model é consumido para write-block + diagnostics + disponibilização de table/form + banner.
