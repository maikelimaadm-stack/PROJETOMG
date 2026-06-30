# MAK Business Intent Architecture

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision · **extended by Program 3.4** (D-059)  
**Decision:** D-057 · **Authoring detail:** [Business Intent Authoring Architecture](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (D-059)  
**Layer:** L6 (Platform Services) + L5 (Studio authoring surface) — **vision only**  
**Hierarchy:** Constitution → [MAK 2035 Master Architecture](./MAK-2035-MASTER-ARCHITECTURE.md) → [MAK 2035 Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) → **This document**

---

## ⚠️ Scope boundary (Program 3.1.5)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent vision and contracts | Code, APIs, runtime, Foundation, MDP schema |
| Authoring model and conversion pipeline | NL parser, Intent Engine implementation |
| Principles for future Studio Intelligence | Any change to current Studio behavior |

**Rule:** This document **does not alter** existing Foundation, Runtime, MDP, or Studio implementations. It defines the **target** Business Intent Layer for future programs.

---

## 1. Purpose

The **Business Intent Layer** is the highest authoring abstraction in MAK Gestão. Users express **what the business needs** — never **how the system implements it**.

The platform converts intent automatically through a fixed pipeline:

```
Natural Language / Visual / Guided / AI-Assisted Authoring
        ↓
Business Intent
        ↓
Business Model
        ↓
Formula Builder (L5 Studio)
        ↓
Expression Engine
        ↓
Computation Engine
        ↓
Runtime (Foundation + CRB)
```

**Binding principle:** Technology is **invisible** to the business user. AST, JSON, SQL, scripts, and internal structures exist only inside the system boundary (see Technology Transparency Principle, [Platform Vision §Principles](../vision/MAK-2035-PLATFORM-VISION.md)).

---

## 2. User-facing authoring modes

| Mode | Description | User sees | System produces |
|------|-------------|-----------|-----------------|
| **Natural Language** | Plain business language | Sentences, questions, confirmations | Business Intent draft |
| **Visual Authoring** | Formula Builder, dashboards, workflow canvas | Fields, functions, flows, widgets | Business Model fragments |
| **Guided Authoring** | Wizards, templates, capability pickers | Steps, choices, previews | Validated Intent + Model |
| **AI Assisted Authoring** | Suggestions, explain, optimize | Proposals to accept/reject | Intent candidates (never auto-apply without confirmation) |

All modes converge on the **same** Business Intent representation before compilation.

---

## 3. Core concepts

### 3.1 Business Language

The **controlled vocabulary** of the tenant — terms, synonyms, units, and domain phrases. Owned by the enterprise, versioned per `cliente_id`. Maps to [Enterprise Vocabulary](./MAK-KNOWLEDGE-ARCHITECTURE.md#5-enterprise-vocabulary) and MDP entity/field labels.

### 3.2 Business Intent

A **declarative statement of business need** — immutable intent id, revision, owner, scope (module/entity/process), and structured payload (goals, rules, conditions, actions). Not executable until resolved to Business Model.

### 3.3 Business Model

The **canonical structural representation** of intent — entities, relationships, behaviors, metrics, and constraints — compatible with MDP L4 and Studio designers. Produced by Intent Resolution; consumed by Formula Builder, Workflow Studio, Dashboard Studio (future).

---

## 4. Business rules, events, and decisions

| Concept | Definition | Future owner (vision) |
|---------|------------|------------------------|
| **Business Rules** | Declarative constraints and derivations | Intent → Computation / Validation |
| **Business Events** | Things that happened in the business | Platform Core event bus + MDP |
| **Conditions** | Predicates over business state | Expression / Computation pipeline |
| **Actions** | Side effects (notify, approve, integrate) | Business Capabilities |
| **Decision Trees** | Branching business logic | Workflow + Decision Engine |
| **Business Goals** | Measurable outcomes (KPIs, SLAs) | Intelligence + Digital Twin |

---

## 5. Intent lifecycle

| Stage | Description |
|-------|-------------|
| **Capture** | NL / visual / guided / AI draft |
| **Intent Resolution** | Map language → structured Intent + Model candidates |
| **Intent Validation** | Type, policy, capability, and dependency checks |
| **Intent Versioning** | Monotonic revision; semver for breaking intent schema |
| **Intent History** | Audit trail — who changed what and why |
| **Intent Reuse** | Publish to Intent Library; clone across modules |
| **Intent Library** | Tenant-scoped catalog of approved intents (see Business Asset Principle) |

---

## 6. Conversion pipeline (normative target)

| Step | Input | Output | Existing anchor (today) |
|------|-------|--------|-------------------------|
| 1 | User utterance / visual edit | Business Intent draft | — (future) |
| 2 | Intent draft | Business Model | MDP dictionaries (L4) |
| 3 | Model + formulas | Computation Document | [Computation Architecture](./MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) |
| 4 | Computation Document | Expression AST + IR | Expression + Computation engines |
| 5 | CRB payload | Runtime behavior | Runtime Bridge + Foundation |

**Compatibility:** Current Program 3.2 Formula Builder is the **first visual step** toward this pipeline; it does not yet implement Business Intent or NL layers.

---

## 7. Architectural principles (Business Intent)

| # | Principle |
|---|-----------|
| **BI1** | User works only in business language at the experience boundary |
| **BI2** | No code, JSON, AST, SQL, or scripts exposed in authoring UX |
| **BI3** | AI accelerates; never mandatory (AI Acceleration Principle) |
| **BI4** | Every intent is a versioned, reusable business asset |
| **BI5** | Intent resolution is deterministic and auditable |
| **BI6** | Failed resolution returns structured diagnostics — no silent drops |

---

## 8. Relationship to other vision documents

| Document | Relationship |
|----------|--------------|
| [Business Object Model](./MAK-BUSINESS-OBJECT-MODEL.md) | Intents attach to Business Objects |
| [Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md) | Vocabulary + memory feed resolution |
| [Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md) | Recommendations propose intents |
| [Business Capabilities](./MAK-BUSINESS-CAPABILITIES.md) | Actions bind to capabilities, not modules |
| [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) | EOS + Business Intent Layer |

---

## 9. Implementation status

| Capability | Status |
|------------|--------|
| Business Intent Layer (vision) | **Vision** — Program 3.1.5 (D-057) |
| **Business Intent Authoring** | **Architecture** — Program 3.4 (D-059) — [Authoring Architecture](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| Business Computation Layer | **Architecture** — Program 3.3 (D-058) |
| Formula Builder (visual) | Implemented — Program 3.2 (D-056) |
| Computation Engine | Implemented — Program 3.1 (D-055) |
| Intent Resolver | **Next implementation mission** (after D-059) |
| Intent Library / Catalog / Templates | Architecture only — D-059 |
| NL → Intent | **Not started** (explicitly excluded from 3.3–3.4) |

---

*Amend via Decision register. Implementation missions must not contradict Foundation freeze or MDP contracts.*
