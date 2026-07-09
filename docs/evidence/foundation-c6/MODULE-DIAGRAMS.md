# Foundation C.6 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M10 — Action Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.action] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=action, frozen post RT-3]
  REG --> AE[ActionEngine.dispatch]
  CMD[UecCommand: type + payload] --> AE
  AE -->|action unknown / no handler| ERR4[UecResult error MAK-L3-ACTION-004]
  AE -->|invalid command shape| ERR3[UecResult error MAK-L3-ACTION-003]
  AE -->|action declares permission| PE[M09 PermissionEngine.can]
  PE -->|denied| ERR5[UecResult error MAK-L3-ACTION-005]
  PE -->|allowed| HANDLER[bound handler invoked]
  AE -->|no permission declared| HANDLER
  HANDLER -->|success| OK[UecResult success + data]
  HANDLER -->|throws| ERR6[UecResult error MAK-L3-ACTION-006]
```

**Depends on:** M04 Registry (hydrated `action` bucket), M09 Permission Engine (delegated, not duplicated)
**Consumed by:** host app / future M16 Execution Engine (C.11) — dispatch is the entry point for UEC Commands

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> PE2[permissionEngine registered]
  PE2 --> AE2[actionEngine registered]
  SL[ServiceLocator] --> AE2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `ActionEngine` from the frozen, hydrated registry and the already-built `PermissionEngine` immediately after RT-5 wiring; `bootstrap.js` registers it into the Service Locator (`instance._serviceLocator.register('actionEngine', ...)`) alongside `registry`, `loader`, `crbLoader`, `dependencyResolver`, `router`, `permissionEngine`.

---

## Router / Runtime Context relationship

```mermaid
flowchart LR
  RC[Runtime Context / AccessScope] --> AE3[ActionEngine.dispatch ctx]
  RT[Runtime Router — RT-5/RT-6] -.does not call dispatch.-> AE3
  AE3 --> PE3[Permission Engine — same instance used by Router.canActivate]
```

**Note:** M10 does not depend on M08 Router at runtime — `canActivate()` (RT-5, route-level) and `ActionEngine.dispatch()` (action-level) are independent consumers of the same M09 `PermissionEngine` instance, avoiding duplicated permission logic (RT-C-09).

---

## C.6 Pipeline Position

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
  PERM --> ACT[Action Engine M10 — C.6]
  ACT --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M10, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.6:** RT-8 "Execute" gains its first real dispatcher (M10) — but only command → handler resolution, not the full 5-stage UP-09 pipeline (Validate → Authorize → Execute → Audit → Respond), which remains scheduled for **M16 Execution Engine (C.11)**. No Workflow (M11, C.7) or Render (M12, C.8) code was introduced in this slice.
