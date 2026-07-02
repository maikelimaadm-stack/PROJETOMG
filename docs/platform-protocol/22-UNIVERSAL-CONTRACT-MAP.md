# 22 — Universal Contract Map

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-22

---

## Contract dependency graph

```mermaid
flowchart TB
  UEP[01 UEP] --> CTX[02 Context]
  UEP --> REQ[03 Request]
  UEP --> RES[04 Response]
  REQ --> CMD[05 Command]
  REQ --> QRY[06 Query]
  REQ --> ACT[07 Action]
  REQ --> EVT[08 Event]
  CMD --> PIPE[09 Pipeline]
  QRY --> PIPE
  ACT --> PIPE
  PIPE --> HND[10 Handler]
  PIPE --> PERM[12 Permissions]
  PIPE --> TX[13 Transactions]
  HND --> SVC[11 Services]
  HND --> CACHE[14 Cache]
  PIPE --> OBS[18 Observability]
  PIPE --> SEC[19 Security]
  PIPE --> FAIL[20 Failure]
  EVT --> ASYNC[15 Async]
  HND --> PLG[16 Plugins]
  HND --> CON[17 Connectors]
  SEQ[21 Sequences] --> UEP
  AUD[24 Audit] --> ALL
```

---

## Layer contracts

| From | To | Contract doc | Message types |
|------|-----|--------------|---------------|
| Studio | MMM | 05 Command | command |
| BOS | Runtime | 07 Action, 06 Query | action, query |
| Runtime | GR | 05 Command, 06 Query | command, query |
| Publish | CRB | 05 Command | internal |
| Any | Event Bus | 08 Event | event |
| AI Gateway | MMM | 05 Command | ai.candidate.create |
| Marketplace | MMM | 05 Command | marketplace.install |
| External | API | 03 Request | command, query |

---

## Must never

| From | To | Reason |
|------|-----|--------|
| Runtime | MMM DB direct | D-PA-03 |
| AI | MMM write direct | D-PB-07 |
| Handler | Permission bypass | D-UP-12 |
| Event | Pre-commit publish | D-PB-11 |
| Client | CRB unsigned | D-PA-03 |

---

## SSOT cross-reference

| Topic | Authority |
|-------|-----------|
| Wire protocol | platform-protocol (this folder) |
| Operational behavior | platform-behavior |
| Topology | platform-architecture |
| MMM taxonomy | meta-model |

---

## Initialization order

| Order | Component |
|-------|-----------|
| 1 | L0 Infrastructure |
| 2 | L1 USR + Pipeline |
| 3 | MMM read services |
| 4 | Runtime bridge ready |
| 5 | Accept UEP requests |

---

*End of document.*
