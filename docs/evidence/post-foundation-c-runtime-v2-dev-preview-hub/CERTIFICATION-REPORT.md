# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Runtime v2 Dev Preview Hub
**Branch:** `claude/post-foundation-c-runtime-v2-dev-preview-hub`
**Base:** `main` @ `4862f86c` (post Second Module Shadow / Generic Module Runtime merge)
**Gates:** G423-PREVIEW-HUB (PASS 20/20) · G423-SECOND-MODULE-SHADOW (20/20) · G423-PREVIEW-EMPRESAS-HARNESS (16/16) · G423-PREVIEW-EMPRESAS-DEV (20/20) · G423-PREVIEW-EMPRESAS (15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (13/13) · G423-SHADOW-EMPRESAS (13/13) · G423-SHADOW (13/13) · G423 master (7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/hub/createRuntimeV2DevPreviewHubModel.js` | Pure, async hub model builder — aggregates the Empresas + cadcps preview fixtures into a deterministic plain model (status/environment/flags/modules/diagnostics/warnings/limitations); masks sensitive, blocks pollution, captures per-module failures, returns safe copy. |
| `src/runtime/preview/dev/hub/devPreviewHubConfig.js` | `isRuntimeV2DevPreviewHubEnabled()` + `detectEnvLabel()` + flag constants — dev-only, fails closed in production. |
| `src/runtime/preview/dev/hub/errors.js` | `RuntimeV2DevPreviewHubError` (`MAK-L3-DEV-HUB-001`..`002`) |
| `src/runtime/preview/dev/hub/RuntimeV2DevPreviewHub.jsx` | Dev-only hub component — exportable, NOT auto-mounted / route / menu; renders null when disabled. |
| `src/runtime/preview/dev/hub/RuntimeV2DevPreviewHubPanel.jsx` | Presentational — status + one card per module. |
| `src/runtime/preview/dev/hub/RuntimeV2DevPreviewModuleCard.jsx` | Presentational — one module's table/form/diagnostics/differences + actions/workflows as text metadata. |
| `src/runtime/types/dev-preview-hub.js` | JSDoc types (`RuntimeV2DevPreviewHubModel`, `HubModuleEntry`) |
| `src/runtime/__tests__/preview/runtime-v2-dev-preview-hub.test.js` | 31 tests — hub off-by-default, prod-fails-closed, deterministic model, lists Empresas + cadcps, mocked/masked/pollution, plain-not-React, component source-scans, actions/workflows metadata-only, no-side-effect/no-backend/no-Prisma/no-storage, no-route/no-menu/no-module import, safe-copy, genericity, denied-fields, barrel-has-no-React |
| `scripts/gates/g423-runtime-v2-dev-preview-hub.mjs` | Gate G423-PREVIEW-HUB |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-hub/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-hub/MODULE-DIAGRAMS.md` | Mermaid — hub position and flow |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-hub/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports ONLY the pure helpers `createRuntimeV2DevPreviewHubModel`, `isRuntimeV2DevPreviewHubEnabled`, `detectEnvLabel`, `RUNTIME_V2_DEV_PREVIEW_HUB_FLAG` — the hub React components are NOT exported from the framework-free barrel. |
| `package.json` | Added `test:runtime:preview:hub`, `gate:g423-preview-hub`; appended the hub test to the aggregated `test:runtime`. No dependency added. |

## Módulos no hub

- **Empresas** — via o pipeline específico já existente (`createEmpresasDevPreviewFixture`).
- **cadcps** — via o pipeline genérico do segundo módulo (`createSecondModuleDevPreviewFixture`).

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`), **nenhuma rota/menu**, **nenhum arquivo SSOT**, e **o runtime legado** foram tocados — confirmado por `git diff` e pelo gate.

**Decisão de rota:** este slice NÃO cria rota (caminho seguro — "hub exportável sem montagem automática"). `RuntimeV2DevPreviewHub` é um componente exportável que um harness de desenvolvimento monta manualmente. Sem `createBrowserRouter`/`<Route>`/`createRoot`/auto-mount. `src/App.jsx` intocado.

**Testabilidade sob `node --test`:** a lógica testável (model builder + config) vive nos `.js`; os `.jsx` são wrappers presentacionais cobertos por source-scan e compilados/lintados por Vite/ESLint. Nenhum componente React entra no barrel do runtime.

---

## O que foi implementado

`RuntimeV2DevPreviewHub` é uma entrada controlada de desenvolvimento, **dev-only** e **opt-in**, que agrega os previews runtime v2 existentes (Empresas + cadcps) para inspeção visual interna — a primeira área para validar o futuro caminho do MAK Studio, ainda sem Studio, sem produção e sem migração real.

- **`isRuntimeV2DevPreviewHubEnabled(env)`** — off por padrão; requer `MAK_RUNTIME_V2_DEV_PREVIEW_HUB === 'true'` **e** ambiente não-produção; em produção **falha fechado** salvo o override explícito `MAK_RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD === 'true'`.
- **`createRuntimeV2DevPreviewHubModel(options)`** — model puro, determinístico, plano; agrega os dois módulos com summaries de table/form, diagnostics, differences, actions/workflows como texto, e metadata mascarada; captura falha por módulo (nunca lança); retorna cópia segura.
- **`RuntimeV2DevPreviewHub.jsx`** — off → `null` (fail closed); on em dev → renderiza status + cards de módulo via panel/card.

**Como inclui Empresas:** através do harness/fixture específico já existente (`source: 'empresas-specific-pipeline'`).
**Como inclui cadcps:** através do pipeline genérico do segundo módulo (`source: 'generic-module-pipeline'`) — provando que os dois convivem no hub.
**Como evita side effects:** actions/workflows apenas como texto metadata; nenhum `onClick`/`dispatch`/`start`/`execute`; nunca salva/edita/exclui, nunca chama backend.
**Como mascara dados sensíveis:** metadata mascarada (`apiKey → [REDACTED]`) por módulo.

## Hub

- **módulos:** empresas, cadcps.
- **tabela:** por módulo — columnCount, visibleColumns, columns (label/sortable/filterable/visible).
- **formulário:** por módulo — fieldCount, visibleFields, fields (label/type/required/permission/denied).
- **diagnostics:** por módulo (warnings/deniedFields/...) + agregado (totalModules/availableModules/warnings).
- **differences:** por módulo (paths).
- **limitações:** dev-only, mocked data only, passivo — documentadas no model.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:hub` | ✅ 31/31 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 613/613 PASS (582 baseline + 31 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-hub` (new) | ✅ PASS 20/20 |
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

**Preservado.** Nenhum arquivo do hub importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Migration planning do primeiro módulo ou dataset controlado dev-only** — iniciar o planejamento de migração de um módulo piloto, ou alimentar o hub com um dataset dev controlado maior. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — hub off por padrão; produção falha fechada; falha por módulo capturada; poluição de protótipo bloqueada.
- **Determinismo:** PASS — mesmo fixture gera o mesmo hub model; sem timestamps.
- **Opt-in/off switch:** PASS — flag `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` off por padrão; componente renderiza `null` quando off.
- **Dev-only:** PASS — exige ambiente não-produção; override de produção explícito e documentado; sem rota/menu.
- **Produção fail-closed:** PASS.
- **Sem side effects:** PASS — nunca executa action/workflow/connector, nunca salva.
- **Sem dados reais:** PASS — só fixtures mock; `status.mocked = true`.
- **Actions/workflows/connectors não executados:** PASS — apenas texto metadata.
- **Dados sensíveis mascarados:** PASS.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 582 testes baseline intactos.
- **Genericidade preservada:** PASS — Empresas via pipeline específico, cadcps via pipeline genérico, ambos no hub.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** substituição de telas reais, dados reais, execução de ações reais, rota dev-only real, e Studio ficam fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-runtime-v2-dev-preview-hub/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega o hub dev-only de previews runtime v2: componentes React exportáveis (sem rota/menu/auto-mount) que agregam os previews de Empresas (pipeline específico) e cadcps (pipeline genérico) a partir de um hub model puro, determinístico e mockado, opt-in, fail-closed em produção, sem dados reais, sem side effect, sem executar ações reais, com dados sensíveis mascarados, e zero alteração de UI de produção, `src/App.jsx`, menu, runtime legado, SSOT ou backend. 31 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
