# MAK Business Computation Architecture

**Status:** Official — Permanent architecture reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.3 — Business Computation Layer  
**Decision:** D-058  
**Layer:** L5 (MAK Studio) — **business authoring surface** above Formula Builder  
**Hierarchy:** Constitution → Master Architecture → [Business Intent Architecture](./MAK-BUSINESS-INTENT-ARCHITECTURE.md) → [Business Intent Authoring Architecture](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (D-059) → **This document** → Formula Builder → Computation Engine

---

## ⚠️ Scope boundary (Program 3.3)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent Business Computation architecture and contracts | Code, APIs, runtime, Foundation, MDP schema changes |
| Business Computation Document model | AI, NLP, natural language interpretation |
| Authoring paradigm and derivation pipeline | Business Computed Fields **implementation** (next mission) |
| Permanent principles (Intent SSOT, Universal Assets, Pattern Library, Business DNA, Process Mining) | Workflow, Dashboard, Automation, Marketplace UI |

**Rule:** This mission **does not alter** Formula Builder, Computation Engine, or any certified Studio behavior. It defines the **business-facing authoring layer** that future programs implement.

---

## 1. Purpose

The **Business Computation Layer** is the official **business-language authoring surface** for all computational behavior on MAK Gestão.

Users express **business intentions** — never technical expressions, AST, JSON, code, or engine names.

The layer **composes** all existing Studio Intelligence infrastructure:

```
Business Language (guided / visual — NOT free-text NLP in v1)
        ↓
Business Intent Document (SSOT) ◄── Business Intent Authoring (D-059)
        ↓
Business Computation Document ◄── THIS DOCUMENT
        ↓
Intent Resolver (future) → Formula Builder (technical layer — D-056)
        ↓
Computation Document (D-055)
        ↓
Expression Engine → Dependency → Type System → Evaluation
        ↓
Runtime (CRB + Foundation)
```

**Formula Builder remains** the sole **technical** authoring layer. Business Computation sits **above** it and **never bypasses** it.

---

## 2. Mandatory authoring principles (Program 3.3)

| # | Principle | User boundary |
|---|-----------|---------------|
| **BC-A1** | No technical expressions | User never writes `price * qty` syntax |
| **BC-A2** | No AST exposure | User never sees parse trees or node kinds |
| **BC-A3** | No JSON / code | User never sees payloads or scripts |
| **BC-A4** | No engine names | User never sees Expression, Computation, Evaluation |
| **BC-A5** | Business language only | Labels, intents, guided choices, confirmations |
| **BC-A6** | Deterministic resolution | Intent → Computation via official resolver (future impl) — not ad-hoc designer logic |
| **BC-A7** | Technology Transparency | All complexity stays inside system ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md)) |

**Program 3.3 explicitly excludes:** AI, NLP, free-text natural language interpretation. Authoring is **structured business language** (phrases bound to vocabulary, wizards, pattern picks).

---

## 3. Business Computation Document

The **Business Computation Document** is the sole business-facing representation of a computational intention.

### 3.1 Official version

| Artifact | Version constant |
|----------|------------------|
| Business Computation Document | `mak-business-computation-document-v1` |
| Business Intent reference | `mak-business-intent-ref-v1` |
| Business Computation kind catalog | `mak-business-computation-kind-v1` |

### 3.2 Structure (conceptual)

```typescript
// Conceptual — not implementation code
BusinessComputationDocument {
  schemaVersion: "mak-business-computation-document-v1"
  id: string
  intentId: string                    // link to Business Intent SSOT
  intentPhrase: string                // business language display, e.g. "Preço multiplicado pela quantidade"
  computationKind: BusinessComputationKind
  subject: BusinessSubjectRef         // entity, field, process, or capability scope
  operands: BusinessOperand[]         // business-named refs — resolved to MDP fields
  condition?: BusinessCondition       // for rules / guards
  policy?: BusinessPolicy             // when / never / always
  outcome: BusinessOutcome            // calculate | aggregate | validate | notify (future)
  metadata: BusinessComputationMetadata
  revision: number
  contentHash: string
}
```

### 3.3 Example intents → document kinds (v1 catalog)

| Business phrase (user-facing) | `computationKind` | Resolves to (technical, internal) |
|------------------------------|-------------------|-----------------------------------|
| "Preço multiplicado pela quantidade" | `multiply_fields` | Formula → Computation Document |
| "Somar todos os itens do pedido" | `aggregate_sum` | Aggregate computation node |
| "Quando o pedido estiver pago" | `condition_when` | Condition / trigger (Workflow deriv.) |
| "Cliente maior de idade" | `validate_rule` | Validation + type check |
| "Sempre que o estoque ficar abaixo do mínimo" | `event_threshold` | Automation deriv. (future) |
| "Nunca permitir venda acima do limite" | `constraint_never` | Validation / policy gate |
| "Calcular automaticamente a comissão" | `derived_calculate` | Derived field computation |

Phrases are **authored via guided UI** (pick subject, verb, object) — not parsed from free text in Program 3.3.

---

## 4. Layer stack (normative)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUSINESS COMPUTATION LAYER ◄── THIS DOCUMENT (Program 3.3)              │
│  Business Computation Document · Guided Authoring · Pattern Library     │
├─────────────────────────────────────────────────────────────────────────┤
│  FORMULA BUILDER (D-056) — technical visual layer (unchanged role)       │
├─────────────────────────────────────────────────────────────────────────┤
│  COMPUTATION ENGINE (D-055) · Expression · Dependency · Type · Evaluation│
├─────────────────────────────────────────────────────────────────────────┤
│  MDP L4 · CRB · Runtime Bridge · Foundation                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Rule:** Business Computation **never** calls Expression parse/evaluate directly. It produces inputs for Formula Builder / Computation Engine through the **official resolution pipeline** (implementation: next mission).

---

## 5. Derivation pipeline (single intent → many artifacts)

**Permanent architectural decision:** One Business Intent may derive multiple platform artifacts — all traceable to the same `intentId`.

```
Business Intent (SSOT)
        ↓
Business Computation Document
        ↓
    ┌───┴───┬───────────┬────────────┬─────────────┐
    ↓       ↓           ↓            ↓             ↓
 Formula  Workflow   Automation  Dashboard    Report
 (field)  (process)  (trigger)   (KPI/widget)  (future)
```

| Derived artifact | Owner layer | Status |
|------------------|-------------|--------|
| **Formula / Computed field** | Business Computation → Formula Builder | Next implementation mission |
| **Workflow** | Intent → Workflow Studio | Future |
| **Automation** | Intent → Automation Studio | Future |
| **Dashboard / KPI** | Intent → Dashboard Studio | Future |
| **Report** | Intent → Report Studio | Future |
| **Integration** | Intent → Integration Studio | Future |
| **AI agent behavior** | Intent → AI Platform | Future (opt-in) |

**Binding:** All derivatives carry `intentId` + `derivationKind` for lineage and impact analysis.

---

## 6. Permanent architectural principles (registered Program 3.3)

### 6.1 Business Intent as single source of truth

**Business Intent is the sole source of business intentions** for the platform. No designer, module, or screen owns intent locally.

### 6.2 Unified derivation

**Formulas, Workflows, Automations, Dashboards, Reports, Integrations, and AI behaviors** are **derived** from the same business intention — never authored as disconnected silos.

### 6.3 Business Capabilities as reusable assets

**Business Capabilities** ([MAK-BUSINESS-CAPABILITIES.md](./MAK-BUSINESS-CAPABILITIES.md)) are reusable enterprise assets. They **never belong to a specific screen or module UI**.

### 6.4 Universal Business Assets

The following are **Universal Business Assets** — publishable, versioned, reusable across compatible Business Objects:

- Formulas and rules  
- Workflows and processes  
- Dashboards and KPIs  
- Integrations  
- Notifications  
- Permissions  
- Automations  

Reuse governed by compatibility matrix ([Business Object Model](./MAK-BUSINESS-OBJECT-MODEL.md)).

### 6.5 Business Pattern Library (architecture only)

The platform maintains a **Business Pattern Library** — registered, versioned patterns such as:

- "Order total from line items"  
- "Age verification"  
- "Low stock alert"  
- "Commission on sale"  

**Program 3.3:** catalog schema and extension points only. **No** pattern suggestion engine.

Patterns map to `BusinessComputationKind` + default operand templates → resolver fills Business Computation Document.

### 6.6 Business DNA (architecture only)

**Business DNA** is the longitudinal model of how a company operates — aggregates:

- Dominant computation kinds  
- Capability usage mix  
- Process topology (from twin)  
- Maturity signals  

Stored as metadata graph facet ([Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md), [Digital Twin](./MAK-DIGITAL-TWIN-ARCHITECTURE.md)). **Not implemented** in Program 3.3.

### 6.7 Process Mining (architecture only)

**Process Mining** capability (future): identify bottlenecks, waste, improvement opportunities, and optimization suggestions from operational event history ([Continuous Improvement](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md)).

**Program 3.3:** register architectural hooks (`miningEligible: boolean` on Intent, event taxonomy refs). **No** mining jobs or UI.

---

## 7. Relationship to Formula Builder

| Aspect | Business Computation | Formula Builder |
|--------|---------------------|-----------------|
| Audience | Business user | Implementer / advanced (optional) |
| Language | Business phrases + guided picks | Visual tokens → expression source |
| Document | Business Computation Document | Formula Document |
| Technical output | Feeds resolver input | Computation Document |
| Visibility | Default authoring path | Hidden from business user; available in support mode |
| Gate | G303B (planned — implementation) | G303A ✅ |

**Compatibility:** ✅ Full — Formula Builder unchanged; Business Computation adds a facade.

---

## 8. Engine reuse (mandatory)

Business Computation Layer **must reuse** — never duplicate:

| Engine | Role in pipeline |
|--------|------------------|
| **Type System** | Operand types, validation rules, inference |
| **Dependency Engine** | Cross-field / cross-entity impact |
| **Expression Engine** | Leaf logic (via Formula Builder only) |
| **Computation Engine** | Document, graph, IR, validation |
| **Evaluation Engine** | Preview and runtime evaluation order |

**Forbidden:** Parallel parsers, evaluators, AST models, or computation graphs in Business Computation UI.

---

## 9. Business Computed Fields (next mission)

**Business Computed Fields** are the first **implementation** of this architecture:

1. User authors Business Computation Document (guided).  
2. Resolver produces Formula Document + Computation Document.  
3. Existing Formula Builder pipeline validates and previews.  
4. Publish embeds `computationIr` via MDP (unchanged CRB path).

Program 3.3 **does not implement** step 1–4 — only defines contracts and stack position.

---

## 10. Gate plan (implementation missions)

| Gate | Target |
|------|--------|
| **G303B** (planned) | Business Computation structure, no parallel engines, Intent SSOT wiring, resolver delegates to Formula Builder |

---

## 11. Implementation status

| Item | Program 3.3 | Next |
|------|-------------|------|
| Architecture + contracts | ✅ This document | — |
| Business Computation Document factory | — | Business Computed Fields |
| Guided authoring UI | — | Business Computed Fields |
| Intent resolver → Formula Builder | — | Business Computed Fields |
| NLP / AI | **Explicitly excluded** | Future programs |

---

*Amend via Decision register. Compatible with D-054, D-055, D-056, D-057.*
