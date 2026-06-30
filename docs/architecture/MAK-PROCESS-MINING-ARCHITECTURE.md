# MAK Process Mining Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Continuous Improvement & Intelligence  
**Hierarchy:** [Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision and contracts only.** Extends D-057 Process Mining hooks. No mining pipelines, jobs, or dashboards in Program 3.5A.

**Binding principle:** **The system observes continuously without depending on external consulting.**

---

## 1. Purpose

Define how MAK **continuously discovers and analyzes** how work actually happens — comparing designed intent (workflows, automations) with operational reality.

Process Mining is **always-on observability** of business processes, not a one-time consulting engagement.

---

## 2. Observation stack

```
Runtime events + Integration logs + Authoring telemetry
        ↓
Event normalization (tenant-scoped)
        ↓
Process Discovery → Process model candidates
        ↓
Conformance & variant analysis
        ↓
Finding types (bottleneck, waste, opportunity)
        ↓
Consulting / Intelligence / Studio suggestions (human approval)
```

---

## 3. Core capabilities (vision register)

| Capability | Description | Output |
|------------|-------------|--------|
| **Process Discovery** | Infer processes from event logs | Discovered process maps |
| **Bottleneck Detection** | Steps limiting throughput | Ranked bottlenecks + evidence |
| **Waiting Time** | Queue and idle delays between steps | Wait histograms |
| **Idle Time** | Resources/steps with no productive work | Idle hotspots |
| **Rework Detection** | Repeated loops, backtracking | Rework paths + cost proxy |
| **Parallel Activities** | Un modeled concurrency | Variant suggestions |
| **Automation Opportunities** | Manual clusters automatable | Intent / capability candidates |
| **Hidden Processes** | Shadow flows outside designed workflows | Discovery alerts |
| **Operational Waste** | Redundant approvals, duplicate entry | Waste catalog |
| **Continuous Observation** | Scheduled + streaming analysis | Living process dashboard (future) |

---

## 4. Event taxonomy (contract)

Mining-eligible events carry (from Intent hooks D-059):

| Field | Purpose |
|-------|---------|
| `miningEligible: boolean` | Intent participates |
| `processId` / `intentId` | Link to designed process |
| `stepKind` | Business-named step |
| `timestamp`, `duration`, `actor` | Analysis dimensions |
| `outcome` | success / fail / rework |

**Source:** Platform event bus (L3 — future), CRB runtime, integration webhooks.

---

## 5. Findings governance

| Rule | Policy |
|------|--------|
| **Explainability** | Every finding links to event evidence |
| **No auto-change** | Mining **suggests**; Intent/Studio **implements** after approval |
| **Privacy** | Actor-level detail governed by tenant policy |
| **Consulting replacement** | Findings feed [Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md) |

---

## 6. Relationships

| Document | Relationship |
|----------|--------------|
| [Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) | Parent vision (D-057) — this doc specializes mining |
| [Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) | Process DNA facet |
| [Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md) | Process evolution timeline |
| [Business Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | `processMining` hooks |

---

## 7. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + taxonomy | ✅ Program 3.5A |
| Event bus + mining jobs | **Not started** |
| Roadmap | **Unchanged** — Program 3.5 Intent Resolver next |

---

*Amend via Decision register. Does not alter Runtime, MDP, or Studio certified behavior.*
