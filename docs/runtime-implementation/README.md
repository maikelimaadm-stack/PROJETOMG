# Runtime Implementation Plan — Documentation Hub

**Status:** Official SSOT — Foundation C.0 Implementation Plan  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation C.0 — Universal Runtime Implementation Plan  
**Authority:** Derived from five pillars — **does not alter architecture**

> **Rule:** This folder transforms SSOT into an **executable plan**. No new architecture. No code. Implementation authorized only after [12-AUDITORIA-FINAL.md](./12-AUDITORIA-FINAL.md) **PASS**.

---

## Six blocks

| # | Block | Path | Role |
|---|-------|------|------|
| 1 | Meta Model | [docs/meta-model/](../meta-model/) | What exists |
| 2 | Platform Architecture | [docs/platform-architecture/](../platform-architecture/) | How built |
| 3 | Platform Behavior | [docs/platform-behavior/](../platform-behavior/) | How behaves |
| 4 | Platform Protocol | [docs/platform-protocol/](../platform-protocol/) | How executes (UEP) |
| 5 | Platform Authoring | [docs/platform-authoring/](../platform-authoring/) | How users create (UAS) |
| 6 | **Runtime Implementation** | [docs/runtime-implementation/](./) | **How to implement** |

---

## Document index

| # | Document | Topic |
|---|----------|-------|
| 01 | [RUNTIME-BACKLOG](./01-RUNTIME-BACKLOG.md) | Module breakdown |
| 02 | [IMPLEMENTATION-ORDER](./02-IMPLEMENTATION-ORDER.md) | DAG — no cycles |
| 03 | [INTERFACES](./03-INTERFACES.md) | Public interfaces (no impl) |
| 04 | [MODULE-CONTRACTS](./04-MODULE-CONTRACTS.md) | Inter-module contracts |
| 05 | [FOLDER-STRUCTURE](./05-FOLDER-STRUCTURE.md) | `src/runtime/` layout |
| 06 | [BOOTSTRAP-SEQUENCE](./06-BOOTSTRAP-SEQUENCE.md) | RT-0 → RT-8 steps |
| 07 | [DEPENDENCY-GRAPH](./07-DEPENDENCY-GRAPH.md) | Who knows whom |
| 08 | [DONE-CRITERIA](./08-DONE-CRITERIA.md) | Objective per module |
| 09 | [GATES](./09-GATES.md) | Foundation C gates G423-NN |
| 10 | [DELIVERY-PLANNING](./10-DELIVERY-PLANNING.md) | Small delivery slices |
| 11 | [RISKS](./11-RISKS.md) | Risks and mitigations |
| 12 | [AUDITORIA-FINAL](./12-AUDITORIA-FINAL.md) | C.0 authorization |
| 13 | [AUDITORIA-FINAL C.0.2](./13-AUDITORIA-FINAL.md) | Global Architecture Certificate |

---

## Cross-cutting

| Document | Purpose |
|----------|---------|
| [DECISIONS.md](./DECISIONS.md) | D-RI-01 through D-RI-15 |
| [CONTRACTS.md](./CONTRACTS.md) | Plan-level contracts |

---

## SSOT references (read-only)

| Topic | Authority |
|-------|-----------|
| Runtime topology | [02-RUNTIME.md](../platform-architecture/02-RUNTIME.md) |
| RT phases | [07-RUNTIME-LIFECYCLE.md](../platform-behavior/07-RUNTIME-LIFECYCLE.md) |
| UEP | [01-UNIVERSAL-EXECUTION-PROTOCOL.md](../platform-protocol/01-UNIVERSAL-EXECUTION-PROTOCOL.md) |
| Render/Action/Workflow | [07](../platform-architecture/07-RENDER-ENGINE.md), [08](../platform-architecture/08-ACTION-ENGINE.md), [09](../platform-architecture/09-WORKFLOW-ENGINE.md) |
| CRB / Publish | [meta-model/17-PUBLISH-PIPELINE.md](../meta-model/17-PUBLISH-PIPELINE.md) |
| Foundation C scope | [18-FOUNDATION-ROADMAP.md](../platform-architecture/18-FOUNDATION-ROADMAP.md) |

---

*End of document.*
