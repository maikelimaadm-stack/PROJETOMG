# MAK Continuous Improvement Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Principle:** **Business Intelligence Principle** (vision register)

---

## ⚠️ Scope boundary

Defines **automatic discovery of improvement opportunities**. Vision only — no mining jobs, agents, or dashboards in this mission.

---

## 1. Purpose

The platform continuously answers:

> “Where is manual work, waste, risk, or missed automation — and what should we improve next?”

**Without requiring external consulting.** Findings feed Intelligence and Studio suggestions; humans approve changes.

---

## 2. Signal sources

| Source | Signals |
|--------|---------|
| **Process Discovery** | Previously unknown flows from event logs |
| **Process Mining** | Actual paths vs designed workflows |
| **Operational Metrics** | Latency, error rates, queue depth |
| **Business Observability** | KPI drift, SLA breaches |
| **Authoring telemetry** | Repeated manual Studio patterns |
| **Integration logs** | Failed syncs, retries |
| **Knowledge gaps** | Unmapped vocabulary, missing docs |

---

## 3. Detection targets (vision register)

| Detection | Description |
|-----------|-------------|
| **Bottleneck Detection** | Steps blocking throughput |
| **Operational Waste** | Redundant approvals, duplicate entry |
| **Manual Work Detection** | Tasks without automation |
| **Spreadsheet Detection** | Parallel shadow processes (import patterns, manual exports) |
| **Repeated Tasks** | Same user action clusters |
| **Low productivity patterns** | High touch, low outcome loops |
| **Operational risks** | Compliance gaps, segregation of duties |
| **Strategic opportunities** | Cross-module consolidation |

---

## 4. Suggestion outputs

| Suggestion type | Consumer |
|-----------------|----------|
| **Optimization Suggestions** | Intelligence UI |
| **Automation Suggestions** | Automation Studio (future) |
| **Dashboard Suggestions** | Dashboard Studio (future) |
| **Workflow Suggestions** | Workflow Studio (future) |
| **Training Suggestions** | Knowledge / LMS hooks |
| **Consulting Suggestions** | Internal playbooks — not vendor reports |

All suggestions link to **evidence** (metrics, event samples) and **estimated impact**.

---

## 5. Maturity model

| Level | Characteristic |
|-------|----------------|
| **L1 Reactive** | Manual reports |
| **L2 Instrumented** | Metrics + alerts (partial today — deploy gates) |
| **L3 Diagnostic** | Mining + bottleneck ID |
| **L4 Prescriptive** | Ranked improvements + simulation |
| **L5 Self-optimizing** | Approved auto-tuning within guardrails (far future) |

**Enterprise Maturity** score aggregates L1–L5 per domain — published via Intelligence.

---

## 6. Business Evolution

**Business Evolution** tracks applied improvements over time — twin diff + maturity score trend. Feeds [Digital Twin timeline](./MAK-DIGITAL-TWIN-ARCHITECTURE.md#3-twin-operations).

---

## 7. Current status

| Item | Status |
|------|--------|
| Continuous Improvement Platform | **Vision only** |
| Deploy observability G401/G402 | ✅ CI/deploy health — subset of L2 |
| Program 6 Observability (backlog) | Planned in Platform Evolution |

---

*Does not alter Runtime behavior. Implementation is future L6 program.*
