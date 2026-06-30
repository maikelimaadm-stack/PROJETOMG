# MAK Intelligence Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Layer:** L6 — AI Platform + Intelligence services

---

## ⚠️ Scope boundary

Defines the **Intelligence Layer** — observatory, decision support, recommendations, optimization. **Vision only.** Current AI integrations in Studio (Formula suggestions stubs) are not Intelligence Platform.

---

## 1. Purpose

Transform operational and knowledge signals into **actionable business insight** — without requiring external consulting. Intelligence **proposes**; humans and governance **approve**.

---

## 2. Intelligence stack (target)

```
┌─────────────────────────────────────────────────────────────┐
│  Experience: Insights · Health · Recommendations · Alerts    │
├─────────────────────────────────────────────────────────────┤
│  INTELLIGENCE LAYER ◄── THIS DOCUMENT                       │
│  Observatory · Decision · Recommendation · Optimization     │
├─────────────────────────────────────────────────────────────┤
│  Knowledge Platform · Digital Twin · Continuous Improvement │
├─────────────────────────────────────────────────────────────┤
│  MDP · Event Bus · Runtime telemetry · Studio authoring     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core engines (vision)

| Engine | Role |
|--------|------|
| **Business Observatory** | Real-time and historical view of KPIs, flows, anomalies |
| **Decision Engine** | Evaluate rules, trees, and policies against twin state |
| **Recommendation Engine** | Suggest automations, dashboards, workflows, training |
| **Optimization Engine** | Propose parameter and process improvements |

---

## 4. Intelligence products

| Product | Description |
|---------|-------------|
| **Business Health Score** | Composite maturity + operational health per tenant/org |
| **Enterprise DNA** | Signature of how the company operates (patterns, bottlenecks) |
| **Business Patterns** | Recurring structures detected across modules |
| **Business Insights** | Narrated findings with evidence links |
| **Strategic Intelligence** | Long-horizon trends, risks, opportunities |
| **Operational Intelligence** | Day-to-day efficiency, SLA, queue depth |
| **Consulting Intelligence** | Internal “consultant” — improvement playbooks without vendor lock-in |

---

## 5. AI governance (vision)

| Concern | Policy |
|---------|--------|
| **AI Suggestions** | Opt-in; shown as drafts in Intent / Studio |
| **AI Review** | Second-pass validation before publish |
| **AI Governance** | Model registry, tenant policy, audit |
| **AI Explainability** | Trace: data → reasoning → recommendation |
| **AI Acceleration** | Never mandatory — all features work without AI |

---

## 6. Analysis capabilities

| Capability | Input | Output |
|------------|-------|--------|
| **Continuous Improvement** | Mining + metrics | Ranked opportunities |
| **Root Cause Analysis** | Event graph + twin | Hypothesis tree |
| **Predictive Intelligence** | Historical series | Forecasts (with confidence) |
| **Prescriptive Intelligence** | Twin simulation | Recommended actions |

---

## 7. Integration points

| Source | Use |
|--------|-----|
| [Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md) | Context, vocabulary |
| [Digital Twin](./MAK-DIGITAL-TWIN-ARCHITECTURE.md) | Simulation, what-if |
| [Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) | Opportunity pipeline |
| [Business Capabilities](./MAK-BUSINESS-CAPABILITIES.md) | Action binding |

---

## 8. Current status

| Item | Status |
|------|--------|
| Intelligence Platform (L6) | **Not started** |
| Formula suggestion stubs | Extension points only (D-056) |
| Observability (G303/G304 deploy) | Operational — not Business Observatory |

---

*Extends Master Architecture §L6 AI Platform. Does not modify Runtime or Foundation.*
