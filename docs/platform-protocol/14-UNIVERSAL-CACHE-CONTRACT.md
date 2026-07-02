# 14 — Universal Cache Contract

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-14

---

## Cache service interface

```
get(key: CacheKey): Promise<CacheEntry|null>
set(key: CacheKey, value, ttlSec): Promise<void>
invalidate(pattern: string): Promise<void>
getVersion(key: CacheKey): string
```

---

## CacheKey structure

```json
{
  "namespace": "crb|pin|auth|gr|schema",
  "tenantId": "uuid",
  "parts": ["moduleCode", "definitionVersionId"],
  "hash": "optional query hash"
}
```

---

## Contract rules

| Rule | Detail |
|------|--------|
| CACHE-01 | Keys always tenant-scoped (except schema registry) |
| CACHE-02 | Value includes `version` matching CRB/pin version |
| CACHE-03 | Never cache unsigned CRB |
| CACHE-04 | Invalidate on event — see mapping below |
| CACHE-05 | TTL defaults from [platform-behavior/21](../platform-behavior/21-UNIVERSAL-CACHING.md) |

---

## Invalidation events

| Event | Pattern |
|-------|---------|
| mmm.publish.completed | `crb:{tenant}:*` |
| object.activated | `pin:{tenant}:*` |
| permission.granted/revoked | `auth:{userId}` |
| record.* | `gr:list:{bo}:*` |

---

## Consumer obligations

| Consumer | Must |
|----------|------|
| Query handlers | Check version before serve |
| Runtime hydrate | Single-flight lock on miss |
| All services | Use CacheService — no private Redis clients |

---

*End of document.*
