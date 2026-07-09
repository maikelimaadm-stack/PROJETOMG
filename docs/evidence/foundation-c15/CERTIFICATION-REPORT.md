# Foundation C.15 — Certification Report

**Slice:** C.15 — M21/M22 Cache + Event Bus
**Branch:** `claude/foundation-c15-cache-event-bus`
**Base:** `main` @ `8ff2bf70` (post PR #405, C.14)
**Gates:** G423-21, G423-22 (PASS) · G423-01–20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/infra/cache/cacheEngine.js` | `CacheEngine` — `get()`, `set()`, `has()`, `delete()`, `clear()`, `invalidatePattern()`, `snapshot()`, `size()`, `namespace()`, `createCacheEngine()` |
| `src/runtime/infra/cache/errors.js` | `CacheError` (`MAK-L3-CACHE-001`..`005`) |
| `src/runtime/types/cache.js` | JSDoc types (`ICache`, `CacheSetOptions`) |
| `src/runtime/__tests__/cache/cache.test.js` | 21 tests — CRUD, namespace/instance isolation, snapshot safety, TTL with injectable clock, limits, prototype-pollution guard, Service Locator |
| `scripts/gates/g423-21-cache.mjs` | Gate G423-21 |
| `src/runtime/infra/event-bus/eventBus.js` | `EventBus` — `on()`, `once()`, `off()`, `emit()`, `publish()`, `subscribe()`, `clear()`, `listenerCount()`, `createEventBus()` |
| `src/runtime/infra/event-bus/errors.js` | `EventBusError` (`MAK-L3-EVENTBUS-001`..`006`) |
| `src/runtime/types/event-bus.js` | JSDoc types (`IEventBus`, `UecEvent`, `EventHandler`, `EmitResult`, `EventHandlerOutcome`) |
| `src/runtime/__tests__/event-bus/event-bus.test.js` | 20 tests — registration, ordering, per-handler failure isolation, limits, reentrancy guard, prototype-pollution guard, Service Locator |
| `scripts/gates/g423-22-event-bus.mjs` | Gate G423-22 |
| `docs/evidence/foundation-c15/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c15/MODULE-DIAGRAMS.md` | Mermaid — M21/M22 position and flow |
| `docs/evidence/foundation-c15/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds a default `CacheEngine` and `EventBus`; returns both in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `cacheEngine` and `eventBus` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createCacheEngine`/`CacheEngine`/`CacheError` and `createEventBus`/`EventBus`/`EventBusError`. |
| `package.json` | Added `gate:g423-21`, `gate:g423-22`, `test:runtime:c15`; extended aggregated `test:runtime`. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, or `src/studio/` was touched. No fixture change was needed — Cache/Event Bus don't depend on registry/CRB data.

**No maintenance fix needed this slice:** per `docs/runtime-implementation/05-FOLDER-STRUCTURE.md`, M21/M22 live under `infra/cache/` and `infra/event-bus/` (infrastructure), not `core/`. The prior "no Cache/Event Bus created" checks in gates G423-17/18/19 assert `core/cache`/`core/event-bus` don't exist — still true and unaffected by this slice's `infra/` placement, so no gate correction was required (unlike the C.8/C.12/C.13/C.14 precedent).

---

## O que foi implementado

### M21 — Cache Engine

Deterministic, isolated, runtime-local key/value store with optional TTL — never persists to disk, backend, `localStorage`/`sessionStorage`/`IndexedDB`, never queries Prisma/MMM. Each instance owns a private entry map; `namespace(name)` returns an ergonomic, prefix-isolated sub-cache view sharing the same underlying map (so different namespaces never leak keys into each other). TTL uses an injectable clock (`options.clock`, defaulting to `Date.now`) for fully deterministic expiration testing. `get()`/`snapshot()` always return deep, independent copies — mutating the returned value never touches internal state (same pattern already established for M17 State Engine). Explicit safety limits: `MAX_CACHE_ENTRIES` (1000), `MAX_KEY_LENGTH` (200), `MAX_NAMESPACE_LENGTH` (100), `MAX_VALUE_DEPTH` (8), plus a prototype-pollution guard (`__proto__`/`constructor`/`prototype` rejected as keys/namespaces or nested inside stored values).

SSOT-literal surface (`ICache`, `03-INTERFACES.md`): `get(key)`, `set(key, value, ttlSeconds?)`, `delete(key)`, `invalidatePattern(pattern)` (simple `*`-wildcard glob, no arbitrary regex from untrusted input) are all present and match the documented `Promise`-returning shapes. The richer ergonomic API requested for this slice (`has`, `clear`, `snapshot`, `size`, `namespace`) is layered on top without breaking that contract.

### M22 — Event Bus

In-process, deterministic pub/sub stub (D-RI-08: production DB-backed transport is Foundation F; this ships `IEventBus` + the stub). Handlers run in registration order; a throwing handler is captured as a per-handler outcome in `emit()`'s result and never prevents sibling handlers from running (rule from this slice's own instructions). `once()` handlers are removed after their single invocation, regardless of success/failure. A reentrancy guard bounds recursive `emit()` calls for the same event type (`MAX_REENTRANCY_DEPTH = 5`) so a handler that re-triggers its own event can never loop unboundedly — the guard's failure is itself captured as a per-handler outcome at the deepest level, consistent with "handler failure never breaks the chain."

SSOT-literal surface (`IEventBus`): `publish(event, ctx)` (wraps `emit()`, discarding the per-handler breakdown to match `Promise<void>`) and `subscribe(eventType, handler)` (alias of `on()`) are both present. The richer ergonomic API requested for this slice (`on`, `once`, `off`, `emit` with structured result, `clear`, `listenerCount`) is layered on top.

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `ICache` | ✅ `get`/`set`/`delete`/`invalidatePattern`, all `Promise`-returning |
| `03-INTERFACES.md` — `IEventBus` | ✅ `publish(event, ctx): Promise<void>`, `subscribe(eventType, handler): Unsubscribe` |
| `08-DONE-CRITERIA.md` M21 — "CRB cache key pattern matches PA-02" / "Invalidation on publish event" | ⚠️ deliberately deferred — see deviation below |
| `08-DONE-CRITERIA.md` M22 — "Publish/subscribe in-process" | ✅ fully in-process, no broker |
| `08-DONE-CRITERIA.md` M22 — "UEC event envelope compliant (UP-08)" | ✅ `publish(event: UecEvent, ctx)` accepts the `{type, payload}` envelope |
| `08-DONE-CRITERIA.md` M22 — "Interface compatible with Foundation F upgrade" | ✅ `IEventBus` shape unchanged; Foundation F only needs to swap the transport behind the same interface (D-RI-08) |
| D-RI-08 (Event Bus stub in C) | ✅ In-process only; no broker, no WebSocket, no BroadcastChannel, no worker/thread |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Neither module imports Prisma/backend |

### Deviação documentada

`08-DONE-CRITERIA.md` M21 expects the cache to be wired into the RT-1/RT-3 bootstrap steps (caching the resolved `EnvironmentPin` and the hydrated CRB, with invalidation on publish events). This slice's own explicit instructions scope M21/M22 to **generic, runtime-local infrastructure** — not to rewiring the bootstrap pipeline's pin/CRB caching behavior, and explicitly forbid forcing existing engines to depend on Cache/Event Bus without contractual need. `CacheEngine`/`EventBus` are built, tested, and registered in the Service Locator, ready for that future integration, but `loadRuntimeBundle.js`'s pin/CRB resolution itself was **not** modified to route through the cache in this slice — documented explicitly as deferred, not silently skipped, matching the deviation pattern already established in prior slices (D-RI-10 in C.9, the USM-catalog deviation in C.12).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c15` | ✅ 41/41 PASS (21 Cache + 20 Event Bus) |
| `npm run test:runtime` (full aggregate) | ✅ 358/358 PASS (317 baseline C.1–C.14 + 41 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-01`..`gate:g423-19` (regression) | ✅ all PASS, no changes needed |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |
| `gate:g423-21` (new — M21 Cache) | ✅ PASS 11/11 |
| `gate:g423-22` (new — M22 Event Bus) | ✅ PASS 11/11 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `ICache`/`IEventBus` implementados conforme `03-INTERFACES.md` (contratos pré-existentes). A decisão de não religar o bootstrap (pin/CRB caching) neste slice é uma escolha de escopo explicitamente instruída, documentada acima, não uma mudança de decisão arquitetural do SSOT.

## D-RI-13

**Preservado.** Nem `infra/cache/cacheEngine.js` nem `infra/event-bus/eventBus.js` importam Prisma, `@prisma/client`, ou qualquer caminho de `backend/`. Verificado por teste automatizado e pelos gates G423-21/G423-22.

## Próximo slice

**C.16 — M23 Transaction Engine**, per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

---

## Enterprise Quality Addendum

- **Escalabilidade Cache:** PASS/NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. `get`/`set`/`delete`/`has` O(1); `snapshot()`/`size()` O(entradas); tetos explícitos em todas as dimensões pedidas (entradas, tamanho de chave, tamanho de namespace, profundidade de valor).
- **Escalabilidade Event Bus:** PASS/NOTES — `emit()` O(handlers registrados para o tipo); registro/remoção O(1) amortizado; tetos explícitos (handlers por evento, tipos de evento distintos, profundidade de payload, profundidade de reentrância).
- **Segurança/fail-safe:** PASS — chave/evento/handler/payload inválidos sempre lançam erro tipado; item expirado tratado como ausente; falha de handler nunca interrompe os seguintes; reentrância excessiva é bloqueada.
- **Determinismo:** PASS — TTL testado com clock injetável; ordem de handlers testada explicitamente; `snapshot()`/`get()` nunca expõem referência interna.
- **Isolamento runtime-local:** PASS — sem broker externo, sem fila externa, sem WebSocket/BroadcastChannel/worker, sem `localStorage`/`sessionStorage`/`IndexedDB`, sem persistência backend.
- **Códigos de erro:** PASS — 5 códigos `MAK-L3-CACHE-001`..`005` + 6 códigos `MAK-L3-EVENTBUS-001`..`006`.
- **Contratos C.1–C.14 preservados:** PASS — regressão G423-01–19/20 100% verde, sem necessidade de correção (Cache/Event Bus vivem em `infra/`, não `core/`, então os checks de diretório existentes permaneceram válidos).
- **D-RI-13:** PASS — ver acima.
- **Transaction Engine fora do escopo:** PASS — nenhum diretório `core/transaction/` criado; nenhuma referência a `TransactionEngine`/`TransactionManager` no código-fonte de ambos os módulos.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- **Débitos técnicos controlados:** cache distribuído, persistência real, broker/event bus externo (produção, Foundation F/G426), retry/circuit breaker, e o religamento do bootstrap ao cache (pin/CRB) ficam explicitamente fora deste slice — documentados como trabalho futuro, não como lacuna silenciosa.
- **Arquivo complementar:** `docs/evidence/foundation-c15/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.15 entrega M21 Cache Engine e M22 Event Bus dentro do escopo: infraestrutura runtime-local determinística e isolada para ambos, conformidade SSOT-literal (`ICache`/`IEventBus`) com API ergonômica adicional camada por cima, TTL com clock injetável, ordem determinística de handlers, falha de handler capturada por resultado controlado sem quebrar os seguintes, guarda de reentrância, guarda de poluição de protótipo em ambos os módulos, limites explícitos e testados em todas as dimensões pedidas, 41 novos testes, 2 novos gates, zero regressão em G423-01–20 (nenhuma correção de manutenção necessária, já que Cache/Event Bus vivem em `infra/` e não colidem com os checks de `core/cache`/`core/event-bus` já existentes), zero mudança de SSOT, zero toque em UI de produção ou Studio, e nenhuma antecipação de C.16 (Transaction Engine) ou Observability Engine.
