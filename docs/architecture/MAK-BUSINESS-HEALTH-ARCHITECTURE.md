# MAK Business Health Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Intelligence Observatory  
**Hierarchy:** [Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision only.** Defines the **Business Health Score** model. No scoring jobs or UI in Program 3.5A.

**Binding principle:** **The enterprise must track its evolution continuously.**

---

## 1. Purpose

Provide a **composite, explainable measure** of how well the organization operates on MAK — across operations, finance, automation, governance, knowledge, process, and risk — with historical trend and benchmark hooks.

---

## 2. Score dimensions

| Dimension | Measures (examples) | Weight |
|-----------|---------------------|--------|
| **Operational Score** | SLA adherence, throughput, error rate | Tenant-configurable |
| **Financial Score** | KPI health vs targets (margin, DSO proxies) | Tenant-configurable |
| **Automation Score** | Coverage, failure rate, manual work ratio | Tenant-configurable |
| **Governance Score** | Policy compliance, approval discipline, audit completeness | Tenant-configurable |
| **Knowledge Score** | Vocabulary coverage, documentation freshness | Tenant-configurable |
| **Process Score** | Conformance, rework, bottleneck severity | Tenant-configurable |
| **Risk Score** | Compliance gaps, segregation issues, anomaly rate | Tenant-configurable |
| **Overall Health** | Weighted composite **Overall Health** | Published score |

Each sub-score is **explainable** — drill-down to contributing signals.

---

## 3. Historical evolution

| Mechanism | Description |
|-----------|-------------|
| **Time series** | Daily / weekly / monthly snapshots per tenant |
| **Trend classes** | improving / stable / declining per dimension |
| **Event annotations** | Major Intent publishes, org changes pinned on timeline |
| **Comparison** | Current vs prior period vs DNA maturity stage |

Stored in [Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) and [Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md).

---

## 4. Benchmark hooks (architecture only)

| Hook | Purpose |
|------|---------|
| `benchmarkOptIn: boolean` | Tenant consent for anonymized cohort comparison |
| `industryVertical` | Cohort selection facet |
| `maturityBand` | Compare within maturity peer group |
| `benchmarkDelta` | Optional percentile vs cohort |

**Program 3.5A:** hooks only — no benchmark data lake.

---

## 5. Relationships

| Document | Relationship |
|----------|--------------|
| [Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) | Maturity evolution |
| [Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md) | Recommendations triggered by health drops |
| [Decision Intelligence](./MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md) | Scenario impact on health forecast |
| [Platform Maturity Index](../engineering/PLATFORM-MATURITY-INDEX.md) | Platform technical maturity (separate from tenant Business Health) |

---

## 6. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + score model | ✅ Program 3.5A |
| Health computation / UI | **Not started** |
| Roadmap | **Unchanged** — Program 3.5 Intent Resolver next |

---

*Amend via Decision register. Tenant Business Health ≠ PMI ERI (engineering index).*
