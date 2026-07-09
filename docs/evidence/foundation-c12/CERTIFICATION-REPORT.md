# Foundation C.12 — Certification Report

**Slice:** C.12 — M17 State Engine
**Branch:** `claude/foundation-c12-state-engine`
**Base:** `main` @ `6f9d6d7b` (post PR #402, C.11)
**Gates:** G423-17 (PASS) · G423-01–16 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/state/stateEngine.js` | `StateEngine` — `get()`, `set()`, `patch()`, `reset()`, `snapshot()`, `subscribe()`, `scope()`, `getState()`/`setState()` (SSOT aliases), `transition()`, `createStateEngine()` |
| `src/runtime/core/state/errors.js` | `StateError` (`MAK-L3-STATE-001`..`005`) |
| `src/runtime/types/state.js` | JSDoc types (`IStateEngine`, `StateKey`, `StateListener`, `Unsubscribe`, `UsmOperation`, `UsmState`) |
| `src/runtime/__tests__/state/state.test.js` | 25 tests — CRUD, isolation, snapshot safety, limits, transition, Service Locator, D-RI-13 |
| `scripts/gates/g423-17-state.mjs` | Gate G423-17 |
| `docs/evidence/foundation-c12/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c12/MODULE-DIAGRAMS.md` | Mermaid — M17 position and flow |
| `docs/evidence/foundation-c12/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds a default `StateEngine` (empty `initialState`) and returns it in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `stateEngine` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createStateEngine`, `StateEngine`, `StateError`. |
| `package.json` | Added `gate:g423-17`, `test:runtime:c12`; extended aggregated `test:runtime`. |
| `src/runtime/__tests__/execution/execution.test.js` | **Maintenance fix** (see below): narrowed a C.11 scope-creep guard that regressed once M17 legitimately came to exist. |
| `scripts/gates/g423-16-execution.mjs` | **Maintenance fix** (same root cause), mirrored in the gate. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, or `src/studio/` was touched. The shared fixture (`empresas-crb.fixture.js`) was **not** modified — the State Engine test uses its own inline `initialState`, plus one integration test through the shared fixture that needed no fixture changes.

### Maintenance note (in-scope correction, same pattern as C.8)

`execution.test.js` and `scripts/gates/g423-16-execution.mjs` each had a check asserting `core/state/` **does not exist** — a scope-creep guard valid only during C.11's own authoring (to prove Execution Engine wasn't anticipating M17). Now that M17 legitimately exists (this slice), that assertion is obsolete and would regress C.11's own gate/test forever after. Fixed identically to the precedent set in C.8 (`g423-11-workflow.mjs`): narrowed to a permanently-valid condition — `executionEngine.js` itself never references `StateEngine`/`stateEngine` — instead of asserting the directory can never exist. No behavior change to `ExecutionEngine`.

---

## O que foi implementado

`StateEngine` is a deterministic, isolated, in-memory local state store — **not** a database, **not** a transaction engine, **not** the MMM/USM 20-operation lifecycle catalog (`16-UNIVERSAL-STATE-MACHINE.md`, which remains a Studio/MMM authoring concern). Each instance owns one private state tree; construction with an invalid `initialState` throws (`MAK-L3-STATE-001`).

**Practical API** (as requested for this slice): `get(path)` (read, no side effect), `set(path, value)` (write, creates intermediate objects), `patch(partial)` (deep-merge, preserves unrelated siblings), `reset(path?)` (whole-state or single-path reset to the constructor's `initialState`), `snapshot()` (deep, independent copy — mutating it never touches internal state), `scope(name)` (ergonomic namespace accessor bound to a top-level path, giving route/entity isolation), `subscribe(path, listener)` (returns an unsubscribe function, notified on `set`/`patch`/`reset` affecting that path or an ancestor/descendant of it).

**SSOT-literal surface** (`IStateEngine`, `03-INTERFACES.md`): `getState`/`setState` are thin aliases of `get`/`set`. `transition(entityRef, operation)` is implemented as a **minimal, generic** dispatcher over three fixed operation types (`set`/`patch`/`reset`) scoped under `entityRef` as a top-level path — deliberately **not** the full 20-operation MMM/USM catalog (`create`/`submit_review`/`publish`/`activate`/...), which would duplicate Studio/MMM's own authoring lifecycle and risk the State Engine "becoming a database" — explicitly forbidden by this slice's own rules. An unknown `operation.type` always throws `MAK-L3-STATE-005`, satisfying the M17 Done Criterion "Subscribers notified on change" together with `subscribe()`, and "USM transition updates entity state" at the scope this slice owns (generic local entity state, not the MMM lifecycle machine).

Safety limits: `MAX_PATH_DEPTH = 16` segments, `MAX_STATE_KEYS = 256` total keys (both throw `MAK-L3-STATE-004`); a prototype-pollution guard rejects `__proto__`/`constructor`/`prototype` as path segments or patch keys (`MAK-L3-STATE-002`).

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IStateEngine` | ✅ `getState`/`setState`/`subscribe`/`transition` all present, plus the ergonomic `get`/`set`/`patch`/`reset`/`snapshot`/`scope` API requested by this slice |
| `08-DONE-CRITERIA.md` M17 — "Route-scoped state isolated between routes" | ✅ `scope(name)` gives per-route/per-entity isolation within one engine instance; separate engine instances are isolated by construction |
| `08-DONE-CRITERIA.md` M17 — "USM transition updates entity state" | ✅ at the scope owned by this slice — a minimal generic dispatcher, not the full MMM/USM catalog (documented deviation, see below) |
| `08-DONE-CRITERIA.md` M17 — "Subscribers notified on change" | ✅ `subscribe()` fires on `set`/`patch`/`reset` affecting the observed path |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Pure in-memory store; no Prisma/backend import |
| Fail-safe | ✅ Invalid `initialState`/path/operation always throws typed `StateError`; unknown transition never silently passes (verified by gate) |

### Deviação documentada

`transition()` does **not** implement the full 10-state/20-operation Universal State Machine described in `platform-behavior/16-UNIVERSAL-STATE-MACHINE.md`. That catalog governs MMM **object** lifecycle (draft → in_review → approved → published → ...) enforced by the MMM API, Publish Engine, and Studio — not local runtime data. Implementing it here would (a) duplicate logic that belongs to MMM/Studio, (b) risk the State Engine turning into a persistence/lifecycle authority (explicitly forbidden by this slice's rules), and (c) anticipate C.13+ scope. This mirrors the D-RI-10 deviation precedent from C.9 (documented instead of silently ignored).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c12` | ✅ 25/25 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 265/265 PASS (240 baseline C.1–C.11 + 25 novos) |
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
| `gate:g423-11` (regression) | ✅ PASS 8/8 |
| `gate:g423-12` (regression) | ✅ PASS 9/9 |
| `gate:g423-13` (regression) | ✅ PASS 9/9 |
| `gate:g423-14` (regression) | ✅ PASS 11/11 |
| `gate:g423-15` (regression) | ✅ PASS 11/11 |
| `gate:g423-16` (regression, fixed) | ✅ PASS 14/14 |
| `gate:g423-17` (new — M17 State) | ✅ PASS 14/14 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `IStateEngine` implementado conforme `03-INTERFACES.md` (contrato pré-existente); a decisão de não reimplementar o catálogo completo USM (20 operações) dentro do runtime local é uma escolha de escopo documentada, não uma mudança de decisão arquitetural do SSOT.

## D-RI-13

**Preservado.** `core/state/stateEngine.js` não importa Prisma, `@prisma/client`, nem qualquer caminho de `backend/`. Verificado por teste automatizado e pelo gate G423-17 (regex sobre o código-fonte).

## Próximo slice

**C.13 — M18 Plugin Engine** (loads manifest without eval; extension point registration), per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

---

## Enterprise Quality Addendum

- **Escalabilidade:** PASS/NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. Leitura/escrita O(profundidade do path); `patch()`/`reset()` O(tamanho do estado afetado); `snapshot()` O(tamanho total do estado, via clone profundo); tetos explícitos contra path profundo e número de chaves.
- **Segurança/fail-safe:** PASS — estado inicial inválido, path/chave inválido (incluindo bloqueio de `__proto__`/`constructor`/`prototype`), e operação de transição desconhecida sempre lançam `StateError` tipado; nunca passam silenciosamente.
- **Determinismo:** PASS — mesma sequência de operações produz o mesmo estado; `get()`/`snapshot()` nunca mutam; `reset()` é previsível (retorna exatamente ao `initialState` capturado no construtor).
- **Isolamento de estado:** PASS — cada instância tem sua própria árvore de estado (testado explicitamente com duas instâncias); `scope()` isola namespaces dentro da mesma instância (testado explicitamente com duas rotas).
- **Códigos de erro:** PASS — 5 códigos (`MAK-L3-STATE-001`..`005`), cobrindo estado inicial inválido, path/chave inválido, argumento de operação inválido, limite excedido, e operação de transição desconhecida.
- **Contratos C.1–C.11 preservados:** PASS — regressão G423-01–16 100% verde (incluindo a correção de manutenção no gate G423-16, documentada acima); fixture compartilhada não foi alterada.
- **D-RI-13:** PASS — ver acima.
- **Transaction/Cache/Event Bus fora do escopo:** PASS — nenhum diretório `core/transaction/`, `core/cache/`, ou `core/event-bus/` criado; nenhuma referência a essas engines no código-fonte; verificado por teste e pelo gate.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- **Débitos técnicos controlados:** persistência real (troca do estado em memória por um backing store durável), sincronização multi-aba/multi-runtime, e o catálogo completo de 20 operações USM ficam explicitamente fora deste slice — documentados como trabalho futuro, não como lacuna silenciosa.
- **Arquivo complementar:** `docs/evidence/foundation-c12/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.12 entrega M17 State Engine dentro do escopo: store de estado local determinístico, isolado por instância e por namespace (`scope()`), com leitura/escrita/patch/reset/snapshot seguros, `subscribe()` funcional, e um `transition()` mínimo e genérico (não o catálogo completo USM, deliberadamente e documentado), 25 novos testes, 1 novo gate, zero regressão em G423-01–16/20 (com uma correção de manutenção documentada e aplicada no próprio gate G423-16, no mesmo padrão já usado em C.8), zero mudança de SSOT, zero toque em UI de produção ou Studio, e nenhuma antecipação de C.13 (Plugin Engine), Connector Engine, Cache, Event Bus, ou Transaction Engine.
