# CADCPS WIRING REPORT — ModeloBase1 Runtime Wiring

## Flag

`MAK_MODELOBASE1_CADCPS_BETA` (umbrella `MAK_MODELOBASE1_DIRECT_BETA`) — off por padrão; fail-closed em produção salvo `_ALLOW_PROD`.

## Comportamento OFF

- `/CadastroCamposPersonalizados` mantém o comportamento atual, byte-idêntico.
- `cadcpsModeloBase1Config` passa `runtimeReadModel: null` → builder não anexa a chave.
- Hook retorna fallback síncrono (`writeBlocked: false`, `betaApplied: false`).
- Write real funciona normalmente.

## Comportamento ON

- `/CadastroCamposPersonalizados` consome `config.runtimeReadModel` **pelo mesmo padrão base de Empresas** (mesmo resolver/validator/apply/hook do ModeloBase1).
- Aplica `table` (colunas/linhas do controlled dataset cadcps), `form` (fields), `diagnostics`.
- Banner read-only beta exibido.
- **Write real bloqueado** pelos mesmos gates do engine.
- Falha → fallback para a config atual.

## Read model usado

`createCadcpsModeloBase1BetaReadModel` (Direct Beta) → deriva um view model do `createCadcpsControlledDataset` (colunas: codigo/nome/tipo/telas/obrigatorio/ativo; required: nome/tipo; campo negado: ativo) + write guard genérico (`createDirectBetaWriteGuard`, códigos MB1-BETA-003).

## Fallback

Flag off / inválido / resolve falha / payload inseguro → tela legada de Campos, sem leitura runtime v2. Reversível por flag ou revert.

## Write guard

Ativo. Bloqueia create/update/delete/save/submit/bulk*/executeAction/startWorkflow/invokeConnector.

## Limitações

- **Nenhuma arquitetura separada** — cadcps usa exatamente o mesmo resolver/validator/apply/hook de Empresas (`src/ModeloBase1/runtime-read-model/*`).
- cadcps ainda não tem descritor table/form runtime v2 próprio; a estrutura vem do controlled dataset. Quando existir, troca-se a fonte estrutural mantendo o mesmo wiring.
- Rota, App.jsx, backend, Prisma, `framework/cadastro` (motor de campos) **não** alterados.
