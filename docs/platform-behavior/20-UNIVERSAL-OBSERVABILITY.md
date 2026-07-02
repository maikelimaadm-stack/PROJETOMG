# 20 — Universal Observability

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-17

---

## Tracing

| Field | Propagation |
|-------|-------------|
| traceId | HTTP header `X-Trace-Id` |
| spanId | Per operation |
| parentSpanId | Nested calls |

Spans: Bootstrap, CRB Load, Render, Action Execute, Workflow Step, DB Query, Event Publish.

---

## Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `mak_http_requests_total` | counter | method, path, status |
| `mak_http_duration_seconds` | histogram | path |
| `mak_publish_duration_seconds` | histogram | tenant |
| `mak_runtime_hydrate_seconds` | histogram | module |
| `mak_action_executions_total` | counter | actionKind |
| `mak_workflow_instances_active` | gauge | tenant |
| `mak_event_publish_total` | counter | eventType |
| `mak_cache_hit_ratio` | gauge | cacheKey |

---

## Health endpoints

| Endpoint | Meaning |
|----------|---------|
| `/health/live` | Process alive |
| `/health/ready` | Accept traffic |
| `/health/deps` | DB, Redis, bus status |

Ready=false during shutdown and failed init.

---

## Diagnostics

| Tool | Scope |
|------|-------|
| Trace viewer | Request waterfall |
| CRB inspector | Loaded registry dump (admin) |
| Event replay | DLQ reprocess |
| Tenant debug | Scoped logs by tenantId |

---

## Performance SLOs

| Operation | p95 target |
|-----------|------------|
| API read | <200ms |
| API write | <500ms |
| Runtime hydrate (warm) | <500ms |
| Publish (typical) | <60s |
| Event delivery | <2s |

---

*End of document.*
