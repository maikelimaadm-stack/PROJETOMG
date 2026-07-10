# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Runtime v2 Controlled Dev Dataset
**Branch:** `claude/post-foundation-c-runtime-v2-controlled-dev-dataset`
**Base:** `main` @ `b20d8f4c` (post Runtime v2 Dev Preview Hub merge)
**Gates:** G423-PREVIEW-DATASET (PASS 20/20) · G423-PREVIEW-HUB (20/20) · G423-SECOND-MODULE-SHADOW (20/20) · G423-PREVIEW-EMPRESAS-HARNESS (16/16) · G423-PREVIEW-EMPRESAS-DEV (20/20) · G423-PREVIEW-EMPRESAS (15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (13/13) · G423-SHADOW-EMPRESAS (13/13) · G423-SHADOW (13/13) · G423 master (7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/data/controlledDevDataset.js` | `createControlledModuleDataset()` — pure generic per-module dataset builder (marks valid/invalid, denied fields, masks sensitive, computes diagnostics, enforces record/depth limits) + shared guards. |
| `src/runtime/preview/dev/data/createControlledDevDataset.js` | `ControlledDevDataset` orchestrator — opt-in, disable-safe API (`isEnabled`/`getModules`/`getRecords`/`getRecordById`/`getTableRows`/`getFormValues`/`getDiagnostics`/`getSummaryByModule`/`clear`). |
| `src/runtime/preview/dev/data/createEmpresasControlledDataset.js` | Empresas controlled dataset — 3 fictitious records (valid / missing-required / denied-field). |
| `src/runtime/preview/dev/data/createCadcpsControlledDataset.js` | cadcps controlled dataset — 3 fictitious records (valid / invalid / denied-field). |
| `src/runtime/preview/dev/data/controlledDatasetConfig.js` | `isControlledDevDatasetEnabled()` + flag/limit constants — dev-only, fails closed in production. |
| `src/runtime/preview/dev/data/errors.js` | `ControlledDevDatasetError` (`MAK-L3-DEV-DATASET-001`..`002`) |
| `src/runtime/types/controlled-dev-dataset.js` | JSDoc types (`ControlledModuleDataset`, `ControlledRecord`, `ControlledDatasetDiagnostics`, `ControlledDatasetModuleSummary`, ...) |
| `src/runtime/__tests__/preview/runtime-v2-controlled-dev-dataset.test.js` | 32 tests — off-by-default, prod-fails-closed, deterministic, lists empresas+cadcps, records, no-real-data, masking, pollution, safe-copy, getById/getTableRows/getFormValues, valid/invalid/denied marking, missing-required diagnostics, record/depth limits, no-backend/no-Prisma/no-storage/no-execution, hub opt-in integration (off = unchanged, on = summary), no-module/no-App/no-menu, no-dep/no-CSS |
| `scripts/gates/g423-runtime-v2-controlled-dev-dataset.mjs` | Gate G423-PREVIEW-DATASET |
| `docs/evidence/post-foundation-c-runtime-v2-controlled-dev-dataset/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-runtime-v2-controlled-dev-dataset/MODULE-DIAGRAMS.md` | Mermaid — dataset position and flow |
| `docs/evidence/post-foundation-c-runtime-v2-controlled-dev-dataset/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports the dataset factories + flag (all pure helpers). |
| `src/runtime/preview/dev/hub/createRuntimeV2DevPreviewHubModel.js` | Opt-in dataset integration — attaches a per-module `dataset` summary ONLY when a dataset instance is passed AND enabled; otherwise byte-identical to before (`flags.datasetIntegrated`). |
| `package.json` | Added `test:runtime:preview:dataset`, `gate:g423-preview-dataset`; appended the test to the aggregated `test:runtime`. No dependency added. |

## Módulos com dataset

- **Empresas** — dataset controlado específico (nomes claramente fictícios: Fazenda Modelo Alfa, Agro Demo Norte, Pecuária Exemplo Sul).
- **cadcps** — dataset controlado (registros fictícios de campos).

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`), **nenhuma rota/menu**, **nenhum arquivo SSOT**, e **o runtime legado** foram tocados — confirmado por `git diff` e pelo gate. A integração ao hub (`createRuntimeV2DevPreviewHubModel.js`) mantém 100% de compatibilidade: com o dataset desligado, o hub é idêntico ao anterior (31/31 testes do hub verdes).

---

## O que foi implementado

`ControlledDevDataset` é uma camada de dados simulados **dev-only** e **opt-in** para alimentar os previews runtime v2 com registros determinísticos e seguros — nunca dados reais, nunca backend/Prisma/MMM, nunca fetch, nunca salvar/editar/excluir.

- **`isControlledDevDatasetEnabled(env)`** — off por padrão; requer `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET === 'true'` **e** ambiente não-produção; em produção **falha fechado** salvo o override explícito `..._ALLOW_PROD`.
- **`createControlledDevDataset(options)`** — orquestrador; quando desligado expõe uma superfície vazia segura (`getModules() → []`); quando ligado agrega os datasets de empresas + cadcps. Toda getter retorna cópia profunda (mutar não altera estado interno). Bloqueia poluição de protótipo nas options.
- **`createControlledModuleDataset(spec)`** — builder genérico puro: marca registros válidos/inválidos (por campo obrigatório vazio), marca campos negados (ocultados como `[DENIED]`), mascara valores sensíveis (`apiKey → [REDACTED]`), computa diagnostics estruturados, e enforce limites (`MAX_RECORDS_PER_MODULE = 50`, `MAX_PAYLOAD_DEPTH = 8`).

**Como evita dados reais:** apenas exemplos claramente fictícios; metadata marcada `source: 'controlled-dev-dataset'`, `mocked: true`.
**Como evita side effects:** nenhuma função com side effect; nunca executa action/workflow/connector; nunca salva.
**Como mascara dados sensíveis:** `redactSensitive` aplicado a valores e metadata (`apiKey`/`token`/... → `[REDACTED]`).

## Datasets

- **Empresas:** `emp-1` válido, `emp-2` com `razao_social` obrigatório vazio (inválido), `emp-3` com `inscricao_estadual` negado. `apiKey` mascarado.
- **cadcps:** `cps-1` válido, `cps-2` com `nome`/`tipo` vazios (inválido), `cps-3` com `ativo` negado.
- **registros válidos:** marcados `valid: true`, `missingRequired: []`.
- **registros inválidos:** marcados `valid: false` com `missingRequired` populado.
- **campos negados:** marcados em `deniedFields`, ocultados como `[DENIED]` em values/tableRows.
- **diagnostics:** por módulo (`recordCount`/`validCount`/`invalidCount`/`deniedFieldCount`/`warnings`) + agregado.

## Integração com Hub

- **integrada?** Sim, opt-in.
- **comportamento com dataset desligado:** o hub funciona idêntico ao anterior — nenhum campo `dataset` nos módulos; `flags.datasetIntegrated: false`. Zero regressão (31/31 testes do hub verdes).
- **comportamento com dataset ligado:** cada módulo ganha um `dataset` summary; `flags.datasetIntegrated: true`.
- **summary por módulo:** `datasetStatus`, `recordCount`, `validCount`, `invalidCount`, `deniedFieldCount`, `sampleRowPreview`, `datasetDiagnostics`.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:dataset` | ✅ 32/32 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 645/645 PASS (613 baseline + 32 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-dataset` (new) | ✅ PASS 20/20 |
| `gate:g423-preview-hub` (regression — hub integration) | ✅ PASS 20/20 |
| `gate:g423-second-module-shadow` (regression) | ✅ PASS 20/20 |
| `gate:g423-preview-empresas-harness` (regression) | ✅ PASS 16/16 |
| `gate:g423-preview-empresas-dev` (regression) | ✅ PASS 20/20 |
| `gate:g423-preview-empresas` (regression) | ✅ PASS 15/15 |
| `gate:g423-shadow-empresas-table-form` (regression) | ✅ PASS 13/13 |
| `gate:g423-shadow-empresas` (regression) | ✅ PASS 13/13 |
| `gate:g423-shadow` (regression) | ✅ PASS 13/13 |
| `gate:g423` (Foundation C master) | ✅ PASS 7/7 |
| `gate:g423-01`..`gate:g423-24` | ✅ all PASS |

---

## SSOT alterado

**Nenhum.**

## UI de produção alterada

**Nenhuma.**

## src/App.jsx alterado

**Não.**

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nenhum arquivo do dataset importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Migration planning do primeiro módulo real ou dev-only route protegida** — iniciar o planejamento de migração de um módulo piloto, ou criar uma rota dev-only protegida para o hub + dataset. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — dataset off por padrão; produção falha fechada; poluição bloqueada; limites enforced.
- **Determinismo:** PASS — mesmo input gera o mesmo dataset; sem timestamps/aleatoriedade.
- **Opt-in/off switch:** PASS — flag off por padrão; desligado expõe superfície vazia segura; `clear()` disponível.
- **Dev-only:** PASS — exige ambiente não-produção; override de produção explícito e documentado; sem rota/menu.
- **Produção fail-closed:** PASS.
- **Sem side effects:** PASS — nenhuma execução de action/workflow/connector, nenhum save.
- **Sem dados reais:** PASS — só exemplos fictícios; `mocked: true`.
- **Dados sensíveis mascarados:** PASS — `apiKey`/`token`/... → `[REDACTED]`.
- **Dataset controlado:** PASS — registros válidos/inválidos/negados determinísticos, com limites de registros e profundidade.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 613 testes baseline intactos.
- **Genericidade preservada:** PASS — empresas usa dataset específico controlado, cadcps usa o builder genérico, hub consome o resumo.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** dados reais, substituição de telas reais, execução de ações reais, Studio, e rota dev-only ficam fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-runtime-v2-controlled-dev-dataset/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega a camada de dataset controlado dev-only: registros simulados determinísticos e seguros para empresas + cadcps (válidos/inválidos/negados, campos obrigatórios vazios, dados sensíveis mascarados), opt-in e fail-closed em produção, integrável ao hub de forma opt-in sem regressão, sem dados reais, sem side effect, sem backend/Prisma/MMM, e zero alteração de UI de produção, `src/App.jsx`, menu, runtime legado, SSOT ou backend. 32 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
