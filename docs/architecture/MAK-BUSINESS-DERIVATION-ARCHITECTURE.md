# MAK Business Derivation Architecture

**Status:** Official — Permanent architecture reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.6 — Business Derivation Architecture  
**Decision:** D-063  
**Layer:** L5 (Platform Derivation) + L6 (Enterprise Services) — **derivation infrastructure SSOT**  
**Hierarchy:** Constitution → Master Architecture → [Business Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (D-059) → **This document** → [Business Computation](./MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) (D-058, computation facet) → Intent Resolver (impl, Program 3.7) → Studio → MDP → Runtime

---

## ⚠️ Scope boundary (Program 3.6)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent **Business Derivation** infrastructure architecture | Code, APIs, runtime, Foundation, Studio, MDP schema changes |
| All concepts in §3 (Document, Catalog, Registry, policies, etc.) | Intent Resolver **implementation** (Program 3.7) |
| Official derivation pipeline and mandatory metadata | Business Computed Fields, Workflow, Dashboard UI |
| Synchronization, Explainability, Marketplace, AI, Evolution **policies** | AI/NLP engines, Marketplace UI |
| Derivation classification and extension points | Any designer-specific derivation bypass |

**Rule:** No Studio may implement proprietary derivation mechanisms. All future derivation **must** conform to this architecture. Intent Resolver (Program 3.7) is the **first implementation** of this contract — not a parallel path.

---

## 1. Purpose

**Business Derivation** is the official platform infrastructure that transforms an approved **Business Intent** into one or more **Business Assets**, **Business Artifacts**, and **Technical Projections** — with full lineage, explainability, and lifecycle governance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUSINESS INTENT (SSOT — D-059)                                              │
│  User creates Intentions only                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS DERIVATION ◄── THIS DOCUMENT (Program 3.6)                           │
│  Derivation Document · Catalog · Registry · Policies · Lineage               │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS ASSET · BUSINESS ARTIFACT · TECHNICAL PROJECTION                   │
│  Formulas · Workflows · Dashboards · Integrations · IA · …                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  STUDIO (Formula Builder · Workflow Studio · …) — projection editors only      │
├─────────────────────────────────────────────────────────────────────────────┤
│  MDP L4 · CRB · RUNTIME                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**One Intent → many derivations:** A single Business Intent may simultaneously produce Formulas, Computed Fields, Derived Fields, Workflows, Automations, Dashboards, Indicators, Reports, Integrations, Permissions, AI configurations, Business Rules, Events, Processes, Notifications, Documents, and future APIs — each as a **separate derivation** with shared `intentId` and independent `derivationId`.

---

## 2. Mandatory derivation principles (Program 3.6)

| # | Principle | Rule |
|---|-----------|------|
| **BD-1** | Single derivation infrastructure | All Studios reuse Business Derivation — no parallel derivation stacks |
| **BD-2** | Intent SSOT | Every derivation traces to exactly one `intentId` (+ revision) |
| **BD-3** | Resolver exclusivity | Only authorized Derivation Engine (Intent Resolver impl) produces artifacts from Intent |
| **BD-4** | No designer bypass | Studios edit **projections** of derivations — never originate business logic |
| **BD-5** | Complete lineage | Every artifact carries mandatory metadata (§5) |
| **BD-6** | Explainability by default | Every derivation answers why / who / when / what participated (§9) |
| **BD-7** | Regenerable | Intent or dependency change triggers governed regeneration (§8) |
| **BD-8** | Versioned & auditable | All derivations versioned; history immutable |
| **BD-9** | Marketplace shares business | Marketplace publishes Intent, Capability, Template, Derivation — never internal implementations |
| **BD-10** | AI produces Intent only | IA never creates technical artifacts directly (§11) |
| **BD-11** | Platform without IA | Full operation without AI; AI accelerates Intent authoring only |
| **BD-12** | Compatible & migratable | Schema semver + compatibilityVersion on every derivation |
| **BD-13** | Deterministic | Same Intent revision + catalog + resolver version → same derivation outputs |
| **BD-14** | Invalidation explicit | Stale derivations marked invalid — never silent drift |
| **BD-15** | Technology Transparency | Business user never sees derivation internals ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md)) |

---

## 3. Permanent architectural concepts

### 3.1 Business Derivation

The **platform capability** — not a UI — that executes the transformation pipeline (§4). Implemented by **Intent Resolver** (Program 3.7) as the sole authorized engine.

| Attribute | Value |
|-----------|-------|
| Contract version | `mak-business-derivation-engine-v1` |
| Owner layer | L5 Platform Derivation |
| Consumers | All Studios, MDP publish, Runtime Bridge |

### 3.2 Derivation Document

Canonical record of **one derivation operation** — input Intent snapshot, derivation plan, outputs, diagnostics.

| Artifact | Version constant |
|----------|------------------|
| Derivation Document | `mak-derivation-document-v1` |
| Derivation result envelope | `mak-derivation-result-v1` |

```typescript
// Conceptual — not implementation code
DerivationDocument {
  schemaVersion: "mak-derivation-document-v1"
  derivationId: string              // immutable derivation instance id
  intentId: string
  intentRevision: number
  derivationKind: DerivationKind
  derivationCategory: DerivationCategory
  status: "planned" | "running" | "completed" | "failed" | "invalidated"
  inputs: DerivationInputSnapshot
  outputs: DerivationOutputRef[]    // Business Asset / Artifact refs
  diagnostics: DerivationDiagnostic[]
  metadata: DerivationMetadata      // §5 mandatory fields
  createdAt: ISO8601
  completedAt?: ISO8601
}
```

### 3.3 Derivation Catalog

Registry of **allowed derivation kinds** — what can be produced from which Intent categories and Capabilities.

| Field | Purpose |
|-------|---------|
| `derivationKind` | Stable kind id (e.g. `compute.formula`, `workflow.approval`) |
| `category` | DerivationCategory (§6) |
| `intentCategories` | Compatible Intent categories |
| `requiredCapabilities` | Business Capabilities needed |
| `artifactTypes` | Output Business Artifact types |
| `projectionTargets` | Studio targets (Formula Builder, Workflow Studio, …) |
| `schemaVersion` | Catalog entry version |

**Version constant:** `mak-derivation-catalog-v1`

### 3.4 Derivation Library

Tenant-scoped **approved derivations** — reusable derivation patterns bound to Business Objects.

| Content | Rule |
|---------|------|
| Approved Derivation Templates | Clone with new `derivationId`, same lineage template |
| Published derivations | Pin `intentId` + `derivationVersion` |
| Marketplace imports | Business-facing package only |

### 3.5 Derivation Registry

Platform SSOT index of **all active derivations** — queryable by intent, object, capability, artifact type.

| Index key | Use |
|-----------|-----|
| `derivationId` | Primary |
| `intentId` | Impact analysis |
| `businessObjectId` | Object-scoped queries |
| `capabilityId` | Capability impact |
| `artifactType` | Studio routing |

**Storage authority:** MDP Metadata Registry (publication) + Derivation Registry service (future impl). Architecture defines contract only.

### 3.6 Derivation Metadata

Extensible metadata facet on every derivation — governance, search, Intelligence hooks.

| Facet | Examples |
|-------|----------|
| `governance` | approval status, owner, tenant |
| `classification` | category, sensitivity, retention |
| `mining` | Process Mining event hooks |
| `marketplace` | publishable, license |

### 3.7 Derivation Lifecycle

| Stage | Description |
|-------|-------------|
| **Plan** | Derivation planned from Intent + Catalog match |
| **Validate** | Derivation Validation (§3.11) |
| **Execute** | Derivation Engine runs |
| **Project** | Technical Projection created for Studio |
| **Publish** | MDP + Registry update |
| **Operate** | Runtime consumes published artifact |
| **Sync** | Source change triggers sync policy (§8) |
| **Regenerate** | Controlled rebuild |
| **Invalidate** | Mark stale; block runtime until resolved |
| **Retire** | Soft-delete; lineage preserved |

### 3.8 Derivation Versioning

| Mechanism | Rule |
|-----------|------|
| `derivationVersion` | Monotonic per `derivationId` |
| `intentRevision` pin | Published artifacts pin Intent revision |
| `resolverVersion` | Engine version that produced output |
| `compatibilityVersion` | Cross-artifact compatibility matrix |
| Schema semver | `mak-derivation-document-v1` → v2 via Decision only |

### 3.9 Derivation Identity

Immutable identifiers — never reused.

| Id | Scope |
|----|-------|
| `derivationId` | One derivation instance lineage root |
| `derivationVersion` | Content generation within derivationId |
| `artifactId` | Business Artifact identity |
| `projectionId` | Technical Projection identity |

### 3.10 Derivation Policies

Governance rules applied before/during derivation.

| Policy type | Examples |
|-------------|----------|
| `approval` | Resolver requires approver role |
| `segregation` | Author ≠ approver |
| `tenant` | Licensed capabilities only |
| `regeneration` | Auto vs manual regen |
| `rollback` | Allowed rollback depth |

**Version constant:** `mak-derivation-policy-set-v1`

### 3.11 Derivation Validation

Pipeline **before** derivation execution:

| Check | Description |
|-------|-------------|
| Intent valid | Intent Validation passed (D-059) |
| Catalog match | `derivationKind` allowed for Intent |
| Capability | Required capabilities present |
| Compatibility | Business Object + artifact compatibility |
| Dependency | No cycles; impact graph consistent |
| Policy | Tenant derivation policies satisfied |

Output: `DerivationValidationSummary` + `DerivationDiagnostic[]`.

### 3.12 Derivation Diagnostics

Business-language feedback — same discipline as Intent Diagnostics (D-059).

```typescript
DerivationDiagnostic {
  code: string
  severity: "info" | "warning" | "error" | "blocking"
  message: string                   // business language
  derivationKind?: string
  suggestion?: string
  relatedDerivationId?: string
}
```

### 3.13 Derivation Dependencies

Graph consumed by Studio Dependency Engine (G299) + Derivation Registry.

| Edge kind | Example |
|-----------|---------|
| `derives_from` | Derivation ← Intent |
| `depends_on` | Formula derivation depends on field derivation |
| `projects_to` | Derivation → Technical Projection |
| `conflicts_with` | Two derivations same target |
| `supersedes` | New derivation version replaces old |

**Version constant:** `mak-derivation-dependency-graph-v1`

### 3.14 Derivation Relationships

Business-facing links between derivations (not only technical deps).

| Relationship | Example |
|--------------|---------|
| `part_of` | Dashboard indicator part of dashboard derivation |
| `triggers` | Workflow derivation triggered by event derivation |
| `constrains` | Permission derivation constrains workflow |

### 3.15 Derivation Contracts

Normative input/output contracts per `derivationKind`.

| Contract | Specifies |
|----------|-----------|
| Input | Intent fields + Capability bindings required |
| Output | Business Asset / Artifact schema |
| Projection | Studio target document type |
| Invariants | Lineage fields mandatory |

**Version constant:** `mak-derivation-contract-v1`

### 3.16 Derivation Compatibility

Matrix ensuring derivations coexist on same Business Object.

| Dimension | Rule |
|-----------|------|
| Intent revision | New Intent revision may invalidate compat |
| Artifact types | Some pairs exclusive (same field computed twice) |
| Resolver version | Breaking resolver bump triggers regen policy |
| Module scope | Cross-module reuse via compatibility matrix |

### 3.17 Derivation Lineage

Directed acyclic graph from Intent → Derivation → Asset → Artifact → Projection → Runtime.

Every node records: `parentId`, `derivationKind`, `version`, `timestamp`.

### 3.18 Derivation Traceability

Operational trace — who triggered derivation, which policy version, which catalog entry.

### 3.19 Derivation History

Immutable audit log of derivation state transitions — append-only.

### 3.20 Derivation Ownership

| Owner type | Responsibility |
|------------|----------------|
| `businessOwner` | Accountable business party |
| `technicalOwner` | Platform team (Resolver) |
| `tenantId` | Enterprise scope |

### 3.21 Derivation Provenance

Source attestation: Intent revision, Template id, Marketplace package id, AI-assisted flag (Intent-only).

### 3.22 Derivation Explainability

Structured answers — see §9 (policy).

### 3.23 Derivation Regeneration

Controlled rebuild when upstream changes. Governed by `regenerationPolicy` (§5).

| Trigger | Default policy |
|---------|----------------|
| Intent revision | Regenerate affected derivations |
| Capability change | Impact scan → regen or invalidate |
| Template change | Optional regen if bound |

### 3.24 Derivation Synchronization

Keep derivations aligned with Intent SSOT — see §8 (policy).

### 3.25 Derivation Invalidation

Mark derivation **invalid** when upstream breaking change cannot auto-regenerate.

| State | Runtime behavior |
|-------|------------------|
| `valid` | Normal operation |
| `stale` | Warn; optional grace period |
| `invalid` | Block publish / runtime until resolved |

### 3.26 Derivation Diff

Compare two derivation versions — business-facing change summary + technical diff for Studio.

### 3.27 Derivation Merge

Combine derivations from multiple Intents (future) — requires explicit merge contract; default **forbidden** without Decision.

### 3.28 Derivation Rollback

Restore prior `derivationVersion` — governed by `rollbackPolicy`; lineage records rollback event.

### 3.29 Derivation Migration

Schema or resolver version migration — `compatibilityVersion` bump + migration script (future program).

### 3.30 Derivation Extension Points

| Extension | Produces | Rule |
|-----------|----------|------|
| New `derivationKind` | Catalog + Contract registration | Decision + Gate |
| New `artifactType` | Contract + Projection target | No Studio bypass |
| New Studio projection | Register in Derivation Catalog | Reuses Derivation Engine |
| AI Intent assist | Intent Document only | §11 |
| Future API types | `category: Future` | Catalog entry required |

---

## 4. Official derivation pipeline

**Normative pipeline — no stage may be skipped:**

```
Business Intent                    ◄── SSOT (Business Intent Document — D-059)
        ↓
Business Derivation                ◄── THIS DOCUMENT (Derivation Engine contract)
        ↓
Business Asset                     ◄── Logical business deliverable (e.g. "Commission rule")
        ↓
Business Artifact                  ◄── Typed business artifact (e.g. computation spec)
        ↓
Technical Projection             ◄── Studio-editable technical document (Formula Doc, …)
        ↓
Studio                             ◄── Formula Builder · Workflow · Dashboard · … (edit projection only)
        ↓
MDP                                ◄── Metadata Registry · publish · version chain
        ↓
Runtime                            ◄── CRB · Foundation · execution
```

| Stage | Owner | Forbidden bypass |
|-------|-------|-------------------|
| Business Intent | Intent Authoring | Module config engines authoring business logic |
| Business Derivation | Derivation Engine (Resolver impl) | Studio creating artifacts without derivation record |
| Business Asset | Derivation output | Direct MDP write from UI |
| Technical Projection | Derivation + Studio adapter | Raw AST authoring in business UI |
| Studio | Certified designers | Parallel parsers/evaluators (G303A) |
| MDP | MDP-4/5 | Ad-hoc JSON stores |
| Runtime | CRB + engines | Legacy paths without lineage (see Formula Unification Plan) |

**Business Computation path (D-058):** For computation-class derivations, Business Computation Document is the **Business Artifact** between Derivation and Formula Builder projection.

---

## 5. Mandatory derivation metadata

Every derivation **must** include:

| Field | Type | Purpose |
|-------|------|---------|
| `derivationId` | string | Immutable derivation identity |
| `intentId` | string | Origin Intent |
| `businessObjectId` | string | Scoped Business Object |
| `capabilityId` | string | Primary Business Capability |
| `artifactType` | string | Output artifact type |
| `derivationKind` | string | Catalog kind |
| `derivationVersion` | number | Monotonic version |
| `resolverVersion` | string | Engine version |
| `lineage` | LineageGraph | Parent chain |
| `provenance` | ProvenanceRecord | Source attestation |
| `generatedBy` | ActorRef | User or system actor |
| `generationReason` | string | Business reason (enum + text) |
| `compatibilityVersion` | string | Cross-artifact compat |
| `regenerationPolicy` | PolicyRef | Regen rules |
| `synchronizationPolicy` | PolicyRef | Sync rules |
| `rollbackPolicy` | PolicyRef | Rollback rules |
| `ownership` | OwnershipRecord | Business + technical owner |
| `metadata` | DerivationMetadata | Extensible facets |

Embedded in every **Business Artifact** and **Technical Projection** published to MDP.

---

## 6. Official derivation classification

| Category | Derivation examples | Primary artifact types |
|----------|---------------------|------------------------|
| **Business** | Policy rules, constraints | Business Rule, Permission |
| **Operational** | Process steps, notifications | Process, Notification |
| **Automation** | Event-triggered actions | Automation Rule |
| **Computation** | Calculations, aggregates | Computation, Formula, Computed/Derived Field |
| **Workflow** | Approvals, state machines | Workflow Definition |
| **Visualization** | Dashboards, indicators | Dashboard, KPI Widget |
| **Reporting** | Reports, exports | Report Definition |
| **Integration** | External system mappings | Integration Mapping |
| **Knowledge** | Documentation, glossary links | Document, Knowledge Ref |
| **AI** | AI-assisted decision configs | AI Config (from Intent only) |
| **Security** | Permissions, access rules | Permission, RBAC Rule |
| **Infrastructure** | Platform hooks, event bindings | Event Subscription |
| **Future** | Reserved catalog kinds | Registered per Decision |

---

## 7. Multi-asset derivation from single Intent

One `BusinessIntentDocument` may produce **simultaneously**:

| Output | derivationKind (examples) | Studio projection |
|--------|---------------------------|-------------------|
| Fórmulas | `compute.formula` | Formula Builder |
| Computed Fields | `compute.field.computed` | Field Studio |
| Derived Fields | `compute.field.derived` | Field Studio |
| Workflows | `workflow.process` | Workflow Studio (future) |
| Automações | `automation.rule` | Automation Studio (future) |
| Dashboards | `visualization.dashboard` | Dashboard Studio (future) |
| Indicadores | `visualization.indicator` | Dashboard Studio |
| Relatórios | `reporting.definition` | Report Studio (future) |
| Integrações | `integration.mapping` | Integration Studio (future) |
| Permissões | `security.permission` | Permission Studio (future) |
| IA | `ai.config` | AI Studio (future) |
| Business Rules | `business.rule` | Rule Studio (future) |
| Eventos | `infrastructure.event` | Event config |
| Processos | `operational.process` | Process Studio (future) |
| Notificações | `operational.notification` | Notification config |
| Documentos | `knowledge.document` | Document template |
| APIs futuras | `future.api` | Catalog-registered |

**Rule:** Each output is a **separate derivation** with unique `derivationId`, shared `intentId`, full lineage.

---

## 8. Synchronization policy (official)

### 8.1 When upstream changes

| Change event | Detection | Default action |
|--------------|-----------|----------------|
| **Intent changes** | `intentRevision` bump | Impact scan all `derives_from` edges → regen or invalidate |
| **Capability changes** | Capability registry diff | Scan derivations with `capabilityId` → validate compat |
| **Business Object changes** | MDP entity dictionary | Scan `businessObjectId` index → compat check |
| **Template changes** | Template version | Regen if derivation bound to template |
| **Formula changes** | Projection revision (Studio) | Mark derivation **stale** if diverges from Intent SSOT |
| **Workflow changes** | Projection revision | Same — Intent SSOT wins |
| **Dashboard changes** | Projection revision | Same — Intent SSOT wins |

### 8.2 Impact detection

1. Query Derivation Registry by changed entity id  
2. Build impact subgraph via Derivation Dependencies  
3. Classify: `none` \| `compatible` \| `regenerate` \| `invalidate`  
4. Emit business-facing impact report (Explainability §9)

### 8.3 Regeneration

| Policy | Behavior |
|--------|----------|
| `auto` | Derivation Engine regens on compatible changes |
| `manual` | Notify owner; require approval |
| `blocked` | Invalidate until business review |

### 8.4 Invalidation

Breaking Intent change without successful regen → status `invalid` → runtime block for affected artifacts.

### 8.5 Compatibility maintenance

`compatibilityVersion` incremented on breaking artifact schema changes. Downstream derivations scanned; migration or rollback per policy.

---

## 9. Explainability policy (official)

Every derivation must answer:

| Question | Source field / mechanism |
|----------|-------------------------|
| Por que existe? | `generationReason` + Intent `intentPhrase` |
| Quem gerou? | `generatedBy` + `ownership` |
| Quando foi gerada? | Derivation History timestamp |
| Qual Intent originou? | `intentId` + `intentRevision` |
| Qual Capability utilizou? | `capabilityId` |
| Quais regras participaram? | Derivation Contract + Intent policies |
| Quais objetos participaram? | `businessObjectId` + dependency graph |
| Quais versões participaram? | `derivationVersion`, `resolverVersion`, `compatibilityVersion` |
| Quais dependências participaram? | Derivation Dependencies subgraph |

**Business Observatory (D-060):** Explainability records feed Enterprise Memory — architecture hook only in Program 3.6.

---

## 10. Marketplace policy (official)

| Shareable (business-facing) | Never shared |
|----------------------------|--------------|
| Business Intent | Formula AST |
| Business Capability packages | Workflow engine internals |
| Business Templates | Resolver implementation |
| Business Derivations (metadata + business artifact) | MDP internal keys |
| Derivation Catalog entries (public kinds) | Studio source code |

Marketplace installs produce **new tenant `derivationId`** with provenance pointing to package — never copy internal projections blindly.

---

## 11. AI policy (official)

| Rule | Description |
|------|-------------|
| **AI-1** | AI never creates technical artifacts directly |
| **AI-2** | AI output is always a **Business Intent Document** (or draft thereof) |
| **AI-3** | Platform performs all technical derivation |
| **AI-4** | Platform operates fully without AI |
| **AI-5** | AI accelerates Intent authoring only — optional |
| **AI-6** | AI-generated Intents carry `provenance.aiAssisted=true` |
| **AI-7** | Derivation from AI-assisted Intent uses same pipeline — no shortcut |

---

## 12. Evolution policy (official)

Every derivation must be:

| Property | Mechanism |
|----------|-----------|
| **Versionável** | `derivationVersion` + schema semver |
| **Auditável** | Derivation History immutable log |
| **Regerável** | Regeneration policy + Engine |
| **Explicável** | Explainability policy §9 |
| **Comparável** | Derivation Diff |
| **Reutilizável** | Derivation Library + Marketplace |
| **Compatível** | Compatibility matrix + version |
| **Migrável** | Derivation Migration program |

---

## 13. Relationship to adjacent architectures

| Architecture | Relationship |
|--------------|--------------|
| [Business Intent Authoring (D-059)](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | Intent SSOT — input to derivation |
| [Business Computation (D-058)](./MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) | Computation **facet** — Business Artifact for compute kinds |
| [Formula Builder (D-056)](../engineering/DECISIONS.md) | Technical Projection editor for formulas — no derivation origin |
| [Computation Engine (D-055)](../engineering/DECISIONS.md) | Executes formula projections — not derivation |
| Intent Resolver (Program 3.7) | **Implementation** of Business Derivation Engine |
| [Formula Runtime Unification Plan](../engineering/FORMULA-RUNTIME-UNIFICATION-PLAN.md) | Runtime stage after MDP publish |

**No conflict:** Derivation Architecture **formalizes** the pipeline D-059 reserved for Resolver. Resolver **implements** this document.

---

## 14. Gate plan (implementation — not Program 3.6)

| Gate | Scope | Program |
|------|-------|---------|
| **G304** | Intent Resolver + Derivation Engine — exclusivity, lineage, no bypass | 3.7 |
| **G303B** | Business Computation derivation path | After Resolver MVP |
| G305 (proposed) | Derivation Registry + mandatory metadata | Future |

Register in [GATE-REGISTRY.md](../engineering/GATE-REGISTRY.md) when implemented.

---

## 15. Program sequence

| Program | Deliverable |
|---------|-------------|
| **3.6** (this) | Business Derivation Architecture — docs only |
| **3.7** | Business Intent Resolver **implementation** using this architecture |
| **3.7+** | Business Computed Fields, Workflow, … per derivation kinds |

---

*Permanent architecture per D-063. Implementation exclusively via Program 3.7+ using this infrastructure.*
