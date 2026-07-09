# Foundation C.8 — Certification Report

**Slice:** C.8 — M12 Render Engine
**Branch:** `claude/foundation-c8-render-engine`
**Base:** `main` @ `7d3cea84` (post PR #398, C.7)
**Gates:** G423-12 (PASS) · G423-01–11 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/render/renderEngine.js` | `RenderEngine` — `render()`, `registerAdapter()`, `createRenderEngine()`, built-in `table` adapter |
| `src/runtime/core/render/errors.js` | `RenderError` (`MAK-L3-RENDER-001`..`006`) |
| `src/runtime/types/render.js` | JSDoc types (`IRenderEngine`, `RenderTree`, `RenderFieldNode`, `ViewAdapter`) |
| `src/runtime/__tests__/render/render.test.js` | 19 tests — tree building, structural validation, permission filtering, Action/Workflow non-execution, Service Locator, determinism, D-RI-13, no-React/no-production-UI guards |
| `scripts/gates/g423-12-render.mjs` | Gate G423-12 |
| `docs/evidence/foundation-c8/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c8/MODULE-DIAGRAMS.md` | Mermaid — M12 position and flow |
| `docs/evidence/foundation-c8/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds a `RenderEngine` from the hydrated registry + M09 Permission Engine post-RT-5; returns `renderEngine` in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `renderEngine` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createRenderEngine`, `RenderEngine`, `RenderError`. |
| `src/runtime/__tests__/fixtures/empresas-crb.fixture.js` | The default `layout` entry (`empresas_layout`) now declares `viewMode: 'table'` and a `fields` array referencing the existing `razao_social` field (additive — no prior test asserted the old, field-less shape). Added optional `overrides.layoutEntries`. |
| `scripts/gates/g423-11-workflow.mjs` | **Bug fix, in-scope for C.8:** the C.7 gate had a check asserting "no Render Engine (M12) created" — that was a valid scope-creep guard only *while C.7 itself was being authored*, not a permanent regression invariant. Now that M12 legitimately exists (this slice), the check was replaced with a narrower, still-meaningful one: `workflowEngine.js` itself must never reference Render/Studio/Marketplace directly. This is a correction to the gate script, not a change to Workflow Engine behavior. |
| `package.json` | Added `gate:g423-12`, `test:runtime:c8`; extended aggregated `test:runtime`. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, or `src/modules/` was touched (verified via `git diff --name-only origin/main...HEAD` and enforced by the G423-12 gate itself).

---

## O que foi implementado

`RenderEngine.render(screenId, ctx)` resolves a CRB `layout` registry entry keyed by `screenId`, structurally validates its declared `fields` (array shape, each entry references a real `field` registry entry, explicit `component` values restricted to a known allowlist), builds an intermediate `RenderFieldNode[]`, filters it through the M09 `PermissionEngine.can()` (never re-implementing deny/allow), and hands the visible fields to a pluggable per-`viewMode` adapter (`registerAdapter`) — a built-in `table` adapter ships out of the box, matching the C.8 done-criteria ("Table adapter renders list from CRB fixture", "Permission-filtered fields omitted"). The result, `RenderTree`, is a plain frozen JS object — no React, no DOM, no side effects.

Fields may carry `actionRef`/`workflowRef` as **inert metadata** — the engine never calls `ActionEngine.dispatch()` or `WorkflowEngine.start()`; it only threads the codes through so a future host UI can decide when/if to act on them (verified by dedicated tests using instrumented fake engines that must never be invoked).

**Deliberate, documented deviation from the literal `03-INTERFACES.md` sketch:** `IRenderEngine.render()` is shown as synchronous (`RenderTree`, not `Promise<RenderTree>`). Since permission filtering requires awaiting the (already-async) M09 `PermissionEngine.can()`, and `03-INTERFACES.md §6` states "All async methods return Promise — sync only for pure evaluation (Expression/Formula)" (Render is not in that sync-exception list), the implementation is `async render(): Promise<RenderTree>` — consistent with every other engine in Foundation C (Action, Workflow, Permission) and with the general rule, not a contract violation.

Expression/Formula evaluation (RT-7 step 7.2, M13/M14) is explicitly **out of scope** — field values are not evaluated or bound to live data in this slice; the tree carries structural/config metadata only (component, dataType, label). This is consistent with the C.8 done-criteria (table adapter + permission filtering only) and the explicit prohibition on creating Expression/Formula engines in this slice.

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IRenderEngine` | ✅ `render(screenId, ctx)`, `registerAdapter(viewMode, adapter)` |
| `04-MODULE-CONTRACTS.md` RT-C-08 (Router → Render) | ✅ Consumes `screenId` conceptually equivalent to `RouteMatch.screenId` (host wiring beyond this slice) |
| `04-MODULE-CONTRACTS.md` RT-C-09 (Permission → Render) | ✅ `can(action, resource, ctx)` delegated, never duplicated |
| `04-MODULE-CONTRACTS.md` RT-C-12 (Render → Host UI) | ✅ Produces `RenderTree`; table adapter shipped, others incremental via `registerAdapter` |
| `06-BOOTSTRAP-SEQUENCE.md` RT-7 steps 7.1/7.3 | ✅ Adapter selection by viewMode; M09 visibility filter. Step 7.2 (M13/M14) and 7.4 (React mount) are explicitly out of scope. |
| `08-DONE-CRITERIA.md` M12 | ✅ Table adapter renders list from CRB fixture; permission-filtered fields omitted |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Reads only from the hydrated `IRegistry`; no Prisma/backend import |
| Fail-closed / safe-by-default | ✅ Unknown screen, invalid tree shape, unknown explicit component, and missing field references all throw typed errors before any tree is returned |

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c8` | ✅ 19/19 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 155/155 PASS (136 baseline C.1–C.7 + 19 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-01` (regression) | ✅ PASS 4/4 |
| `gate:g423-02` (regression) | ✅ PASS 4/4 |
| `gate:g423-03` (regression) | ✅ PASS 5/5 |
| `gate:g423-04` (regression) | ✅ PASS 5/5 |
| `gate:g423-05` (regression) | ✅ PASS 5/5 |
| `gate:g423-06` (regression) | ✅ PASS 5/5 |
| `gate:g423-07` (regression) | ✅ PASS 5/5 |
| `gate:g423-08` (regression) | ✅ PASS 5/5 |
| `gate:g423-09` (regression) | ✅ PASS 8/8 |
| `gate:g423-10` (regression) | ✅ PASS 7/7 |
| `gate:g423-11` (regression, script corrected) | ✅ PASS 8/8 |
| `gate:g423-12` (new — M12 Render) | ✅ PASS 9/9 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `IRenderEngine` implementado conforme `03-INTERFACES.md`, com a única nota de fidelidade documentada acima (assinatura async, consistente com `§6` das regras do próprio documento e com todos os demais engines já implementados).

## D-RI-13

**Preservado.** `core/render/renderEngine.js` não importa Prisma, `@prisma/client`, `backend/`, nem `react`/`react-dom`. Verificado por teste automatizado e pelo gate G423-12 (regex sobre o código-fonte + `git diff` confirmando que `src/App.jsx`/`src/shared`/`src/framework`/`src/modules` permanecem intocados).

## Próximo slice

**C.9 — M13/M14 Expression/Formula Engine** (adapters reutilizando G302, per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`).

---

## Enterprise Quality Addendum

- **Escalabilidade:** NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. Lookup no registry é O(1) por campo (Map interno); custo total de uma renderização é O(n) no número de campos declarados no layout, com teto explícito de 256 campos por layout (`MAX_FIELDS_PER_LAYOUT`).
- **Segurança/fail-safe:** PASS — nenhum caminho retorna `allow`/visível silenciosamente; falha de engine de permissão in-flight vira `visible:false`, não exceção não tratada.
- **Determinismo:** PASS — mesma entrada (registry + ctx) sempre produz a mesma `RenderTree` (testado explicitamente com `assert.deepEqual` em duas chamadas).
- **Códigos de erro:** PASS — 6 códigos `MAK-L3-RENDER-001`..`006`, cada um com causa distinta e testada.
- **Contratos C.1–C.7 preservados:** PASS — regressão G423-01–11 100% verde; nenhuma mudança de assinatura pública quebrou chamadas existentes (todos os novos parâmetros são opcionais com default).
- **D-RI-13:** PASS — ver acima.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`; gate G423-12 automatiza essa checagem.
- **Débitos técnicos controlados:** render real em React/DOM, form/kanban/outros 8 view modes, e avaliação de expressões/fórmulas (M13/M14) ficam fora deste slice — listados explicitamente, não escondidos.
- **Arquivo complementar:** `docs/evidence/foundation-c8/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.8 entrega M12 Render Engine dentro do escopo: árvore de renderização intermediária determinística e segura a partir do registry/CRB hidratado, adapter de tabela funcional, filtragem de permissão delegada (nunca duplicada) ao M09, metadados de Action/Workflow carregados sem nunca serem executados automaticamente, integração real com M20, 19 novos testes, 1 novo gate, zero regressão em G423-01–11/20 (com correção legítima de um gate desatualizado do C.7), zero mudança de SSOT, zero toque em UI de produção, e nenhuma antecipação de C.9 (Expression/Formula), Studio ou Marketplace.
