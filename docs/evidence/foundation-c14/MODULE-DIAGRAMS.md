# Foundation C.14 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M19 — Connector Engine

```mermaid
flowchart TB
  CRB[CrbPayload.objects — objectType=integration] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=connector, keyed by objectId, frozen post RT-3]
  REG --> CE[ConnectorEngine.resolve / load]
  CTX[Runtime Context] -.optional metadata.-> CE
  PERM[Permission Engine M09] --> CE
  SL[Service Locator M20] --> CE

  CE -->|unknown connector| ERR002[throw ConnectorError MAK-L3-CONNECTOR-002]
  CE -->|invalid manifest / request shape| ERR003[throw ConnectorError MAK-L3-CONNECTOR-003]

  CE --> HAR[Host Adapter Registry — registerOperation / registerAdapter]
  HAR -->|operation not a known Host Adapter Registry entry| ERR004[throw ConnectorError MAK-L3-CONNECTOR-004]
  HAR -->|connector disabled| ERR005[ConnectorResponse error MAK-L3-CONNECTOR-005]
  HAR -->|operation known but not permitted for this connector| ERR006[ConnectorResponse error MAK-L3-CONNECTOR-006]
  HAR -->|required dependency missing| ERR007[ConnectorResponse error MAK-L3-CONNECTOR-007]
  HAR -->|permission denied by M09| ERR008[ConnectorResponse error MAK-L3-CONNECTOR-008]
  HAR -->|payload/manifest/result exceeds limits or prototype pollution| ERR009[throw ConnectorError MAK-L3-CONNECTOR-009]
  HAR -->|host-registered adapter throws| ERR010[ConnectorResponse error MAK-L3-CONNECTOR-010]
  HAR --> RESULT[Connector Result — success:true, data redacted]

  ADAPTER["host-registered adapter (registerAdapter) — the only place a real HTTP/DB/transport call may run, outside core/connector/"] --> HAR

  PLUGIN["Plugin/Execution Engine (future controlled integration)"] -. integração futura controlada .-> CE
  STATE["State Engine (optional local state)"] -. estado local opcional .-> CE
```

**Depends on:** M04 Registry (hydrated `connector` bucket), M09 Permission Engine (delegated, optional per connector)
**Consumed by:** future controlled integrations from Plugin/Execution Engine (not wired in this slice); host application via Service Locator.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> PLUGIN2[pluginEngine registered — C.13]
  PLUGIN2 --> CONN2[connectorEngine registered — wired to registry + the already-resolved Permission Engine]
  SL[ServiceLocator] --> CONN2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `ConnectorEngine` from the frozen, hydrated registry and the same `PermissionEngine` instance already resolved earlier in the same pipeline pass; `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## C.14 Pipeline Position

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
  PLUGIN3 --> CONN3[Connector Engine M19 — C.14]
  CONN3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M19, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.14:** RT-C-17 (Plugin → Connector, "no eval, manifest-only") now has a real, registry-driven, deterministic implementation. Connector invocation always dispatches to a host-registered adapter — never a direct network call inside `core/connector/`. RT-C-18 (Connector → External systems, HTTP first) remains deliberately unimplemented at the transport level — that responsibility belongs to the host adapter, not this module (documented deviation). No Cache, Event Bus, Transaction Engine, Studio, or Marketplace code exists in `src/runtime/core/connector/`.
