# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Runtime v2 Dev Preview Route Mount
**Branch:** `claude/post-foundation-c-runtime-v2-dev-preview-route-mount`
**Base:** `main` @ `2d23aada` (post Runtime v2 Dev Preview Route merge)
**Gates:** G423-PREVIEW-ROUTE-MOUNT (PASS 16/16) · G423-PREVIEW-ROUTE (20/20) · G423-PREVIEW-DATASET (20/20) · G423-PREVIEW-HUB (20/20) · G423-SECOND-MODULE-SHADOW (20/20) · G423 master (7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/preview/dev/route/registerRuntimeV2DevPreviewRoute.js` | Pure mount gate — `isRuntimeV2DevEnvironment()`, `shouldMountRuntimeV2DevPreviewRoute()`, `getRuntimeV2DevPreviewRouteMountPlan()` (dev + route flag; fails closed in production). |
| `src/runtime/preview/dev/route/RuntimeV2DevPreviewRouteMount.jsx` | Dev-only mount wrapper — renders the route only when the mount gate allows, else `null`. |
| `src/runtime/types/dev-preview-route-mount.js` | JSDoc type (`RuntimeV2DevPreviewRouteMountPlan`) |
| `src/runtime/__tests__/preview/runtime-v2-dev-preview-route-mount.test.js` | 20 tests — not-mounted-by-default, mounted-only-with-flag, prod-fails-closed + explicit override, dev-environment gate, exact path, deterministic plan, not-in-menu/not-public, reason strings, fallback, hub/dataset independent, no-backend/no-Prisma/no-storage/no-execution, no-App/no-module import, not-in-router/menu, no-dep/no-CSS, barrel-has-no-mount-jsx |
| `scripts/gates/g423-runtime-v2-dev-preview-route-mount.mjs` | Gate G423-PREVIEW-ROUTE-MOUNT |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-mount/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-mount/MODULE-DIAGRAMS.md` | Mermaid — mount gate and flow |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-mount/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports the pure mount helpers (`shouldMountRuntimeV2DevPreviewRoute`, `isRuntimeV2DevEnvironment`, `getRuntimeV2DevPreviewRouteMountPlan`). The mount `.jsx` is NOT exported. |
| `package.json` | Added `test:runtime:preview:route-mount`, `gate:g423-preview-route-mount`; appended the test to the aggregated `test:runtime`. No dependency added. |

## Rota

- **path:** `/__dev/runtime-v2/previews`
- **montada:** **Mecanismo de montagem dev-only pronto e testado.** O `src/App.jsx` central **NÃO** foi editado (ver decisão abaixo). A montagem é um **opt-in de uma linha** que o mantenedor aplica no `<Routes>`.
- **dev-only:** Sim — `shouldMountRuntimeV2DevPreviewRoute` exige ambiente de desenvolvimento (`import.meta.env.DEV`) **e** a flag da rota.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita hub + dataset flags); override de produção explícito `..._ALLOW_PROD`.
- **aparece no menu principal:** Não.
- **usa dados reais:** Não.

---

## Decisão de montagem (documentada — "não faça gambiarra")

O roteamento do projeto é **centralizado em `src/App.jsx`** (um único `<Routes>`). `src/App.jsx` é o arquivo mais protegido deste programa: **todos os gates anteriores** (G423-PREVIEW-ROUTE, G423-PREVIEW-DATASET, G423-PREVIEW-HUB, G423-SECOND-MODULE-SHADOW, e o master G423 — todos na lista de validação obrigatória deste slice) verificam `git diff origin/main...HEAD -- src/App.jsx …` e **falham se `src/App.jsx` mudar**.

Montar a rota editando `src/App.jsx` faria **todos esses ~11 gates falharem**. Para mantê-los verdes seria necessário editar cada um deles para tolerar a mudança em `src/App.jsx` — uma erosão ampla do invariante central do programa, exatamente a "gambiarra" que o prompt proíbe ("Não faça gambiarra") e o oposto de "mínima e isolada".

O prompt oferece a saída explícita: **"Se o roteador do projeto não permitir montagem segura sem risco, pare e reporte."** Portanto, a decisão de engenharia correta e fiel ao prompt é: **entregar um mecanismo de montagem real, dev-guarded, testado e gated** — e **não editar `src/App.jsx`** — reportando o motivo de forma transparente e fornecendo o snippet exato de opt-in.

**Snippet de opt-in de uma linha** (o mantenedor adiciona dentro do `<Routes>` de `src/App.jsx`, quando desejar):

```jsx
import { shouldMountRuntimeV2DevPreviewRoute, RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH } from '@/runtime';
import { RuntimeV2DevPreviewRoute } from '@/runtime/preview/dev/route/RuntimeV2DevPreviewRoute.jsx';
// ... dentro de <Routes>:
{shouldMountRuntimeV2DevPreviewRoute() && (
  <Route path={RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH} element={<RuntimeV2DevPreviewRoute />} />
)}
```

`shouldMountRuntimeV2DevPreviewRoute()` retorna `false` por padrão e em produção — a rota nunca aparece fora de um ambiente dev com a flag ligada, e o Vite elimina o ramo em builds de produção via `import.meta.env.DEV`.

**`src/App.jsx alterado: Não`.** Nenhum arquivo de UI de produção, menu, SSOT, ou runtime legado foi tocado — confirmado por `git diff` e pelo gate.

---

## O que foi implementado

- **`isRuntimeV2DevEnvironment(env)`** — `import.meta.env.DEV` truthy, ou label de ambiente `development`, ou o override explícito de produção.
- **`shouldMountRuntimeV2DevPreviewRoute(env)`** — o portão único de montagem: `isRuntimeV2DevEnvironment && isRuntimeV2DevPreviewRouteEnabled` (dev + flag da rota; fail-closed em produção).
- **`getRuntimeV2DevPreviewRouteMountPlan(options)`** — plano de montagem plano e determinístico (`path`/`shouldMount`/`devOnly`/`inMainMenu`/`publicRoute`/`production`/`reason`).
- **`RuntimeV2DevPreviewRouteMount.jsx`** — wrapper dev-only que renderiza a rota apenas quando o portão permite, senão `null` (para contextos fora de `<Routes>`, ex.: um overlay dev).

**Como usa Hub / Controlled Dataset:** o mount não força nem o hub nem o dataset — cada um continua controlado pela sua própria flag; a rota (via seu route model) já respeita `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` e `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET`.
**Como evita dados reais / side effects:** herdado da rota/hub/dataset (mock only, sem execução, sem backend/fetch/storage).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:route-mount` | ✅ 20/20 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 692/692 PASS (672 baseline + 20 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-route-mount` (new) | ✅ PASS 16/16 |
| `gate:g423-preview-route` (regression) | ✅ PASS 20/20 |
| `gate:g423-preview-dataset` (regression) | ✅ PASS 20/20 |
| `gate:g423-preview-hub` (regression) | ✅ PASS 20/20 |
| `gate:g423-second-module-shadow` (regression) | ✅ PASS 20/20 |
| `gate:g423` (Foundation C master) | ✅ PASS 7/7 |
| `gate:g423-01`..`gate:g423-24` | ✅ all PASS |

---

## SSOT alterado

**Nenhum.**

## UI de produção alterada

**Nenhuma.**

## src/App.jsx alterado

**Não.** (Ver decisão de montagem acima — mecanismo de montagem entregue; opt-in de uma linha para o mantenedor.)

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** Nenhum arquivo do mount importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Migration planning do primeiro módulo real.** Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — mount off por padrão; produção falha fechada; portão único e explícito.
- **Determinismo:** PASS — mesmo env gera o mesmo mount plan.
- **Opt-in/off switch:** PASS — flag off por padrão; wrapper renderiza `null` quando não deve montar.
- **Dev-only:** PASS — exige `import.meta.env.DEV` (ou override de produção explícito).
- **Produção fail-closed:** PASS.
- **Sem side effects:** PASS.
- **Sem dados reais:** PASS — herdado da rota/hub/dataset (mock only).
- **Rota fora do menu principal:** PASS — `inMainMenu: false`; nenhum registro em router/menu ativo.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 672 testes baseline intactos.
- **Genericidade preservada:** PASS — Empresas + cadcps continuam no hub via a rota.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** edição do `src/App.jsx` central (opt-in de uma linha), dados reais, execução de ações reais, e Studio ficam fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-mount/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega o mecanismo de montagem dev-only da rota do Runtime v2 Dev Preview Hub (`/__dev/runtime-v2/previews`): portão de montagem puro e determinístico (`shouldMountRuntimeV2DevPreviewRoute` — dev + flag, fail-closed em produção), wrapper de montagem que renderiza `null` fora de dev, e um mount plan estruturado — sem dados reais, sem side effect, sem menu. Para preservar o invariante central do programa (verificado por ~11 gates) e não fazer gambiarra, `src/App.jsx` **não foi editado**; a montagem é um opt-in de uma linha documentado para o mantenedor. 20 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
