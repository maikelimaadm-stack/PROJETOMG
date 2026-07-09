# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Empresas Dev-Only Preview Harness
**Branch:** `claude/post-foundation-c-empresas-dev-preview-harness`
**Base:** `main` @ `1315ebf4` (post Empresas Dev-Only Visual Preview merge)
**Gates:** G423-PREVIEW-EMPRESAS-HARNESS (PASS 16/16) · G423-PREVIEW-EMPRESAS-DEV (PASS 20/20) · G423-PREVIEW-EMPRESAS (PASS 15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (PASS 13/13) · G423-SHADOW-EMPRESAS (PASS 13/13) · G423-SHADOW (PASS 13/13) · G423 master (PASS 7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/createEmpresasDevPreviewFixture.js` | Deterministic, SAFE mock preview model (never real data; sensitive keys masked). |
| `src/runtime/preview/dev/devPreviewHarnessConfig.js` | `isEmpresasDevPreviewHarnessEnabled()` + harness flag constants — dev-only, fails closed in production. |
| `src/runtime/preview/dev/EmpresasDevPreviewHarness.jsx` | Dev-only React harness — exportable, NOT auto-mounted, NOT a route, NOT in the menu; feeds the fixture into `EmpresasDevPreview`. |
| `src/runtime/__tests__/preview/empresas-dev-preview-harness.test.js` | 24 tests — harness off-by-default, prod-fails-closed, deterministic/masked/mock fixture, uses EmpresasDevPreview, table/form/diagnostics/differences rendering, actions/workflows metadata-only, no-side-effect/no-backend/no-Prisma/no-storage, no-route/no-menu, no-new-dep/no-CSS, exportable-no-auto-mount, barrel-has-no-React |
| `scripts/gates/g423-empresas-dev-preview-harness.mjs` | Gate G423-PREVIEW-EMPRESAS-HARNESS |
| `docs/evidence/post-foundation-c-empresas-dev-preview-harness/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-empresas-dev-preview-harness/MODULE-DIAGRAMS.md` | Mermaid — harness position and flow |
| `docs/evidence/post-foundation-c-empresas-dev-preview-harness/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports ONLY the pure helpers `createEmpresasDevPreviewFixture`, `isEmpresasDevPreviewHarnessEnabled` — the harness React component is NOT exported from the framework-free runtime barrel. |
| `package.json` | Added `test:runtime:preview:empresas-harness`, `gate:g423-preview-empresas-harness`; appended the harness test to the aggregated `test:runtime`. No dependency added. |

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`), **nenhuma rota**, **nenhum item de menu**, **nenhum arquivo SSOT**, e **o runtime legado** foram tocados — confirmado por `git diff` e pelo gate.

**Decisão de rota:** este slice NÃO cria rota (nem pública nem dev). Optou-se pelo caminho mais seguro descrito no prompt — "criar harness exportável e documentado, sem montar automaticamente". `EmpresasDevPreviewHarness` é um componente exportável que um harness de desenvolvimento pode montar manualmente; não há `createBrowserRouter`/`<Route>`/`createRoot`/auto-mount em lugar algum. Isso evita qualquer toque em `src/App.jsx`/router e garante que nada aparece em produção ou no menu.

---

## O que foi implementado

`EmpresasDevPreviewHarness` é um ponto de visualização **dev-only**, **opt-in** e isolado para o preview de Empresas, usando um **mock seguro determinístico** (nunca dados reais). Não é rota pública, não aparece no menu, não controla a tela real de Empresas. Nunca executa action/workflow/connector, nunca salva/edita/exclui, nunca chama backend, nunca toca dados reais.

- **`isEmpresasDevPreviewHarnessEnabled(env)`** — off por padrão; requer a flag `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS === 'true'` **e** ambiente não-produção; em produção **falha fechado** salvo o override explícito `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD === 'true'`.
- **`createEmpresasDevPreviewFixture()`** — retorna um preview model válido, determinístico e seguro: colunas/campos estruturais, um campo negado por permissão (diagnostics `deniedFields`), diferenças simuladas (`[{path:'form'}]`), validações e permissões simuladas, actions/workflows como metadados, e `meta` com chaves sensíveis de exemplo **mascaradas** (`apiKey → [REDACTED]`) e marcador `source: 'mock-fixture'`.
- **`EmpresasDevPreviewHarness.jsx`** — quando o flag está off (ou em produção sem override) renderiza `null` (fail closed); quando on em dev, monta um cabeçalho ("dev-only · mocked data · not a production route · not in menu") e renderiza `EmpresasDevPreview` com a fixture, passando um env efetivo que também liga o preview interno (mantendo o fail-closed de produção).

**Testabilidade sob `node --test`:** toda a lógica testável vive nos `.js` (`createEmpresasDevPreviewFixture.js`, `devPreviewHarnessConfig.js`); o `.jsx` do harness é um wrapper fino, coberto por source-scan nos testes e compilado/lintado por Vite/ESLint. Nenhum componente React entra no barrel do runtime.

## Preview Harness

- **tabela:** colunas estruturais da fixture (id/label/sortable/filterable/visible), coluna `inscricao_estadual` oculta.
- **formulário:** campos estruturais com label/required/permission/validation; `inscricao_estadual` marcado `denied`.
- **diagnostics:** `warnings`, `deniedFields: ['inscricao_estadual']`, `unsupportedFeatures: ['form.workflows:metadata-only']`.
- **differences:** `[{path:'form'}]` (simuladas).
- **limitações:** fixture mock (sem dados reais), harness exportável sem rota/montagem automática.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:empresas-harness` | ✅ 24/24 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 557/557 PASS (533 baseline + 24 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-empresas-harness` (new) | ✅ PASS 16/16 |
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

## Tela Empresas real alterada

**Não.**

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nenhum arquivo do harness importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Segundo módulo piloto ou preview dev com dataset controlado** — aplicar o padrão shadow→projeção→preview→harness a um segundo módulo, ou alimentar o harness com um dataset dev controlado maior. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — harness off por padrão; produção falha fechada; componente renderiza `null` quando desabilitado.
- **Determinismo:** PASS — a fixture é constante; mesmo input gera mesmo preview.
- **Opt-in/off switch:** PASS — flag `MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_HARNESS` off por padrão.
- **Dev-only:** PASS — exige ambiente não-produção; override de produção explícito e documentado; sem rota/menu.
- **Sem side effects:** PASS — nunca executa action/workflow/connector, nunca salva, nunca chama backend.
- **Sem dados reais:** PASS — fixture mock marcada `source: 'mock-fixture'`; nenhum dado de empresa real.
- **Actions/workflows/connectors não executados:** PASS — apenas metadados; nenhum `onClick`/`dispatch`/`start`/`execute`.
- **Dados sensíveis mascarados:** PASS — chaves sensíveis de exemplo mascaradas na fixture.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 533 testes baseline intactos.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** segundo módulo piloto, dataset dev controlado, e rota dev-only real ficam explicitamente fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-empresas-dev-preview-harness/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega o harness dev-only do preview de Empresas: componente React exportável (sem rota/menu/auto-mount) que alimenta o preview visual com uma fixture mock segura e determinística, opt-in, fail-closed em produção, sem dados reais, sem side effect, sem executar ações reais, com dados sensíveis mascarados, e zero alteração de UI de produção, `src/App.jsx`, menu, runtime legado, SSOT ou backend. 24 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
