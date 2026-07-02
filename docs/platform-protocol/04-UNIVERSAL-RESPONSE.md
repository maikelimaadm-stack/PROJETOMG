# 04 — Universal Response

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-04

---

## Response envelope

```json
{
  "header": {
    "protocolVersion": "mak-uep-v1",
    "messageId": "uuid",
    "correlationId": "uuid",
    "traceId": "uuid",
    "timestamp": "ISO8601",
    "messageType": "response|asyncAck",
    "requestMessageId": "uuid"
  },
  "status": "success|warning|error|partial",
  "body": {
    "data": { },
    "warnings": [],
    "errors": [],
    "meta": {
      "executionId": "uuid",
      "durationMs": 42,
      "eventsEmitted": ["record.updated"]
    }
  }
}
```

---

## Status semantics

| Status | Meaning | HTTP |
|--------|---------|------|
| **success** | Completed, no warnings | 200/201 |
| **warning** | Completed with non-fatal issues | 200 |
| **error** | Failed, no commit (or rolled back) | 4xx/5xx |
| **partial** | Batch: some items succeeded | 207 |
| **asyncAck** | Accepted for background processing | 202 |

---

## Error object (in body.errors)

```json
{
  "code": "MAK-L3-ACTION-001",
  "message": "Human-readable",
  "field": "optional.path",
  "retryable": false,
  "details": { }
}
```

Catalog: [platform-behavior/18-UNIVERSAL-ERRORS.md](../platform-behavior/18-UNIVERSAL-ERRORS.md).

---

## Warning object

```json
{
  "code": "MAK-WARN-001",
  "message": "Deprecated field used",
  "field": "payload.legacyRef"
}
```

Warnings never block commit unless policy elevates to error.

---

## Partial response

Batch commands return:

```json
{
  "status": "partial",
  "body": {
    "data": { "succeeded": [], "failed": [] },
    "meta": { "total": 10, "successCount": 8, "failCount": 2 }
  }
}
```

---

## Async acknowledgment

```json
{
  "status": "asyncAck",
  "body": {
    "data": { "jobId": "uuid", "estimatedCompletionSec": 60 },
    "meta": { "pollUrl": "/api/jobs/{jobId}" }
  }
}
```

Client polls job status or subscribes to completion event.

---

*End of document.*
