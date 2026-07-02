# 06 — Universal Query

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-06

---

## Query pattern

Queries are **read-only**. They never mutate state or emit domain events.

```json
{
  "header": { "messageType": "query" },
  "body": {
    "kind": "domain.entity.read",
    "target": "objectId|boCode",
    "payload": {
      "filter": { },
      "sort": [],
      "page": { "offset": 0, "limit": 50 },
      "projection": ["field1", "field2"]
    }
  }
}
```

---

## Query kinds

| kind | Purpose |
|------|---------|
| `record.get` | Single record by id |
| `record.list` | Paginated list |
| `record.search` | Full-text / indexed search |
| `record.lookup` | Autocomplete |
| `record.projection` | Computed/read model |
| `mmm.object.get` | MMM envelope read |
| `mmm.object.list` | MMM scope listing |
| `schema.lookup` | PlatformSchema fetch |
| `crb.registry.get` | Runtime registry slice |
| `permission.check` | Explicit permission probe |
| `health.status` | Health probe |

---

## Read models

| Model | Source |
|-------|--------|
| CRB registries | Compiled snapshot — Runtime |
| GR records | PostgreSQL via adapter |
| MMM objects | mmm_object tables |
| Projections | L10 read stores (future) |

Queries **never** hit MMM DB from Runtime user path (D-PA-03).

---

## Cache behavior

Queries may read cache per [14-UNIVERSAL-CACHE-CONTRACT.md](./14-UNIVERSAL-CACHE-CONTRACT.md). Cache key includes tenant + query hash + CRB version.

---

## Response

Always `status: success` or `status: error` — no partial for single queries. List queries may return empty array.

---

*End of document.*
