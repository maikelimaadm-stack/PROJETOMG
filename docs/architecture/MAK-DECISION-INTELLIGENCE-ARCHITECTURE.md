# MAK Decision Intelligence Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Decision Platform  
**Hierarchy:** [Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision only.** No decision engines implemented in Program 3.5A.

**Binding principle:** **Every recommendation must be explainable.**

---

## 1. Purpose

Define how MAK **supports business decisions** — from operational choices to strategic scenarios — with evidence, alternatives, and confidence — without replacing human accountability.

---

## 2. Decision intelligence stack

```
Enterprise Context + Memory + Twin state (optional)
        ↓
Decision Engine (evaluate policies, rules, constraints)
        ↓
Recommendation Engine (ranked options)
        ↓
Simulation Engine (what-if on twin or sandbox)
        ↓
Explainability layer → business-language output
        ↓
Decision History → Decision Memory
```

---

## 3. Core engines (vision)

| Engine | Role |
|--------|------|
| **Decision Engine** | Evaluate declarative rules, trees, policies against current state |
| **Recommendation Engine** | Propose actions, parameter changes, new Intents |
| **Simulation Engine** | Project outcomes under scenarios without production impact |

All engines consume **Business Intent** and **Capability** bindings — never ad-hoc module logic.

---

## 4. Analysis capabilities

| Capability | Description |
|------------|-------------|
| **Scenario Analysis** | Compare multiple futures side-by-side |
| **ROI Estimation** | Business-case proxies for proposed changes |
| **Risk Analysis** | Compliance, financial, operational risk facets |
| **Alternative Analysis** | Explicit option set with trade-offs |
| **Decision History** | Auditable log of choices and outcomes |
| **Explainability** | Evidence chain: data → reasoning → recommendation |
| **Decision Confidence** | Calibrated score + uncertainty disclosure |

---

## 5. Explainability contract (normative)

Every recommendation presented to a business user includes:

| Element | Required |
|---------|----------|
| **Business summary** | Plain-language recommendation |
| **Evidence links** | Memory / metrics / events cited |
| **Alternatives considered** | At least one rejected option when applicable |
| **Confidence** | Score + what would change the answer |
| **Approval path** | Who can accept / defer / reject |

**Forbidden:** Black-box scores without evidence in business UX.

---

## 6. AI relationship

| Mode | Policy |
|------|--------|
| **Without AI** | Rule-based and statistical paths fully supported |
| **With AI** | Accelerates option generation; must pass same explainability contract |
| **Mandatory AI** | **Forbidden** per [EOS Principles](./MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) EOS-17 |

---

## 7. Relationships

| Document | Relationship |
|----------|--------------|
| [Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) | Decision Memory |
| [Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md) | Improvement recommendations |
| [Digital Twin](./MAK-DIGITAL-TWIN-ARCHITECTURE.md) | Simulation substrate |
| [Business Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | Decisions derive from / publish to Intent |

---

## 8. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + engines (vision) | ✅ Program 3.5A |
| Decision / simulation runtime | **Not started** |
| Roadmap | **Unchanged** — Program 3.5 Intent Resolver next |

---

*Amend via Decision register. Extends Intelligence Architecture (D-057); no conflict with Computation Engine.*
