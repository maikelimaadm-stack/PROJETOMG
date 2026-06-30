# MAK Consulting Engine Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Intelligence Platform  
**Hierarchy:** [Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md) · [Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision only.** The **Consulting Engine** is an internal, continuous advisory layer — not external professional services.

**Binding principle:** **The system must continuously guide enterprise evolution.**

---

## 1. Purpose

Reduce dependence on **external consulting** by embedding continuous operational, financial, and strategic guidance into MAK — powered by Memory, Mining, DNA, Health, and Decision Intelligence.

The Consulting Engine **orients**; leaders **decide**; Intent Authoring **implements**.

---

## 2. Consulting domains

| Domain | Focus | Typical inputs |
|--------|-------|----------------|
| **Continuous Consulting** | Always-on advisory loop | Health, Evolution, Mining |
| **Operational Consulting** | Throughput, SLA, capacity | Process Mining, Operational Memory |
| **Financial Consulting** | Margin, cost, cash proxies | KPIs, formulas, dashboards |
| **Process Consulting** | Flow redesign, bottlenecks | Discovery, rework detection |
| **Automation Consulting** | What to automate next | Manual work detection, Automation DNA |
| **Optimization Consulting** | Parameter and policy tuning | Simulation, ROI |
| **Growth Consulting** | Capability expansion | Capability DNA, maturity |
| **Business Recommendations** | Ranked improvement backlog | All domains |
| **Improvement Plans** | Phased initiatives with owners | Approved recommendations |
| **Continuous Follow-up** | Track plan execution vs outcome | Evolution Timeline |

---

## 3. Consulting loop (normative)

```
Observe (Mining, Health, Memory)
        ↓
Analyze (DNA, Decision Intelligence)
        ↓
Recommend (explainable, prioritized)
        ↓
Plan (human-approved Improvement Plan)
        ↓
Implement (Intent → Resolver → Runtime)
        ↓
Measure (Evolution Engine, Health delta)
        ↓
Learn (Enterprise Memory) → loop
```

---

## 4. Output contracts

| Artifact | Consumer |
|----------|----------|
| **Recommendation** | Business user dashboard |
| **Improvement Plan** | PMO / operations leader |
| **Intent candidate** | Intent Authoring (guided pick — not NLP in v1) |
| **Health impact forecast** | Decision Intelligence simulation |

All outputs: business language, evidence-linked, approval-gated.

---

## 5. Governance

| Rule | Policy |
|------|--------|
| **No auto-production change** | Consulting never publishes Intent without human approval |
| **Tenant isolation** | No cross-tenant benchmarking without explicit opt-in |
| **Consultant replacement** | Goal is capability building inside the enterprise |
| **AI optional** | Heuristic and rule paths must exist |

---

## 6. Relationships

| Document | Relationship |
|----------|--------------|
| [Process Mining](./MAK-PROCESS-MINING-ARCHITECTURE.md) | Operational findings |
| [Business Health](./MAK-BUSINESS-HEALTH-ARCHITECTURE.md) | Score drivers |
| [Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md) | Follow-up measurement |
| [EOS Principles](./MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) | EOS-23 continuous suggestions |

---

## 7. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + domains | ✅ Program 3.5A |
| Consulting runtime | **Not started** |
| Roadmap | **Unchanged** — Program 3.5 Intent Resolver next |

---

*Amend via Decision register. Vision layer only — no Studio or Foundation changes.*
