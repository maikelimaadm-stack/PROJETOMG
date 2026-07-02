# 17 — Universal Connectors

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-17

---

## Connector types

| Connector | Protocol entry | Direction |
|-----------|----------------|-----------|
| ERP (external) | `integration.erp.*` | Outbound |
| Marketplace | `marketplace.*` | Inbound + Outbound |
| Public API | HTTP REST | Inbound |
| Partner API | HTTP + API key | Inbound |
| AI Provider | `ai.provider.*` | Outbound |
| Storage (S3/Supabase) | `storage.*` | Outbound |
| Webhook | `webhook.receive` | Inbound |

---

## Connector envelope

```json
{
  "connectorCode": "stripe",
  "operation": "charge",
  "request": { },
  "uec": { },
  "options": {
    "timeoutMs": 15000,
    "retryable": true
  }
}
```

---

## Connector contract

| Method | Responsibility |
|--------|----------------|
| connect(config) | Validate credentials |
| execute(operation, payload, uec) | Call external system |
| mapError(external) | → MAK error code |
| healthCheck() | Connector availability |

---

## ERP connector

| Operation | Command kind |
|-----------|--------------|
| Sync master data | `integration.erp.sync` |
| Push invoice | `integration.erp.push` |
| Pull orders | `integration.erp.pull` |

Bidirectional — always through pipeline with audit.

---

## AI connector

| Operation | Allowed |
|-----------|---------|
| completion | Yes |
| embedding | Yes |
| write MMM | **Forbidden** |
| write record | **Forbidden** |

Output → `ai.candidate.create` command only.

---

## Storage connector

| Operation | Use |
|-----------|-----|
| upload | Attachments |
| download | Signed URL |
| delete | Lifecycle expunge |

Never expose raw credentials to Runtime client.

---

*End of document.*
