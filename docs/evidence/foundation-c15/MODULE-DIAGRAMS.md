# Foundation C.15 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M21 — Cache Engine

```mermaid
flowchart TB
  CTX[Runtime Context] -.optional metadata.-> CE[CacheEngine]
  SL[Service Locator M20] --> CE

  CE --> GET[get key]
  CE --> SET[set key, value, options]
  CE --> HAS[has key]
  CE --> DEL[delete key]
  CE --> CLEAR[clear namespace?]
  CE --> SNAP[snapshot]
  CE --> SIZE[size namespace?]
  CE --> NS[namespace name — bound sub-cache view]
  CE --> INVAL[invalidatePattern pattern]

  GET -->|invalid key| ERR002[throw CacheError MAK-L3-CACHE-002]
  SET -->|invalid key/namespace| ERR002
  SET -->|value too deep / prototype pollution| ERR004[throw CacheError MAK-L3-CACHE-004]
  SET -->|entry count exceeded| ERR005[throw CacheError MAK-L3-CACHE-005]
  NS -->|invalid namespace| ERR003[throw CacheError MAK-L3-CACHE-003]

  SET --> STORE[Runtime Local Cache — TTL via injectable clock]
  GET --> STORE
  STORE -->|expired| ABSENT[treated as absent, entry evicted]

  RUNTIME["Runtime Modules (future consumers)"] -.cache local.-> CE
```

**Depends on:** nothing mandatory — `CacheEngine` has no required engine dependency; an injectable `clock` is the only constructor option.
**Consumed by:** future runtime modules needing local memoization (not wired as a required dependency in this slice); host application via Service Locator.

---

## M22 — Event Bus

```mermaid
flowchart TB
  CTX2[Runtime Context] -.optional.-> EB[EventBus]
  SL2[Service Locator M20] --> EB

  EB --> ON[on eventType, handler, options]
  EB --> ONCE[once eventType, handler]
  EB --> OFF[off eventType, handlerOrSubscription]
  EB --> EMIT[emit eventType, payload, ctx]
  EB --> PUB[publish UecEvent, ctx — SSOT-literal]
  EB --> SUB[subscribe eventType, handler — SSOT-literal alias of on]

  ON -->|invalid event type| ERR002[throw EventBusError MAK-L3-EVENTBUS-002]
  ON -->|invalid handler| ERR003[throw EventBusError MAK-L3-EVENTBUS-003]
  ON -->|too many handlers/event types| ERR005[throw EventBusError MAK-L3-EVENTBUS-005]
  EMIT -->|invalid payload / prototype pollution| ERR004[throw EventBusError MAK-L3-EVENTBUS-004]
  EMIT -->|reentrancy depth exceeded| ERR006[throw EventBusError MAK-L3-EVENTBUS-006]

  EMIT --> SUBSCRIBERS[Runtime Local Subscribers — registration-order dispatch]
  SUBSCRIBERS -->|handler throws| CAPTURED[captured as per-handler outcome, siblings still run]
  SUBSCRIBERS -->|handler succeeds| RESULT[EmitResult — success + value per handler]

  FUTURE["Execution/Workflow/Plugin/Connector (future consumers)"] -.eventos internos.-> EB
```

**Depends on:** nothing mandatory — `EventBus` has no required engine dependency.
**Consumed by:** future controlled integrations from Execution/Workflow/Plugin/Connector (documented as future consumers, not wired in this slice — D-RI-08 in-process stub, Foundation F replaces the transport); host application via Service Locator.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> CONN2[connectorEngine registered — C.14]
  CONN2 --> CACHE2[cacheEngine registered — new, independent instance]
  CACHE2 --> EB2[eventBus registered — new, independent instance]
  SL[ServiceLocator] --> CACHE2
  SL --> EB2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds a default `CacheEngine` and `EventBus` (no registry/CRB dependency — both are pure runtime-local infrastructure); `bootstrap.js` registers both into the Service Locator alongside every other RT-3 service.

---

## C.15 Pipeline Position

```mermaid
flowchart TD
  B[Bootstrap M01 / RT-0] --> SL0[ServiceLocator init — M20]
  SL0 --> C[Context M02]
  C --> S[Session M03]
  S --> R[Registry M04]
  R --> L[Loader M05]
  L --> CRB[CRB Loader M06]
  CRB --> DEP[Dependency Resolver M07]
  DEP --> PERM[Permission Engine M09]
  PERM --> ACT[Action Engine M10]
  ACT --> WF[Workflow Engine M11]
  WF --> REND[Render Engine M12]
  REND --> XE3[Expression Engine M13]
  XE3 --> FORM3[Formula Engine M14]
  FORM3 --> VAL3[Validation Engine M15]
  VAL3 --> EXE3[Execution Engine M16]
  EXE3 --> STATE3[State Engine M17]
  STATE3 --> PLUGIN3[Plugin Engine M18]
  PLUGIN3 --> CONN3[Connector Engine M19]
  CONN3 --> CACHE3[Cache Engine M21 — C.15]
  CACHE3 --> EB3[Event Bus M22 — C.15]
  EB3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M19, M21-M22, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.15:** local runtime infrastructure for caching and in-process event distribution now exists (`ICache`/`IEventBus`, D-RI-08 stub). Neither is yet wired as a required dependency into RT-1/RT-3 bootstrap caching (pin/CRB) or into RT-8 post-commit event emission (M16 Execution → M22) — both remain future, explicitly documented integration points. No Transaction Engine, Observability Engine, Studio, or Marketplace code exists in `src/runtime/infra/cache/` or `src/runtime/infra/event-bus/`.
