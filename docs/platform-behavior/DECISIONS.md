# Platform Behavior Decisions (D-PB)

**Status:** Official SSOT  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation B.5

---

## D-PB-01 — Universal State Machine (USM) is mandatory

**Decision:** All platform objects use **one** state machine defined in [16-UNIVERSAL-STATE-MACHINE.md](./16-UNIVERSAL-STATE-MACHINE.md). Object-type **profiles** select applicable states and transitions — no alternate state machines.

---

## D-PB-02 — MMM lifecycle maps to USM

**Decision:** MMM `mmm-lifecycle-v1` statuses map to USM states: `review`→`in_review`, `active`→`running`. Meta-model [03-OBJECT-LIFECYCLE.md](../meta-model/03-OBJECT-LIFECYCLE.md) remains authoritative for MMM operations; USM is the superset for all platform objects.

---

## D-PB-03 — Universal operations catalog

**Decision:** All state transitions use the **20 universal operations** in USM. Layer-specific aliases (e.g. `submit_review`) are operation names, not separate machines.

---

## D-PB-04 — Event naming convention

**Decision:** All domain events use `{domain}.{entity}.{action}` lowercase dot notation. Catalog in [17-UNIVERSAL-EVENTS.md](./17-UNIVERSAL-EVENTS.md) is closed for v1; additions require D-PB amendment.

---

## D-PB-05 — Error code format

**Decision:** Errors use `MAK-{LAYER}-{CATEGORY}-{NNN}` (e.g. `MAK-L3-RUNTIME-001`). HTTP mapping defined in [18-UNIVERSAL-ERRORS.md](./18-UNIVERSAL-ERRORS.md).

---

## D-PB-06 — Fail-closed default

**Decision:** Any undefined transition, unknown event, or ambiguous permission → **reject** with audit log. No silent fallback.

---

## D-PB-07 — AI never direct-write

**Decision:** AI lifecycle ends at `AICandidate`; human approval required before any USM `create` operation on MMM objects (D-PA-09, D-MMM-09).

---

## D-PB-08 — Publish vs activate separation

**Decision:** `publish` transitions to `published`; `activate` (EnvironmentPin) transitions to `running`. Install from Marketplace uses `install` → `installed` before tenant `activate`.

---

## D-PB-09 — Record lifecycle uses USM DATA profile

**Decision:** Business records use USM states `draft`, `running`, `archived`, `deleted` only — not a separate machine.

---

## D-PB-10 — Workflow instance vs definition

**Decision:** Workflow **definition** uses USM DEFINITION profile. Workflow **instance** uses USM INSTANCE profile (`idle`, `running`, `waiting`, `completed`, `failed`, `cancelled`) as USM sub-states under `running`.

---

## D-PB-11 — Transaction boundaries

**Decision:** MMM mutations, Record CRUD, and publish compile each run in **one transactional boundary** per [22-UNIVERSAL-TRANSACTIONS.md](./22-UNIVERSAL-TRANSACTIONS.md). Cross-plane operations use saga with compensating events.

---

## D-PB-12 — Idempotency keys mandatory

**Decision:** All mutating API operations accept `Idempotency-Key` header. Duplicate keys within 24h return original result without re-execution.

---

## D-PB-13 — Cache invalidation on publish

**Decision:** Publish completion emits `mmm.publish.completed` → invalidates CRB cache keys within 5s (eventual consistency bound).

---

## D-PB-14 — Session refresh behavior

**Decision:** Access token TTL 15m; refresh token TTL 7d; sliding refresh on activity. Revocation is immediate fail-closed.

---

## D-PB-15 — Tenant suspension behavior

**Decision:** Suspended tenant: read-only for 30 days, then archived. Running CRB pins frozen; Runtime shows maintenance screen.

---

## D-PB-16 — Deployment pipeline stages

**Decision:** Mandatory path: Studio → MMM draft → review → publish → CRB → pin → Runtime hydrate → user. No skip paths (D-PB-06).

---

## D-PB-17 — Observability correlation

**Decision:** Every request carries `traceId`; propagated through Runtime, Action, Workflow, and event handlers.

---

## D-PB-18 — Logging levels closed

**Decision:** `fatal`, `error`, `warn`, `info`, `debug`, `audit` — audit is append-only immutable stream.

---

## D-PB-19 — Background job retry policy

**Decision:** Max 3 retries, exponential backoff (1s, 4s, 16s), then dead-letter queue. Idempotent handlers required.

---

## D-PB-20 — Rate limit tiers

**Decision:** Per-tenant: 1000 req/min API; 100 req/min AI Gateway; 10 publish/hour. Configurable by plan.

---

## D-PB-21 — Foundation C gate dependency

**Decision:** Foundation C authorized **only after** B.5 audit PASS in [25-AUDIT-FINAL.md](./25-AUDIT-FINAL.md). Supersedes D-PA-19 partial authorization.

---

## D-PB-22 — User lifecycle USM profile

**Decision:** User states: `draft` (invited), `running` (active), `deprecated` (suspended), `archived` (blocked), `deleted`.

---

## D-PB-23 — Marketplace install creates draft only

**Decision:** Package install always creates MMM objects at `draft` with lineage — never `running` (R-18).

---

## D-PB-24 — Rollback is pin change, not delete

**Decision:** Platform/application rollback = EnvironmentPin to prior DefinitionVersion; objects remain in `deprecated`, not `deleted`.

---

## D-PB-25 — Event delivery guarantee

**Decision:** At-least-once delivery on L1 Event Bus; consumers must be idempotent.

---

## D-PB-26 — Circuit breaker thresholds

**Decision:** External integrations: open after 5 failures in 30s; half-open after 60s; close after 3 successes.

---

## D-PB-27 — Offline sync conflict resolution

**Decision:** Field-level last-write-wins with server timestamp authority; conflicts emit `sync.conflict.detected`.

---

## D-PB-28 — Expunge is irreversible

**Decision:** Data expunge (LGPD) transitions `archived` → `deleted` with crypto-shred; no restore.

---

## D-PB-29 — Platform boot order

**Decision:** L0 infra → L1 core (auth, bus, scheduler) → MMM read-only → Runtime bridge ready → accept traffic.

---

## D-PB-30 — Universal execution single dispatcher

**Decision:** All execution (action, workflow step, automation, AI tool) routes through [23-UNIVERSAL-EXECUTION-MODEL.md](./23-UNIVERSAL-EXECUTION-MODEL.md) dispatcher — no parallel executors.

---

## D-PB-31 — Profile operation aliases

**Decision:** Domain-specific operation labels (e.g. user `block`, tenant `cancel`) map to canonical USM operations via [16-UNIVERSAL-STATE-MACHINE.md](./16-UNIVERSAL-STATE-MACHINE.md) **Profile operation aliases**. Enforcement and audit use USM operation names only.

---

## D-PB-32 — RT-5 maps to UEP stage 2 Authorize

**Decision:** Runtime phase **RT-5 Authorize** implements UEP pipeline **stage 2 Authorize** ([platform-protocol/09-UNIVERSAL-PIPELINE.md](../platform-protocol/09-UNIVERSAL-PIPELINE.md)). Permission evaluation occurs before RT-6 Route / RT-8 Execute.

---

## D-PB-33 — Event Bus stub during Foundation C until G426

**Decision:** Foundation C ships **EventBusClient** interface + in-process stub transport. Production DB-backed L1 Event Bus deferred to Foundation F (**G426**). Runtime and services emit to stub; consumers must not assume cross-process delivery until G426 PASS.

---

*End of document.*
