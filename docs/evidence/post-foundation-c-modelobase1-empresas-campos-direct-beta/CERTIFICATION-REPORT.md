# Post-Foundation C — Certification Report — ModeloBase1 Empresas/Campos Direct Beta

**Slice:** Post-Foundation C — ModeloBase1 Empresas/Campos Direct Beta Activation
**Branch:** `claude/post-foundation-c-modelobase1-empresas-campos-direct-beta`
**Área/Módulos:** Cadastro de Empresa · Campos Personalizados (cadcps) · ModeloBase1 · runtime v2

## Objetivo

Primeira **ativação beta direta** do ModeloBase1 para Empresas e Campos Personalizados:

1. Adicionar um ponto de injeção runtime v2 / read model no ModeloBase1.
2. Conectar o Cadastro de Empresa a um read model runtime v2 beta quando a flag beta estiver ligada.
3. Conectar Campos Personalizados ao mesmo padrão beta quando a flag beta estiver ligada.
4. Manter **fallback total** para o comportamento atual quando a flag estiver desligada.

**Read-only nesta fase** — nenhuma escrita, sem backend/Prisma/schema, sem runtimeBridge global, sem outras telas.

## Arquivos criados

| File | Papel |
|---|---|
| `src/runtime/modelobase1-direct-beta/errors.js` | Erro tipado + códigos MAK-L3-MB1-BETA-001..007 |
| `src/runtime/modelobase1-direct-beta/modeloBase1DirectBetaConfig.js` | Flags `MAK_MODELOBASE1_EMPRESAS_BETA` / `MAK_MODELOBASE1_CADCPS_BETA` / umbrella `MAK_MODELOBASE1_DIRECT_BETA` (+ `_ALLOW_PROD`); resolvers `is*Enabled` / `is*ProductionBlocked` |
| `src/runtime/modelobase1-direct-beta/createModeloBase1DirectBetaReadModel.js` | Fábrica genérica do descritor injetável + `resolve()` assíncrono (finalize: safeClone + reattach do write guard) |
| `src/runtime/modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js` | Read model beta de Empresas (reutiliza o Read-Only Candidate + controlled dataset + write guard) |
| `src/runtime/modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js` | Read model beta de Campos (view model do controlled dataset cadcps) + `createCadcpsBetaViewModel` |
| `src/runtime/modelobase1-direct-beta/createDirectBetaWriteGuard.js` | Write guard genérico read-only (cadcps) — bloqueia toda escrita |
| `src/runtime/modelobase1-direct-beta/modeloBase1DirectBetaFallback.js` | Contrato de fallback (flag off → legado, reversível) |
| `src/runtime/modelobase1-direct-beta/modeloBase1DirectBetaDiagnostics.js` | Resumo/readiness das duas telas |
| `src/runtime/types/modelobase1-direct-beta.js` | Typedefs |
| `src/ModeloBase1/config/modeloBase1RuntimeReadModel.js` | **Ponto de injeção** ModeloBase1 (normalize/read/has — no-op quando ausente) |
| `src/runtime/__tests__/modelobase1-direct-beta.test.js` | 36 testes node --test |
| `scripts/gates/g423-modelobase1-empresas-campos-direct-beta.mjs` | Gate do slice (19 checks) |
| `docs/evidence/post-foundation-c-modelobase1-empresas-campos-direct-beta/*` | Este pacote de evidência (6 arquivos) |

## Arquivos alterados (escopo autorizado)

| File | Alteração |
|---|---|
| `src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js` | Aceita override `runtimeReadModel`, normaliza e **anexa só quando presente** (sem chave quando off → fallback byte-idêntico) |
| `src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js` | Injeta o read model beta de Empresas atrás da flag |
| `src/modules/cadcps/config/cadcpsModeloBase1Config.js` | Injeta o read model beta de Campos atrás da flag |
| `src/runtime/index.js` | Exports públicos (apenas helpers puros; nenhum .jsx) |
| `scripts/gates/lib/productionUiGuard.mjs` | Modo **escopo autorizado**: tolera as 2 configs beta (aditivo, sem tokens proibidos, ainda consumidor ModeloBase1); tudo o mais continua bloqueado |
| `package.json` | Scripts `test:runtime:modelobase1-direct-beta` + `gate:g423-modelobase1-direct-beta` + append no `test:runtime` agregado |

## Feature flags

| Flag | Efeito | Default |
|---|---|---|
| `MAK_MODELOBASE1_EMPRESAS_BETA` | Liga o read model beta de Empresas | off |
| `MAK_MODELOBASE1_CADCPS_BETA` | Liga o read model beta de Campos | off |
| `MAK_MODELOBASE1_DIRECT_BETA` | Umbrella — liga as duas | off |
| `*_ALLOW_PROD` | Escape hatch explícito para produção | off (fail-closed) |

## Fallback

Flag off → `empresasModeloBase1Config` / `cadcpsModeloBase1Config` atuais, **sem a chave `runtimeReadModel`** (o builder só a anexa quando um read model está presente). ModeloBase1 renderiza o config legado, byte-idêntico ao pré-slice. O ponto de injeção é no-op quando ausente. Reversão = flag off / revert do PR. Sem schema/write destrutivo.

## Segurança

- Backend / APIs / Prisma / schema alterados? **Não.**
- `src/framework` compartilhado alterado? **Não.**
- runtimeBridge / makBootstrap global alterado? **Não.**
- Studio / Marketplace / BOS / outras telas alteradas? **Não.**
- `src/App.jsx` alterado? **Não.**
- CSS global alterado? **Não.**
- Dependência nova adicionada? **Não.**
- Escrita habilitada? **Não** — read-only; write guard ativo bloqueia 11 operações.
- Dados reais como fonte? **Não** — controlled dev dataset.

## Status

**PASS** — ver `gate:g423-modelobase1-direct-beta` (19/19) e validação de regressão no `BETA-ACTIVATION-REPORT.md`.
