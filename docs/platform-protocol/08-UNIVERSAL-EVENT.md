# 08 — Universal Event

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-08

---

## Event envelope

```json
{
  "header": {
    "messageType": "event",
    "eventId": "uuid",
    "eventType": "record.updated",
    "causationId": "requestMessageId",
    "tenantId": "uuid"
  },
  "context": { "traceId", "correlationId" },
  "body": {
    "aggregateType": "record",
    "aggregateId": "uuid",
    "payload": { },
    "schemaVersion": "mak-event-v1"
  }
}
```

Full catalog: [platform-behavior/17-UNIVERSAL-EVENTS.md](../platform-behavior/17-UNIVERSAL-EVENTS.md).

---

## Publish rules

| Rule | Detail |
|------|--------|
| EVT-01 | Events emitted **post-commit** only (D-PB-11) |
| EVT-02 | Publisher sets `causationId` = originating request messageId |
| EVT-03 | At-least-once delivery (D-PB-25) |
| EVT-04 | Tenant-scoped always |

---

## Who publishes

| Publisher | Events |
|-----------|--------|
| Command handler | Domain events |
| Action Engine | action.executed |
| Publish Engine | mmm.publish.completed |
| Workflow Engine | workflow.* |
| Auth | security.* |

---

## Who consumes

| Consumer | Subscription pattern |
|----------|---------------------|
| Workflow Engine | record.*, action.executed |
| Automation | record.*, workflow.* |
| L10 Intelligence | record.*, workflow.*, action.* |
| Audit | security.*, object.*, permission.* |
| Runtime cache | mmm.publish.completed |
| Notifications | workflow.*, user.*, marketplace.* |

---

## Consumer contract

```
handle(event: UniversalEvent, ctx: UEC): Promise<void>
```

| Rule | Detail |
|------|--------|
| Idempotent | Dedup by eventId |
| No cascade loops | Max depth 3 |
| Async only | Never block publisher |

---

*End of document.*
