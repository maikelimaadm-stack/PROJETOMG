# MAK Platform Behavior — Documentation Hub

**Status:** Official SSOT — Complete operational behavior specification  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation B.5 — Platform Behavior Specification  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); complements [platform-architecture](../platform-architecture/) and [meta-model](../meta-model/)

> **Rule:** Foundation C (Runtime) **must not start** until [25-AUDIT-FINAL.md](./25-AUDIT-FINAL.md) certifies **PASS** and all three pillars are complete.

---

## Three pillars

| Pillar | Path | Answers |
|--------|------|---------|
| **What exists** | [docs/meta-model/](../meta-model/) | Taxonomy, envelope, schemas, MMM lifecycle |
| **How it is built** | [docs/platform-architecture/](../platform-architecture/) | Layers, Runtime, Studio, contracts |
| **How it behaves** | [docs/platform-behavior/](./) | Lifecycles, events, errors, execution |

---

## Document index

| # | Document | Topic |
|---|----------|-------|
| 01 | [PLATFORM-LIFECYCLE](./01-PLATFORM-LIFECYCLE.md) | Boot, shutdown, update, rollback, failover |
| 02 | [APPLICATION-LIFECYCLE](./02-APPLICATION-LIFECYCLE.md) | Application states and transitions |
| 03 | [MODULE-LIFECYCLE](./03-MODULE-LIFECYCLE.md) | Module states and transitions |
| 04 | [BUSINESS-OBJECT-LIFECYCLE](./04-BUSINESS-OBJECT-LIFECYCLE.md) | BusinessObject lifecycle |
| 05 | [FIELD-LIFECYCLE](./05-FIELD-LIFECYCLE.md) | Field lifecycle |
| 06 | [WORKFLOW-LIFECYCLE](./06-WORKFLOW-LIFECYCLE.md) | Workflow definition lifecycle |
| 07 | [RUNTIME-LIFECYCLE](./07-RUNTIME-LIFECYCLE.md) | RT-0 → RT-8 operational behavior |
| 08 | [USER-LIFECYCLE](./08-USER-LIFECYCLE.md) | User invite → delete |
| 09 | [TENANT-LIFECYCLE](./09-TENANT-LIFECYCLE.md) | Tenant create → restore |
| 10 | [MARKETPLACE-LIFECYCLE](./10-MARKETPLACE-LIFECYCLE.md) | Publish → remove |
| 11 | [AI-LIFECYCLE](./11-AI-LIFECYCLE.md) | Request → publish (no direct write) |
| 12 | [EVENT-LIFECYCLE](./12-EVENT-LIFECYCLE.md) | Publish, consume, respond |
| 13 | [DATA-LIFECYCLE](./13-DATA-LIFECYCLE.md) | CRUD, archive, expunge |
| 14 | [SECURITY-LIFECYCLE](./14-SECURITY-LIFECYCLE.md) | Auth, session, revoke |
| 15 | [DEPLOYMENT-LIFECYCLE](./15-DEPLOYMENT-LIFECYCLE.md) | Studio → user path |
| 16 | [UNIVERSAL-STATE-MACHINE](./16-UNIVERSAL-STATE-MACHINE.md) | Single state machine for all objects |
| 17 | [UNIVERSAL-EVENTS](./17-UNIVERSAL-EVENTS.md) | Event catalog |
| 18 | [UNIVERSAL-ERRORS](./18-UNIVERSAL-ERRORS.md) | Error catalog and behaviors |
| 19 | [UNIVERSAL-LOGGING](./19-UNIVERSAL-LOGGING.md) | Logging model |
| 20 | [UNIVERSAL-OBSERVABILITY](./20-UNIVERSAL-OBSERVABILITY.md) | Tracing, metrics, health |
| 21 | [UNIVERSAL-CACHING](./21-UNIVERSAL-CACHING.md) | Cache, TTL, invalidation |
| 22 | [UNIVERSAL-TRANSACTIONS](./22-UNIVERSAL-TRANSACTIONS.md) | Atomicity, retry, idempotency |
| 23 | [UNIVERSAL-EXECUTION-MODEL](./23-UNIVERSAL-EXECUTION-MODEL.md) | Runtime, Action, Workflow, AI |
| 24 | [CROSS-CUTTING-CONCERNS](./24-CROSS-CUTTING-CONCERNS.md) | Locks, queues, rate limits |
| 25 | [AUDIT-FINAL](./25-AUDIT-FINAL.md) | B.5 certification |

---

## Cross-cutting

| Document | Purpose |
|----------|---------|
| [DECISIONS.md](./DECISIONS.md) | D-PB-01 through D-PB-30 |
| [CONTRACTS.md](./CONTRACTS.md) | Behavioral contracts between actors |

---

## Amendment process

1. New **D-PB** entry in [DECISIONS.md](./DECISIONS.md)
2. Update affected topic document(s)
3. Register in [GOVERNANCE-REGISTRY.md](../engineering/GOVERNANCE-REGISTRY.md)
4. Re-run [25-AUDIT-FINAL.md](./25-AUDIT-FINAL.md) if universal state machine or event catalog changes

---

*End of document.*
