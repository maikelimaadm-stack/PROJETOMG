# Business Object Audit — Program 3.8.6

**Date:** 2026-06-30  
**Evidence:** `docs/architecture/BUSINESS-OBJECT-MODEL.md`, `src/studio/intent/contracts/`, `src/studio/business/contracts/`

---

## 1. Business Object Model Overview

The BOM defines typed business entities with metadata facets, lifecycle, and relationships. **Implemented in code:** partial — Computed Field asset + Intent contracts.

---

## 2. Object Inventory

### 2.1 Business Intent

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Capture author intent in business language before derivation |
| **Lifecycle** | draft → parsed → resolved → archived |
| **Metadata** | `BusinessIntentContract`, parse tree, source text |
| **Capabilities** | Parse, derive (2 kinds: computedField, layoutField) |
| **Policies** | Resolver policies in `resolverPolicies.js` |
| **Contracts** | `businessIntentContracts.js` |
| **Versioning** | Via Studio versioning (generic) |
| **Dependencies** | Business Language parser |
| **Relationships** | → Business Computed Field, → Layout config |
| **Events** | intent.created, intent.resolved (contractual, not emitted) |
| **Ownership** | Tenant + author |
| **Marketplace** | Pl |
| **Knowledge** | Pl |
| **Memory** | Pl |
| **Lineage** | `businessComputedLineage.js` when derived |
| **Status** | **Partial** — 2 derivation kinds; 8 extension points `implemented: false` |
| **Example** | "Quero um campo calculado Total = Preço × Quantidade" → resolver → Computed Field asset |

### 2.2 Business Computed Field (Asset / Object)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Declarative computed field with full metadata |
| **Lifecycle** | draft → validated → published → active → deprecated → archived |
| **Metadata** | 15+ facets (Field, Document, Dependency, Runtime, Publishing, etc.) |
| **Capabilities** | Validate, project, explain, version, audit |
| **Policies** | `businessComputedPolicies.js` |
| **Contracts** | `businessComputedContracts.js`, G306 |
| **Versioning** | `businessComputedVersioning.js` |
| **Dependencies** | Formula AST, field refs, document context |
| **Relationships** | Belongs to Document; depends on Fields |
| **Events** | asset.created, asset.projected (contractual) |
| **Ownership** | `businessComputedOwnership.js` |
| **Marketplace** | Metadata only |
| **Knowledge** | Metadata only |
| **Memory** | Pl |
| **Lineage** | `businessComputedLineage.js` |
| **Status** | **Complete in Studio**; Runtime projection partial |
| **Example** | See BUSINESS-ASSET-AUDIT §2.1 |

### 2.3 Business Document (Object — planned)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Schema of a business entity (fields, rules, layout) |
| **Lifecycle** | Pl — BOM §3.1 |
| **Metadata** | DocumentMetadata facet exists as part of Computed Field |
| **Status** | **Not standalone object** — empresa uses PAGEMP + Prisma |
| **Example (today)** | PAGEMP JSON + `empresa` Prisma model — not BOM object |

### 2.4 Business Workflow (Object — planned)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | State machine for business process |
| **Status** | **Planned** Program 3.9 |
| **Evidence** | BOM §3.2, no `src/studio/business/workflow/` |

### 2.5 Business Automation (Object — planned)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Trigger → action rules |
| **Status** | **Planned** |
| **Evidence** | BOM §3.3 |

### 2.6 Business Dashboard (Object — planned)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Composed visualization |
| **Status** | **Planned** |
| **Evidence** | BOM §3.4; legacy dashboard code in cadastro framework |

### 2.7 Business Organization / Tenant

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Multi-tenant boundary |
| **Lifecycle** | Active tenant in Supabase/auth |
| **Metadata** | `cliente`, `empresa` tables |
| **Status** | **Implemented** — backend Prisma, not BOM-modeled |
| **Gap** | Org object not in Studio; admin via direct DB/API |

### 2.8 Business Capability (Gate object)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Certify feature readiness |
| **Lifecycle** | Gate pass/fail in CI |
| **Metadata** | G262–G306 scripts |
| **Status** | **Implemented** as engineering artifact, not user object |

### 2.9 Digital Twin / Digital Organization

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Virtual representation of org |
| **Status** | **Architecture only** — D-057, no code |
| **Evidence** | Vision docs, 0% implementation |

### 2.10 Runtime Projection (Object)

| Dimension | Detail |
|-----------|--------|
| **Responsibility** | Executable form of asset for Runtime |
| **Lifecycle** | Generated on publish/sync |
| **Metadata** | `RuntimeProjectionMetadata.js` |
| **Status** | **Partial** — projection builder exists; Runtime doesn't consume uniformly |

---

## 3. Relationship Graph (Evidence-Based)

```
Business Language (docs + partial parser)
    └── Business Intent (partial)
            └── Resolver (2 kinds)
                    ├── Business Computed Field (complete Studio)
                    │       └── Runtime Projection (partial wire)
                    └── Layout Field config (not BAAP asset)

PAGEMP / Cadastro (legacy path, parallel)
    └── Prisma models (empresa, etc.)
    └── MakCadastroForm (Runtime)
    └── campoEngine (legacy formula)
```

**Circular dependency risk:** None detected between Studio packages.  
**Coupling:** Resolver → Business → Computation engines (one-way).  
**Bypass:** Empresas cadastro bypasses Intent/Asset entirely (P0).

---

## 4. Findings

| ID | Finding | Severity | Class |
|----|---------|----------|-------|
| BO-01 | BOM defines 10+ objects; 1 fully implemented in Studio | P0 | Implementação |
| BO-02 | Tenant/Org implemented as DB rows, not Business Objects | P1 | Arquitetura |
| BO-03 | Runtime Projection not consumed uniformly | P0 | Runtime |
| BO-04 | Intent extension points documented but not implemented | P1 | Implementação |
| BO-05 | Legacy PAG path parallel to BOM — no convergence plan in code | P0 | Arquitetura |
| BO-06 | Event contracts defined but not emitted to event bus | P2 | Implementação |

---

## 5. Utilization Example — Ideal vs Actual

**Ideal (Vision):**
```
Intent → Resolver → Computed Field Asset → Projection → Runtime → UI field "Total"
```

**Actual (Empresas today):**
```
PAGEMP config → MakCadastroForm → POST /api/empresas → Prisma
(Custom field formula: campoEngine.jsx directly)
```

**Misalignment location:** Entire cadastro stack for empresas — **P0**.
