# 18 — Universal Observability Contract

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-18

---

## Mandatory propagation

Every pipeline execution emits:

| Signal | Contract |
|--------|----------|
| traceId | UEC → all spans |
| correlationId | Request → events → responses |
| executionId | Unique per pipeline run |

---

## Logging contract

```json
{
  "timestamp": "ISO8601",
  "level": "info|audit|error",
  "traceId": "uuid",
  "executionId": "uuid",
  "tenantId": "uuid",
  "handlerKind": "record.update",
  "durationMs": 42,
  "message": "..."
}
```

Detail: [platform-behavior/19-UNIVERSAL-LOGGING.md](../platform-behavior/19-UNIVERSAL-LOGGING.md).

---

## Metrics contract

Each handler **must** increment:

| Metric | Labels |
|--------|--------|
| mak_handler_executions_total | kind, status |
| mak_handler_duration_seconds | kind |
| mak_pipeline_stage_duration_seconds | stage |

---

## Tracing contract

| Span name | Parent |
|-----------|--------|
| pipeline.execute | HTTP request |
| pipeline.validate | pipeline.execute |
| pipeline.authorize | pipeline.execute |
| pipeline.execute.handler | pipeline.execute |
| event.publish | handler |

---

## Health contract

| Endpoint | Protocol |
|----------|----------|
| /health/live | Query `health.status` |
| /health/ready | Query + dependency checks |

---

## Diagnostics API

Admin-only queries:

| Query kind | Purpose |
|------------|---------|
| trace.lookup | Full waterfall |
| crb.inspect | Loaded registry |
| job.inspect | Job status |

---

*End of document.*
