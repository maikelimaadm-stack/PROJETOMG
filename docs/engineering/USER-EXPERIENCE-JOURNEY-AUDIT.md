# User Experience Journey Audit

**Status:** Official — Strategic audit report  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8.5 — Enterprise Vision Compliance Audit  
**Scope:** End-user journeys as of Program 3.8 · No code

---

## Purpose

Answer: **How does a user actually operate the platform today?** vs **How EOS vision says they should?**

Evidence: `src/modules/empresas`, Studio routes (`/studio/empresas/*`), [MAK-STUDIO-UX-FRAMEWORK.md](../architecture/MAK-STUDIO-UX-FRAMEWORK.md), Program 3.8 Resolver/G306 pipeline (engine-level only).

---

## Scenario: User creates a company from zero

### Today (production path)

| Step | What happens | Vision-aligned? |
|------|--------------|-----------------|
| 1 | User logs into ERP frontend | ✅ |
| 2 | Navigates to **Empresas** cadastro module | ⚠️ Module-centric, not Business Intent |
| 3 | Fills traditional form fields (CNPJ, razão social, …) | ⚠️ Standard ERP — acceptable as **data entry** |
| 4 | Saves via MDP/backend API | ✅ |
| 5 | No Business Intent, no Business Asset created for "empresa" | ❌ vs EOS authoring model |

**Finding UX-P1-01 (P1):** Company creation is **operational cadastro**, not **business authoring**. Acceptable for master data; **does not exercise EOS stack**.

---

## Journey matrix (mandatory questions)

| User action | Today (Program 3.8) | Vision (EOS) | Gap |
|-------------|---------------------|--------------|-----|
| **Create cadastro (empresa)** | Empresas module form | Business Object via Intent optional | P1 |
| **Create field** | Field Studio — visual field designer | Expert: Computed Field asset OR Business First intent | **P0** |
| **Create calculation** | Formula Builder — **expression text** OR Resolver in tests only | Business Language → Intent → Computed Field | **P0** |
| **Create automation** | Not available | Intent → Automation asset | P2 (planned 3.x+) |
| **Create workflow** | Not available | Intent → Workflow asset (3.9 planned) | P2 |
| **Create dashboard** | Not available | Intent → Dashboard asset | P2 |
| **Create report** | Not available | Intent → Report asset | P2 |
| **Create integration** | Not available | Intent → Integration asset | P2 |
| **Create indicator** | Not available | Intent → Indicator asset | P2 |
| **Create IA** | Not available | Intent → IA config asset | P2 |
| **Reuse assets** | No unified asset library UI | Cross-module asset picker | **P1** |
| **Find existing assets** | Module-specific lists; Studio project | Enterprise asset catalog + search | **P1** |
| **Understand change impact** | Limited Studio preview | Explainability + dependency impact | **P1** |
| **Track company evolution** | Audit logs partial | Evolution Engine + Memory | P2 |
| **Receive suggestions** | None | Continuous Improvement engine | P2 |
| **Approve suggestions** | N/A | Human-in-control workflow | P2 |
| **Reject suggestions** | N/A | Audit trail | P2 |
| **Explain decisions** | Computed Field explainability in Resolver result only | Platform-wide explainability | P1 |
| **Consult history** | Backend/audit partial | Enterprise Memory | P2 |
| **Learn platform** | Ad hoc | Progressive Disclosure tiers + guided paths | **P1** |

---

## User persona journeys

### Beginner user

| Aspect | Today | Vision |
|--------|-------|--------|
| Entry | ERP menus + Studio if trained | Business First — describe goal in Portuguese |
| Field/calc | Must open Studio, learn designers | "Quero calcular lucro" → platform proposes Computed Field |
| Technology exposure | **Sees formulas, field types, layout** | **Zero** |
| Finding | **UX-P0-01 (P0)** — Beginner **must** enter technical Studio for calculations |

### Intermediate user

| Aspect | Today | Vision |
|--------|-------|--------|
| Entry | Studio designers + module config | Expert Mode asset picker OR templates |
| Configuration | Property grids, formula tokens | Business Asset settings (business terms) |
| Finding | **UX-P1-02 (P1)** — Intermediate uses **Formula Builder**, not Business Language shell |

### Expert user

| Aspect | Today | Vision |
|--------|-------|--------|
| Entry | Full Studio stack | Expert Mode — choose asset type, still via Intent |
| Deep config | Expression source, computation graphs (internal) | Business Asset detail — **never AST** |
| Finding | **UX-P0-02 (P0)** — Expert still edits `expressionSource` — **developer cognition required**

---

## Technology exposure audit (mandatory)

| Exposure | Beginner | Intermediate | Expert | Vision allowed? |
|----------|----------|--------------|--------|-----------------|
| Think in technology | **YES** (Studio navigation) | **YES** (Formula Builder) | **YES** (expressions) | **NO** |
| Know code | No (unless custom) | No | Possible in extensions | **NO** |
| Know AST | No direct | No direct | No direct | **NO** |
| Know JSON | Layout/field docs internal | Possible export | Possible | **NO** |
| Know SQL | No | No | No | **NO** |

**Verdict:** Technology exposure violates EOS-1..7 and BAAP-3 (Progressive Disclosure) **in calculation and field authoring paths**.

---

## Dual authoring consistency

| Mode | Documented (BAAP-1) | Product UI | Consistent? |
|------|---------------------|------------|-------------|
| Business First | ✅ | ❌ Not shipped | **NO** |
| Expert Mode | ✅ | ⚠️ Studio ≈ expert technical, not asset-type picker | **NO** |

Both modes **converge in architecture** (Intent → Resolver → Asset). **Product offers single technical Studio path** for fields/formulas.

---

## Positive UX alignments

| Area | Evidence |
|------|----------|
| Portuguese business UI in cadastro | Empresas module |
| Studio shell UX framework | G285 — explorers, inspectors, wizards pattern ready |
| Computation preview | Formula Builder uses official Evaluation pipeline |
| No SQL for business user in cadastro | ✅ |

---

## Findings register

| ID | Severity | Finding |
|----|----------|---------|
| UX-P0-01 | **P0** | Beginner cannot create calculation without Formula Studio / expressions |
| UX-P0-02 | **P0** | Expert Mode exposes `expressionSource` — violates Zero Technical Authoring |
| UX-P1-01 | P1 | No Business First entry shell in product |
| UX-P1-02 | P1 | No unified Business Asset library / search |
| UX-P1-03 | P1 | No Progressive Disclosure tiers in UI |
| UX-P1-04 | P1 | Explainability not surfaced to user (engine-only) |
| UX-P2-01 | P2 | No suggestion / approve / reject UX (Continuous Improvement) |
| UX-P2-02 | P2 | No onboarding journey tied to BAAP principles |
| UX-P3-01 | P3 | Studio routes not branded as "Business Asset editing" |

---

## Answers (journey certification)

| # | Question | Answer |
|---|----------|--------|
| 3 | Operate without technical knowledge? | **NO** — for fields/calculations |
| 4 | Start simple, evolve naturally? | **NOT YET** |
| 5 | Dual modes consistent? | **ARCHITECTURE YES · UX NO** |

---

*Cross-ref: [BUSINESS-AUTHORING-AUDIT.md](./BUSINESS-AUTHORING-AUDIT.md) · [ENTERPRISE-VISION-COMPLIANCE-AUDIT.md](./ENTERPRISE-VISION-COMPLIANCE-AUDIT.md)*
