# 23 — Universal Protocol Decisions (D-UP)

**Status:** Official SSOT · **Version:** 1.0.0 · **Mission:** Foundation B.6

---

## D-UP-01 — UEP is authoritative over Runtime

**Decision:** `mak-uep-v1` in this folder defines all inter-component communication. Foundation C Runtime **implements** UEP — it does not extend or replace it without D-UP amendment.

---

## D-UP-02 — Universal Execution Context mandatory

**Decision:** No operation executes without complete UEC ([02-UNIVERSAL-CONTEXT.md](./02-UNIVERSAL-CONTEXT.md)). UEC frozen after authorize stage.

---

## D-UP-03 — Universal Request envelope

**Decision:** All ingress operations use request envelope with `protocolVersion`, `messageId`, `correlationId`, `traceId`, `messageType`.

---

## D-UP-04 — Universal Response statuses

**Decision:** Five response statuses: `success`, `warning`, `error`, `partial`, `asyncAck`. No ad-hoc response shapes.

---

## D-UP-05 — Command/Query separation

**Decision:** Strict CQRS — queries never mutate; commands never return partial domain state without commit semantics.

---

## D-UP-06 — Query read-only guarantee

**Decision:** Query handlers registered with `mutates: false` — enforced at registry.

---

## D-UP-07 — Action as first-class message type

**Decision:** UI operations use `action` message type, not raw commands — Action Engine translates to commands/internal calls.

---

## D-UP-08 — Event post-commit only

**Decision:** Events published only after transaction commit via outbox.

---

## D-UP-09 — Five-stage pipeline mandatory

**Decision:** Validate → Authorize → Execute → Audit → Respond for all mutations.

---

## D-UP-10 — Handler registry closed namespaces

**Decision:** Handler kinds use `{namespace}.{entity}.{operation}` — namespaces listed in 10-UNIVERSAL-HANDLER.

---

## D-UP-11 — Service locator pattern

**Decision:** Handlers resolve dependencies via ServiceLocator — no global singletons in handler code.

---

## D-UP-12 — Centralized permission evaluation

**Decision:** PermissionService only — pipeline stage 2. Handlers read UEC.permissions snapshot.

---

## D-UP-13 — Transaction protocol

**Decision:** Commit-before-event; saga for cross-plane; idempotency on commands.

---

## D-UP-14 — Cache service mandatory

**Decision:** All caching through CacheService — no ad-hoc Redis.

---

## D-UP-15 — Async via job envelope

**Decision:** Operations >30s or opt-in async return `asyncAck` + jobId.

---

## D-UP-16 — Plugin static registration

**Decision:** Plugins register at CRB hydrate from signed manifest — no remote code load.

---

## D-UP-17 — Connector boundary

**Decision:** All external I/O through connector protocol — handlers do not raw HTTP.

---

## D-UP-18 — Observability mandatory fields

**Decision:** traceId + executionId on every pipeline run.

---

## D-UP-19 — Security contract

**Decision:** JWT for auth; HMAC for CRB/packages; secrets outside UEC.

---

## D-UP-20 — Failure model unified

**Decision:** retryable flag + circuit breaker on connectors; no auth bypass on degradation.

---

## D-UP-21 — Execution sequences documented

**Decision:** 21-UNIVERSAL-EXECUTION-SEQUENCE is normative for cross-component flows.

---

## D-UP-22 — Contract map authoritative

**Decision:** 22-UNIVERSAL-CONTRACT-MAP defines allowed dependencies.

---

## D-UP-23 — Protocol version negotiation

**Decision:** v1 only for Foundation C. Future versions additive — reject unknown with MAK-UEP-001.

---

## D-UP-24 — Batch commands

**Decision:** Batch uses single command with array payload — response `partial` when applicable.

---

## D-UP-25 — Foundation C gate

**Decision:** Foundation C authorized only after B.6 audit PASS ([25-AUTORIZACAO.md](./25-AUTORIZACAO.md)). Supersedes D-PB-21 timing.

---

## D-UP-26 — Runtime is UEP host

**Decision:** RT-8 Universal Execution Dispatcher implements pipeline stage Execute for action/query from CRB context.

---

## D-UP-27 — MMM API speaks UEP

**Decision:** `/api/mmm/v1` accepts command/query envelopes (HTTP mapping) — internal shape identical to UEP.

---

## D-UP-28 — WebSocket deferred

**Decision:** v1 HTTP only for client UEP; WebSocket same envelope when added.

---

## D-UP-29 — System UEC for jobs

**Decision:** Background workers use System UEC with explicit tenantId.

---

## D-UP-30 — Four pillars complete

**Decision:** meta-model + platform-architecture + platform-behavior + platform-protocol = complete SSOT before Foundation C code.

> **Supersession (C.0.2):** Pillar count extended — five pillars (+ authoring D-UA-34), six blocks (+ runtime-implementation D-RI-15). Timing superseded by D-UP-25 → D-UA-26 → D-RI-14 chain.

---

## D-UP-31 — Action idempotency

**Decision:** Mutating `action` messages accept `idempotencyKey` in request header (same as commands per D-PB-12).

---

*End of document.*
