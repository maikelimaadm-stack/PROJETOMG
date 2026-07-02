# 22 — Universal Transactions

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-11, D-PB-12

---

## Transaction boundaries

| Operation | Boundary | Rollback |
|-----------|----------|----------|
| MMM object mutate | Single DB transaction | Full revert |
| MMM batch | Single transaction | Full revert |
| Publish compile | Transaction + immutable write | No partial CRB |
| Record CRUD | Single GR transaction | Full revert |
| Action (CRUD) | GR transaction + event after commit | Event compensating |
| Cross-plane (publish→pin) | Saga | Compensating pin revert |

---

## Atomicity rules

| Rule | Behavior |
|------|----------|
| Event after commit | Events emitted only post-commit |
| Outbox pattern | Event + mutation same TX when required |
| Publish | All-or-nothing CRB sign |

---

## Rollback

| Layer | Mechanism |
|-------|-----------|
| DB | Transaction rollback |
| MMM object | `restore` operation |
| Publish | No rollback — new publish forward |
| Pin | `rollback` to prior DefinitionVersion |
| Saga | Compensating events |

---

## Retry

| Context | Policy |
|---------|--------|
| Idempotent API | Client retry with same Idempotency-Key |
| Transient DB | 3× exponential 100ms–1s |
| External API | Circuit breaker — D-PB-26 |
| Event handler | 3× — D-PB-19 |

---

## Idempotency

| Rule | Detail |
|------|--------|
| Header | `Idempotency-Key: uuid` |
| Window | 24 hours |
| Storage | Result cache by key+tenant |
| Duplicate | Return original response |

Required on: POST, PATCH, DELETE (mutations).

---

*End of document.*
