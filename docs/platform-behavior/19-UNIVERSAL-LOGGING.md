# 19 — Universal Logging

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-18

---

## Log levels

| Level | Use | Retention |
|-------|-----|-----------|
| fatal | Process cannot continue | 90d |
| error | Operation failed | 90d |
| warn | Degraded / retry | 30d |
| info | Normal operations | 14d |
| debug | Development only | 7d |
| audit | Compliance immutable | 7y |

---

## Log entry format

```json
{
  "timestamp": "ISO8601",
  "level": "info",
  "traceId": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "service": "runtime",
  "message": "...",
  "context": {}
}
```

---

## What gets logged

| Category | Level | Examples |
|----------|-------|----------|
| Auth | audit | login, logout, revoke |
| MMM mutation | audit | create, publish, delete |
| Record CRUD | audit | create, update, delete |
| Permission deny | audit + warn | RT-5 failures |
| Publish | info + audit | C-1→C-16 steps |
| Runtime errors | error | CRB load fail |
| Performance | info | Slow query >1s |
| Debug | debug | Hydration detail |

---

## Rules

| Rule | Detail |
|------|--------|
| PII | Mask in non-audit logs |
| Secrets | Never log |
| Audit | Append-only — no delete |
| Correlation | traceId on every entry |
| Tenant | tenantId on every tenant-scoped entry |

---

## Sinks

| Environment | Sink |
|-------------|------|
| Production | Structured JSON → log aggregator |
| Development | Console + file |
| Audit | Separate immutable store |

---

*End of document.*
