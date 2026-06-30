# MAK Digital Twin Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Layer:** L6 — Platform Services (simulation & replay)

---

## ⚠️ Scope boundary

Defines the **Enterprise Digital Twin** — a live digital representation of each tenant's business. **Vision only.** No twin runtime in Program 3.1.5.

---

## 1. Purpose

Each **empresa** (and optionally org units) possesses a **Digital Twin** that mirrors:

- Structure (objects, relationships, capabilities)
- Processes (workflows, automations)
- People (roles, assignments — metadata only, RBAC-bound)
- Assets (equipment, inventory — as business objects)
- Data (aggregated operational state — not raw PII export)

Enables simulation, impact analysis, and replay **before** changing production.

---

## 2. Twin facets

| Twin | Contents |
|------|----------|
| **Business Digital Twin** | Root aggregate — links all facets |
| **Process Twin** | Workflow graphs, throughput, bottlenecks |
| **People Twin** | Org structure, workload, skill tags (HR policy compliant) |
| **Asset Twin** | Asset registry, utilization, maintenance hooks |
| **Data Twin** | Metric snapshots, dimensional aggregates |
| **Workflow Twin** | Active instances, SLAs, exception rates |
| **Automation Twin** | Triggers, actions, failure rates |
| **Knowledge Twin** | Vocabulary, decisions, linked playbooks |

---

## 3. Twin operations

| Operation | Description |
|-----------|-------------|
| **Simulation** | Run scenario on twin copy — no production side effects |
| **Scenario Analysis** | Compare branches (best/worst/likely) |
| **Impact Analysis** | “If we change field X / workflow Y, what breaks?” |
| **Future Prediction** | Forecast from historical twin timelines |
| **Operational Replay** | Step through past business timeline |
| **Business Timeline** | Ordered events + state changes |
| **Business Evolution** | Diff twin snapshots over quarters |
| **Dependency Visualization** | Graph UI over objects + computation deps |

---

## 4. Data flow

```
Runtime events + MDP publish + Studio authoring
        ↓
Twin ingest (async, tenant-scoped)
        ↓
Twin store (versioned snapshots + stream)
        ↓
Intelligence · Improvement · Studio preview (simulation mode)
```

**Rule:** Twin **never** bypasses tenant isolation or RBAC. Production writes only via official Runtime paths.

---

## 5. Relationship to Studio

Studio **preview** today is a **local subset** of twin behavior (single record, draft CRB). Full Digital Twin is **platform-wide** and **time-aware** — future program.

Computation Engine simulation mode (`simulationMode` in Studio Context) is an **extension point** toward twin-backed preview.

---

## 6. Current status

| Capability | Status |
|------------|--------|
| Digital Twin platform | **Vision only** |
| CRB preview | ✅ Program 1E |
| Computation Studio Context `simulationMode` | ✅ D-054 spec |

---

*Compatible with Master Architecture L6. No Foundation or MDP schema change in this mission.*
