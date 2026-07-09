# Foundation C.17 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M24 — Observability Engine

```mermaid
flowchart TB
  RM[Runtime Modules — M01-M23] -.optional diagnostics.-> OE[ObservabilityEngine]
  SL[Service Locator M20] --> OE

  OE --> REC[recordEvent type, payload, context]
  OE --> MET[recordMetric name, value, tags]
  OE --> TRACE[startTrace name, context]
  OE --> ENDTRACE[endTrace traceId, result]
  OE --> SPAN[startSpan name, ctx — SSOT alias]
  OE --> LOG[log level, message, meta — SSOT alias]
  OE --> ERR[captureError error, context]
  OE --> HEALTH[health — SSOT alias]
  OE --> READY[readiness runtime]

  REC -->|invalid shape/limit/pollution| ERR001[throw ObservabilityError MAK-L3-OBSERVABILITY-001/004]
  MET -->|invalid value/tags| ERR002[throw ObservabilityError MAK-L3-OBSERVABILITY-002]
  TRACE -->|unknown/ended| ERR003[throw ObservabilityError MAK-L3-OBSERVABILITY-003]
  OE -->|invalid clock| ERR005[throw ObservabilityError MAK-L3-OBSERVABILITY-005]

  REC --> REDACT[redactSensitive — password/token/secret/apiKey/authorization/cookie/credential]
  ERR --> REDACT
  TRACE --> REDACT

  OE --> SNAP[snapshot — deep clone of all buffers]
  SNAP -->|mutating returned snapshot| NOEFFECT[never affects internal state — cloneRecord]

  OE --> CLEAR[clear — reset all buffers]

  RM2["Runtime Events/Metrics/Traces/Errors\n(events/metrics/traces/errors)"] -.buffered runtime-local, no external send.-> OE
```

**Depends on:** nothing mandatory — `ObservabilityEngine` has no required engine dependency; an injectable `clock` is the only constructor option.
**Consumed by:** any Runtime module via the Service Locator (`observabilityEngine`), for diagnostic recording; `RuntimeCompletion` checks its presence as M24 during the Foundation C audit. Never sends telemetry externally, never persists to disk/backend.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> TX3[transactionEngine registered — C.16]
  TX3 --> OE3[observabilityEngine registered — new, independent instance]
  SL[ServiceLocator] --> OE3
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds a default `ObservabilityEngine` (no registry/CRB dependency — pure runtime-local infrastructure, same as Cache/Event Bus/Transaction); `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## Runtime Completion — Foundation C closure audit

```mermaid
flowchart TB
  RC[RuntimeCompletion] --> CRC[checkRuntimeCompleteness runtime]
  RC --> CSA[checkServiceAvailability serviceLocator]
  RC --> CGM[checkGatesManifest manifest]
  RC --> CFR[createFoundationCReport runtime]

  CRC --> MR["MODULE_REGISTRY — M01..M24\n(direct property OR Service Locator .has fallback)"]
  MR -->|module present| AVAIL[status: available]
  MR -->|module absent/errors internally| MISSING[status: missing — never throws]

  CSA --> SL[Service Locator M20]
  SL -->|resolve name| SVCAVAIL[available: true/false]
  CSA -->|invalid locator argument| ERRC002A[throw RuntimeCompletionError MAK-L3-COMPLETION-002]

  CGM --> FS[fs.existsSync per gate script path]
  CGM -->|non-array manifest| ERRC002B[throw RuntimeCompletionError MAK-L3-COMPLETION-002]

  CFR --> CRC
  CFR --> REPORT["Foundation C Report\n{modules, availableCount, missingCount, generatedAt}"]

  REPORT -.consumed by.-> GATE[gate:g423 master — scripts/gates/g423-foundation-c.mjs]
  GATE --> G01_24["G423-01..G423-24 presence + individual PASS"]
  GATE --> NOPRISMA["no Prisma/backend in src/runtime/"]
  GATE --> NOSSOT["SSOT untouched this slice"]
  GATE --> NOUICHANGE["production UI untouched this slice"]
```

**Depends on:** nothing mandatory — pure static/read-only audit, no registry/CRB dependency. Deliberately **not** registered into the Service Locator (it audits the runtime, it isn't a runtime service).
**Consumed by:** `scripts/gates/g423-foundation-c.mjs` (master gate) and evidence generation. Never invoked by production UI, Studio, or Marketplace code.

---

## C.17 Pipeline Position

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
  CONN3 --> CACHE3[Cache Engine M21]
  CACHE3 --> EB3[Event Bus M22]
  EB3 --> TX3[Transaction Engine M23]
  TX3 --> OE4[Observability Engine M24 — C.17]
  OE4 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M24 all resolvable]
  SL3 --> READY[Runtime Ready]
  READY -.audited by, not part of pipeline.-> RC2[Runtime Completion — static audit tool]
```

**Foundation C status after C.17:** all 24 runtime modules (M01–M24) are implemented, wired through `loadRuntimeBundle.js`/`bootstrap.js`, and resolvable via the Service Locator. `RuntimeCompletion` provides a static, read-only audit confirming this composition without executing real Action/Workflow/Connector behavior. The master gate `gate:g423` validates the entire Foundation C surface in one command. No real database/Prisma transaction, no external telemetry export, no Studio, or Marketplace code exists in `src/runtime/`.
