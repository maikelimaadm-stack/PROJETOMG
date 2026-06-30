# MAK Business DNA Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Intelligence & Digital Twin  
**Hierarchy:** [Digital Twin](./MAK-DIGITAL-TWIN-ARCHITECTURE.md) · [Intelligence](./MAK-INTELLIGENCE-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision only.** Defines the **operational identity** model of an enterprise. No DNA computation jobs or UI in Program 3.5A.

**Binding principle:** **Every enterprise has its own operational identity.**

---

## 1. Purpose

**Business DNA** is the canonical model of **how a specific company operates** — patterns, maturity, behaviors, and fingerprint — evolving over time on MAK.

Distinct from generic ERP configuration: DNA is **derived and observed**, not merely configured.

---

## 2. DNA facets

| Facet | Description | Primary signals |
|-------|-------------|-----------------|
| **Organizational DNA** | Structure, delegation, approval depth | Workflow memory, org metadata |
| **Process DNA** | Dominant flows, variants, bottlenecks | Process Mining, event logs |
| **Operational DNA** | Execution tempo, error profile, capacity | Operational Memory, runtime telemetry |
| **Decision DNA** | How choices are made, risk appetite | Decision Memory, scenario history |
| **Automation DNA** | Automation maturity, coverage gaps | Automation Memory, manual work detection |
| **Capability DNA** | Which Business Capabilities dominate | Capability usage, Intent categories |
| **Culture Patterns** | Recurring behavioral norms (e.g. approval-heavy) | Mining + Health trends |
| **Behavioral Patterns** | User/process interaction clusters | Observatory signals |

Facets compose the **Enterprise Fingerprint** — a stable, versioned identifier for benchmarking and twin simulation.

---

## 3. Core concepts

### 3.1 Business Identity

**Business Identity** is the business-facing label of DNA — how leaders describe “how we work”:

- Narrative summary (business language)  
- Linked evidence (insights, not raw logs)  
- Comparison to past self — not to competitors by default  

### 3.2 Enterprise Fingerprint

Technical aggregate:

```typescript
// Conceptual — not implementation
EnterpriseFingerprint {
  schemaVersion: "mak-business-dna-v1"
  tenantId: string
  dnaRevision: number
  facets: DnaFacetSnapshot[]
  maturityLevel: MaturityStage
  contentHash: string
  capturedAt: string
}
```

### 3.3 Maturity Evolution

| Stage | Indicators (examples) |
|-------|------------------------|
| **Foundational** | Manual processes, sparse automation |
| **Structured** | Intent Library growing, workflows defined |
| **Automated** | High automation DNA, low rework |
| **Optimized** | Continuous improvement loop active |
| **Adaptive** | Simulation-driven change, predictive health |

Tracked on [Evolution Timeline](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md).

### 3.4 DNA Versioning

- Snapshot on schedule + on significant change (Intent publish, org restructure hook)  
- Diff between DNA revisions explains **what changed operationally**  
- Hooks on Intent Document (`businessDnaFacet`) from D-059 — **contracts only until implementation**

---

## 4. Relationships

| Document | Relationship |
|----------|--------------|
| [Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) | DNA aggregates memory facets |
| [Process Mining](./MAK-PROCESS-MINING-ARCHITECTURE.md) | Process DNA primary input |
| [Business Health](./MAK-BUSINESS-HEALTH-ARCHITECTURE.md) | Health score informs maturity |
| [Business Computation](./MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) | Computation kind mix in Capability DNA |

---

## 5. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + facets | ✅ Program 3.5A |
| DNA engine / UI | **Not started** |
| Roadmap | **Unchanged** — Intent Resolver next |

---

*Amend via Decision register. Extends D-057 Business DNA hooks; does not alter D-058/D-059 contracts.*
