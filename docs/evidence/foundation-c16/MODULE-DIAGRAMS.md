# Foundation C.16 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M23 — Transaction Engine

```mermaid
flowchart TB
  CTX[Runtime Context] -.optional metadata.-> TE[TransactionEngine]
  SL[Service Locator M20] --> TE

  TE --> BEGIN[begin options]
  TE --> COMMIT[commit transactionId]
  TE --> ROLLBACK[rollback transactionId]
  TE --> RUN[run fn, options]
  TE --> REGISTER[registerParticipant name, participant]

  BEGIN -->|invalid metadata/id / limit exceeded| ERR006[throw TransactionError MAK-L3-TRANSACTION-006/007]
  COMMIT -->|unknown transaction| ERR004[throw TransactionError MAK-L3-TRANSACTION-004]
  COMMIT -->|already finalized| ERR005[throw TransactionError MAK-L3-TRANSACTION-005]
  REGISTER -->|invalid name/limit| ERR002[throw TransactionError MAK-L3-TRANSACTION-002]
  REGISTER -->|invalid shape| ERR003[throw TransactionError MAK-L3-TRANSACTION-003]

  BEGIN --> PARTICIPANTS[Transaction Participants — host-registered]
  COMMIT --> PARTICIPANTS
  ROLLBACK --> PARTICIPANTS

  PARTICIPANTS -->|prepare fails| ROLLBACKALREADY[rollback already-prepared, reverse order]
  ROLLBACKALREADY --> COMMITRESULT[Commit Result — success:false, PREPARE_FAILED]
  PARTICIPANTS -->|commit fails| COMPENSATE[compensate already-committed, reverse order]
  COMPENSATE --> COMMITRESULT2[Commit Result — success:false, COMMIT_FAILED]
  PARTICIPANTS -->|all prepare+commit succeed| COMMITRESULT3[Commit Result — success:true]

  PARTICIPANTS -->|rollback per participant, captured individually| ROLLBACKRESULT[Rollback Result — success:true, participantResults]

  RUN --> BEGIN
  RUN -->|fn throws| ROLLBACK
  RUN -->|fn succeeds| COMMIT

  STATECACHEEB["State/Cache/EventBus (M17/M21/M22)"] -. participantes locais futuros/host-registrados .-> TE
  FUTURE["Execution/Workflow/Connector (future consumers)"] -. integração controlada .-> TE
```

**Depends on:** nothing mandatory — `TransactionEngine` has no required engine dependency; an injectable `clock` and optional `maxActiveDurationMs` are the only constructor options.
**Consumed by:** future controlled integrations from Execution/Workflow/Connector (documented as future consumers, not wired in this slice); host application via Service Locator. State/Cache/Event Bus can be wrapped by a host-registered participant (illustrated in tests) without any forced coupling.

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> EB2[eventBus registered — C.15]
  EB2 --> TX2[transactionEngine registered — new, independent instance]
  SL[ServiceLocator] --> TX2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds a default `TransactionEngine` (no registry/CRB dependency — pure runtime-local infrastructure, same as Cache/Event Bus); `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## C.16 Pipeline Position

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
  EB3 --> TX3[Transaction Engine M23 — C.16]
  TX3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M19, M21-M23, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.16:** a real, deterministic, runtime-local unit-of-work coordinator now exists for M16 handlers and future consumers to build atomic-looking multi-participant operations over already-existing local infrastructure (State/Cache/Event Bus, if wrapped as participants). It is registered in the Service Locator but **not yet wired as a required dependency** into Execution/Workflow — those remain future, explicitly documented integration points. No real database/Prisma transaction, Observability Engine, Studio, or Marketplace code exists in `src/runtime/infra/transaction/`.
