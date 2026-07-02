# 15 — Scalability Architecture

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PA-14

---

## Principle

**Same L0–L10 topology** from 100 to 10 million tenants — scale **out**, not **up** architecturally.

---

## Tier model

| Tenants | API | Database | Cache | CDN |
|---------|-----|----------|-------|-----|
| 100 | 1–2 replicas | Single PG | Optional Redis | Vercel |
| 1K | 3–5 replicas | PG + read replica | Redis required | CDN |
| 10K | Auto-scale 10+ | PG primary + 2 replicas | Redis cluster | Multi-region CDN |
| 100K | K8s/Railway scale | Sharded by tenant hash | Redis cluster | Edge |
| 1M | Regional stacks | Shard PG per region | Dedicated cache tier | Global |
| 10M | Multi-region active | Shard + citus-style | Dedicated | Full edge |

---

## Sharding strategy

| Data | Shard key |
|------|-----------|
| MMM objects | `cliente_id` |
| Records | `cliente_id` |
| CRB bundles | `tenant_id` + CDN |
| Events | `tenant_id` partition |
| Intelligence | `tenant_id` |

Cross-shard queries **forbidden** except platform admin.

---

## Hot paths

| Path | Optimization |
|------|--------------|
| Runtime boot | CRB CDN cache |
| Record list | Index + GR cache |
| Publish | Async job queue at 10K+ |
| Studio list | Cursor pagination |

---

## No architecture change items

| Concern | Scale approach |
|---------|--------------|
| Layer count | Fixed L0–L10 |
| CRB immutability | Unchanged |
| MMM envelope | Unchanged |
| Event bus | Partitioned topics |

---

*End of document.*
