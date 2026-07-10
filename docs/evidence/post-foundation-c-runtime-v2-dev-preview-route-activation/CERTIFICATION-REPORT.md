# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Runtime v2 Dev Preview Route Activation
**Branch:** `claude/post-foundation-c-runtime-v2-dev-preview-route-activation`
**Base:** `main` @ `752c913b` (post Runtime v2 Dev Preview Route Mount merge, PR #419)
**Gates:** G423-PREVIEW-ROUTE-ACTIVATION (PASS 18/18) · G423-PREVIEW-ROUTE-MOUNT (16/16) · G423-PREVIEW-ROUTE (20/20) · G423-PREVIEW-DATASET (20/20) · G423-PREVIEW-HUB (20/20) · G423-SECOND-MODULE-SHADOW (20/20) · G423 master (7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `scripts/gates/lib/productionUiGuard.mjs` | Guard de UI de produção compartilhado. `productionUiOffendingFiles(ROOT)` tolera **exatamente uma** exceção: a montagem dev-only sancionada em `src/App.jsx` (apenas adições, path dev, sem tokens proibidos). Qualquer outra mudança em `src/App.jsx`/`src/shared`/`src/framework`/`src/modules`/`src/studio` continua ofensora. **Não** é um afrouxamento genérico. |
| `src/runtime/__tests__/preview/runtime-v2-dev-preview-route-activation.test.js` | 23 tests — rota montada no `<Routes>` real, path exato via constante, imports do gate/path, lazy import, off-por-padrão, só-com-flag, prod fail-closed, override explícito, dev-env, flag-off não quebra a app, plano determinístico, hub/dataset com flags próprias, fora do menu/nav, rotas de produção intactas, sem backend/fetch/Prisma/storage/execução/dados-reais/dependência/CSS no bloco, diff de App.jsx estritamente aditivo, guard aceita só a exceção. |
| `scripts/gates/g423-runtime-v2-dev-preview-route-activation.mjs` | Gate G423-PREVIEW-ROUTE-ACTIVATION (18 checks) |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-activation/CERTIFICATION-REPORT.md` | Este report |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-activation/MODULE-DIAGRAMS.md` | Mermaid — ativação da rota no roteador real |
| `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-activation/QUALITY-SCALABILITY-NOTES.md` | Adendo de qualidade/escalabilidade/segurança |

## Arquivos modificados

| File | Change |
|---|---|
| `src/App.jsx` | **Montagem dev-only sancionada (apenas adições).** 2 imports (`shouldMountRuntimeV2DevPreviewRoute`, `RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH`), 1 `lazy()` da rota, e um `<Route>` guardado por `shouldMountRuntimeV2DevPreviewRoute() && (...)` dentro do `<Routes>`. Nenhuma linha existente removida/alterada. |
| `scripts/gates/g423-12-render.mjs` … (21 gates que guardam `src/App.jsx`) | Cada um passa a usar `productionUiOffendingFiles(ROOT)` do guard compartilhado no lugar do `git diff --name-only` inline. A exceção dev-only fica definida **em um único lugar**. A lógica `noProductionUiChange = diff.length === 0` é inalterada. |
| `package.json` | Added `test:runtime:preview:route-activation`, `gate:g423-preview-route-activation`; appended the test to the aggregated `test:runtime`. No dependency added. |

## Rota

- **path:** `/__dev/runtime-v2/previews`
- **montada:** **Sim** — dentro do `<Routes>` central de `src/App.jsx`, guardada por `shouldMountRuntimeV2DevPreviewRoute()`.
- **dev-only:** Sim — `shouldMountRuntimeV2DevPreviewRoute` exige ambiente de desenvolvimento (`import.meta.env.DEV`) **e** a flag da rota.
- **flag:** `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE` (respeita hub + dataset flags); override de produção explícito `..._ALLOW_PROD`.
- **aparece no menu principal:** Não.
- **usa dados reais:** Não.

---

## Decisão de engenharia (autorizada por este slice)

As fatias anteriores **não podiam** editar `src/App.jsx`: ~21 gates verificam `git diff origin/main...HEAD -- src/App.jsx …` e falham se `src/App.jsx` mudar. A fatia Route Mount (PR #419) entregou o **mecanismo** de montagem **sem** editar `src/App.jsx`, documentando a decisão de parar-e-reportar.

**Este slice é explicitamente autorizado** a fazer a mudança mínima em `src/App.jsx` para montar a rota dev-only **e** a atualizar os gates anteriores — **mas somente** para permitir esta exceção estrita e específica: *"Não enfraquecer gates de forma genérica."*

**Como a exceção foi mantida precisa (não genérica):**

1. Um único guard compartilhado — `scripts/gates/lib/productionUiGuard.mjs` — define a exceção **em um lugar só**. Ele exige que a mudança em `src/App.jsx` seja **apenas adições** (nenhuma linha existente removida/alterada), que **toda** linha adicionada que declara `path` referencie o path dev, e que **nenhum** token proibido (`prisma`/`PrismaClient`/`/backend/`/`fetch(`/`localStorage`/`sessionStorage`/`indexedDB`/`addMenuItem`/`navItems`/`menu.push`) seja adicionado. Qualquer outra mudança em `src/App.jsx` — e **qualquer** mudança em `src/shared`/`src/framework`/`src/modules`/`src/studio` — continua ofensora.
2. Os 21 gates que guardam `src/App.jsx` passaram a **chamar** esse guard em vez de repetir o `git diff` inline. Nenhuma verificação foi removida; a superfície do invariante é a mesma, só que agora com a exceção dev-only precisa embutida.

**Diff de `src/App.jsx`:** apenas adições. As linhas adicionadas são 2 imports da rota dev, 1 `lazy()` da rota, e o bloco `{shouldMountRuntimeV2DevPreviewRoute() && (<Route path={RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH} … />)}`. A única `path=` adicionada é a constante do path dev.

---

## O que foi implementado

- **Montagem real** da rota dev-only no roteador central (`src/App.jsx`), guardada por `shouldMountRuntimeV2DevPreviewRoute()` — `false` por padrão e em produção; o Vite elimina o ramo em builds de produção via `import.meta.env.DEV`.
- **Guard de produção compartilhado** que codifica a exceção dev-only precisa e é reutilizado por todos os 21 gates que guardam `src/App.jsx`.
- **Carregamento lazy** de `RuntimeV2DevPreviewRoute.jsx` — sem custo em produção quando a flag está desligada.

**Como usa Hub / Controlled Dataset:** a ativação não força nem o hub nem o dataset — cada um continua controlado pela sua própria flag; a rota (via seu route model) já respeita `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` e `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET`.
**Como evita dados reais / side effects:** o bloco montado só referencia o componente da rota (dev-guarded) — sem fetch, sem storage, sem Prisma, sem execução de action/workflow/connector, sem import de módulos reais.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:preview:route-activation` | ✅ 23/23 PASS |
| `npm run test:runtime` (full aggregate) | ✅ PASS (baseline + 23 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-preview-route-activation` (new) | ✅ PASS 18/18 |
| `gate:g423-preview-route-mount` (regression) | ✅ PASS 16/16 |
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

**Somente a montagem dev-only sancionada em `src/App.jsx`** (apenas adições; rota dev-guarded fora do menu). Nenhuma tela real, layout, `src/shared`/`src/framework`/`src/modules`/`src/studio` tocado.

## src/App.jsx alterado

**Sim — a montagem dev-only sancionada (autorizada por este slice).** Apenas adições; a única `path=` adicionada é o path dev; guardada por `shouldMountRuntimeV2DevPreviewRoute()`.

## Menu principal alterado

**Não.**

## Runtime legado preservado

**Sim.**

## D-RI-13

**Preservado.** O bloco montado não importa Prisma/backend/MMM. Verificado por teste, gate, e master gate G423.

## Próximo passo

**Migration planning do primeiro módulo real.** Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — rota off por padrão; produção falha fechada; portão único e explícito.
- **Determinismo:** PASS — mesmo env gera o mesmo mount plan.
- **Opt-in/off switch:** PASS — flag off por padrão; ramo eliminado em produção.
- **Dev-only:** PASS — exige `import.meta.env.DEV` (ou override de produção explícito).
- **Produção fail-closed:** PASS.
- **Sem side effects:** PASS.
- **Sem dados reais:** PASS.
- **Rota fora do menu principal:** PASS — `inMainMenu: false`; nenhum registro em menu/nav.
- **Gates não enfraquecidos de forma genérica:** PASS — exceção precisa (apenas adições, path dev) definida em um único guard compartilhado; todo o resto de `src/App.jsx` e toda a UI de produção continuam guardados.
- **Runtime legado preservado:** PASS.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; testes baseline intactos.
- **Genericidade preservada:** PASS — Empresas + cadcps continuam no hub via a rota.
- **D-RI-13:** PASS.
- **Débitos técnicos controlados:** dados reais, execução de ações reais, e Studio ficam fora deste slice.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-runtime-v2-dev-preview-route-activation/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice ativa a rota dev-only do Runtime v2 Dev Preview Hub (`/__dev/runtime-v2/previews`) montando-a de fato no roteador central de `src/App.jsx`, atrás de guardas dev-only e opt-in estritas, sem exposição no menu, sem dados reais e sem impacto em produção. A exceção nos gates é precisa (apenas adições, path dev) e centralizada em um único guard compartilhado — **os gates não foram enfraquecidos de forma genérica**. 23 novos testes, 1 novo gate, zero regressão, zero dependência nova, zero CSS global novo.
