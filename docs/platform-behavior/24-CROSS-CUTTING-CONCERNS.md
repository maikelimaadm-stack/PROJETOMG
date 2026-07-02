# 24 — Cross-Cutting Concerns

**Status:** Official SSOT · **Version:** 1.0.0

---

## Concurrency

| Concern | Strategy |
|---------|----------|
| MMM edit | Optimistic lock on `revision` |
| Record update | `rowVersion` optimistic lock |
| Publish | Distributed lock per tenant scope |
| Pin change | Single-writer per environment |

Conflict → 409 + retry guidance.

---

## Locks

| Lock | Scope | TTL |
|------|-------|-----|
| Publish | tenant+scope | 120s |
| MMM edit | objectId | 300s (Studio) |
| Hydrate | bundleId | 30s (single-flight) |

Dead lock → auto-release on TTL.

---

## Jobs

| Type | Scheduler |
|------|-----------|
| Workflow timers | L1 cron |
| SLA escalation | L1 cron |
| Tenant backup | L1 daily |
| Cache warm | Post-publish |
| DLQ replay | Manual + scheduled |

Retry: D-PB-19 (3×, backoff, DLQ).

---

## Rate limits

| Tier | Limit |
|------|-------|
| API | 1000 req/min/tenant |
| AI Gateway | 100 req/min/tenant |
| Publish | 10/hour/tenant |
| Login | 10/min/IP |

Response: 429 + `Retry-After`.

---

## Queues

| Queue | Purpose |
|-------|---------|
| event-outbox | Reliable event delivery |
| job-queue | Background jobs |
| dlq | Failed after retries |
| sync-outbox | Offline writes |

At-least-once delivery — consumers idempotent.

---

## Timeout

| Operation | Timeout |
|-----------|---------|
| HTTP API | 30s |
| Action handler | 60s |
| Workflow step | 300s |
| External API | 15s |
| Publish compile | 300s |

Timeout → fail + `action.failed` / `workflow.failed`.

---

## Circuit breaker

| Parameter | Value |
|-----------|-------|
| Failure threshold | 5 in 30s |
| Open duration | 60s |
| Half-open probes | 3 successes to close |

Applies to external integrations (D-PB-26).

---

## Background tasks

| Rule | Behavior |
|------|----------|
| Tenant scope | Every job carries tenantId |
| Idempotent | Required |
| Checkpoint | Long jobs persist progress |
| Cancel | Admin can cancel non-critical |

---

*End of document.*
