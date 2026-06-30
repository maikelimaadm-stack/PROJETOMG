# Technical Debt Master Register — Program 3.8.6

**Date:** 2026-06-30  
**Mission:** Audit 10 — Consolidated debt across all categories  
**Sources:** [TECH-DEBT.md](./TECH-DEBT.md), [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md), Programs 3.8.5/3.8.6 audits

---

## 1. Register Structure

Each item: **ID · Description · Impact · Risk · Priority · Cause · Consequence · Category**

Priority: P0–P3  
Category: Code · Architecture · Documentation · Governance · Runtime · UX · Parametrização · Performance · Scalability · Marketplace · Intelligence

---

## 2. P0 — Critical

### EPDA-P0-01 — Formula Builder exposes technical expression UI

| Field | Value |
|-------|-------|
| **Impact** | Users see/edit raw expressions — violates Technology Transparency (BAAP) |
| **Risk** | EOS vision unreachable for business users |
| **Cause** | Formula Builder built before Business Asset First |
| **Consequence** | Consulting dependency persists |
| **Category** | UX · Implementation |
| **Evidence** | `FormulaEditor.jsx` `expressionSource` |

### EPDA-P0-02 — Three parallel formula evaluation paths

| Field | Value |
|-------|-------|
| **Impact** | Semantic drift between preview, Studio, and production |
| **Risk** | Incorrect calculations in production |
| **Cause** | Legacy campoEngine + V17 bridge + Studio computation |
| **Consequence** | Cannot certify Business Computed Field end-to-end |
| **Category** | Runtime · Architecture |
| **Evidence** | `FORMULA-RUNTIME-UNIFICATION-PLAN.md`, `campoEngine.jsx`, `runMakFormulaEvaluation.js` |

### EPDA-P0-03 — Single Business Asset vs universal vision

| Field | Value |
|-------|-------|
| **Impact** | Platform remains module-centric ERP |
| **Risk** | Architecture pattern not proven at scale |
| **Cause** | Program 3.8 scope = Computed Field only |
| **Consequence** | Workflow/Dashboard/etc. may repeat one-off patterns |
| **Category** | Strategic Vision · Implementation |
| **Evidence** | G306 only; 9 extension points `implemented: false` |

### EPDA-P0-04 — Business Language / Dual Authoring absent from product UI

| Field | Value |
|-------|-------|
| **Impact** | Users cannot author via business language |
| **Risk** | D-065 architecture unused |
| **Cause** | Architecture-first sequencing |
| **Consequence** | "Building systems" not replaced by "business solutions" |
| **Category** | UX · Strategic Vision |
| **Evidence** | D-065 docs; no product shell |

### EPDA-P0-05 — Intelligence layer 0% code

| Field | Value |
|-------|-------|
| **Impact** | Continuous Improvement not operable |
| **Risk** | EOS value proposition unmet |
| **Cause** | D-060 docs-only program |
| **Consequence** | No learning, recommendations, or evolution |
| **Category** | Intelligence · Strategic Vision |
| **Evidence** | ENTERPRISE-INTELLIGENCE-AUDIT |

### EPDA-P0-06 — Empresas cadastro bypasses Intent/Asset pipeline

| Field | Value |
|-------|-------|
| **Impact** | Production path contradicts Business Asset First |
| **Risk** | Two permanent authoring paradigms |
| **Cause** | Legacy ModeloBase1 + PAGEMP |
| **Consequence** | Runtime never consumes Business Computed Field projections for empresas |
| **Category** | Architecture · Runtime |
| **Evidence** | USER-JOURNEY-DEEP-AUDIT |

---

## 3. P1 — High

| ID | Description | Impact | Risk | Cause | Consequence | Category |
|----|-------------|--------|------|-------|-------------|----------|
| TD-003 | framework/cadastro legacy 61 files | Dual maintenance | Blocks abstraction | Incomplete promotion | Confusion | Code |
| TD-004 | Empresas nomenclature in generic layer | Cognitive coupling | New module errors | Historical naming | SSOT drift | Code |
| EPDA-P1-01 | CRB empresas-only pilot | Single-module runtime | Scale blocked | Phased rollout | Other modules on legacy | Runtime |
| EPDA-P1-02 | Intent 8 extension kinds stub | Resolver incomplete | Workflow may duplicate patterns | Scope sequencing | Rework | Implementation |
| EPDA-P1-03 | Metadata stubs imply completeness | False maturity | Wrong priorities | Forward-looking contracts | Misleading PMI | Documentation |
| AD-P1-02 | No gate for Foundation formula evaluators | Untested legacy path | Production bugs | G298 scope = Studio only | Silent failures | Governance |
| AD-P1-05 | Program 3.x absent from ROADMAP | Planning drift | Wrong sequencing | ROADMAP lag | Contributor confusion | Governance |
| PARAM-C03 | derivationKind catalog mismatch | Capability checks fail | Wrong derivations | Catalog not synced | Silent bugs | Parametrização |
| PARAM-C04 | CRB cache vs live MDP | Stale metadata | Wrong runtime behavior | Committed cache | Prod/CI divergence | Runtime |

---

## 4. P2 — Medium

| ID | Description | Category |
|----|-------------|----------|
| TD-005 | Dual DDL Prisma + ensureSchema | Parametrização |
| TD-006 | UI monoliths (MakCadastroTable 2407 LOC) | Code · Maintainability |
| TD-007 | Dual design system CSS | UX |
| TD-010 | No backend event bus | Architecture |
| AD-P2-01 | Enterprise DNA vs Business DNA overlap | Documentation |
| AD-P2-05 | Dual Computation Engine domainId | Architecture |
| AD-P2-14 | ROADMAP Program 3 = Marketplace collision | Governance |
| BO-06 | Event contracts not emitted | Implementation |
| BA-05 | Process vs Workflow terminology | Documentation |

---

## 5. P3 — Low

| ID | Description | Category |
|----|-------------|----------|
| TD-009 | Typecheck noise shadcn | Code |
| TD-011 | Deprecated aliases 25+ | Maintainability |
| TD-012 | CADCPS flat backend structure | Code |
| TD-015 | Subordinate docs may drift | Documentation |
| AD-P3-01–06 | Studio naming/hygiene items | Maintainability |

---

## 6. Debt by Category Summary

| Category | P0 | P1 | P2 | P3 | Total |
|----------|----|----|----|----|-------|
| Architecture | 2 | 2 | 3 | 0 | 7 |
| Implementation | 2 | 2 | 2 | 0 | 6 |
| Documentation | 0 | 1 | 4 | 2 | 7 |
| Governance | 0 | 2 | 1 | 1 | 4 |
| Runtime | 2 | 2 | 1 | 0 | 5 |
| UX | 2 | 0 | 1 | 0 | 3 |
| Parametrização | 0 | 1 | 2 | 0 | 3 |
| Strategic Vision | 2 | 0 | 0 | 0 | 2 |
| Intelligence | 1 | 0 | 0 | 0 | 1 |
| Code | 0 | 1 | 2 | 3 | 6 |
| Performance | 0 | 0 | 1 | 0 | 1 |
| Scalability | 0 | 1 | 0 | 0 | 1 |
| Marketplace | 0 | 0 | 0 | 0 | 0 |

---

## 7. Resolved (Reference)

| ID | Resolution | Date |
|----|------------|------|
| AD-P0-01–05 | D-062 remediation plans/docs | 2026-06-30 |
| TD-001, TD-002, TD-008, TD-013, TD-014 | Various IFM missions | 2026-06-28 |

---

## 8. Mandatory Decisions Before Scale

1. **Assign Program ID** for Runtime Formula Unification (EPDA-P0-02)
2. **Assign Program ID** for Business Language UX Track (EPDA-P0-04)
3. **Define convergence plan** for empresas legacy path → Business Asset (EPDA-P0-06)
4. **Sync ROADMAP** with PROGRAM-REGISTRY (AD-P1-05)

---

*This register supersedes breadth of individual audits for debt tracking. Update TECH-DEBT.md and ARCHITECTURE-DEBT-REGISTER.md when items resolve.*
