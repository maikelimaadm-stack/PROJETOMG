# Foundation C.12 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M17 — State Engine

```mermaid
flowchart TB
  CTX[Runtime Context] -.optional metadata.-> SE[StateEngine]
  SL[Service Locator] --> SE

  SE --> GET[get path]
  SE --> SET[set path, value]
  SE --> PATCH[patch partial]
  SE --> RESET[reset path?]
  SE --> SNAP[snapshot]
  SE --> SUB[subscribe path, listener]
  SE --> SCOPE[scope name — namespace-bound accessor]
  SE --> TRANS[transition entityRef, operation]

  GET -->|invalid path| ERR002[throw StateError MAK-L3-STATE-002]
  SET -->|invalid path / limit exceeded| ERR002
  SET -->|limit exceeded| ERR004[throw StateError MAK-L3-STATE-004]
  PATCH -->|non-object| ERR003[throw StateError MAK-L3-STATE-003]
  TRANS -->|unknown operation type| ERR005[throw StateError MAK-L3-STATE-005]

  SNAP --> SNAPSHOT[Runtime State Snapshot — deep, independent copy]
  SET --> MUTATION[Runtime State Mutation — internal tree, never exposed by reference]
  PATCH --> MUTATION
  RESET --> MUTATION
  TRANS --> MUTATION

  MUTATION -.->|notifies| SUB

  EXEC["Execution/Workflow/Render (future consumers)"] -.consomem estado.-> SE
```

**Depends on:** nothing mandatory — `StateEngine` has no required engine dependency; `initialState` is the only constructor input.
**Consumed by:** future Execution/Workflow/Render integrations (documented as future consumers, not wired in this slice); host application via Service Locator.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> EXE2[executionEngine registered — C.11]
  EXE2 --> STATE2[stateEngine registered — new, independent instance, empty initialState]
  SL[ServiceLocator] --> STATE2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds a default `StateEngine` with an empty `initialState` (no registry/CRB dependency needed — the engine is pure local state); `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## C.12 Pipeline Position

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
  EXE3 --> STATE3[State Engine M17 — C.12]
  STATE3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M17, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.12:** local runtime state now has a real, deterministic, isolated implementation (`get`/`set`/`patch`/`reset`/`snapshot`/`subscribe`/`scope`), plus a minimal `transition()` for generic entity-scoped operations. It is registered in the Service Locator but **not yet wired as a required dependency** into Execution/Workflow/Render — those remain future, explicitly documented integration points, not implemented in this slice. No Transaction Engine, Cache, Event Bus, Plugin Engine, Connector Engine, Studio, or Marketplace code exists in `src/runtime/core/state/`.
