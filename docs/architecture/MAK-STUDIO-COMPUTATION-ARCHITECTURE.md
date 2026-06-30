# MAK Studio Computation Architecture

**Status:** Official — Permanent architecture reference for Computation Engine  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.0.5 — Studio Computation Architecture  
**Decision:** D-054  
**Layer:** L5 (MAK Studio) — orchestration above Expression · Dependency · Type · Evaluation  
**Hierarchy:** Constitution → Master Architecture → [MAK Studio Architecture](./MAK-STUDIO-ARCHITECTURE.md) → **This document** → Program 2.3.6 implementation

---

## ⚠️ Scope boundary (Program 3.0.5)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent architecture definition | Code, APIs, runtime, Foundation, MDP schema changes |
| Contracts, graphs, contexts, pipelines | Program 2.3.6 implementation |
| Scale and extension-point design | Formula Builder UI (future) |

**Implementation mission:** [Program 2.3.6](../engineering/IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md) — must conform to this document. Gate **G302** (planned) enforces structural compliance.

---

## 1. Purpose

The **Studio Computation Engine** is the official orchestration layer for **all computed behavior** authored in MAK Studio — from single-field expressions to cross-entity aggregations, rollups, lookups, and calculated collections.

It **does not replace** the Expression, Dependency, Type, or Evaluation engines. It **composes** them into a unified computation model that:

1. Authors edit as **Computation Documents** in Field Studio (and future designers).
2. Compiles into **portable computation IR** embedded in MDP / CRB.
3. Executes in **Studio preview** and **Foundation runtime** through the same evaluation order and cache semantics.

### 1.1 Position in the Studio stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Field Studio · Formula Builder (future) · Dashboard Studio (future)     │
├─────────────────────────────────────────────────────────────────────────┤
│  COMPUTATION ENGINE ◄── THIS DOCUMENT                                   │
│  Document · AST · Graph · Optimizer · Profiler · Field models          │
├─────────────────────────────────────────────────────────────────────────┤
│  Evaluation Engine (D-051) — pipeline, cache, scheduler, strategies     │
│  Expression Engine (D-048) — parse, AST, compile, function catalog      │
│  Dependency Engine (D-049) — graph, cycles, topological order           │
│  Type System (D-050) — inference, coercion, validation                  │
├─────────────────────────────────────────────────────────────────────────┤
│  MDP L4 (field definitions) · MDP-5 compile → CRB → Runtime Bridge    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Rule:** No designer implements parallel computation graphs, evaluators, or field computation models.

---

## 2. Architectural principles

| # | Principle | Rationale |
|---|-----------|-----------|
| **C1** | **Compose, don't duplicate** | Expression AST for leaf logic; Evaluation for execution; Dependency for order |
| **C2** | **Authoring graph ≠ execution graph** | Studio edits rich metadata; runtime runs minimized executable graph |
| **C3** | **Compile before run** | No interpreted computation trees in production (Master Architecture §10) |
| **C4** | **Module-scoped by default** | Cross-module edges are explicit, versioned, and rare |
| **C5** | **Incremental by default** | Recompute only invalidated subgraph after data or definition change |
| **C6** | **Lazy unless proven hot** | Eager/batch/parallel are opt-in strategies per computation node |
| **C7** | **Tenant isolation** | Every context carries `cliente_id`; no cross-tenant computation |
| **C8** | **Diagnostics first** | Every failed computation returns structured diagnostics (no silent NaN) |
| **C9** | **Version everything** | Document, AST, graph, and compiled IR carry semver + content hash |
| **C10** | **Extension via registry** | AI and Marketplace add **functions and node types** — never bypass engines |

---

## 3. Official version identifiers

| Artifact | Version constant | Notes |
|----------|------------------|-------|
| Computation Document | `mak-computation-document-v1` | Authoring SSOT in Studio |
| Computation AST | `mak-computation-ast-v1` | Superset of expression nodes |
| Computation Graph | `mak-computation-graph-v1` | Authoring dependency view |
| Execution Graph | `mak-execution-graph-v1` | Compiled runtime view |
| Compiled Computation IR | `mak-computation-ir-v1` | Embedded in CRB payload |
| Engine facade | `mak-studio-computation-v1` | Gate G302 target |

**Binding decision (take now):** These version strings are **immutable contracts**. Additive changes → minor bump; breaking → major + migration (§19).

---

## 4. Computation Document

The **Computation Document** is the sole Studio authoring representation for a field's computational behavior (and future dashboard/widget computations).

### 4.1 Structure (conceptual)

```typescript
// Conceptual — not implementation code
ComputationDocument {
  schemaVersion: "mak-computation-document-v1"
  id: string                    // stable field computation id
  ownerType: "field" | "widget" | "collection" | "rollup"
  ownerId: string               // MDP field id or registry entry id
  moduleId: string
  entityId: string
  fieldKind: "computed" | "derived" | "aggregation" | "rollup" | "lookup" | "calculated_collection"
  expressionSource?: string     // human-readable formula (display)
  ast: ComputationAstNode       // official AST root
  dependencies: DependencyRef[] // explicit deps (validated against graph)
  evaluationPolicy: EvaluationPolicy
  typeDescriptor: TypeDescriptorRef
  metadata: ComputationMetadata // AI + Marketplace + diagnostics hints
  contentHash: string
  revision: number
}
```

### 4.2 Storage

| Phase | Location |
|-------|----------|
| Authoring draft | MDP Metadata Registry entry (`entryType: field_computation`) |
| Published | CRB `fields[].computationIr` + MDP field `source` / extension payload |
| Runtime | Hydrated from CRB — **never** read raw document in hot path |

Studio session state holds **working copies** only; persist via MDP APIs.

---

## 5. Computation AST

The **Computation AST** extends the Expression AST (`mak-expression-ast-v1`) with **computation nodes** for non-scalar and cross-record operations.

### 5.1 Node families

| Family | Examples | Delegates to |
|--------|----------|--------------|
| **Expression leaf** | `Literal`, `Variable`, `BinaryOp`, `Call` | Expression Engine |
| **Field ref** | `FieldRef`, `CrossEntityRef` | Dependency Engine |
| **Aggregate** | `Sum`, `Count`, `Avg`, `Min`, `Max`, `DistinctCount` | Computation Engine |
| **Rollup** | `Rollup(parentField, childRelation, agg)` | Computation Engine |
| **Lookup** | `Lookup(relation, matchKey, returnField)` | Computation Engine |
| **Collection** | `MapCollection`, `FilterCollection`, `ReduceCollection` | Computation Engine |
| **Control** | `Coalesce`, `If`, `Switch`, `Try` | Expression + Type System |

### 5.2 Rules

1. Every `Call` must resolve to **Function Catalog** entry (official, AI-extended, or Marketplace-extended).
2. `CrossEntityRef` requires **Relationship Dictionary** binding (MDP-3).
3. AST is **immutable** after parse; transforms go through official optimizer passes only.
4. Max depth / node count enforced by **Cost Analyzer** at authoring time.

---

## 6. Computation Graph

The **Computation Graph** is the **authoring-time** directed graph of all computation nodes and field dependencies within a **module scope** (default) or explicit cross-module bundle.

### 6.1 Graph elements

| Element | Description |
|---------|-------------|
| **Node** | Field, widget, or standalone computation artifact |
| **Edge** | Data dependency (`reads`) or ordering dependency (`mustRunBefore`) |
| **Group** | Entity boundary, transaction boundary, or batch partition |
| **Metadata** | Impact hints, AI explanations, Marketplace origin |

### 6.2 Construction

1. Extract variable refs from each Computation AST → Expression Dependency Graph.
2. Merge into Studio Dependency Engine graph (`artifactType: computation`).
3. Attach aggregate/rollup/lookup edges from relationship registry.
4. Run **cycle detection** — official Dependency Engine only.

### 6.3 Computation Graph vs Execution Graph

| Aspect | Computation Graph | Execution Graph |
|--------|-------------------|-----------------|
| Purpose | Authoring, impact analysis, Studio UI | Runtime / preview execution |
| Granularity | Field + logical operations | Executable units (kernels) |
| Metadata | Rich (labels, AI, docs) | Minimal (ids, hashes, costs) |
| Mutability | Edited in Studio | Immutable per CRB version |
| Cross-module | Visible with warnings | Only explicit pinned imports |

---

## 7. Execution Graph

The **Execution Graph** is the **compiled, minimized** graph produced at `mdpCompileService.buildCrb()` time.

### 7.1 Executable unit (kernel)

```
ExecutionKernel {
  kernelId: string
  ownerFieldId: string
  ir: ComputationIrNode
  inputSlots: SlotBinding[]
  outputSlot: SlotBinding
  strategy: "lazy" | "eager" | "batch" | "parallel"
  cacheKeyTemplate: string
  costTier: "O(1)" | "O(n)" | "O(n log n)" | "O cross-entity"
  invalidationTags: string[]
}
```

### 7.2 Compilation pipeline

```
ComputationDocument[]
      ↓ validate (Type + Dependency)
Computation Graph (authoring)
      ↓ optimize (Optimizer passes)
      ↓ lower aggregates/lookups to kernels
Execution Graph
      ↓ serialize
CRB fields[].computationIr + dependencyGraph.computation
```

Runtime Bridge hydrates kernels into Evaluation Engine batch requests — **no re-parse in production**.

---

## 8. Evaluation order

Official order is computed by **Dependency Engine topological sort** + **Computation Engine scheduling policies**.

### 8.1 Default algorithm

1. **Validate** graph acyclicity (or apply circular strategy §18).
2. **Partition** into layers (parallel-safe groups).
3. **Within layer:** order by `costTier` ascending (cheap first) unless `mustRunBefore` overrides.
4. **Execute** via Evaluation Engine scheduler:
   - Leaf expressions → single-kernel lazy
   - Same-record dependents → incremental batch
   - Cross-entity aggregates → deferred batch (or async worker future)

### 8.2 Triggers

| Trigger | Strategy |
|---------|----------|
| Field save (record) | Incremental — recompute affected subgraph only |
| Preview (Studio) | Lazy — compute on visible fields + dependents |
| Bulk import | Batch — partitioned by entity |
| Publish compile | Full graph validation + cost report |
| Pin / deploy | No execution — graph validation only |

---

## 9. Dependency resolution

| Concern | Owner |
|---------|-------|
| Variable-level deps | Expression Engine → Dependency Engine |
| Field-level deps | Computation Graph builder |
| Cross-entity deps | Relationship Dictionary + explicit `CrossEntityRef` |
| Transitive closure | Dependency Engine `resolveTransitive()` |
| Impact analysis | Dependency Engine Impact Analyzer |
| Safe rename/delete | Dependency Engine + Computation metadata |

**Rule:** Computation Engine **never** implements its own cycle detection or topological sort.

---

## 10. Evaluation strategies

Delegated to **Evaluation Engine** strategies; Computation Engine selects strategy per kernel.

| Strategy | Use case | Scale note |
|----------|----------|------------|
| **Lazy evaluation** | Preview, on-demand UI fields | Default; cache memoizes |
| **Incremental evaluation** | Single-record edit | Invalidates minimal tag set |
| **Batch evaluation** | List views, imports, reports | Partitioned batches (e.g. 500–5000 rows) |
| **Parallel evaluation** | Independent kernels in same layer | Worker pool / WebWorker (client) / worker queue (server future) |

### 10.1 Parallel evaluation (future-ready)

- Execution Graph layers define **parallel-safe sets**.
- Kernels declare `pure: boolean` — only pure kernels parallelize by default.
- Cross-entity aggregates default to **sequential** until distributed coordinator exists.

---

## 11. Cache layers

Multi-tier cache model — all keys include `{tenantId, moduleId, crbVersionHash, kernelId, inputFingerprint}`.

| Layer | Scope | Invalidation |
|-------|-------|--------------|
| **L1 — Session cache** | Studio preview session | Session close / field edit |
| **L2 — Evaluation cache** | Evaluation Engine (in-memory) | `invalidateCache(ownerId)` |
| **L3 — Record cache** | Runtime per-record field values | Record mutation tags |
| **L4 — Aggregate cache** | Cross-record rollup results | Relation child changes + TTL |
| **L5 — Distributed cache** (future) | Redis / edge | Tag broadcast |

**Rule:** Cache **never** bypasses tenant or version scope.

---

## 12. Context model

Three official contexts — **never mix** scopes.

### 12.1 Studio Context

| Field | Purpose |
|-------|---------|
| `clienteId`, `userId`, `moduleId`, `designerId` | Auth + scope |
| `draftVersionId` | MDP draft being edited |
| `previewRecordId?` | Sample record for preview |
| `diagnosticsLevel` | `authoring` \| `verbose` |
| `simulationMode` | Allow unresolved cross-entity with mock data |

Used by: Field Studio Property Grid, Formula Builder preview, diagnostics panel.

### 12.2 Runtime Context

| Field | Purpose |
|-------|---------|
| `clienteId`, `empresaId?`, `userId` | Tenant + RBAC |
| `crbVersionHash`, `moduleId` | Pinned compile |
| `record`, `recordCollection?` | Data bindings |
| `trigger` | `save` \| `load` \| `batch` \| `api` |
| `diagnosticsLevel` | `production` \| `support` |

Used by: Foundation field hydration, save pipeline, future server-side batch workers.

### 12.3 Computation Context

Execution-local facade passed to Evaluation Pipeline:

```
ComputationContext {
  studio?: StudioContextSlice
  runtime?: RuntimeContextSlice
  variables: Map<string, TypedValue>
  functions: FunctionCatalogSlice
  typeSystem: TypeSystemHandle
  cache: CacheHandle
  diagnostics: DiagnosticsSink
  profiler: ProfilerHandle
  abortSignal?: AbortSignal
}
```

**Rule:** Kernels receive `ComputationContext` — not raw Prisma or DOM.

---

## 13. Formula model

| Concept | Definition |
|---------|------------|
| **Formula** | Human-facing syntax stored as `expressionSource` |
| **Compiled formula** | Expression/Computation AST + IR |
| **Formula binding** | Link from MDP field → Computation Document |
| **Formula scope** | Record-local unless aggregate/lookup node present |

Future **Formula Builder** edits the same Computation Document — no parallel formula model.

Official function categories: **Math**, **Text**, **Date**, **Logical**, **Aggregate**, **Lookup**, **Collection**, **Custom (Marketplace)**.

---

## 14. Field computation models

### 14.1 Computed fields

| Attribute | Value |
|-----------|-------|
| MDP `source` | `computed` |
| Mutability | **Read-only** at runtime |
| Evaluation | On read + on dependency change (incremental) |
| Storage | May cache in materialized column (future) — default virtual |

### 14.2 Derived fields

| Attribute | Value |
|-----------|-------|
| MDP `source` | `derived` |
| Mutability | Write-time compute → stored like native |
| Evaluation | **On save** before persistence |
| Validation | Type System + Validation Pipeline |

### 14.3 Aggregations

Cross-record reductions (`Sum`, `Count`, …) over related records or filtered sets.

- Declared via Computation AST aggregate nodes.
- Default execution: **batch** with relation-scoped query plan (domain repository — L1, not Foundation).
- **Never** embed raw SQL in AST — use registered aggregate providers.

### 14.4 Rollups

Hierarchical aggregate along MDP-3 relationship (e.g. parent account ← child lines).

- Requires explicit relationship id + rollup policy (recompute on child change).
- Cost tier: `O cross-entity` — Cost Analyzer warns in Studio.

### 14.5 Lookup fields

Resolve value from related entity via match key (similar to VLOOKUP / relational pick).

- `Lookup` node binds to Relationship Dictionary.
- Cardinality enforced by Type System (scalar vs collection).

### 14.6 Calculated collections

Virtual child collections computed from expressions (e.g. filtered related rows).

- Read-only at runtime; shape defined in Computation Document.
- Pagination mandatory for large sets — no unbounded array materialization in client memory.

---

## 15. Validation pipeline

Official ordered pipeline — abort on hard failure.

| Stage | Owner | Checks |
|-------|-------|--------|
| 1. Structural | Computation Engine | Schema version, required fields |
| 2. Parse | Expression Engine | Syntax → AST |
| 3. Type | Type System | Inference + compatibility |
| 4. Dependency | Dependency Engine | Graph build + cycles |
| 5. Semantic | Computation Engine | Aggregate/lookup bindings exist |
| 6. Cost | Cost Analyzer | Tier + budget warnings |
| 7. Policy | Studio Governance | Forbidden patterns (Foundation imports, etc.) |
| 8. MDP sync | Field Studio adapter | Field definition consistency |

Output: `ValidationReport { ok, errors[], warnings[], costEstimate, diagnostics }`

---

## 16. Diagnostics

| Level | Audience | Content |
|-------|----------|---------|
| **Authoring** | Studio user | Friendly messages + field links |
| **Verbose** | Implementer | Kernel id, AST path, dependency chain |
| **Production** | Support | Error code + correlation id — no stack in UI |
| **Support** | Operator | Full profiler trace when flag enabled |

Standard error codes: `COMP_CYCLE`, `COMP_TYPE_MISMATCH`, `COMP_LOOKUP_UNRESOLVED`, `COMP_AGGREGATE_TIMEOUT`, `COMP_COST_EXCEEDED`, `COMP_VERSION_DRIFT`.

Diagnostics integrate with Evaluation Engine `evaluationDiagnostics.js` — single sink.

---

## 17. Optimizer

Official compile-time passes (ordered):

| Pass | Action |
|------|--------|
| **Constant fold** | Evaluate literal subtrees |
| **Dead kernel elimination** | Remove unreachable nodes |
| **Common subexpression elimination** | Share identical AST subtrees |
| **Aggregate pushdown** | Move aggregates to lowest valid layer |
| **Cache key normalization** | Stable cache templates |
| **Parallel layer tagging** | Mark independent kernels |

Optimizer runs at **compile** (CRB build), not on every keystroke. Studio preview may run lightweight subset.

---

## 18. Cost analyzer

Estimates computation cost **before publish**.

| Tier | Criteria | Studio UX |
|------|----------|-----------|
| **O(1)** | Record-local expression | Green |
| **O(n)** | Same-record collection op | Yellow if n unbounded |
| **O(n log n)** | Sort/distinct aggregate | Yellow |
| **O cross-entity** | Rollup, cross-module lookup | Orange — requires acknowledgment |
| **O prohibited** | Unbounded cross-tenant | Red — block publish |

Cost metadata stored in `ComputationMetadata` for AI and Marketplace review.

---

## 19. Performance profiler

| Metric | Captured |
|--------|----------|
| Kernel wall time | Per execution |
| Cache hit rate | L1–L2 |
| Batch size | Records processed |
| Parallelism | Workers used |
| Memory estimate | Large collection ops |

Profiler feeds **Program 6 Observability** (future) via hooks — no hard dependency now.

Studio preview shows simplified flame graph for authors when `diagnosticsLevel: verbose`.

---

## 20. Circular dependency strategy

| Scenario | Strategy |
|----------|----------|
| **Authoring cycle detected** | **Block save** — show cycle path in Studio |
| **Soft cycle (coalesce/defaults)** | Allow only if broken by `Try`/`Coalesce` official pattern — validator decides |
| **Runtime incremental cycle** | Incremental scheduler detects re-entry → abort kernel + `COMP_CYCLE` |
| **Cross-field mutual recursion** | Forbidden in v1 — explicit error |
| **Future iterative solvers** | Extension point — new `solverStrategy` on document (not v1) |

**Binding decision (take now):** Mutual recursion between computed fields is **forbidden in v1**. Prevents undefined evaluation order at scale.

---

## 21. Versioning

| Artifact | Version policy |
|----------|----------------|
| Computation Document | `revision` monotonic per field |
| AST / IR | Major schema in version constant |
| CRB embed | `computationIrVersion` + content hash |
| Function Catalog | Semver per function; Marketplace functions pin min platform |

Publish flow validates **backward compatibility** — breaking IR change requires migration script (§22).

---

## 22. Migration strategy

| Change type | Migration |
|-------------|-----------|
| Additive AST node | Minor IR bump — old kernels still run |
| New aggregate provider | Register in catalog — no migration |
| Breaking AST rename | Major bump + `migrateComputationDocument_v1_v2` |
| MDP field source change | Domain migration script (backend) — separate from Studio |
| CRB recompile | Automatic on publish — no manual step |

Migration scripts live in `backend/scripts/migrations/computation/` (future) — **not** in Foundation.

Program 2.3.6 implements **v1 only** — migration framework stubbed, not full history migration.

---

## 23. AI extension points

| Extension | Mechanism | Constraints |
|-----------|-----------|-------------|
| Suggest formula | Reads Computation Metadata + Type context | Proposes `expressionSource` — user confirms |
| Explain computation | Reads Dependency + Impact metadata | No execution |
| Optimize formula | Rewrites AST via official Optimizer | Must pass Validation Pipeline |
| Register AI function | Function Catalog `origin: ai` | Sandboxed — no side effects unless marked |
| Agent batch recompute | **Forbidden** without Runtime Context RBAC | Program 4 |

AI **never** writes directly to MDP — only through Studio APIs and validated documents.

---

## 24. Marketplace extension points

| Extension | Mechanism | Constraints |
|-----------|-----------|-------------|
| Custom functions | Function Catalog `origin: marketplace` | P17 — declarative only |
| Custom aggregate providers | Registered provider id in AST | Certified packages only |
| Computation templates | `.makpkg` registry entries | Install via Marketplace flow (Program 5) |
| Third-party kernels | **Forbidden in v1** | Future — WASM sandbox discussion |

Marketplace functions declare **compatibility range** against `mak-studio-computation-v1`.

---

## 25. Module and path conventions (implementation guide for 2.3.6)

| Path | Content |
|------|---------|
| `src/studio/computation/` | Engine root (future) |
| `src/studio/computation/document/` | Computation Document contracts |
| `src/studio/computation/ast/` | AST nodes + factory |
| `src/studio/computation/graph/` | Computation + Execution graph builders |
| `src/studio/computation/optimizer/` | Optimizer passes |
| `src/studio/computation/cost/` | Cost Analyzer |
| `src/studio/computation/context/` | Studio / Runtime / Computation contexts |
| `src/studio/computation/fieldModels/` | Computed, Derived, Aggregate, … |
| `src/studio/designers/field/computation/` | Field Studio adapter |
| `scripts/gate-studio-computation-engine.mjs` | Gate G302 |

Exported from `src/studio/index.js` — same pattern as Evaluation Engine.

---

## 26. Relationship to Program 2.3.6 scope

| 2.3.6 delivers (implementation) | Architecture defines (this doc) |
|--------------------------------|----------------------------------|
| Computed + Derived fields (empresas pilot) | Full field model catalog |
| G302 gate | All structural contracts |
| Expression + Evaluation integration | All strategies (lazy/incremental first) |
| MDP sync for `source: computed\|derived` | Aggregations, rollups, lookups — **spec only** |
| Basic diagnostics | Full profiler + cost tiers — incremental |

Programs after 2.3.6 extend the same engine — **no second computation stack**.

---

## 27. Mandatory architecture certification

### 1. Esta arquitetura suporta milhões de cálculos?

**Sim — com ressalvas de implementação.**

The design targets **millions of kernel executions per day** via incremental evaluation, batch partitioning, cache layers (§11), and future **distributed workers** executing Execution Graph layers. Cross-entity aggregates require async batch tier (L4 cache + worker queue) at extreme scale — architecture reserves extension points; v1 pilot stays synchronous incremental on record scope.

### 2. Suporta dezenas de milhares de campos?

**Sim.**

Computation Graphs are **module-scoped** by default (C4). A tenant with 10K+ fields across hundreds of modules compiles **separate Execution Graphs per module** — never one monolithic graph. Lazy evaluation + cache tags prevent full-graph recomputation on each read.

### 3. Suporta centenas de módulos?

**Sim.**

Each module carries independent CRB computation IR. Cross-module dependencies require **explicit pins** (MDP-5 environment pin + relationship import). Compilation and validation are **O(module fields)**, not O(platform fields).

### 4. Suporta execução distribuída no futuro?

**Sim.**

Execution Graph **layers** map to worker tasks; kernels declare purity and cost tier. L5 distributed cache + worker protocol is a forward-compatible extension — no change to Computation Document or IR versioning required. Parallel evaluation (§10.1) is the client-side subset.

### 5. Evita retrabalho nas próximas fases?

**Sim.**

Formula Builder, Dashboard Studio, Automation triggers, and Marketplace functions all consume the same **Computation Document → Execution Graph → Evaluation** path. Expression, Dependency, Type, and Evaluation engines remain SSOT — Computation Engine orchestrates without forking.

### 6. Existe algum ponto fraco?

**Sim — conhecidos e mitigados:**

| Weak point | Mitigation |
|------------|------------|
| Cross-entity rollups at huge cardinality | Cost Analyzer + async batch tier; materialized cache L4 |
| v1 forbids mutual recursion | May limit certain financial models — future solver extension |
| Client-side parallel limits | Heavy aggregates must move to server workers |
| CRB recompile on large modules | Optimizer at compile time; publish validation async |
| Marketplace function quality | Certification gate (Program 5) |

### 7. Existe alguma decisão que deve ser tomada agora para evitar quebra futura?

**Sim — binding before 2.3.6 code:**

| # | Decision | Rationale |
|---|----------|-----------|
| **D-054.1** | Adopt version constants in §3 **unchanged** | IR stability for CRB |
| **D-054.2** | Authoring graph ≠ Execution graph (§6.3) | Prevents Studio metadata in hot path |
| **D-054.3** | Forbid mutual recursion v1 (§20) | Deterministic order |
| **D-054.4** | No raw SQL / Prisma in AST (§14.3) | Provider registry only |
| **D-054.5** | Module-scoped graphs default (C4) | Scale to hundreds of modules |
| **D-054.6** | Three contexts — Studio / Runtime / Computation (§12) | Prevents auth and scope leaks |
| **D-054.7** | All execution via Evaluation Engine (C1) | No parallel evaluators in designers |

---

## 28. Document maintenance

| Event | Action |
|-------|--------|
| Program 2.3.6 certification | Update §26 scope table |
| New computation node type | Add to §5 + migration note |
| Distributed workers launched | Expand §10.1 + §11 L5 |
| Breaking IR change | Major version + DECISIONS entry |

**Amendment authority:** D-register entry required for topology changes; additive nodes follow minor version policy.

---

*Program 3.0.5 — Studio Computation Architecture — permanent reference. Program 2.3.6 implementation begins after merge.*
