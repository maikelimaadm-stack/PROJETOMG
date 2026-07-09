# Foundation C.8 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M12 — Render Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.layout + .field] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry types=layout,field, frozen post RT-3]
  REG --> RE[RenderEngine.render screenId]
  CTX[Runtime Context / AccessScope] --> RE
  RE --> RESOLVE[resolve + validate field refs]
  RESOLVE -->|unknown screen| ERR3[throw RenderError MAK-L3-RENDER-003]
  RESOLVE -->|invalid fields shape / dangling field ref| ERR4[throw RenderError MAK-L3-RENDER-004]
  RESOLVE -->|unknown explicit component| ERR5[throw RenderError MAK-L3-RENDER-005]
  RESOLVE --> PE[M09 PermissionEngine.can per field.permission]
  PE -->|denied / no engine + declared perm| HIDDEN[field omitted from tree]
  PE -->|allowed / no permission declared| VISIBLE[field kept]
  VISIBLE --> ADAPT[viewMode adapter — table built-in]
  ADAPT -->|no adapter registered| ERR6[throw RenderError MAK-L3-RENDER-006]
  ADAPT --> TREE[RenderTree — plain frozen object, no React/DOM]
  TREE -.actionRef / workflowRef metadata only.-> META[never dispatched / never started]
```

**Depends on:** M04 Registry (hydrated `layout`/`field` buckets), M09 Permission Engine (delegated, not duplicated)
**Consumed by:** future host UI (React mount, out of scope for C.8 — no render target introduced)

---

## Permission / Action / Workflow relationship (no auto-execution)

```mermaid
flowchart LR
  RE2[RenderEngine] -->|can action,resource,ctx| PE2[M09 PermissionEngine]
  RE2 -.carries actionRef as metadata, never calls.-> AE2[M10 ActionEngine — untouched]
  RE2 -.carries workflowRef as metadata, never calls.-> WE2[M11 WorkflowEngine — untouched]
```

**Note:** M12 never imports or invokes `ActionEngine.dispatch()` or `WorkflowEngine.start()` — verified by tests using instrumented fake engines that assert zero invocations even when a field declares `actionRef`/`workflowRef`.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> WE3[workflowEngine registered]
  WE3 --> RE3[renderEngine registered]
  SL[ServiceLocator] --> RE3
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `RenderEngine` from the frozen, hydrated registry and the already-built `PermissionEngine` immediately after M11 wiring; `bootstrap.js` registers it into the Service Locator alongside `registry`, `loader`, `crbLoader`, `dependencyResolver`, `router`, `permissionEngine`, `actionEngine`, `workflowEngine`.

---

## C.8 Pipeline Position

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
  WF --> REND[Render Engine M12 — C.8]
  REND --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M12, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.8:** RT-7 gains its first real, non-stub piece — table-adapter tree building with permission filtering — but step 7.2 (M13/M14 Expression/Formula binding evaluation) and 7.4 (actual React mount) remain unimplemented, scheduled for **C.9** and beyond. No Expression Engine, Formula Engine, Studio, or Marketplace code exists in `src/runtime/core/render/`.
