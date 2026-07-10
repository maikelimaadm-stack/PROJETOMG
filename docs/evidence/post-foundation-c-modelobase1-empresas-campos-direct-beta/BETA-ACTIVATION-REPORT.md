# BETA ACTIVATION REPORT — ModeloBase1 Empresas/Campos Direct Beta

## O que foi ativado

A **primeira ativação beta direta** do ModeloBase1 para Empresas e Campos Personalizados:

- Um **ponto de injeção** runtime v2 read model no ModeloBase1 (`config.runtimeReadModel`), aditivo e no-op quando ausente.
- **Cadastro de Empresa** conectado a um read model runtime v2 beta (read-only) atrás de `MAK_MODELOBASE1_EMPRESAS_BETA`.
- **Campos Personalizados** conectado ao mesmo padrão atrás de `MAK_MODELOBASE1_CADCPS_BETA`.
- Umbrella `MAK_MODELOBASE1_DIRECT_BETA` liga as duas.
- **Fallback total** quando as flags estão off (byte-idêntico ao pré-slice).

**Fase 1 — passiva:** o read model é injetado e inspecionável (`readModeloBase1RuntimeReadModel`), mas o engine ainda **não** renderiza a partir dele — isso é a Fase 2 (ModeloBase1 Runtime Wiring). Isso garante fallback 100% seguro nesta fase.

## Read-only

- Empresas: reutiliza o **Empresas Read-Only Candidate** (view model runtime v2) + **controlled dev dataset** + o **write guard read-only** existente (11 operações bloqueadas, códigos `MAK-L3-EMP-READONLY-003`).
- Campos: view model derivado do **controlled dataset cadcps** + write guard genérico (`MAK-L3-MB1-BETA-003`).
- Nenhum caminho de escrita. Nenhum dado real. Nenhum backend/Prisma/fetch/storage.

## Escopo autorizado respeitado

- **Alterado:** `src/ModeloBase1/config/*` (ponto de injeção), `src/modules/empresas/config/*` e `src/modules/cadcps/config/*` (wiring), `src/runtime/*` (módulo beta + barrel), `scripts/gates/*`, `package.json`, `docs/evidence/*`.
- **Intocado:** backend, APIs (`src/apis`), Prisma, schema, `src/framework`, `src/modules/makBootstrap/runtimeBridge`, makBootstrap global, Studio, Marketplace, BOS, outras telas de módulos, `src/App.jsx`, CSS global, auth global, SSOT.
- Gate de escopo (check 17) e gate de paths proibidos (check 18) confirmam mecanicamente.

## Validação (regressão completa)

| Item | Resultado |
|---|---|
| `gate:g423-modelobase1-direct-beta` (novo) | ✅ 25/25 |
| `gate:g423-empresas-read-slot` | ✅ 26/26 |
| `gate:g423-empresas-bridge-dry-run` | ✅ 23/23 |
| `gate:g423-empresas-read-ui-parity-hardening` | ✅ 23/23 |
| `gate:g423-empresas-guarded-read-ui-overlay` | ✅ 21/21 |
| `gate:g423-empresas-guarded-read-ui` | ✅ 21/21 |
| `gate:g423-empresas-dual-read` | ✅ 21/21 |
| `gate:g423-empresas-readonly` | ✅ 19/19 |
| `gate:g423-migration-first-module` | ✅ 18/18 |
| `gate:g423-shadow-empresas` / `-table-form` | ✅ 13/13 · 13/13 |
| `gate:g423-preview-*` (empresas/dev/harness/hub/dataset/route/route-mount/route-activation) | ✅ todos verdes |
| `gate:g423-second-module-shadow` | ✅ 20/20 |
| `gate:g423` (master) | ✅ 7/7 |
| `test:runtime` | ✅ 1126/1126 (58 suites) |
| `lint` | ✅ exit 0 |
| `build` | ✅ exit 0 |

> Nota: os gates anteriores usam o guard compartilhado `productionUiGuard.mjs`, que ganhou um **modo de escopo autorizado** tolerando apenas as 2 configs beta (aditivo, sem tokens proibidos, ainda consumidor ModeloBase1). Todos continuaram verdes — a proteção sobre qualquer outro arquivo de produção permanece intacta.

## Flags (resumo)

| Flag | Default | Produção |
|---|---|---|
| `MAK_MODELOBASE1_EMPRESAS_BETA` | off | fail-closed (salvo `_ALLOW_PROD`) |
| `MAK_MODELOBASE1_CADCPS_BETA` | off | fail-closed (salvo `_ALLOW_PROD`) |
| `MAK_MODELOBASE1_DIRECT_BETA` (umbrella) | off | fail-closed (salvo `_ALLOW_PROD`) |

## Próximo passo

**Fase 2 — ModeloBase1 Runtime Wiring:** fazer o engine ModeloBase1 consumir `config.runtimeReadModel` para renderizar a leitura (tabela/form) via runtime v2 quando a flag ligar, mantendo o fallback. Depois: Campos unified, write local controlado, persistência, hardening.
