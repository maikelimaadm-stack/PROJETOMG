# 17 — Dependency Graph

**Status:** Official SSOT · **Version:** 1.0.0

---

## Full platform dependency graph

```mermaid
flowchart TB
  subgraph L10[L10 Intelligence]
    MEM[Memory]
    KG[Knowledge Graph]
    CON[Consulting]
  end
  subgraph L9[L9 BOS]
    BOS[BOS Shell]
    BL[Business Language]
  end
  subgraph L8[L8 Applications]
    APP[ERP CRM WMS RH packages]
  end
  subgraph L7[L7 Marketplace]
    MKP[Marketplace]
  end
  subgraph L6[L6 AI]
    AI[AI Gateway]
  end
  subgraph L5[L5 Intent]
    INT[Intent Engine]
  end
  subgraph L4[L4 Studio]
    ST[Studio]
  end
  subgraph L3[L3 Runtime]
    RT[Runtime Bridge]
    RE[Render Engine]
    AE[Action Engine]
    WE[Workflow Engine]
  end
  subgraph L2[L2 MMM]
    MMM[MMM API and Persistence]
    PUB[Publish Engine]
    CRB[CRB]
  end
  subgraph L1[L1 Core]
    AUTH[Auth]
    EB[Event Bus]
    AUD[Audit]
  end
  subgraph L0[L0 Infra]
    DB[(PostgreSQL)]
    REDIS[(Redis)]
  end

  BOS --> RT
  BOS --> BL --> INT
  ST --> MMM
  INT --> MMM
  AI --> INT
  MKP --> MMM
  APP --> MMM
  MMM --> PUB --> CRB
  CRB --> RT
  RT --> RE
  RT --> AE
  RT --> WE
  RT --> AUTH
  RT --> DB
  MMM --> AUTH
  MMM --> DB
  PUB --> DB
  EB --> MEM
  EB --> KG
  BOS --> CON
  AUTH --> REDIS
```

---

## Initialization order (cold start)

| Order | Component |
|-------|-----------|
| 1 | L0 Infrastructure |
| 2 | L1 Auth, Event Bus |
| 3 | L2 MMM persistence available |
| 4 | L2 Publish / pin resolution |
| 5 | L3 Runtime Bridge hydrate |
| 6 | L9 BOS shell mount |
| 7 | L4 Studio (on demand) |
| 8 | L5/L6 on user action |
| 9 | L10 subscribers active |

---

## Publish chain

```
Studio/Intent → MMM objects (approved) → Publish Engine → CRB → EnvironmentPin → Runtime hydrate
```

---

## Forbidden dependencies (never)

| From | Must NOT depend on |
|------|-------------------|
| L3 Runtime | L4 Studio, L9 BOS UI |
| L2 MMM | L9 BOS, L10 Intelligence |
| L1 Core | L3 Runtime UI |
| CRB consumer | MMM draft API |
| L10 Intelligence | Direct MMM write API |
| AI Gateway | Direct publish pin |

---

## Consumer matrix

| Producer | Consumers |
|----------|-----------|
| CRB | Runtime only |
| MMM API | Studio, Intent, Publish, Marketplace install |
| Event Bus | Workflow, Automation, L10, Audit |
| Generic Repository | Runtime actions only |
| EnvironmentPin | Runtime, Publish rollback |

---

*End of document.*
