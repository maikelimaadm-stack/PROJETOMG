# 18 — Universal Errors Catalog

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-05, D-PB-06

---

## Error format

```json
{
  "code": "MAK-L3-RUNTIME-001",
  "message": "Human-readable message",
  "traceId": "uuid",
  "details": {},
  "retryable": false
}
```

Code pattern: `MAK-{LAYER}-{CATEGORY}-{NNN}`

---

## HTTP mapping

| HTTP | Use |
|------|-----|
| 400 | Validation, bad request |
| 401 | Auth required / expired |
| 403 | Permission denied |
| 404 | Not found |
| 409 | Conflict (revision, state) |
| 422 | Business rule violation |
| 429 | Rate limit |
| 500 | Internal error |
| 503 | Maintenance / unavailable |

---

## L1 Platform Core

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L1-SECURITY-001 | 403 | Tenant suspended — maintenance page |
| MAK-L1-SECURITY-002 | 403 | User not active |
| MAK-L1-SECURITY-003 | 403 | Permission denied — audit log |
| MAK-L1-SECURITY-004 | 401 | Token invalid |
| MAK-L1-SECURITY-005 | 401 | Token expired — refresh |
| MAK-L1-EVENT-001 | 500 | Event publish failed — retry |
| MAK-L1-JOB-001 | 500 | Job failed — DLQ |

---

## L2 MMM / Lifecycle

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L2-LIFECYCLE-001 | 409 | Invalid state transition |
| MAK-L2-LIFECYCLE-002 | 409 | Operation not allowed in current state |
| MAK-L2-MMM-001 | 400 | Schema validation failed |
| MAK-L2-MMM-002 | 409 | Revision conflict |
| MAK-L2-MMM-003 | 404 | Object not found |
| MAK-L2-PUBLISH-001 | 422 | Publish validation failed (C-5) |
| MAK-L2-PUBLISH-002 | 500 | Compile failed |
| MAK-L2-PUBLISH-003 | 500 | Signature failed |

---

## L3 Runtime

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L3-RUNTIME-001 | 503 | Pin not found — maintenance |
| MAK-L3-RUNTIME-002 | 503 | CRB load failed |
| MAK-L3-RUNTIME-003 | 503 | CRB signature invalid |
| MAK-L3-RUNTIME-004 | 503 | Schema mismatch |
| MAK-L3-RUNTIME-005 | 404 | Route not found |
| MAK-L3-ACTION-001 | 422 | Action precondition failed |
| MAK-L3-ACTION-002 | 500 | Handler execution failed |
| MAK-L3-WORKFLOW-001 | 422 | Invalid transition |
| MAK-L3-WORKFLOW-002 | 500 | Step execution failed |

---

## L0 Data / GR

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L0-DATA-001 | 400 | Field validation failed |
| MAK-L0-DATA-002 | 409 | Optimistic lock conflict |
| MAK-L0-DATA-003 | 404 | Record not found |
| MAK-L0-DATA-004 | 422 | Business rule violation |

---

## L6 AI

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L6-AI-001 | 403 | Direct MMM write forbidden |
| MAK-L6-AI-002 | 403 | Direct record write forbidden |
| MAK-L6-AI-003 | 422 | Auto-approve forbidden |
| MAK-L6-AI-004 | 403 | Pin change forbidden |
| MAK-L6-AI-005 | 429 | Rate limit exceeded |
| MAK-L6-AI-006 | 503 | Provider unavailable |

---

## L7 Marketplace

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L7-MARKETPLACE-001 | 422 | Package validation failed |
| MAK-L7-MARKETPLACE-002 | 403 | License required |
| MAK-L7-MARKETPLACE-003 | 409 | Version conflict |

---

## L9 Sync

| Code | HTTP | Behavior |
|------|------|----------|
| MAK-L9-SYNC-001 | 409 | Conflict detected |
| MAK-L9-SYNC-002 | 503 | Sync service unavailable |

---

## Error behaviors (global)

| Rule | Behavior |
|------|----------|
| Fail-closed | Undefined → 500 + alert |
| Retryable flag | Client may retry idempotent ops |
| Audit | All 403, 409 on mutations logged |
| User message | Localized; no stack trace in production |
| traceId | Always returned |

---

*End of document.*
