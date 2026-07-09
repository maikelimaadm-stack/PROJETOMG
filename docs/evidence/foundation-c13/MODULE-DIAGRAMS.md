# Foundation C.13 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M18 — Plugin Engine

```mermaid
flowchart TB
  CRB[CrbPayload.objects — objectType=plugin] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=plugin, keyed by objectId, frozen post RT-3]
  REG --> PE[PluginEngine.resolve / load]
  CTX[Runtime Context] -.optional metadata.-> PE
  PERM[Permission Engine M09] --> PE
  SL[Service Locator M20] --> PE

  PE -->|unknown plugin| ERR002[throw PluginError MAK-L3-PLUGIN-002]
  PE -->|invalid manifest shape| ERR003[throw PluginError MAK-L3-PLUGIN-003]

  PE --> CAP[Plugin Capability Resolver — execute pluginId, capability]
  CAP -->|capability not a known extension point| ERR004[throw PluginError MAK-L3-PLUGIN-004]
  CAP -->|plugin disabled| ERR005[PluginResult error MAK-L3-PLUGIN-005]
  CAP -->|capability known but not permitted for this plugin| ERR006[PluginResult error MAK-L3-PLUGIN-006]
  CAP -->|required dependency missing| ERR007[PluginResult error MAK-L3-PLUGIN-007]
  CAP -->|permission denied by M09| ERR008[PluginResult error MAK-L3-PLUGIN-008]
  CAP -->|host-registered handler throws| ERR009[PluginResult error MAK-L3-PLUGIN-009]
  CAP -->|handler succeeds| RESULT[Plugin Result — success:true, data]

  HANDLER["host-registered handler (registerHandler) — never eval'd, never dynamically imported"] --> CAP

  EXEC["Execution/Action Engine (future controlled integration)"] -. integração controlada .-> PE
  STATE["State Engine (optional local state)"] -. estado local opcional .-> PE
```

**Depends on:** M04 Registry (hydrated `plugin` bucket), M09 Permission Engine (delegated, optional per plugin)
**Consumed by:** future controlled integrations from Execution/Action Engine (not wired in this slice); host application via Service Locator.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> STATE2[stateEngine registered — C.12]
  STATE2 --> PLUGIN2[pluginEngine registered — wired to registry + the already-resolved Permission Engine]
  SL[ServiceLocator] --> PLUGIN2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `PluginEngine` from the frozen, hydrated registry and the same `PermissionEngine` instance already resolved earlier in the same pipeline pass; `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## C.13 Pipeline Position

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
  STATE3 --> PLUGIN3[Plugin Engine M18 — C.13]
  PLUGIN3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M18, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.13:** RT-0 step 3.4 ("M18 load plugin manifests, no eval") now has a real, registry-driven, deterministic implementation. Manifests resolve from the hydrated CRB `plugin` bucket; capability execution always dispatches to a host-registered handler — never arbitrary plugin-supplied code. No Connector Engine, Cache, Event Bus, Transaction Engine, Studio, or Marketplace code exists in `src/runtime/core/plugin/`.
