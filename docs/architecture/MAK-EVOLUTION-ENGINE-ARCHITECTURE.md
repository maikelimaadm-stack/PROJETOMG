# MAK Evolution Engine Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Intelligence & Learning Platform  
**Hierarchy:** [Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) · [Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision only.** Defines longitudinal **enterprise evolution** tracking. No evolution engine runtime in Program 3.5A.

**Binding principle:** **Every improvement must be measurable.**

---

## 1. Purpose

Define how MAK **accompanies enterprise evolution over years** — capability growth, process change, automation adoption, knowledge accumulation, organizational maturity, and strategic shifts — as a first-class platform concern.

---

## 2. Evolution dimensions

| Dimension | Tracked evolution |
|-----------|-------------------|
| **Evolution Timeline** | Master chronological view of significant changes |
| **Capability Growth** | New / deprecated Business Capabilities over time |
| **Process Evolution** | Designed vs discovered process drift |
| **Automation Evolution** | Automation coverage and reliability trends |
| **Knowledge Evolution** | Vocabulary, patterns, Library growth |
| **Organizational Evolution** | Structure, roles, delegation changes |
| **Improvement History** | Consulting plans → outcomes |
| **Strategic Evolution** | Intent themes shifting (e.g. cost → growth) |
| **Enterprise Maturity** | DNA maturity stage progression |

---

## 3. Evolution Timeline (normative)

```typescript
// Conceptual — not implementation
EvolutionEvent {
  id: string
  tenantId: string
  occurredAt: string
  kind: EvolutionKind
  title: string                    // business language
  intentId?: string
  capabilityId?: string
  healthDelta?: HealthDeltaSummary
  dnaRevision?: number
  evidenceRefs: string[]
  approvedBy?: string
}
```

**EvolutionKind** examples: `intent_published`, `automation_deployed`, `health_milestone`, `improvement_completed`, `mining_finding_resolved`, `maturity_stage_change`.

---

## 4. Measuring improvement

| Rule | Policy |
|------|--------|
| **Baseline before change** | Snapshot Health + DNA pre-change |
| **Target definition** | Improvement Plan declares measurable target |
| **Post-measurement** | Compare after agreed window |
| **Failed improvement** | Recorded as learning — not hidden |
| **Link to Memory** | All events immutable in Enterprise Memory |

Feeds [Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md) continuous follow-up.

---

## 5. Relationships

| Document | Relationship |
|----------|--------------|
| [Business Health](./MAK-BUSINESS-HEALTH-ARCHITECTURE.md) | Score trends on timeline |
| [Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) | Maturity and fingerprint revisions |
| [Process Mining](./MAK-PROCESS-MINING-ARCHITECTURE.md) | Process evolution signals |
| [EOS Principles](./MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) | EOS-24 continuous measurement |

---

## 6. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + timeline contract | ✅ Program 3.5A |
| Evolution runtime | **Not started** |
| Roadmap | **Unchanged** — Program 3.5 Intent Resolver next |

---

*Amend via Decision register. Compatible with D-057 through D-059.*
