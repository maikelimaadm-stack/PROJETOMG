# MAK Business Object Model

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Hierarchy:** Constitution → Master Architecture → **This document** → MDP / Studio implementations

---

## ⚠️ Scope boundary

Defines the **universal Business Object** abstraction for the MAK Enterprise Operating System. **Does not replace** MDP entity definitions or Studio SOM today — provides the **target unification model** for future convergence.

---

## 1. Principle

> **Every piece of information and every artifact on the platform is a Business Object.**

Screens, fields, dashboards, workflows, automations, AI agents, documents, reports, indicators, integrations, processes, widgets, components, permissions, APIs, capabilities, and knowledge assets **share one common model**.

This enables: universal search, reuse, lineage, marketplace packaging, digital twin synchronization, and cross-module intelligence.

---

## 2. Business Object types (exhaustive catalog — vision)

| Category | Examples |
|----------|----------|
| **Data & UI** | Field, Screen (Layout), Widget, Component |
| **Analytics** | Dashboard, Indicator, Report |
| **Process** | Workflow, Automation, Process, Integration |
| **Intelligence** | AI Agent, Knowledge Asset, Recommendation |
| **Platform** | Permission, API, Business Capability, Document |
| **Meta** | Tag, Category, Template, Package (.makpkg) |

Each type **extends** the common Business Object core — no parallel object registries per module.

---

## 3. Common model (normative schema — conceptual)

```typescript
// Conceptual — not implementation code
BusinessObject {
  id: string                    // global object id (tenant-scoped)
  objectKind: BusinessObjectKind
  displayName: string
  description?: string
  identity: ObjectIdentity      // stable id, aliases, external refs
  lifecycle: LifecycleState     // draft | active | deprecated | archived
  metadata: MetadataBundle      // labels, tags, categories, custom attrs
  capabilities: CapabilityRef[] // what this object can do / use
  relationships: RelationshipRef[]
  dependencies: DependencyRef[] // graph for impact analysis
  knowledge: KnowledgeRef[]     // linked vocabulary, docs, decisions
  marketplace?: MarketplaceRef
  ownership: Ownership        // tenant, org unit, role, author
  security: SecurityPolicy      // RBAC, classification, audit level
  audit: AuditTrail
  versioning: VersionDescriptor // revision, semver, content hash
  history: HistoryEntry[]
  inheritance?: InheritanceRef    // extends / specializes
  composition?: CompositionRef[]  // contains / aggregates
}
```

---

## 4. Cross-cutting dimensions

| Dimension | Purpose |
|-----------|---------|
| **Identity** | Stable reference across Studio, MDP, Runtime, Marketplace |
| **Lifecycle** | Draft authoring → publish → deprecate → archive |
| **Metadata** | Discovery, search, AI context, documentation |
| **Capabilities** | Link to [Business Capabilities](./MAK-BUSINESS-CAPABILITIES.md) — not module features |
| **Relationships** | MDP-3 alignment + cross-object graph |
| **Dependencies** | Studio Dependency / Computation graphs (authoring) |
| **Knowledge** | Enterprise vocabulary, playbooks, decision history |
| **Marketplace** | Origin, certification, compatibility range |
| **Ownership** | Business owns assets — not screens (Business Asset Principle) |
| **Security** | Tenant isolation, RBAC, field-level rules |
| **Audit** | Immutable change log |
| **Versioning** | Publish pins, rollback, migration |
| **Tags / Categories** | Faceted navigation in Studio and Intelligence |
| **History** | Time-travel for twin and compliance |
| **Inheritance** | Specialize templates (e.g. “Invoice” extends “Document”) |
| **Composition** | Dashboard contains widgets; workflow contains steps |

---

## 5. Mapping to current platform (compatibility)

| Vision (Business Object) | Current implementation | Convergence path |
|--------------------------|------------------------|------------------|
| Field | MDP field + Field Studio document | Computation IR embed |
| Screen | Layout Studio document | MDP registry |
| Widget / Component | Studio registries + Universal Components | Unified manifest |
| Workflow | V20 config engine (Foundation) | Studio Workflow (future) |
| Capability | `framework/mak` engines + Studio capabilities | Business Capabilities registry (future) |
| Knowledge Asset | — | Knowledge Platform (future) |

**No conflict:** BOM is a **superset vision**; existing artifacts remain valid until explicit migration programs.

---

## 6. Rules

| # | Rule |
|---|------|
| **BO1** | No module-local object identity — global id within tenant |
| **BO2** | Publish produces versioned, immutable snapshot (CRB / package) |
| **BO3** | Dependencies must be explicit in graph — no hidden coupling |
| **BO4** | Reuse via library — clone with lineage pointer |
| **BO5** | Security and audit mandatory on every object kind |

---

## 7. Relationship to Digital Twin

Every Business Object contributes state to the [Digital Twin](./MAK-DIGITAL-TWIN-ARCHITECTURE.md) — structural twin (definitions) and operational twin (runtime metrics).

---

*Vision only — Program 3.1.5. Implementation requires dedicated programs and Decision entries.*
