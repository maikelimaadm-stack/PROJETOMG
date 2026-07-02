# 21 — Universal Execution Sequence

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-21

---

## Master sequence

```mermaid
flowchart TD
  ST[Studio] -->|command| MMM[MMM API]
  MMM -->|approved scope| PUB[Publish Engine]
  PUB -->|compile+sign| CRB[CRB mmm-crb-v1]
  CRB --> PIN[Environment Pin]
  PIN --> RT[Runtime RT-0 to RT-8]
  RT --> BOS[BOS User UI]
  BOS -->|action| ACT[Action Engine]
  ACT -->|crud| GR[Generic Repository]
  ACT -->|trigger| WF[Workflow Engine]
  WF -->|automate| AUTO[Automation]
  AUTO -->|event| BUS[Event Bus]
  ACT -->|integrate| MKP[Marketplace]
  ACT -->|call| API[External API]
  ST -->|ai assist| AI[AI Gateway]
  AI -->|candidate| MMM
  BUS --> L10[L10 Intelligence]
```

---

## Studio → Publish

```mermaid
sequenceDiagram
  participant S as Studio
  participant M as MMM
  participant P as Publish
  participant C as CRB

  S->>M: command mmm.object.update
  M-->>S: response success
  S->>M: command transition approve
  S->>P: command publish.execute
  P->>P: C-1 to C-16
  P->>C: signed bundle
  P-->>S: response success + bundleId
```

---

## CRB → Runtime → User

```mermaid
sequenceDiagram
  participant U as User
  participant RT as Runtime
  participant CRB as CRB
  participant AE as Action Engine

  U->>RT: navigate (query)
  RT->>CRB: RT-3 hydrate
  RT-->>U: rendered screen
  U->>RT: action save
  RT->>AE: Universal Action
  AE->>AE: pipeline
  AE-->>RT: response
  RT-->>U: UI update
```

---

## Action → Workflow → Automation

```mermaid
sequenceDiagram
  participant AE as Action Engine
  participant GR as GR
  participant WF as Workflow
  participant BUS as Event Bus
  participant AUTO as Automation

  AE->>GR: record.update
  GR->>BUS: record.updated
  BUS->>WF: trigger
  WF->>WF: step execute
  BUS->>AUTO: rule match
  AUTO->>AE: derived action
```

---

## Marketplace install

```mermaid
sequenceDiagram
  participant A as Admin
  participant MK as Marketplace
  participant M as MMM
  participant P as Publish

  A->>MK: command marketplace.install
  MK->>M: command mmm.object.create draft
  A->>M: approve + publish
  M->>P: publish.execute
  P-->>RT: CRB updated
```

---

## AI path (bounded)

```mermaid
sequenceDiagram
  participant U as User
  participant AI as AI Gateway
  participant R as Reviewer
  participant M as MMM

  U->>AI: query ai.complete
  AI-->>U: AICandidate preview
  U->>R: submit review
  R->>M: command mmm.object.create
  Note over AI,M: AI never writes directly
```

---

*End of document.*
