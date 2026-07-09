# Foundation C.7 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M11 — Workflow Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.workflow] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=workflow, frozen post RT-3]
  REG --> WE[WorkflowEngine.start / transition]
  CTX[Runtime Context / AccessScope] --> WE
  WE -->|workflow declares permission| PE[M09 PermissionEngine.can]
  PE -->|denied| ERR5[throw WorkflowError MAK-L3-WORKFLOW-005]
  PE -->|allowed| RUN[USM loop over steps]
  WE -->|no permission declared| RUN
  RUN -->|step type = action| AE[M10 ActionEngine.dispatch]
  AE -->|success| NEXT[advance stepIndex]
  AE -->|failure| FAILED[instance.status = failed + lastError]
  RUN -->|step type = human| WAITING[instance.status = waiting — stub, no render]
  WAITING -->|transition complete-human-step| RUN
  RUN -->|steps exhausted| DONE[instance.status = completed]
```

**Depends on:** M04 Registry (hydrated `workflow` bucket), M10 Action Engine (delegated, not duplicated), M09 Permission Engine (delegated, not duplicated)
**Consumed by:** host app (workflow-driven UI, out of scope for C.7 — no render introduced)

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> AE2[actionEngine registered]
  AE2 --> WE2[workflowEngine registered]
  SL[ServiceLocator] --> WE2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `WorkflowEngine` from the frozen, hydrated registry and the already-built `ActionEngine`/`PermissionEngine` immediately after M10 wiring; `bootstrap.js` registers it into the Service Locator (`instance._serviceLocator.register('workflowEngine', ...)`) alongside `registry`, `loader`, `crbLoader`, `dependencyResolver`, `router`, `permissionEngine`, `actionEngine`.

---

## C.7 Pipeline Position

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
  ACT --> WF[Workflow Engine M11 — C.7]
  WF --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M11, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.7:** Human tasks are queued as a stub (no UI) per done-criteria — real host-UI rendering of pending human steps remains **M12 Render Engine (C.8)**, not introduced here. No Render Engine, Studio, or Marketplace code exists in `src/runtime/core/workflow/`.
