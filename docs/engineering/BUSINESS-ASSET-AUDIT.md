# Business Asset Audit — Program 3.8.6

**Date:** 2026-06-30  
**Scope:** All Business Assets (implemented + planned)  
**Evidence:** `src/studio/business/`, `MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md`, `BUSINESS-OBJECT-MODEL.md`, `BUSINESS-ASSET-CONTRACTS.md`, `src/studio/intent/`

---

## 1. Universal Lifecycle Matrix (Template)

For each asset, roles are classified: **Implemented (I)**, **Partial (P)**, **Planned (Pl)**, **Not Applicable (N/A)**.

| Role | Actor | Mechanism |
|------|-------|-----------|
| Create | Author | Studio / Intent / Import |
| Edit | Author | Studio designer |
| Reuse | Consumer | Marketplace / clone / template |
| Execute | Runtime | Projection → engine |
| Validate | Studio + Resolver | Gates + contracts |
| Sync | Studio Sync | `studioSync.js` |
| Derive | Resolver | Intent pipeline |
| Version | Studio Versioning | `studioVersioning.js` |
| Explain | Studio Explainability | `studioExplainability.js` |
| Audit | Studio Audit | `studioAudit.js` |
| Register | Governance | PROGRAM-REGISTRY, gates |
| Observe | Diagnostics | `studioDiagnostics.js` |
| Recommend | Intelligence | Planned |
| Publish | Marketplace | Planned |
| Share | Org / tenant | Planned |
| Learn | Evolution | Planned |
| Evolve | Evolution Engine | Planned |
| Archive | Lifecycle | `studioLifecycle.js` |
| Remove | Lifecycle + policy | Soft delete / archive |

---

## 2. Implemented Assets

### 2.1 Business Computed Field

| Dimension | Status | Evidence |
|-----------|--------|----------|
| **Objective** | Derived numeric/text field from formula | `buildBusinessComputedAsset.js`, D-068 |
| **Birth** | Intent Resolver OR Studio Formula Builder | `computedFieldDerivation.js`, `FormulaBuilderDesigner.jsx` |
| **Creator** | Business author (Studio) | Formula Builder |
| **Editor** | Same | Studio |
| **Reuser** | Planned (Marketplace) | `PublishingMetadata` contract only |
| **Executor** | Runtime via projection | `projectFormulaFromComputedField.js` → **partial** (campoEngine still primary) |
| **Validator** | `businessComputedValidation.js`, G306 | 21 gate checks |
| **Synchronizer** | `businessComputedSync.js` | Contract |
| **Deriver** | `computedFieldDerivation.js` | Resolver |
| **Versioner** | `businessComputedVersioning.js` | Contract |
| **Explainer** | `businessComputedExplainability.js` | Contract |
| **Auditor** | `businessComputedAuditTrail.js` | Contract |
| **Registrar** | G306, D-068 | Governance |
| **Observer** | `businessComputedDiagnostics.js` | Contract |
| **Recommender** | Pl | Evolution metadata stub |
| **Publisher** | Pl | `PublishingMetadata` |
| **Sharer** | Pl | — |
| **Learner** | Pl | — |
| **Evolver** | Pl | `EvolutionMetadata` |
| **Archiver** | P | Lifecycle contract |
| **Remover** | P | Lifecycle contract |

**Complete utilization example:**

1. Author opens Formula Builder (`/studio/formula` or embedded).
2. Defines expression `preco * quantidade` with label "Total".
3. `buildBusinessComputedAsset()` produces asset with 15+ metadata facets.
4. Resolver path: Intent "campo calculado total = preço × quantidade" → `computedFieldDerivation` → same asset.
5. `projectFormulaFromComputedField(asset)` → `{ expression, ast, dependencies }`.
6. **Gap:** Runtime empresas still uses `campoEngine.jsx` for custom fields — projection not wired end-to-end.
7. G306 validates contracts at build time.

**Classification:** P1 Implementation — asset complete in Studio; Runtime wiring incomplete.

---

## 3. Planned Assets (Architecture / Docs)

### 3.1 Business Workflow

| Dimension | Status |
|-----------|--------|
| Objective | Multi-step business process with states/transitions |
| Birth | Workflow Studio (Pl 3.9) |
| All lifecycle roles | Pl — `WorkflowMetadata` in BOM only |

**Evidence:** `BUSINESS-OBJECT-MODEL.md` §3.2; Program 3.9 authorized.

### 3.2 Business Automation

| Dimension | Status |
|-----------|--------|
| Objective | Event-triggered actions |
| Birth | Automation Studio (Pl 3.10+) |
| Executor | Runtime event bus (Pl) |

### 3.3 Business Dashboard

| Dimension | Status |
|-----------|--------|
| Objective | Composed KPI views |
| Birth | Dashboard Studio (Pl) |
| Executor | Runtime projection (Pl) |

### 3.4 Business Report

| Dimension | Status |
|-----------|--------|
| Objective | Structured output documents |
| Birth | Report Studio (Pl) |
| Executor | Report engine (Pl) |

### 3.5 Business Integration

| Dimension | Status |
|-----------|--------|
| Objective | External system connectors |
| Birth | Integration Studio (Pl) |
| Executor | Integration runtime (Pl) |

### 3.6 Business AI / Agent

| Dimension | Status |
|-----------|--------|
| Objective | AI-assisted business operations |
| Birth | AI Studio (Pl) |
| Executor | Intelligence layer (0% code) |

### 3.7 Business Document (Asset class)

| Dimension | Status |
|-----------|--------|
| Objective | Structured business document definition |
| Birth | Document Studio (Pl) — distinct from `BusinessDocumentMetadata` facet |
| Note | `businessDocumentMetadata.js` is metadata facet for Computed Field, not standalone asset |

### 3.8 Business Process

| Dimension | Status |
|-----------|--------|
| Objective | End-to-end process definition |
| Birth | Process Studio (Pl) |
| Overlap risk | Workflow vs Process — needs D-decision |

### 3.9 Business Template

| Dimension | Status |
|-----------|--------|
| Objective | Reusable configuration packages |
| Birth | Template Studio / Marketplace (Pl) |

### 3.10 Business Capability (as Asset)

| Dimension | Status |
|-----------|--------|
| Objective | Declarable business capability unit |
| Birth | Capability registry (Pl) |
| Note | Today "capability" = gate script (G262–G306), not user asset |

### 3.11 Business Indicator / KPI

| Dimension | Status |
|-----------|--------|
| Objective | Measurable business metric |
| Birth | Indicator Studio (Pl) |
| Relation | May derive from Computed Field + Dashboard |

### 3.12 Business Form / Layout (Asset elevation)

| Dimension | Status |
|-----------|--------|
| Objective | Elevate PAG/form config to Business Asset |
| Today | `layoutDesigner`, `fieldDesigner` produce config, not BAAP assets |
| Gap | P0 strategic — only Computed Field is asset |

### 3.13 Marketplace Package

| Dimension | Status |
|-----------|--------|
| Objective | Distributable asset bundle |
| Birth | Marketplace (Pl) |
| Evidence | `PublishingMetadata`, `MarketplaceMetadata` contracts on Computed Field only |

---

## 4. Asset Coverage Summary

| Category | Count Implemented | Count Planned | Coverage |
|----------|-------------------|---------------|----------|
| Field类 | 1 | 0 | 100% of field assets |
| Process类 | 0 | 3+ | 0% |
| Analytics类 | 0 | 3+ | 0% |
| Integration类 | 0 | 2+ | 0% |
| Intelligence类 | 0 | 2+ | 0% |
| **Total** | **1** | **12+** | **~8%** |

---

## 5. Cross-Cutting Findings

| ID | Finding | Severity | Class |
|----|---------|----------|-------|
| BA-01 | Only Computed Field implements full BAAP lifecycle | P0 | Visão Estratégica |
| BA-02 | Layout/Field designers not elevated to Business Assets | P0 | Arquitetura |
| BA-03 | Marketplace/Publish metadata contracts exist without runtime | P1 | Implementação |
| BA-04 | Evolution/Learning metadata stubs without Intelligence layer | P1 | Implementação |
| BA-05 | Process vs Workflow terminology overlap undocumented | P2 | Documentação |
| BA-06 | `BusinessDocumentMetadata` naming confusion (facet vs asset) | P2 | Manutenibilidade |

---

## 6. Certification (Asset Scope)

**Will universal Business Asset vision be reached continuing current path?**  
**CONDITIONAL YES** — BAAP + G306 pattern is repeatable; **NO** if only Computed Field is ever implemented.

**Evidence:** D-068, `MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md` (BAAP-0..13), single asset in `src/studio/business/`.
