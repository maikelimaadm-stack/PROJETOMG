# MAK Business Intent Resolver Architecture

**Status:** Official — Permanent architecture reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.6.5 — Business Intent Resolver Architecture  
**Decision:** D-064  
**Layer:** L5 (Platform Derivation) + L6 (Enterprise Services) — **Intent resolution SSOT**  
**Hierarchy:** Constitution → Master Architecture → [Business Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (D-059) → [Business Derivation Architecture](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) (D-063) → **This document** → Intent Resolver Implementation (Program 3.7, G304) → Studio → MDP → Runtime

---

## ⚠️ Scope boundary (Program 3.6.5)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent **Business Intent Resolver** architecture — all concepts in §3 | Code, APIs, database, runtime, Foundation, Studio changes |
| Official resolution pipeline (§4) | Resolver **implementation** (Program 3.7) |
| Decision criteria, lifecycle, integration contracts (§5–§7) | Business Computed Fields UI, Workflow Studio UI |
| Guarantees: determinism, idempotence, traceability (§8) | AI/NLP engines, Marketplace UI |
| Extension points, Marketplace hooks, AI hooks (contracts only) | Any designer-specific resolution bypass |

**Rule:** The Intent Resolver is the **sole authorized infrastructure** that transforms a Business Intent into derived business assets. No Studio may implement proprietary resolution logic. No AI may resolve an Intent directly. All resolution **must** pass through the Resolver. Program 3.7 implements this contract under gate **G304**.

**Relationship to prior docs:** [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) §3.6 introduced the Resolver contract at authoring level. **This document** is the permanent, exhaustive Resolver SSOT. [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) (D-063) defines derivation infrastructure; the Resolver **executes** Business Derivation as its core output phase.

---

## 1. Purpose

The **Business Intent Resolver** is the platform's most critical derivation component — the **only** authorized engine that:

1. Accepts an approved **Business Intent Document** (D-059)
2. Resolves **Business Capabilities** bound to the Intent
3. Executes **Business Derivation** (D-063)
4. Produces **Business Assets**, **Business Artifacts**, and **Technical Projections**
5. Routes projections to the correct **Studio** editors and **MDP** publication path
6. Maintains **complete lineage** from Intent to Runtime

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUSINESS INTENT (SSOT — D-059)                                              │
│  User creates Intentions only · Intent Validation passed                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS INTENT RESOLVER ◄── THIS DOCUMENT (Program 3.6.5)                  │
│  Capability Resolution · Derivation · Projection · Sync · Explainability     │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS DERIVATION (D-063) · ASSETS · ARTIFACTS · TECHNICAL PROJECTIONS  │
├─────────────────────────────────────────────────────────────────────────────┤
│  STUDIO (Formula Builder · Workflow Studio · …) — projection editors only    │
├─────────────────────────────────────────────────────────────────────────────┤
│  MDP L4 · CRB · RUNTIME                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory resolver principles (Program 3.6.5)

| # | Principle | Rule |
|---|-----------|------|
| **IR-1** | Sole resolution authority | Only Intent Resolver may transform Intent → derived assets |
| **IR-2** | No Studio resolution | Studios edit projections — never resolve Intents |
| **IR-3** | No AI resolution | AI produces Intent only; Resolver performs all technical derivation |
| **IR-4** | Derivation architecture compliance | All outputs conform to [Business Derivation Architecture](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) (D-063) |
| **IR-5** | Intent SSOT | Every resolution traces to exactly one `intentId` + `intentRevision` |
| **IR-6** | Capability binding | Every resolution binds `capabilityId` — never module APIs |
| **IR-7** | Deterministic | Same Intent revision + catalog + resolver version → same outputs |
| **IR-8** | Idempotent | Re-running resolution with unchanged inputs produces equivalent derivations |
| **IR-9** | Complete lineage | Mandatory metadata on every derivation (D-063 §5) |
| **IR-10** | Explainability by default | Every resolution answers why / who / when / what participated |
| **IR-11** | Regenerable | Upstream changes trigger governed regeneration — never silent drift |
| **IR-12** | Platform without IA | Full resolution without AI; AI hooks accelerate Intent authoring only |
| **IR-13** | Reproducible | Resolution sessions replayable from Resolver Document snapshot |
| **IR-14** | Auditable | Immutable Resolver Audit trail for every session |
| **IR-15** | Technology Transparency | Business user never sees resolver internals ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md)) |

**Permanent prohibition:** Designers, modules, AI agents, or runtime paths that produce Formula Documents, Workflow definitions, Automation rules, Dashboard widgets, or any derived artifact **without** passing through Intent Resolver (once implemented) are **architecturally invalid**.

---

## 3. Permanent architectural concepts

### 3.1 Intent Resolver

The **platform engine** — not a UI — that orchestrates the official resolution pipeline (§4). Single implementation authorized under Program 3.7 (G304).

| Attribute | Value |
|-----------|-------|
| Contract version | `mak-intent-resolver-v1` |
| Engine id | `mak-business-intent-resolver-engine` |
| Owner layer | L5 Platform Derivation |
| Consumers | All Studios, MDP Publish, Runtime Bridge, Marketplace import |
| Subordinate to | Business Derivation Architecture (D-063) |

### 3.2 Resolver Document

Canonical record of **one resolution operation** — input Intent snapshot, capability resolution, derivation plan, outputs, diagnostics, audit.

| Artifact | Version constant |
|----------|------------------|
| Resolver Document | `mak-resolver-document-v1` |
| Resolver result envelope | `mak-resolver-result-v1` |

```typescript
// Conceptual — not implementation code
ResolverDocument {
  schemaVersion: "mak-resolver-document-v1"
  resolverSessionId: string           // immutable session id
  intentId: string
  intentRevision: number
  resolverVersion: string
  resolverStrategy: ResolverStrategy
  status: "planned" | "running" | "completed" | "failed" | "partial" | "invalidated"
  capabilityResolution: CapabilityResolutionResult
  derivationPlan: DerivationPlanEntry[]
  outputs: ResolverOutputRef[]        // Derivation Document refs
  diagnostics: ResolverDiagnostic[]
  metadata: ResolverMetadata          // §3.6
  audit: ResolverAuditEntry[]
  createdAt: ISO8601
  completedAt?: ISO8601
}
```

### 3.3 Resolver Session

Ephemeral or durable **execution context** for one resolution invocation.

| Field | Purpose |
|-------|---------|
| `resolverSessionId` | Unique session identifier |
| `tenantId` | Enterprise scope |
| `trigger` | `manual` \| `auto_regen` \| `marketplace_import` \| `sync` \| `preview` |
| `initiatedBy` | Actor (user id or system principal) |
| `mode` | `full` \| `incremental` \| `preview` \| `dry_run` |
| `policySet` | Active Resolver Policies (§3.7) |
| `cachePolicy` | Cache read/write behavior (§3.29) |

**Rule:** One Resolver Session produces one Resolver Document. Preview sessions produce non-published Resolver Documents marked `preview: true`.

### 3.4 Resolver Context

Immutable **input snapshot** bound to a session — everything the Resolver needs for deterministic replay.

| Facet | Content |
|-------|---------|
| `intentSnapshot` | Pinned Intent Document at `intentRevision` |
| `catalogSnapshot` | Intent Catalog + Derivation Catalog versions |
| `capabilitySnapshot` | Resolved Business Capabilities + compatibility matrix |
| `objectSnapshot` | Target Business Object schema + bindings |
| `dependencySnapshot` | Intent Dependencies + Derivation Dependencies |
| `tenantPolicySnapshot` | Resolver Policies + Derivation Policies |
| `resolverVersion` | Engine semver |
| `compatibilityVersion` | Cross-artifact compatibility matrix version |

**Version constant:** `mak-resolver-context-v1`

### 3.5 Resolver Pipeline

The **ordered stages** every resolution must execute (§4). No stage may be skipped; failures halt or branch per policy.

| Stage | Output |
|-------|--------|
| Intent intake | Validated Intent reference |
| Capability Resolution | `CapabilityResolutionResult` |
| Capability Validation | Pass / diagnostics |
| Capability Compatibility | Compatibility matrix verdict |
| Business Derivation | `DerivationDocument[]` per D-063 |
| Asset materialization | `BusinessAsset[]` |
| Artifact materialization | `BusinessArtifact[]` |
| Technical Projection | Studio-target documents |
| Publish routing | MDP + Registry refs |

### 3.6 Resolver Metadata

Extensible metadata on every resolution — governance, telemetry, cost.

| Facet | Examples |
|-------|----------|
| `governance` | approval status, segregation of duties |
| `lineage` | parent session, regen source |
| `provenance` | template id, marketplace package id |
| `cost` | Resolver Cost Analysis summary (§3.30) |
| `telemetry` | duration, derivation count, cache hits |

Mandatory fields inherited on every output derivation (D-063 §5): `derivationId`, `intentId`, `businessObjectId`, `capabilityId`, `artifactType`, `derivationKind`, `derivationVersion`, `resolverVersion`, `lineage`, `provenance`, `generatedBy`, `generationReason`, `compatibilityVersion`, `regenerationPolicy`, `synchronizationPolicy`, `rollbackPolicy`, `ownership`, `metadata`.

### 3.7 Resolver Lifecycle

| Stage | Description |
|-------|-------------|
| **Plan** | Build derivation plan from Intent + Catalog |
| **Context** | Assemble Resolver Context snapshot |
| **Resolve capabilities** | Capability Resolution + Validation + Compatibility |
| **Execute derivations** | Business Derivation per plan entry |
| **Project** | Technical Projections for Studios |
| **Validate outputs** | Resolver Validation (§3.11) |
| **Publish** | MDP + Derivation Registry update (when not preview) |
| **Operate** | Runtime consumes published artifacts |
| **Sync** | Upstream change triggers sync policy |
| **Regenerate** | Controlled rebuild (§5) |
| **Invalidate** | Mark stale; block runtime until resolved |
| **Retire** | Soft-delete session; lineage preserved |

### 3.8 Resolver Policies

Governance rules applied before/during resolution.

| Policy type | Examples |
|-------------|----------|
| `approval` | Resolution requires approver role |
| `segregation` | Author ≠ resolver initiator |
| `tenant` | Licensed capabilities only |
| `regeneration` | Auto vs manual regen on Intent change |
| `rollback` | Allowed rollback depth |
| `cache` | Cache TTL, invalidation rules |
| `cost` | Max derivations per session |
| `preview` | Preview allowed without publish |

**Version constant:** `mak-resolver-policy-set-v1`

### 3.9 Resolver Contracts

Normative input/output contracts for the Resolver engine.

| Contract | Specifies |
|----------|-----------|
| Input | `BusinessIntentDocument` + Resolver Context |
| Output | `ResolverResult` = Derivation Documents + Projections |
| Invariants | IR-1 through IR-15; D-063 mandatory metadata |
| Failure | `ResolverDiagnostic[]` — no silent partial publish |

**Version constant:** `mak-intent-resolver-contract-v1`

### 3.10 Resolver Diagnostics

Business-language feedback — same discipline as Intent Diagnostics (D-059) and Derivation Diagnostics (D-063).

```typescript
ResolverDiagnostic {
  code: string
  severity: "info" | "warning" | "error" | "blocking"
  message: string                   // business language
  stage?: ResolverPipelineStage
  derivationKind?: string
  capabilityId?: string
  suggestion?: string
  relatedSessionId?: string
}
```

**Rule:** Diagnostics never expose AST, stack traces, or engine internals to the business user.

### 3.11 Resolver Validation

Pipeline **after** capability resolution, **before** derivation execution:

| Check | Description |
|-------|-------------|
| Intent valid | Intent Validation passed (D-059) |
| Capability resolved | All required capabilities bound |
| Catalog match | Derivation kinds allowed for Intent |
| Compatibility | Business Object + artifact compatibility |
| Dependency | No cycles; impact graph consistent |
| Policy | Tenant resolver policies satisfied |
| Cost | Within tenant cost limits (if configured) |

Output: `ResolverValidationSummary` + `ResolverDiagnostic[]`.

### 3.12 Resolver Explainability

Structured answers for every resolution — mandatory policy.

| Question | Source |
|----------|--------|
| Por que existe? | `generationReason` + Intent goal summary |
| Quem gerou? | `generatedBy` + `initiatedBy` |
| Quando foi gerada? | `createdAt` / `completedAt` |
| Qual Intent originou? | `intentId` + `intentRevision` |
| Qual Capability utilizou? | `capabilityId[]` |
| Quais regras participaram? | Intent rules + policy set refs |
| Quais objetos participaram? | `businessObjectId` + field bindings |
| Quais versões participaram? | Intent, catalog, resolver, compatibility versions |
| Quais dependências participaram? | Dependency graph snapshot |

**Version constant:** `mak-resolver-explainability-report-v1`

### 3.13 Resolver Versioning

| Mechanism | Rule |
|-----------|------|
| `resolverVersion` | Engine semver — recorded on every output |
| `intentRevision` pin | Published artifacts pin Intent revision |
| `derivationVersion` | Per-derivation monotonic version (D-063) |
| `compatibilityVersion` | Cross-artifact compatibility matrix |
| Schema semver | `mak-resolver-document-v1` → v2 via Decision only |

**Breaking resolver bump:** Triggers regeneration policy for all affected derivations.

### 3.14 Resolver Lineage

Directed acyclic graph: Intent → Resolver Session → Derivation → Asset → Artifact → Projection → Runtime.

Every node records: `parentId`, `resolverSessionId`, `derivationKind`, `version`, `timestamp`.

### 3.15 Resolver Dependency Resolution

Integrates Intent Dependencies (D-059) and Derivation Dependencies (D-063) with Studio **Dependency Engine** (G299).

| Phase | Behavior |
|-------|----------|
| Pre-resolution | Load dependency graph; detect cycles |
| Plan | Order derivations topologically |
| Impact | Upstream change → affected derivation set |
| Cross-intent | Commission intent depends on Order Total intent → ordered resolution |

**Version constant:** `mak-resolver-dependency-resolution-v1`

### 3.16 Resolver Strategy

Pluggable **orchestration strategy** within the single Resolver engine — not parallel resolution stacks.

| Strategy | Use |
|----------|-----|
| `standard` | Full pipeline for approved Intent |
| `incremental` | Re-resolve only changed derivation kinds |
| `preview` | Non-publishing dry run for Studio preview |
| `marketplace_import` | Intent from Marketplace package → tenant derivations |
| `regeneration` | Triggered by sync policy |
| `migration` | Schema/resolver version migration |

**Rule:** Strategies share the same pipeline stages (§4); they differ in scope and publish behavior.

### 3.17 Resolver Extension Points

Official hooks for future capability — **without** bypassing Resolver exclusivity.

| Extension | Contract |
|-----------|----------|
| Derivation kind handler | Register in Derivation Catalog; invoked by Resolver |
| Projection adapter | Maps artifact → Studio document type |
| Capability resolver plugin | Resolves capability-specific derivation plan |
| Post-derivation validator | Tenant-specific validation hook |
| Telemetry exporter | Resolver Telemetry sink |

**Version constant:** `mak-resolver-extension-registry-v1`

### 3.18 Resolver Marketplace Hooks

Marketplace integration — business assets only.

| Hook | Behavior |
|------|----------|
| `import_intent` | Marketplace Intent → Resolver Session (`marketplace_import`) |
| `publish_derivation` | Export Derivation Document (business-facing) — never internal impl |
| `license_check` | Capability license before resolution |
| `package_provenance` | Marketplace package id on provenance |

**Rule:** Marketplace shares Intent, Capability, Template, Derivation — never internal Resolver implementation (D-063 §10).

### 3.19 Resolver AI Hooks

AI integration — Intent authoring acceleration only.

| Hook | Behavior |
|------|----------|
| `intent_draft_assist` | AI suggests Intent Document fields — user approves |
| `intent_enrichment` | AI proposes capability bindings — Resolver validates |
| `resolution_explain` | AI summarizes Resolver Explainability report for user |

**Forbidden:** AI invoking Resolver with synthetic Intent without user approval; AI writing Technical Projections directly; AI bypassing Capability Validation.

### 3.20 Resolver Runtime Projection

Bridge from Technical Projection to MDP publication and Runtime Bridge (CRB).

| Step | Target |
|------|--------|
| Projection compile | Studio document → MDP L4 artifact |
| Registry update | Derivation Registry index |
| CRB hydration | Runtime-consumable form |
| Lineage embed | `intentId`, `derivationId`, `resolverVersion` on runtime artifact |

**Rule:** Runtime never receives artifacts without Resolver lineage metadata.

### 3.21 Resolver Preview

Non-publishing resolution for Studio **what-if** and authoring feedback.

| Attribute | Rule |
|-----------|------|
| `preview: true` | No MDP publish; no Registry commit |
| Output | Resolver Document + Projections in ephemeral store |
| TTL | Configurable; auto-discard |
| Promotion | User approves → new session with `standard` strategy |

### 3.22 Resolver Diff

Compare two Resolver Documents or derivation sets.

| Diff kind | Audience |
|-----------|----------|
| Business diff | Intent change impact summary |
| Derivation diff | Added/removed/changed derivations |
| Projection diff | Studio document field changes |
| Compatibility diff | Breaking vs non-breaking |

**Version constant:** `mak-resolver-diff-v1`

### 3.23 Resolver Regeneration

Controlled rebuild when upstream changes — governed by `regenerationPolicy` (D-063 §5).

| Trigger | Default behavior |
|---------|------------------|
| Intent revision | Regenerate affected derivations |
| Capability change | Impact scan → regen or invalidate |
| Business Object schema change | Compatibility check → regen |
| Template change | Regen if Intent bound to template |
| Formula change (derived) | Upstream derivation regen cascade |
| Workflow change (derived) | Same |
| Dashboard change (derived) | Same |

See §5 for full regeneration taxonomy.

### 3.24 Resolver Synchronization

Keep resolved derivations aligned with Intent SSOT — extends D-063 §8.

| Event | Resolver action |
|-------|-----------------|
| Intent saved (new revision) | Queue sync impact analysis |
| Capability updated | Scan derivations with `capabilityId` |
| Business Object changed | Scan derivations with `businessObjectId` |
| Template updated | Scan bound Intents |
| External derivation edited in Studio | Detect drift vs Resolver projection; flag or merge |

### 3.25 Resolver Incremental Update

Re-resolve **only** affected derivation kinds — not full pipeline when safe.

| Condition | Incremental allowed |
|-----------|---------------------|
| Intent field change localized to one derivation kind | Yes |
| Capability compatibility unchanged | Yes |
| Breaking Intent revision | No — full regen |
| Resolver version breaking bump | No — migration path |

**Output:** Partial Resolver Document referencing prior session lineage.

### 3.26 Resolver Rollback

Restore derivations to prior known-good state.

| Mechanism | Rule |
|-----------|------|
| Session rollback | Revert to prior `resolverSessionId` outputs |
| Derivation rollback | Per-derivation version pin |
| Policy | `rollbackPolicy` on metadata — depth limit |
| Runtime | Rollback publishes previous MDP generation |

### 3.27 Resolver Compatibility

Ensures resolution outputs coexist on same Business Object.

| Dimension | Rule |
|-----------|------|
| Intent revision | New revision may invalidate compat |
| Multiple derivations same target | Exclusive pairs blocked at validation |
| Resolver version | Breaking bump triggers migration |
| Cross-module | Compatibility matrix from Capability layer |
| Studio manual edit | Drift detection via sync |

### 3.28 Resolver Migration

Schema and engine version transitions.

| Migration type | Process |
|----------------|---------|
| Resolver contract v1 → v2 | Decision + migration program |
| Derivation catalog bump | Re-resolve or invalidate |
| Intent schema bump | Intent migration → Resolver regen |
| MDP artifact schema | Projection adapter migration |

**Version constant:** `mak-resolver-migration-plan-v1`

### 3.29 Resolver Cache

Performance layer — **must not** affect determinism.

| Cache key | Components |
|-----------|------------|
| Resolution cache | `intentRevision` + catalog versions + resolver version + context hash |
| Derivation cache | Per-derivation-kind intermediate |
| Invalidation | Intent/Capability/Catalog change |

**Rule:** Cache hit must produce **identical** outputs to cache miss. Idempotence (IR-8) preserved.

### 3.30 Resolver Cost Analysis

Tenant governance for resolution resource usage.

| Metric | Use |
|--------|-----|
| Derivation count | Per session |
| Duration | Per stage |
| Cache hit ratio | Optimization |
| Regeneration frequency | Sync policy tuning |

Advisory only in v1 — no billing implementation in architecture.

### 3.31 Resolver Optimization

Internal engine optimizations — transparent to contracts.

| Technique | Constraint |
|-----------|------------|
| Parallel derivation (independent kinds) | Same deterministic output order in Document |
| Cache (§3.29) | Determinism preserved |
| Incremental update (§3.25) | Lineage records partial path |
| Plan pruning | Skip unchanged derivations when safe |

### 3.32 Resolver Telemetry

Operational observability — platform operators only.

| Signal | Purpose |
|--------|---------|
| Session duration | SLA monitoring |
| Stage latency | Bottleneck detection |
| Failure rate | Health |
| Derivation kind distribution | Capacity planning |

**Rule:** Telemetry never exposed to business users (IR-15).

### 3.33 Resolver Audit

Immutable append-only log — compliance and forensics.

| Event | Recorded |
|-------|----------|
| Session start/end | Actor, trigger, mode |
| Policy decisions | Approval gates |
| Publish | MDP artifact ids |
| Rollback | Prior session ref |
| Invalidation | Reason code |

**Version constant:** `mak-resolver-audit-log-v1`

### 3.34 Resolver Security

| Control | Rule |
|---------|------|
| Authorization | Resolver invocation requires capability + tenant license |
| Segregation | Intent author ≠ resolver approver (when policy enabled) |
| Data scope | Resolver Context limited to tenant + object scope |
| Marketplace import | Package signature verification |
| AI hooks | No autonomous publish — user approval required |
| Audit | All sessions logged (§3.33) |

---

## 4. Official resolution pipeline

Every resolution **must** execute these stages in order:

```
Business Intent
      ↓
Capability Resolution
      ↓
Capability Validation
      ↓
Capability Compatibility
      ↓
Business Derivation
      ↓
Business Assets
      ↓
Business Artifacts
      ↓
Technical Projection
      ↓
Studio
      ↓
MDP
      ↓
Runtime
```

### Stage definitions

| Stage | Input | Output | Failure |
|-------|-------|--------|---------|
| **Business Intent** | Approved Intent Document | Intent reference in Context | Block — Intent Validation required |
| **Capability Resolution** | Intent capability bindings | Resolved capability set + parameters | Diagnostic — missing capability |
| **Capability Validation** | Resolved capabilities | Validation summary | Block — invalid or unlicensed |
| **Capability Compatibility** | Capabilities + Business Object | Compatibility matrix verdict | Block or warn — object mismatch |
| **Business Derivation** | Plan + Context | Derivation Documents (D-063) | Partial allowed only in preview |
| **Business Assets** | Derivation outputs | Asset records | Rollback on critical failure |
| **Business Artifacts** | Assets | Typed artifacts per kind | Same |
| **Technical Projection** | Artifacts | Studio-target documents | Same |
| **Studio** | Projections | User-edited projections (optional) | Drift sync on save |
| **MDP** | Approved projections | L4 published metadata | Publish gate |
| **Runtime** | MDP + CRB | Executed behavior | Runtime lineage check |

---

## 5. Official decision criteria — when to generate

The Resolver **decides** which derivations to produce from Intent content, Catalog entries, and Capability bindings — never the Studio, never AI.

### 5.1 Decision matrix

| Output type | `derivationKind` (example) | Generate when |
|-------------|---------------------------|---------------|
| **Fórmulas** | `compute.formula` | Intent category = computation; capability requires numeric/logic expression |
| **Computed Fields** | `compute.computed_field` | Intent binds to Business Object field; computation capability present |
| **Derived Fields** | `compute.derived_field` | Intent declares derived value from other fields/objects |
| **Workflows** | `workflow.approval` \| `workflow.process` | Intent category = process; workflow capability; triggers/approvals declared |
| **Automações** | `automation.rule` | Intent declares event-triggered action; automation capability |
| **Dashboards** | `visualization.dashboard` | Intent category = insight/KPI; visualization capability |
| **Indicadores** | `visualization.indicator` | Intent declares metric; indicator capability |
| **Relatórios** | `reporting.definition` | Intent category = report; reporting capability |
| **Integrações** | `integration.mapping` | Intent declares external system binding; integration capability |
| **Permissões** | `security.permission` | Intent constrains access; security capability |
| **IA** | `ai.configuration` | Intent declares AI-assisted behavior; **output is config derivation only** — not direct AI artifact |
| **Business Rules** | `rule.validation` \| `rule.constraint` | Intent declares business rule; rule capability |
| **Eventos** | `event.definition` | Intent declares domain event emission |
| **Processos** | `process.definition` | Intent maps to Business Process capability |
| **Notificações** | `notification.template` | Intent declares notify action |
| **Documentos** | `document.template` | Intent declares document generation |
| **APIs futuras** | `api.contract` | Extension point — Catalog entry when capability exists |

### 5.2 Multi-derivation rule

One Intent **may** produce **multiple** derivation kinds simultaneously when Catalog + Capability matrix allows. Each output receives independent `derivationId` with shared `intentId`.

### 5.3 Non-generation rule

The Resolver **must not** generate a derivation kind when:

- Catalog does not list kind for Intent category
- Required capability missing or unlicensed
- Compatibility matrix blocks combination
- Dependency resolution detects unresolvable cycle
- Policy blocks derivation kind for tenant

Output: `ResolverDiagnostic` with business-language explanation — never silent omission.

---

## 6. Lifecycle operations

### 6.1 Regeneração (Regeneration)

Full or partial rebuild of derivations from current Intent revision.

| Mode | Scope | Publish |
|------|-------|---------|
| Auto regen | Policy-driven on Intent save | Immediate or staged |
| Manual regen | User-initiated | After approval |
| Scheduled regen | Batch sync job | Maintenance window |

### 6.2 Recompilação (Recompilation)

Re-run Technical Projection and MDP publish **without** re-executing Business Derivation — when only projection adapter or MDP schema changed.

### 6.3 Atualização incremental (Incremental Update)

§3.25 — affected derivation kinds only; lineage links to prior session.

### 6.4 Atualização completa (Full Update)

Full pipeline re-execution — required on breaking Intent revision or resolver breaking bump.

### 6.5 Merge

When Studio edits projection AND Intent evolves:

| Scenario | Resolution |
|----------|------------|
| Non-conflicting edits | Merge projection with new derivation |
| Conflicting field binding | Block — user chooses Intent or Studio version |
| Policy | `mergePolicy` on Derivation metadata |

### 6.6 Rollback

§3.26 — restore prior session outputs; audit records rollback event.

### 6.7 Versionamento

Resolver Version (§3.13) + Derivation Version (D-063 §3.8) + Intent Revision (D-059 §3.8) — three-axis versioning.

### 6.8 Lineage

§3.14 — immutable DAG from Intent to Runtime.

### 6.9 Sincronização

§3.24 — event-driven alignment with Intent SSOT.

### 6.10 Conflitos

| Conflict type | Detection | Resolution |
|---------------|-----------|------------|
| Dual derivation same target | Validation | Block second derivation |
| Intent vs Studio drift | Sync on Studio save | Regen or merge policy |
| Capability deprecated | Sync job | Invalidate affected derivations |
| Cross-intent dependency break | Impact analysis | Cascade invalidate |

### 6.11 Explainability

§3.12 — mandatory report on every completed session.

---

## 7. Integration contracts

The Resolver **integrates with** — never duplicates — these platform components.

| Component | Integration | Resolver role |
|-----------|-------------|---------------|
| **Business Intent** (D-059) | Input SSOT | Consumes approved Intent Document |
| **Business Capability** | Resolution + validation | Binds `capabilityId`; never module APIs |
| **Business Objects** | Object snapshot | Schema compatibility; field bindings |
| **Business Computation** (D-058) | Derivation facet | Delegates computation-class intents to computation path |
| **Business Derivation** (D-063) | Output infrastructure | Produces Derivation Documents per contract |
| **Formula Builder** | Projection target | Receives computation projections — editor only |
| **Computation Engine** (G302) | Downstream execution | Fed by Formula Builder after Resolver — unchanged |
| **Expression Engine** (G298) | Derivation internal | Used during computation derivation — not bypass |
| **Dependency Engine** (G299) | Graph + impact | Resolver Dependency Resolution (§3.15) |
| **Type System** (G300) | Validation | Field type compatibility in derivations |
| **Evaluation Engine** (G301) | Preview/simulation | Resolver Preview evaluation — optional |
| **Business Memory** | Context enrichment | Future — extension point; Intent context only |
| **Knowledge** | Vocabulary | Intent terms resolve via Enterprise Vocabulary |
| **Business DNA** | Pattern binding | Template/pattern refs on provenance |
| **Marketplace** | Import/export hooks | §3.18 — business assets only |
| **Enterprise Intelligence** | Telemetry/mining | Resolver emits mining events post-publish |

**Foundation rule:** No Foundation (`framework/mak`) changes. Resolver lives in L5 Platform Derivation — implementation in Program 3.7.

---

## 8. Platform guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| **Determinismo** | Resolver Context snapshot + IR-7; cache must not alter output |
| **Idempotência** | IR-8; same inputs → equivalent Resolver Document |
| **Rastreabilidade** | Lineage DAG + mandatory metadata + Audit |
| **Reprodutibilidade** | Context replay from Resolver Document |
| **Consistência** | Single Resolver; no Studio parallel paths |
| **Compatibilidade** | Compatibility matrix at Capability + Derivation layers |
| **Reutilização** | Derivation Library + Marketplace import |
| **Escalabilidade** | Cache, incremental update, parallel independent derivations |

---

## 9. Synchronization policy (Resolver operational view)

Extends [Business Derivation Architecture §8](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md).

| When… | Resolver action |
|-------|-----------------|
| **Intent muda** | Impact analysis → regen or invalidate affected derivations |
| **Capability muda** | Scan by `capabilityId` → compatibility check → regen/invalidate |
| **Business Object muda** | Schema compatibility → field binding regen |
| **Template muda** | Scan Intents bound to template |
| **Formula muda** (in Studio) | Drift detection → sync or block publish |
| **Workflow muda** | Same |
| **Dashboard muda** | Same |

| Operation | Process |
|-----------|---------|
| **Detectar impacto** | Dependency Engine + Derivation Registry query |
| **Regenerar** | Resolver Regeneration (§6.1) |
| **Invalidar** | Mark derivation invalid; block runtime |
| **Manter compatibilidade** | `compatibilityVersion` + non-breaking diff rules |

---

## 10. AI policy (Resolver view)

| Rule | Detail |
|------|--------|
| AI never resolves directly | AI produces Intent; user approves; Resolver resolves |
| AI never creates technical artifacts | All artifacts via Resolver pipeline |
| Platform works without AI | IR-12; full resolution path without AI hooks |
| AI accelerates authoring | Resolver AI Hooks (§3.19) — draft assist only |
| AI explainability | Summarizes Resolver Explainability — does not alter outputs |

---

## 11. Evolution policy

Every Resolver output derivation must be:

| Property | Resolver contribution |
|----------|----------------------|
| Versionável | `resolverVersion` + session lineage |
| Auditável | Resolver Audit (§3.33) |
| Regerável | Regeneration + Sync policies |
| Explicável | Explainability report (§3.12) |
| Comparável | Resolver Diff (§3.22) |
| Reutilizável | Marketplace + Library hooks |
| Compatível | Compatibility matrix (§3.27) |
| Migrável | Migration plans (§3.28) |

---

## 12. Identified architectural risks (Program 3.6.5)

| Risk | Mitigation | Residual |
|------|------------|----------|
| Studio drift vs Resolver projection | Sync policy + drift detection on Studio save | Low — requires G304 enforcement |
| Resolver performance at scale | Cache + incremental update + cost analysis | Medium — monitor in implementation |
| Cross-intent dependency cycles | Dependency Resolution blocks at validation | Low |
| Marketplace import malicious package | Security §3.34 signature verification | Medium — impl detail in 3.7 |
| AI hook over-automation | User approval gate; no autonomous publish | Low |
| Formula runtime dual path (AD-P0) | [FORMULA-RUNTIME-UNIFICATION-PLAN.md](../engineering/FORMULA-RUNTIME-UNIFICATION-PLAN.md) — separate program | Medium — tracked debt |

**No blocking architectural conflict** identified with Intent, Capability, Derivation, Formula Builder, Computation Engine, or Foundation.

---

## 13. Gate plan — Program 3.7 implementation

| Gate | Scope |
|------|-------|
| **G304** | Intent Resolver implementation — contract compliance, exclusivity, lineage, Dependency integration |

**G304 is exclusively reserved for Intent Resolver** (D-062). Deploy pipeline uses G401/G402 — see [GATE-REGISTRY.md](../engineering/GATE-REGISTRY.md).

Program 3.7 **must** implement exclusively against this architecture and [Business Derivation Architecture](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md). No parallel resolution paths.

---

## 14. Document authority map

| Topic | SSOT |
|-------|------|
| Intent authoring | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| Derivation infrastructure | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |
| **Intent Resolver** | **This document** |
| Resolver implementation | Program 3.7 (code — not yet started) |
| Business Computation facet | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](./MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) |

---

## 15. Certification (Program 3.6.5)

| # | Question | Answer |
|---|----------|--------|
| 1 | Resolver = única infraestrutura oficial de resolução? | **SIM** — IR-1, IR-2, IR-3 |
| 2 | Conflito com Business Intent? | **NÃO** — Intent SSOT input |
| 3 | Conflito com Business Capability? | **NÃO** — capability resolution integrated |
| 4 | Conflito com Business Derivation? | **NÃO** — Resolver executes Derivation |
| 5 | Conflito com Formula Builder? | **NÃO** — projection editor only |
| 6 | Conflito com Computation Engine? | **NÃO** — downstream unchanged |
| 7 | Conflito com Foundation? | **NÃO** — no Foundation changes |
| 8 | Toda derivação futura depende do Resolver? | **SIM** — IR-1 permanent |
| 9 | Elimina lógica de resolução nos Studios? | **SIM** — IR-2 |
| 10 | Suporta Workflows, Dashboards, IA, Marketplace, etc.? | **SIM** — §5 decision matrix |
| 11 | Rastreabilidade Intent → Runtime? | **SIM** — §3.14 lineage + §3.20 |
| 12 | Determinismo e reprodutibilidade? | **SIM** — §8 IR-7, IR-8, IR-13 |
| 13 | Preparada para décadas? | **SIM** — versioning, migration, extension points |
| 14 | Risco arquitetural identificado? | **SIM** — §12 non-blocking risks documented |
| 15 | Program 3.7 Implementation autorizado? | **SIM** — after approval of this architecture (G304) |

---

*Amendments require Decision + ENGINEERING-JOURNAL entry. Implementation: Program 3.7 — Business Intent Resolver (G304).*
