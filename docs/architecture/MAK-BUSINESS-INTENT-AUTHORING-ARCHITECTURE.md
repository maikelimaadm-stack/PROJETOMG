# MAK Business Intent Authoring Architecture

**Status:** Official — Permanent architecture reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.4 — Business Intent Authoring Architecture  
**Decision:** D-059  
**Layer:** L5 (MAK Studio) + L6 (Platform Services) — **authoring SSOT surface**  
**Hierarchy:** Constitution → Master Architecture → [Business Intent Architecture](./MAK-BUSINESS-INTENT-ARCHITECTURE.md) (D-057 vision) → **This document** → …

> **MMM supersession (D-MMM-08, D-MMM-15):** Authoring flow SSOT for Program 4.xx is [docs/meta-model/20-BUSINESS-LANGUAGE.md](../meta-model/20-BUSINESS-LANGUAGE.md) + [21-INTENT-ENGINE.md](../meta-model/21-INTENT-ENGINE.md). This document is **Reference (pre-MMM)** — see [SUPERSESSION-REGISTER.md](../engineering/SUPERSESSION-REGISTER.md).

---

## ⚠️ Scope boundary (Program 3.4)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent Business Intent Authoring architecture and contracts | Code, APIs, runtime, Foundation, MDP schema changes |
| All concepts listed in §3 (Document, Catalog, Resolver, Lifecycle, etc.) | Intent Resolver **implementation** (next mission) |
| Authoring paradigm — user creates **only** Business Intentions | Business Computed Fields implementation |
| Marketplace, Knowledge, Business DNA, Process Mining **contracts only** | AI, NLP, natural language interpretation |
| Gate plan **G304** (planned) | Workflow, Dashboard, Automation Studio UI |

**Rule:** This mission **does not alter** Formula Builder, Computation Engine, Business Computation Layer contracts, or any certified Studio behavior. It defines the **sole business authoring origin** for the entire platform.

---

## 1. Purpose

**Business Intent Authoring** is the official paradigm by which **any** business intention is created inside MAK Gestão.

The user **never** creates Workflows, Formulas, Automations, Dashboards, Reports, Integrations, or technical permissions directly. The user creates **Business Intentions** only. The platform derives all technical artifacts through the **Intent Resolver** (architecture in this document; implementation: next mission).

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUSINESS INTENT AUTHORING ◄── THIS DOCUMENT (Program 3.4)               │
│  User creates Intentions only · Catalog · Templates · Library            │
├─────────────────────────────────────────────────────────────────────────┤
│  INTENT RESOLVER (architecture only — implementation next)               │
│  Sole authorized layer: Intent → technical artifacts                     │
├─────────────────────────────────────────────────────────────────────────┤
│  DERIVED LAYERS (never user-authored directly)                           │
│  Business Computation · Formula Builder · Workflow · Automation · …      │
├─────────────────────────────────────────────────────────────────────────┤
│  COMPUTATION ENGINE · Expression · Dependency · Type · Evaluation        │
├─────────────────────────────────────────────────────────────────────────┤
│  MDP L4 · CRB · Runtime · Foundation                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory authoring principles (Program 3.4)

| # | Principle | User boundary |
|---|-----------|---------------|
| **BIA-1** | Intentions only | User never creates Workflows, Formulas, or Automations |
| **BIA-2** | Platform derives | System transforms Intent → technical artifacts via Resolver |
| **BIA-3** | No technical exposure | User never sees AST, JSON, code, engine names, or resolver internals |
| **BIA-4** | Business language only | Phrases, categories, templates, guided picks, confirmations |
| **BIA-5** | Intent SSOT | One Business Intent is the origin of all derived functional logic |
| **BIA-6** | Universal reuse | Intent reusable across compatible Business Objects and modules |
| **BIA-7** | Marketplace shares Intent | Marketplace publishes Intentions — never technical implementations |
| **BIA-8** | Resolver exclusivity | Only Intent Resolver may produce technical artifacts from Intent |
| **BIA-9** | Deterministic lineage | Every derivative carries `intentId` + `derivationKind` + `resolverRevision` |
| **BIA-10** | Technology Transparency | All complexity invisible at experience boundary ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md)) |

**Program 3.4 explicitly excludes:** AI, NLP, free-text natural language interpretation. Authoring is **structured business language** bound to Catalog, Templates, and vocabulary.

---

## 3. Permanent architectural concepts

### 3.1 Business Intent Authoring

The **act and surface** by which a business user declares what the enterprise needs — goals, rules, calculations, constraints, triggers, and outcomes — without selecting a technical artifact type.

Authoring modes (all converge on Business Intent Document):

| Mode | Description | Produces |
|------|-------------|----------|
| **Guided Authoring** | Wizards, step flows, operand pickers | Intent Document draft |
| **Template Authoring** | Clone and customize Intent Template | Intent Document from template |
| **Catalog Authoring** | Pick from Intent Catalog by category | Intent Document from catalog entry |
| **Library Authoring** | Reuse approved tenant Intent | Cloned Intent Document |
| **Pattern Authoring** | Apply Business Pattern Library entry | Intent Document + metadata |

Future modes (AI-assisted, NL) are **extension points** — they still produce the same Intent Document; not in scope for Program 3.4.

### 3.2 Business Intent Document

The **canonical, versioned representation** of a single business intention. SSOT for all derived behavior.

| Artifact | Version constant |
|----------|------------------|
| Business Intent Document | `mak-business-intent-document-v1` |
| Intent reference (embedded in derivatives) | `mak-business-intent-ref-v1` |
| Intent capability binding | `mak-intent-capability-ref-v1` |

**Conceptual structure:**

```typescript
// Conceptual — not implementation code
BusinessIntentDocument {
  schemaVersion: "mak-business-intent-document-v1"
  id: string                          // immutable intent id
  revision: number                    // monotonic content revision
  semver?: string                     // breaking schema migrations only
  contentHash: string

  // Business-facing (user-authored)
  title: string                       // short business name
  intentPhrase: string                // primary business statement
  category: IntentCategory
  subcategory?: string
  description?: string                // business context, never technical

  // Scope & reuse
  subject: BusinessSubjectRef         // Business Object / entity / process scope
  compatibility: CompatibilityMatrix  // reusable Business Objects
  capabilities: IntentCapability[]    // required Business Capabilities

  // Structure
  goals?: BusinessGoal[]              // measurable outcomes (KPI hooks)
  rules?: BusinessRuleRef[]           // declarative constraints
  conditions?: BusinessCondition[]      // when / unless predicates (business form)
  actions?: BusinessActionRef[]         // notify, approve, integrate (capability-bound)
  computations?: BusinessComputationRef[]  // links to computation intents (D-058)
  relationships: IntentRelationship[] // see §3.16

  // Governance
  lifecycle: IntentLifecycleState
  metadata: IntentMetadata
  dependencies: IntentDependency[]
  validation: IntentValidationSummary
  diagnostics?: IntentDiagnostic[]

  // Extension hooks (architecture only)
  knowledge?: IntentKnowledgeRef
  businessDna?: IntentBusinessDnaFacet
  processMining?: IntentProcessMiningHooks

  // Audit
  createdAt: string
  updatedAt: string
  authoredBy: string
  tenantId: string
}
```

### 3.3 Business Intent Catalog

The **platform registry** of known intention **kinds** — what the business can express, organized for discovery.

| Field | Purpose |
|-------|---------|
| `catalogId` | Stable catalog entry id |
| `category` | Intent category (see §3.15) |
| `intentKind` | e.g. `calculate`, `validate`, `aggregate`, `trigger`, `constrain`, `notify` |
| `phraseTemplate` | Business phrase pattern with slots |
| `requiredCapabilities` | Capabilities the intent may bind |
| `compatibleObjects` | Business Object types |
| `defaultTemplateId` | Optional Intent Template |

**Version constant:** `mak-business-intent-catalog-v1`

Catalog is **platform-maintained** (MAK); tenants extend via Library, not by editing catalog schema ad hoc.

### 3.4 Business Intent Templates

**Reusable starting points** for common intentions — parameterized Intent Documents.

| Field | Purpose |
|-------|---------|
| `templateId` | Stable template id |
| `sourceIntentId?` | Promoted from tenant Library |
| `parameters` | Business-named slots (e.g. `{product}`, `{minimumStock}`) |
| `scope` | `platform` \| `tenant` \| `marketplace` |
| `moduleAgnostic` | **true** — reusable in any compatible module |

**Version constant:** `mak-business-intent-template-v1`

**Principle:** Intent Templates are reusable in **any module** where compatibility matrix allows.

### 3.5 Business Intent Library

The **tenant-scoped collection** of approved, published Intent Documents available for clone, reuse, and governance.

| State | Description |
|-------|-------------|
| `draft` | Authoring in progress |
| `review` | Awaiting approval (optional policy) |
| `approved` | Eligible for Resolver and reuse |
| `published` | Visible in Library; cloneable across modules |
| `deprecated` | Superseded; existing derivatives remain traceable |
| `archived` | Retired from active authoring |

Library entries are **Business Assets** ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md), D-057).

### 3.6 Business Intent Resolver (architecture only)

The **sole authorized transformation layer** from Business Intent Document to technical artifacts.

```
Business Intent Document (approved)
        ↓
Intent Resolver
        ↓
    ┌───┴────┬──────────┬────────────┬─────────────┬──────────────┐
    ↓        ↓          ↓            ↓             ↓              ↓
Computation Workflow  Automation  Dashboard    Report      Integration
Document  Definition  Rule        Widget/KPI   Definition  Mapping
    ↓
Formula Builder (when computation path)
    ↓
Computation Engine → Runtime
```

**Resolver contract (normative):**

| Input | Output | Rule |
|-------|--------|------|
| `BusinessIntentDocument` | `ResolverResult` | Deterministic for same intent revision + catalog version |
| `derivationKind` | One or more technical documents | Each tagged with `intentId`, `derivationKind`, `resolverRevision` |
| Validation failure | `IntentDiagnostic[]` | No silent partial derivation |
| Impact query | `IntentDependencyGraph` | Uses Dependency Engine for cross-intent impact |

**Version constant:** `mak-intent-resolver-v1` (contract); implementation gate **G304**.

**Forbidden:** Designers, modules, or runtime paths that produce Formula Documents, Workflow definitions, or Automation rules **without** passing through Intent Resolver (once implemented).

### 3.7 Intent Lifecycle

| Stage | Actor | System behavior |
|-------|-------|-----------------|
| **Capture** | Business user | Guided/template/catalog authoring → draft Intent Document |
| **Enrich** | Business user | Add goals, conditions, capabilities, relationships |
| **Validate** | Platform | Intent Validation pipeline (§3.12) |
| **Review** | Approver (optional) | Policy gate before Resolver |
| **Resolve** | Intent Resolver | Produce technical artifact candidates |
| **Publish** | Platform | Embed derivatives in MDP; register in Library |
| **Operate** | Runtime | Execute derived behavior; emit mining events |
| **Evolve** | Business user | New revision → re-validate → re-resolve → migrate derivatives |
| **Retire** | Business user | Deprecate intent; dependents flagged via Intent Dependencies |

### 3.8 Intent Versioning

| Mechanism | Rule |
|-----------|------|
| **Content revision** | Monotonic integer `revision` on every saved Intent Document change |
| **Schema semver** | `mak-business-intent-document-v1` → `v2` only via Decision + migration |
| **Derivative pinning** | Published artifacts pin `intentId` + `intentRevision` at publish time |
| **Breaking change** | Requires impact analysis via Intent Dependencies + explicit user confirmation |
| **History** | Immutable audit log — who, when, what changed (business-facing summary) |

### 3.9 Intent Capabilities

Binding between an Intent Document and [Business Capabilities](./MAK-BUSINESS-CAPABILITIES.md).

| Field | Purpose |
|-------|---------|
| `capabilityId` | Reference to platform capability |
| `role` | `requires` \| `triggers` \| `constrains` |
| `parameters` | Business-named capability inputs |

**Rule:** Actions in Intent Documents bind to **Capabilities**, never to module-specific APIs.

### 3.10 Intent Dependencies

Graph of relationships between Intent Documents and derived artifacts — consumed by Dependency Engine (D-049).

| Edge kind | Example |
|-----------|---------|
| `depends_on` | Commission intent depends on Order Total intent |
| `conflicts_with` | Two validation intents on same field |
| `extends` | Specialized intent extends base template |
| `supersedes` | New intent revision replaces prior |
| `derives_to` | Intent → Formula Document / Workflow |

**Version constant:** `mak-intent-dependency-graph-v1`

### 3.11 Intent Validation

Official validation pipeline **before** Resolver invocation:

| Check | Description |
|-------|-------------|
| **Schema** | Document conforms to `mak-business-intent-document-v1` |
| **Catalog** | `intentKind` + category valid in Catalog |
| **Capability** | Required capabilities exist and are licensed |
| **Compatibility** | Subject Business Object in compatibility matrix |
| **Dependency** | No cycles in Intent Dependencies |
| **Policy** | Tenant governance rules (approval, segregation of duties) |
| **Vocabulary** | Terms resolve to Enterprise Vocabulary ([Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md)) |

Output: `IntentValidationSummary` — `valid` \| `warnings` \| `blocked` + `IntentDiagnostic[]`.

### 3.12 Intent Diagnostics

Structured, **business-language** feedback when validation or resolution fails.

```typescript
// Conceptual
IntentDiagnostic {
  code: string              // stable diagnostic code
  severity: "info" | "warning" | "error" | "blocking"
  message: string           // business-language message for user
  field?: string            // intent document path (internal — not shown as JSON to user)
  suggestion?: string       // guided fix hint
  relatedIntentId?: string
}
```

**Rule:** Diagnostics never expose AST, stack traces, or engine internals to the business user.

### 3.13 Intent Metadata

Extensible, queryable metadata for governance, search, and Intelligence hooks.

| Facet | Examples |
|-------|----------|
| **Classification** | category, tags, industry vertical |
| **Ownership** | author, owner team, cost center |
| **Governance** | approval status, risk class, data sensitivity |
| **Lineage** | templateId, catalogId, marketplacePackageId |
| **Operational** | lastResolvedAt, derivativeCount, activeModules |

### 3.14 Intent Categories

Top-level taxonomy for Catalog and Library navigation:

| Category | Example intentions |
|----------|-------------------|
| **Calculation** | Totals, commissions, conversions |
| **Validation** | Age checks, credit limits, constraints |
| **Aggregation** | Sum line items, rollups |
| **Trigger** | When paid, when stock low |
| **Notification** | Alert manager, notify customer |
| **Process** | Approval flow, escalation (Workflow deriv.) |
| **Insight** | KPI definition, dashboard metric |
| **Integration** | Sync to external system |
| **Permission** | Who may act (capability-bound) |
| **Compliance** | Regulatory rules, audit trails |

Subcategories are tenant-extensible via metadata; platform Catalog defines the root taxonomy (`mak-intent-category-v1`).

### 3.15 Intent Relationships

Explicit links between Intent Documents:

| Relationship | Semantics |
|--------------|-----------|
| `parent_of` / `child_of` | Decomposition |
| `related_to` | Soft association |
| `bundle` | Marketplace package grouping |
| `alternative_to` | Competing approaches (pick one) |
| `requires` | Hard prerequisite intent |

Used for impact analysis, Library navigation, and Marketplace bundles.

### 3.16 Intent Marketplace Model (architecture only)

The **Intent Marketplace** distributes **Business Intentions** — never technical implementations.

| Asset type | Shared | Not shared |
|------------|--------|------------|
| Intent Template | ✅ | — |
| Intent Document (approved) | ✅ | — |
| Catalog extension (approved) | ✅ | — |
| Formula Document | — | ❌ |
| Workflow definition | — | ❌ |
| Source code / AST | — | ❌ |

**Package model:**

```typescript
// Conceptual
IntentMarketplacePackage {
  packageId: string
  intentTemplateIds: string[]
  intentDocumentIds?: string[]    // frozen reference intents
  compatibilityMatrix: CompatibilityMatrix
  license: MarketplaceLicense
  // NO technical artifacts in package payload
}
```

Import flow: Marketplace Intent → tenant Library → Resolver → tenant-specific derivatives (MDP-bound).

### 3.17 Intent Knowledge (architecture only)

Links Intent Documents to [Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md):

| Hook | Purpose |
|------|---------|
| `vocabularyRefs` | Terms used in intentPhrase |
| `synonymGroups` | Alternate business phrasings |
| `domainContext` | Industry / process context for future AI |
| `explanationArtifact` | Business-readable "why this intent exists" |

**Program 3.4:** schema hooks only. No knowledge ingestion or AI.

### 3.18 Intent Business DNA (architecture only)

Facet contributing to enterprise [Business DNA](./MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md#66-business-dna-architecture-only) — longitudinal operational model.

| Signal | Source |
|--------|--------|
| Intent category distribution | Library analytics |
| Reuse rate | Cross-module clones |
| Validation failure patterns | Diagnostics aggregation |
| Resolver derivation mix | Which artifact types dominate |

Stored as `IntentBusinessDnaFacet` on Intent metadata graph. **Not implemented** in Program 3.4.

### 3.19 Intent Process Mining Hooks (architecture only)

Architectural hooks for future [Process Mining](./MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md):

| Hook | Event |
|------|-------|
| `miningEligible: boolean` | Intent participates in mining |
| `lifecycleEvents` | capture, validate, resolve, publish, execute, fail |
| `operationalMetrics` | latency, failure rate, override count |
| `bottleneckSignals` | queue time at approval, re-resolution frequency |

**Program 3.4:** contract fields only. No mining jobs, dashboards, or optimizers.

---

## 4. Unified derivation (permanent principles)

| # | Principle |
|---|-----------|
| **UD-1** | **Business Intent is the SSOT** of all functional logic on the platform |
| **UD-2** | Formulas, Computed Fields, Workflows, Dashboards, Reports, Integrations, Permissions, and AI behaviors are **derived** from Business Intent — never independently authored at the business boundary |
| **UD-3** | Business Intent is **reusable** across any compatible Business Object ([Business Object Model](./MAK-BUSINESS-OBJECT-MODEL.md)) |
| **UD-4** | Intent Templates are **module-agnostic** — reuse governed by compatibility matrix |
| **UD-5** | Intent Marketplace shares **Intentions only** — Resolver produces tenant-specific technical artifacts on import |
| **UD-6** | Intent Resolver is the **only** authorized transformation layer |

---

## 5. Relationship to Business Computation Layer (D-058)

| Layer | Role |
|-------|------|
| **Business Intent Authoring** (this document) | Origin — user creates Intent Document |
| **Business Computation Layer** | Specialized **derivation facet** for calculation/validation/aggregation intents |
| **Formula Builder** | Technical visual layer for computation path only |
| **Computation Engine** | Execution orchestration |

Computation intents embed as `BusinessComputationRef[]` on Intent Document. Resolver delegates computation-class intents to Business Computation resolution path, then Formula Builder — **never bypassing** D-058 pipeline.

---

## 6. Relationship to Formula Builder and Computation Engine

| Component | Conflict? | Relationship |
|-----------|-----------|--------------|
| **Formula Builder** (D-056) | **No** | Becomes **resolver output path** for computation intents; remains technical layer; hidden from business user |
| **Computation Engine** (D-055) | **No** | Unchanged; fed by Formula Builder after Resolver |
| **Business Computation** (D-058) | **No** | Subordinate derivation facet under Intent Authoring |

Existing Formula Builder routes and G303A certification remain valid for **technical/support authoring** until Intent Resolver implementation subsumes the business path.

---

## 7. Engine and infrastructure reuse

Intent Authoring and Resolver **must reuse** — never duplicate:

| Infrastructure | Role |
|----------------|------|
| **Dependency Engine** (D-049) | Intent Dependencies + cross-artifact impact |
| **Type System** (D-050) | Operand and outcome typing in validation |
| **Expression Engine** (D-048) | Via Formula Builder path only |
| **Computation Engine** (D-055) | Computation derivation |
| **Evaluation Engine** (D-051) | Preview of resolved artifacts |
| **MDP L4** | Persistence of Intent Documents and derivatives |
| **Business Capabilities registry** | Intent Capability binding |

---

## 8. Implementation sequence (post Program 3.4)

| Order | Mission | Scope |
|-------|---------|-------|
| **1** | **Business Intent Resolver** | Implement Resolver contract (G304); first derivation paths |
| **2** | **Business Computed Fields** | Guided Intent Authoring + computation derivation |
| **3+** | Workflow, Automation, Dashboard Studios | Additional `derivationKind` handlers |

Program 3.4 **authorizes** Resolver implementation as next mission; **does not authorize** Computed Fields before Resolver.

---

## 9. Gate plan (implementation missions)

| Gate | Target |
|------|--------|
| **G304** (planned) | Intent Document schema, Resolver exclusivity, no designer bypass, Dependency integration, lineage on all derivatives |
| | **Gate ID G304 is exclusively reserved for Intent Resolver** per D-062. Deploy pipeline uses G401/G402 — see [GATE-REGISTRY.md](../engineering/GATE-REGISTRY.md). |
| **G303B** (planned) | Business Computation path (from D-058) — subordinate to G304 |

---

## 10. Implementation status

| Item | Program 3.4 | Next |
|------|-------------|------|
| Architecture + all §3 concepts | ✅ This document | — |
| Business Intent Document factory | — | Intent Resolver |
| Intent Catalog / Templates / Library | — | Intent Resolver + Studio |
| Intent Resolver | — | **Next implementation mission** |
| Business Computed Fields | — | After Resolver |
| AI / NLP authoring | **Explicitly excluded** | Future programs |

---

*Amend via Decision register. Compatible with D-054, D-055, D-056, D-057, D-058.*
