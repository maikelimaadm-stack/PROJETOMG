# MAK Knowledge Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Layer:** L6 — Knowledge Platform (Master Architecture)

---

## ⚠️ Scope boundary

Defines **how the platform learns and remembers** at enterprise scale. No Knowledge Platform code in this mission.

---

## 1. Purpose

MAK Knowledge Architecture connects **operational data**, **authoring metadata**, **decision history**, and **enterprise vocabulary** into a unified graph that powers:

- AI context (RBAC-bound)
- Intent resolution
- Intelligence and recommendations
- Digital twin replay
- Continuous improvement

---

## 2. Core components

| Component | Definition |
|-----------|------------|
| **Business Memory** | Tenant-scoped store of facts, decisions, and outcomes learned over time |
| **Knowledge Graph** | Nodes (objects, events, concepts) + edges (relationships, causality) |
| **Enterprise Knowledge** | Curated policies, playbooks, regulations, SOPs |
| **Knowledge Providers** | Sources: MDP, audit logs, integrations, user uploads, mining |
| **Knowledge Consumers** | AI, Intelligence, Intent resolver, Twin simulator, Studio suggestions |
| **Historical Context** | Time-bounded snapshots for “what did we know then?” |
| **Decision History** | Who decided what, when, with which data |
| **Learning Engine** | Pattern extraction from operations (future — not ML mandate) |
| **Process Mining** | Discover flows from event logs |
| **Semantic Knowledge** | Embeddings + ontology aligned to Enterprise Vocabulary |
| **Relationship Graph** | MDP-3 + cross-domain links |

---

## 3. Enterprise Vocabulary

| Attribute | Description |
|-----------|-------------|
| **Terms** | Canonical business terms per tenant |
| **Synonyms** | NL mapping for Intent resolution |
| **Units & dimensions** | KPIs, currencies, measures |
| **Governance** | Steward role, approval workflow |
| **Versioning** | Vocabulary semver + effective dates |

Feeds [Business Intent Architecture](./MAK-BUSINESS-INTENT-ARCHITECTURE.md) and Studio authoring labels.

---

## 4. Knowledge lifecycle

| Stage | Activity |
|-------|----------|
| **Ingest** | Providers push structured/unstructured knowledge |
| **Knowledge Validation** | Schema, source trust, PII policy |
| **Knowledge Quality** | Completeness, freshness, conflict detection |
| **Knowledge Versioning** | Pin for AI and compliance |
| **Knowledge Sharing** | Cross-module reuse, marketplace packages |

---

## 5. Business Experience

**Business Experience** is the accumulated narrative of how the enterprise uses the platform — journeys, pain points, successful patterns — derived from:

- Studio authoring telemetry (aggregated, anonymized where required)
- Runtime events
- Continuous improvement signals

Used for training suggestions and maturity scoring — not sold as raw user surveillance (Constitution + RBAC).

---

## 6. AI Context

| Rule | Description |
|------|-------------|
| **K-AI1** | AI reads knowledge graph + vocabulary — never raw DB without policy |
| **K-AI2** | Context window includes object lineage and decision history when permitted |
| **K-AI3** | AI outputs are proposals — Intent layer confirms |

---

## 7. Current vs future

| Capability | Today | Target |
|------------|-------|--------|
| MDP metadata | ✅ L4 | Knowledge graph node source |
| Dependency / impact metadata | ✅ Studio engines | Graph edges |
| Enterprise Vocabulary | — | L6 service |
| Learning Engine | — | L6 |
| Process Mining | — | L6 + observability |

---

*Compatible with Master Architecture L6 Knowledge Platform. No implementation in Program 3.1.5.*
