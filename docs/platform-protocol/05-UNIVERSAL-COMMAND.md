# 05 — Universal Command

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-05

---

## Command pattern

Commands are **intent to mutate state**. They map 1:1 to USM operations where applicable.

```json
{
  "header": { "messageType": "command" },
  "body": {
    "kind": "domain.entity.operation",
    "target": "objectId|scopeRef",
    "payload": { },
    "expectedRevision": 3
  }
}
```

---

## Command catalog (closed v1)

| kind | Target | USM operation |
|------|--------|---------------|
| `mmm.object.create` | objectType | create |
| `mmm.object.update` | objectId | edit |
| `mmm.object.transition` | objectId | submit_review, approve, etc. |
| `mmm.object.delete` | objectId | delete |
| `publish.execute` | scopeRef | publish |
| `publish.rollback` | environmentPinId | rollback |
| `pin.activate` | bundleId + env | activate |
| `marketplace.install` | packageId | install |
| `record.create` | boCode | GR create |
| `record.update` | recordId | GR update |
| `record.delete` | recordId | GR delete |
| `workflow.start` | workflowCode | start instance |
| `workflow.signal` | instanceId | signal step |
| `ai.candidate.create` | scopeRef | AI output |
| `tenant.suspend` | tenantId | suspend |
| `user.invite` | tenantId | create |

Additions require D-UP amendment.

---

## Command rules

| Rule | Detail |
|------|--------|
| CMD-01 | Commands require `idempotencyKey` |
| CMD-02 | Optimistic lock via `expectedRevision` when applicable |
| CMD-03 | Commands pass through full pipeline ([09](./09-UNIVERSAL-PIPELINE.md)) |
| CMD-04 | Single handler per `kind` |
| CMD-05 | Handler returns Response, emits Events post-commit |

---

## Handler signature (conceptual)

```
handle(command: UniversalCommand, ctx: UEC): Promise<UniversalResponse>
```

---

*End of document.*
