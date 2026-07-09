# Foundation C.7 — Certification Report

**Slice:** C.7 — M11 Workflow Engine
**Branch:** `claude/foundation-c7-workflow-engine`
**Base:** `main` @ `8e7da523` (post PR #397, C.6)
**Gates:** G423-11 (PASS) · G423-01–10 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/workflow/workflowEngine.js` | `WorkflowEngine` — `start()`, `transition()`, `getInstance()`, `createWorkflowEngine()` |
| `src/runtime/core/workflow/errors.js` | `WorkflowError` (`MAK-L3-WORKFLOW-001`..`006`) |
| `src/runtime/types/workflow.js` | JSDoc types (`IWorkflowEngine`, `WorkflowInstance`, `WorkflowDefinition`, `UsmOperation`) |
| `src/runtime/__tests__/workflow/workflow.test.js` | 21 tests — engine, definition validation, human-step queue, Action Engine delegation, permission integration, Service Locator, D-RI-13, out-of-scope guards |
| `scripts/gates/g423-11-workflow.mjs` | Gate G423-11 |
| `docs/evidence/foundation-c7/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c7/MODULE-DIAGRAMS.md` | Mermaid — M11 position and flow |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds a `WorkflowEngine` from the hydrated registry + already-built M10 Action Engine + M09 Permission Engine post-RT-5; returns `workflowEngine` in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `workflowEngine` into `instance._serviceLocator` alongside the other RT-3 services. |
| `src/runtime/index.js` | Exports `createWorkflowEngine`, `WorkflowEngine`, `WorkflowError`. |
| `src/runtime/__tests__/fixtures/empresas-crb.fixture.js` | The default `workflow` registry entry (`empresa_approval`) now carries a minimal valid `steps` array (additive; existing `registry.has('workflow', 'empresa_approval')` assertion in `crb.test.js` unaffected). Added optional `overrides.workflowEntries` for custom scenarios. |
| `package.json` | Added `gate:g423-11`, `test:runtime:c7`; extended aggregated `test:runtime`. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched.

---

## O que foi implementado

`WorkflowEngine.start(definitionId, payload, ctx)` resolves and structurally validates a CRB `workflow` registry entry (steps array, step `id`/`type`, action steps requiring an `action` code), optionally checks a workflow-level `permission` via M09 (throwing `WorkflowError` if denied — no instance is created), then drives an in-process USM loop over `steps`:

- **`action` steps** delegate to M10 `ActionEngine.dispatch()` — no permission/dispatch logic duplicated. If the action fails, the instance becomes `status: 'failed'` with `lastError` (not thrown — a legitimate business outcome).
- **`human` steps** are queued: instance becomes `status: 'waiting'` (stub — no UI render), and `transition(instanceId, { type: 'complete-human-step' }, ctx)` advances it, continuing the loop until completion, failure, or the next human step.

Structural/config problems (unknown workflow, invalid definition, unsupported step type, invalid call arguments, unknown USM operation, transitioning a terminal instance) throw typed `WorkflowError` — distinct from business-outcome failures (action denied/failed), which are recorded on the returned instance per the `IWorkflowEngine` contract (`Promise<WorkflowInstance>`, no error-result wrapper defined by SSOT for this interface, unlike `IActionEngine.dispatch(): Promise<UecResult>`).

Persistence is an injectable `store` (default: in-memory `Map`) — the "BE persistence stub" called for in `10-DELIVERY-PLANNING.md` §C.7, swappable later for a real Internal-API-backed store without touching engine logic. No Prisma/backend call exists in this slice.

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IWorkflowEngine` | ✅ `start(definitionId, payload, ctx)`, `transition(instanceId, operation, ctx)`, `getInstance(instanceId)` |
| `04-MODULE-CONTRACTS.md` RT-C-11 (Workflow → Action) | ✅ Transition/step execution triggers bound M10 actions; persistence modeled as FE stub / BE-swappable |
| `08-DONE-CRITERIA.md` M11 | ✅ Start + transition via USM operation; human step queued (stub, no UI); instance persisted (stub store) |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Reads only from the hydrated `IRegistry`; no Prisma/backend import |
| Fail-closed principle | ✅ No silent allow; permission-declaring workflows blocked without a wired/granting engine; unsupported/invalid definitions rejected before instance creation |

## Débito / convenção documentada

Workflows declare permission via `payload.permission` — same additive convention as C.5 (routes) and C.6 (actions), not a CRB schema change. Full BE persistence (a real Internal-API-backed workflow instance store, matching "Instance persisted (BE)") remains a stub — the injectable `store` interface is ready, but no BE store implementation exists yet (out of scope for FE runtime v2; would be wired when the BE workflow persistence endpoint exists, unrelated to this slice's boundaries).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c7` | ✅ 21/21 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 136/136 PASS (115 baseline C.1–C.6 + 21 novos) |
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
| `gate:g423-11` (new — M11 Workflow) | ✅ PASS 8/8 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `IWorkflowEngine` implementado exatamente conforme `03-INTERFACES.md` (contrato pré-existente, não modificado).

## D-RI-13

**Preservado.** `core/workflow/workflowEngine.js` não importa Prisma, `@prisma/client`, nem qualquer caminho de `backend/`. Verificado por teste automatizado e pelo gate G423-11 (regex sobre o código-fonte). O gate também confirma que nenhum diretório `core/render/` foi criado e que o arquivo não referencia Render Engine/Studio/Marketplace.

## Próximo slice

**C.8 — M12 Render Engine** (table view adapter, migração da lista de empresas), per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

## Status

**PASS.** Slice C.7 entrega M11 Workflow Engine dentro do escopo: start/transition via operação USM, step humano enfileirado (stub, sem render), steps de ação delegando ao M10 sem duplicar lógica, integração real com M09 e M20, 21 novos testes, 1 novo gate, zero regressão em G423-01–10/20, zero mudança de SSOT, e nenhuma antecipação de C.8 (Render), Studio ou Marketplace.
