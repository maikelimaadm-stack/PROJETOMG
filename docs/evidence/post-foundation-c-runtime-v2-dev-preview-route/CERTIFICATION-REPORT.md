# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Runtime v2 Dev Preview Route
**Branch:** `claude/post-foundation-c-runtime-v2-dev-preview-route`
**Base:** `main` @ `8d312155` (post Runtime v2 Controlled Dev Dataset merge)
**Gates:** G423-PREVIEW-ROUTE (PASS 20/20) · G423-PREVIEW-DATASET (20/20) · G423-PREVIEW-HUB (20/20) · G423-SECOND-MODULE-SHADOW (20/20) · G423-PREVIEW-EMPRESAS-HARNESS (16/16) · G423-PREVIEW-EMPRESAS-DEV (20/20) · G423-PREVIEW-EMPRESAS (15/15) · G423-SHADOW-EMPRESAS-TABLE-FORM (13/13) · G423-SHADOW-EMPRESAS (13/13) · G423-SHADOW (13/13) · G423 master (7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/route/createRuntimeV2DevPreviewRouteModel.js` | Pure, async route model builder — routePath/enabled/devOnly/productionBlocked/hubEnabled/datasetEnabled/status/warnings/limitations/hubModel; masks sensitive (via hub), blocks pollution, deterministic, safe copy. |
| `src/runtime/preview/dev/route/devPreviewRouteConfig.js` | `isRuntimeV2DevPreviewRouteEnabled()` + path/flag constants — dev-only, fails closed in production. |
| `src/runtime/preview/dev/route/errors.js` | `RuntimeV2DevPreviewRouteError` (`MAK-L3-DEV-ROUTE-001`..`002`) |
| `src/runtime/preview/dev/route/RuntimeV2DevPreviewRoute.jsx` | Dev-only, self-guarding route component — renders a safe fallback when disabled; exportable, NOT wired into the production router. |
| `src/runtime/preview/dev/route/RuntimeV2DevPreviewRoutePage.jsx` | Dev-only page — DEV-ONLY banner, flag/production status, the Hub (Empresas + cadcps + dataset summary when on), limitations. |
| `src/runtime/types/dev-preview-route.js` | JSDoc types (`RuntimeV2DevPreviewRouteModel`) |
| `src/runtime/__tests__/preview/runtime-v2-dev-preview-route.test.js` | 27 tests — off-by-default, prod-fails-closed + explicit override, deterministic model, path, hub/dataset status, no-real-data, masking, pollution, plain-not-React, component fallback/banner/Hub source-scans, no-backend/no-Prisma/no-storage/no-execution, no-App/no-module import, not-in-router/menu, no-dep/no-CSS, productionBlocked |
| `scripts/gates/g423-runtime-v2-dev-preview-route.mjs` | Gate G423-PREVIEW-ROUTE |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route/MODULE-DIAGRAMS.md` | Mermaid — route position and flow |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports ONLY the pure helpers `createRuntimeV2DevPreviewRouteModel`, `isRuntimeV2DevPreviewRouteEnabled`, `RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH`, `RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG` — the route React components are NOT exported from the framework-free barrel. |
| `package.json` | Added `test:runtime:preview:route`, `gate:g423-preview-route`; appended the test to the aggregated `test:runtime`. No dependency added. |

## Rota

- **path:** `/__dev/runtime-v2/previews`
- **dev-only:** Sim — exige ambiente não-produção.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita também `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` e `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET`); override de produção explícito `..._ALLOW_PROD`.
- **aparece no menu principal:** Não.
- **usa dados reais:** Não.

## Módulos visíveis

- **Empresas** — via o hub.
- **cadcps** — via o hub.

## Dataset

- **opt-in:** Sim — o summary do dataset só aparece quando `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET === 'true'`.
- **controlado:** Sim — registros simulados/mock, sem dados reais.

**`src/App.jsx alterado: Não`.** **Decisão de wiring (documentada):** o roteamento do projeto é centralizado em `src/App.jsx`, que é protegido pela checagem "no production UI change (src/App.jsx…)" em **todos os gates anteriores** (g423-preview-dataset, g423-preview-hub, g423-shadow-*, etc.). Montar a rota alterando `src/App.jsx` faria TODOS esses gates falharem (regressão). Portanto a rota foi entregue como um **componente de rota exportável, dev-only e auto-protegido** (com o path correto `/__dev/runtime-v2/previews`, guarda de flag, fail-closed em produção e fallback seguro), pronto para ser montado por uma futura alteração dev-only de router — mas **não montado** neste slice, preservando todos os invariantes e mantendo cada gate anterior verde. `getRuntimeV2DevPreviewRouteDescriptor()` fornece um descritor `{ path, Component, devOnly }` que um router poderia consumir.

**Nenhum arquivo de UI de produção, menu, SSOT, ou runtime legado foi tocado** — confirmado por `git diff` e pelo gate.

---

## O que foi implementado

Uma rota **dev-only**, **opt-in** e auto-protegida para o Runtime v2 Dev Preview Hub, com o path `/__dev/runtime-v2/previews`. Renderiza (quando permitido) o aviso DEV-ONLY, o status das flags, o status de produção-bloqueada, o Hub (Empresas + cadcps, com summary do dataset quando ligado), diagnostics e limitations — a partir de um route model puro e mockado. Nunca dados reais, nunca backend/fetch, nunca action/workflow/connector, nunca save, nunca no menu principal.

- **`isRuntimeV2DevPreviewRouteEnabled(env)`** — off por padrão; requer a flag da rota **e** ambiente não-produção; em produção **falha fechado** salvo override explícito.
- **`createRuntimeV2DevPreviewRouteModel(options)`** — model puro; inclui o `hubModel` (com dataset opt-in) apenas quando as flags de rota + hub permitem; captura falha do hub (nunca lança); mascara sensível; determinístico; cópia segura.
- **`RuntimeV2DevPreviewRoute.jsx`** — off → fallback seguro (aviso dev-only); on → `RuntimeV2DevPreviewRoutePage` com o route model.

**Como usa Hub:** o route model constrói o hub via `createRuntimeV2DevPreviewHubModel` quando rota+hub ligados; a página renderiza `RuntimeV2DevPreviewHub`.
**Como usa Controlled Dataset:** quando a flag do dataset está ligada, passa um `ControlledDevDataset` ao hub → summary por módulo aparece; senão, previews sem dataset summary.
**Como evita dados reais / side effects / mascara sensível:** herda do hub/dataset (mock only, `[REDACTED]`, sem execução).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:route` | ✅ 27/27 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 672/672 PASS (645 baseline + 27 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-route` (new) | ✅ PASS 20/20 |
| `gate:g423-preview-dataset` (regression) | ✅ PASS 20/20 |
| `gate:g423-preview-hub` (regression) | ✅ PASS 20/20 |
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

**Não.** (Ver decisão de wiring acima.)

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nenhum arquivo da rota importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Migration planning do primeiro módulo real.** Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — rota off por padrão; produção falha fechada; falha do hub capturada; poluição bloqueada.
- **Determinismo:** PASS — mesmo input gera o mesmo route model.
- **Opt-in/off switch:** PASS — flag off por padrão; componente renderiza fallback seguro quando off.
- **Dev-only:** PASS — exige ambiente não-produção; override de produção explícito.
- **Produção fail-closed:** PASS.
- **Sem side effects:** PASS — nenhuma execução de action/workflow/connector; nenhum save.
- **Sem dados reais:** PASS — só mock (hub/dataset).
- **Rota fora do menu principal:** PASS — path declarado como constante/descritor; não montado em router/menu ativo.
- **Actions/workflows/connectors não executados:** PASS.
- **Dados sensíveis mascarados:** PASS — `[REDACTED]`.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 645 testes baseline intactos.
- **Genericidade preservada:** PASS — Empresas + cadcps no hub via a rota.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** montagem no router de produção, dados reais, execução de ações reais, e Studio ficam fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega a rota dev-only do Runtime v2 Dev Preview Hub (`/__dev/runtime-v2/previews`): componente de rota exportável e auto-protegido (dev-only, flag-protected, fail-closed em produção, fallback seguro) que renderiza o hub (Empresas + cadcps + dataset summary opt-in) a partir de um route model puro e mockado, sem dados reais, sem side effect, sem menu, e — para preservar todos os invariantes e manter cada gate anterior verde — **sem alterar `src/App.jsx`** (rota pronta para montar, não montada). 27 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
