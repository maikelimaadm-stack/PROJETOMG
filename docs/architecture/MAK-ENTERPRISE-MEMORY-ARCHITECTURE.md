# MAK Enterprise Memory Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Layer:** L6 — Knowledge & Memory Platform  
**Hierarchy:** [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) → [Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md) → **This document**

---

## ⚠️ Scope boundary

**Vision and contracts only.** No storage implementation, APIs, or AI models in Program 3.5A.

**Binding principle:** **Memory belongs to the enterprise, never to the AI.**

---

## 1. Purpose

Define how an organization **accumulates, preserves, and reuses knowledge** over years of operation on MAK — independent of any single model, vendor, or consultant.

Enterprise Memory is the **longitudinal record** of what the company knew, decided, automated, and learned.

---

## 2. Memory taxonomy

| Memory type | Scope | Examples |
|-------------|-------|----------|
| **Enterprise Memory** | Whole tenant / group | Strategy shifts, maturity milestones, health history |
| **Business Memory** | Domain / capability | Pricing policies, commission rules, approval norms |
| **Operational Memory** | Day-to-day execution | Throughput baselines, SLA history, incident patterns |
| **Decision Memory** | Choices made | Approved scenarios, rejected alternatives, rationale |
| **Automation Memory** | Event → action history | Trigger frequency, failure modes, override logs |
| **Workflow Memory** | Process instances | Path variants, wait times, escalation chains |
| **Formula Memory** | Computation lineage | Field derivations, validation outcomes, version pins |

All types roll up under **Enterprise Memory** with explicit **Knowledge Lineage**.

---

## 3. Core concepts

### 3.1 Knowledge Lineage

Every memory artifact carries traceable lineage:

```
Source event / authoring action
        ↓
Business Intent (SSOT ref)
        ↓
Derived artifact (formula, workflow, etc.)
        ↓
Runtime observation
        ↓
Memory record (immutable event + derived summary)
```

Lineage links: `intentId`, `artifactId`, `revision`, `tenantId`, `observedAt`.

### 3.2 Memory Versioning

| Mechanism | Rule |
|-----------|------|
| **Content revision** | Monotonic per memory facet |
| **Schema semver** | `mak-enterprise-memory-v1` → breaking changes via Decision |
| **Point-in-time replay** | Enterprise Context reconstructable for any approved date |
| **Retention policy** | Tenant-governed; compliance profiles override defaults |

### 3.3 Memory Lifecycle

| Stage | Description |
|-------|-------------|
| **Capture** | Events, authoring, decisions, outcomes ingested |
| **Classify** | Route to memory type + facet |
| **Validate** | Schema, policy, PII classification |
| **Index** | Searchable, graph-linked ([Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md)) |
| **Summarize** | Aggregates for DNA, Health, Evolution (future) |
| **Archive** | Cold storage; lineage preserved |
| **Purge** | Policy-driven; audit trail of purge itself |

### 3.4 Memory Providers

Pluggable **Memory Providers** supply facets — all write through official bus:

| Provider | Input | Memory facet |
|----------|-------|--------------|
| **Intent Provider** | Intent Library changes | Business Memory |
| **Runtime Provider** | CRB / event bus | Operational Memory |
| **Decision Provider** | Decision Intelligence | Decision Memory |
| **Studio Provider** | Publish / version events | Formula / Workflow Memory |
| **Integration Provider** | Sync logs | Operational Memory |

**Forbidden:** AI model weights as substitute for Enterprise Memory.

### 3.5 Enterprise Context

**Enterprise Context** is the **assembled view** of memory relevant to a task — scoped, versioned, explainable:

- Active vocabulary and synonyms  
- Recent decisions and outcomes  
- Applicable policies and capabilities  
- Historical baselines for comparison  

Context is **assembled from memory** — not hallucinated.

### 3.6 Organizational Learning

Learning is **enterprise-owned**:

- Pattern detection feeds suggestions ([Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md))  
- Humans approve changes to Business Intent or capabilities  
- Learning artifacts stored as Memory — not opaque model fine-tunes required for audit  

### 3.7 Historical Evolution

Time-series views: capability adoption, automation rate, health score, DNA drift ([Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md)).

### 3.8 Memory Governance

| Concern | Policy |
|---------|--------|
| **Ownership** | Tenant admin + data steward roles |
| **Classification** | Public / internal / restricted / regulated |
| **Export** | Full enterprise memory portable on exit |
| **AI use** | Opt-in; memory never transferred as model ownership |
| **Audit** | Who accessed which context, when |

---

## 4. Relationship to Business Intent

Business Intent (D-059) is the **authoring SSOT**. Memory **records** intent lifecycle and outcomes — it does not replace Intent Documents.

---

## 5. Implementation status

| Capability | Status |
|------------|--------|
| Architecture + contracts | ✅ Program 3.5A |
| Memory store / APIs | **Not started** |
| Next implementation mission | **Unchanged** — Program 3.5 Intent Resolver |

---

*Amend via Decision register. Compatible with D-057, D-059, Knowledge Architecture.*
