# MAK Engineering Principles

**Status:** Official — Permanent engineering doctrine  
**Version:** 1.0.0  
**Effective date:** 2026-06-29  
**Decision:** D-029  
**Mission:** Engineering Principles — permanent rules for all implementation

---

## 1. Purpose

This document defines **permanent engineering principles** for MAK Gestão. Every implementation — human or AI — must comply with these principles in addition to the [Constitution](../constitution/00-MAK-CONSTITUTION.md) and [MAK 2035 Master Architecture](./MAK-2035-MASTER-ARCHITECTURE.md).

Principles here are **binding for new work**. Existing transitional debt (documented in [TECH-DEBT.md](../engineering/TECH-DEBT.md)) is acknowledged; new code must not increase that debt.

---

## 2. Document Hierarchy

When resolving conflicts, apply this order:

```
Constitution (docs/constitution/)
        ↓
Master Architecture (MAK-2035-MASTER-ARCHITECTURE.md)
        ↓
Engineering Principles (this document)
        ↓
Architecture Specifications (e.g. MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md)
        ↓
Engineering Docs (CURRENT-STATE, ROADMAP, DECISIONS, PMI, PIP, …)
        ↓
Implementation (code, schema, APIs)
```

**Amendment:** Changes to this document require a Decision register entry (D-0XX). Individual principles may be clarified in ENGINEERING-JOURNAL; topology-level changes require D-register.

**Related gates:** [D-028 long-term impact analysis](../engineering/DECISIONS.md#d-028--engineering-governance-evolution) (PIR mandatory) · [PIP Phase 1](../engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md)

---

## 3. The Eighteen Principles

### P1 — Architecture First

**Never create code without defined architecture.**

| Rule | Detail |
|------|--------|
| Before code | Map to Master Architecture layer (L0–L7); document in mission plan or PIR |
| Before schema | Align with MDP spec or register D-entry for new persisted types |
| Before UI | Confirm ModeloBase1 / Studio path — no ad-hoc structural UI |
| Stop condition | If layer or ownership is unclear → architectural review before implementation |

**Evidence today:** PIP 10-phase lifecycle; gates G31–G142 enforce structural rules.

---

### P2 — Single Source of Truth

**Never duplicate information. Every datum has exactly one owner.**

| SSOT domain | Owner |
|-------------|-------|
| Structural UI | ModeloBase1 + framework/mak (L2) |
| Platform definitions | MAK DATA PLATFORM — Entity, Data, Relationship, Metadata Registry (L4) |
| Published runtime config | `mdp_compiled_bundle` (CRB) per pinned version |
| Module catalog | `mdp_entity` → export → parallel caches (transitional) |
| Business records | PostgreSQL tenant-scoped tables (L0/L1) |
| Auth / tenant | Platform Core JWT + `cliente_id` (L3) |

**Forbidden:** Parallel metadata in module JS that should live in MDP; duplicate registries without documented transitional status.

**Transitional debt (reduce, do not extend):** `cadastro-modules.registry.json`, `*ModuleMetadata.js` boot caches until Program 1E hydration (D-027).

---

### P3 — Compile, Never Duplicate

**Always compile. Never copy configuration.**

| Rule | Detail |
|------|--------|
| Production path | MDP definitions → `compile(moduleId, version)` → CRB → runtime hydration |
| Preview | Same compile service for draft and published paths |
| Forbidden | Copying layout/field/validation configs between modules by hand |
| Forbidden | Forking engine config into a second registry without compile pipeline |

**Evidence:** `backend/src/modules/mdp/mdpCompileService.js`; Master Architecture §6 boot flow; D-026 MDP-5.

---

### P4 — Foundation Frozen

**Foundation is infrastructure. Changes only through the official process.**

| Component | Path | Change process |
|-----------|------|----------------|
| ModeloBase1 | `src/ModeloBase1/` | Constitution Amendment + gates |
| framework/mak | `src/framework/mak/` | Backward-compatible only; D-001 |
| cadastro-engine | `src/framework/cadastro-engine/` | Same |
| Generator | `scripts/generate-cadastro-module.mjs` | Gate-certified changes |

**Evidence:** `scripts/governance-baseline.json` v10.2; D-001 Foundation Freeze.

---

### P5 — Metadata First

**Whenever possible, behavior originates in MDP — not in code.**

| Prefer MDP | Avoid in module code |
|------------|----------------------|
| Field definitions | Hardcoded field lists in `*Form.constants.js` (migrate to MDP-2) |
| Layouts, validations, formulas | Imperative UI structure |
| Permissions (future) | Hardcoded RBAC branches |
| Integrations (future) | Ad-hoc connector code in modules |

**Studio and generators write MDP.** Modules hold only irreducible domain rules (fiscal logic, pricing engines).

---

### P6 — Backward Compatibility

**Avoid breaking changes. Evolution must preserve compatibility whenever possible.**

| Area | Rule |
|------|------|
| Foundation APIs | Additive changes only unless Amendment Process |
| MDP schemas | Versioned migrations; frozen MDP-1..4 per D-025 |
| CRB format | `crbVersion` field; consumers tolerate unknown keys |
| Public APIs (future) | Deprecation period before removal |
| User preferences | `versao_schema` overlay on published layout |

---

### P7 — Observability by Design

**Every new component must be born ready for logs, metrics, and audit.**

| Requirement | Minimum |
|-------------|---------|
| Logs | Structured context: `cliente_id`, `moduleId`, `requestId` where applicable |
| Metrics | Expose counters/latency hooks for Platform Core observability (1F.3 target) |
| Audit | Mutations on MDP and business data traceable to actor + tenant |
| Health | Register in `/api/health` or domain health endpoint when adding critical services |

**Gap today:** Full APM/tracing = Program 1F.3 — new code must not block adoption (correlation IDs, structured errors).

---

### P8 — Global by Default

**Every implementation must consider locale dimensions — even if not used yet.**

| Dimension | Design requirement |
|-----------|-------------------|
| Idiomas | User-facing strings via MDP label tables or i18n keys — not hardcoded PT-only in shared layers |
| Países | Tenant/country scope in metadata where regulations apply |
| Moedas | Numeric fields declare currency semantics in MDP when monetary |
| Timezone | Store UTC; display with tenant/user TZ |
| Locale | `compile(moduleId, version, locale)` path in MDP spec §10 |

**Runtime i18n infrastructure:** Program 1F.1 — principle applies to **design** now, implementation phased.

---

### P9 — Security by Default

**Every feature is born considering auth, authorization, audit, tenant isolation, and empresa scope.**

| Requirement | Evidence |
|-------------|----------|
| Authentication | JWT Fastify — `backend/src/modules/auth/` |
| Authorization | RBAC CONSULTA/OPERADOR/ADMIN — `cadastroRbac.js` |
| Tenant isolation | `cliente_id` on all operational models |
| Multi-empresa | `PermissaoEmpresa` + `X-Empresa-Id` header |
| Audit | `AuditLog` model; expand coverage with new mutations |
| Default deny | No endpoint without auth unless explicitly public (future public API) |

---

### P10 — Scale by Design

**Every implementation must answer: *How does this work with 100,000 users?***

| Question | Expected design answer |
|----------|------------------------|
| Database | Indexed tenant-scoped queries; no unbounded full scans |
| API | Pagination; rate limits (1F.4 target) |
| Frontend | Virtualization for large lists; lazy engine hydration |
| Publish/compile | Module-scoped CRB; not full-platform compile per request |
| Caching | Explicit cache keys with tenant/version scope |

**Related:** D-028 10-question enterprise gate; Program 1F.4 Scale Platform.

---

### P11 — No Parallel Platforms

**Never create a parallel platform. Everything evolves on Foundation + MDP.**

| Forbidden | Required path |
|-----------|---------------|
| Second UI runtime for cadastro | ModeloBase1 only |
| Second metadata store | MDP L4 only |
| Second config engine pattern | V13–V20 engines + registries |
| Studio as parallel stack | Studio writes MDP; preview uses Foundation compile path |

**Evidence:** Master Architecture §9 resolved conflicts; Constitution doc 08 Do-Not-Do list.

---

### P12 — Everything Versioned

**Every important definition must be versionable.**

| Object | Version mechanism |
|--------|-------------------|
| MDP definitions | `mdp_definition_version` + revision chain (MDP-5) |
| CRB | Immutable `mdp_compiled_bundle` with contentHash |
| Environment | `mdp_environment_pin` (dev/qa/prod) |
| Snapshots | `mdp_snapshot` for offline/marketplace/backup |
| User preferences | `versao_schema` + overlay |
| Foundation | `governance-baseline.json` version |

---

### P13 — API First

**Every platform capability must have an API before UI.**

| Rule | Detail |
|------|--------|
| New MDP surface | REST route under `/api/mdp/*` before Studio designer |
| New business capability | Backend route + OpenAPI consideration before frontend page |
| Studio | Consumes existing MDP APIs — does not invent parallel transport |
| Order | API contract → gate/validate → UI |

**Evidence:** MDP-1..5 implemented API-first; Studio brief consumes introspect/compile/publish.

---

### P14 — Studio Edits Definitions

**Studio never alters Runtime directly.**

| Allowed | Forbidden |
|---------|-----------|
| Read/write MDP registry, dictionaries | Patch Foundation source |
| Draft compile for preview | Hot-patch engine registries in production |
| Publish via MDP-5 | Write to `*ConfigRegistry.js` files |

**Evidence:** IFM-PHASE-2-MAK-STUDIO-BRIEF.md; Master Architecture §L5 rule.

---

### P15 — Runtime Never Edits Metadata

**Runtime only consumes published CRB.**

| Runtime may | Runtime may not |
|-------------|-----------------|
| Hydrate registries from CRB | Persist layout/field changes back to MDP |
| Apply user preference overlays | Mutate published definition version |
| Execute domain business rules | Create parallel metadata in module JS |

**Gap today:** Boot cache still primary until Program 1E — runtime must not **write** metadata regardless.

---

### P16 — AI Never Bypasses Platform Rules

**AI only through official APIs. Never direct database access.**

| Rule | Detail |
|------|--------|
| Context | MDP introspection (`GET /api/mdp/introspect`) — RBAC-scoped |
| Actions | Platform Core CRUD APIs — same auth as human users |
| Forbidden | Raw SQL/Prisma from agent runtime; training on tenant data without contract |
| Audit | All agent actions logged |

**Evidence:** Master Architecture §L6.3; D-009 auth boundaries; Constitution doc 09 AI Rules.

---

### P17 — Marketplace Never Injects Code

**Marketplace publishes definitions — never arbitrary code.**

| Allowed package content | Forbidden |
|-------------------------|-----------|
| MDP snapshot (`.makpkg`) | Executable JS patches to Foundation |
| Themes, modules, integrations as MDP entries | npm packages that override frozen layers without review |
| Signed bundles | Unsigned code injection |

**Evidence:** Master Architecture §L6.1; Compatibility Rule §10.7 compile before run.

---

### P18 — Every Implementation Must Reduce Complexity

**New work must simplify the platform — never increase complexity without justification.**

| Test | Pass criteria |
|------|---------------|
| Lines of structural duplication removed ≥ added | For refactors and promotions |
| New abstractions | Must eliminate ≥2 call sites or register D-entry justification |
| New registry/table | Must replace an existing SSOT — not duplicate |
| Mission close | TECH-DEBT register updated; net complexity trend documented |

**Related:** Constitution Pillar 5 Promotion First; IFM 1B A1 legacy reduction.

---

## 4. Principle Compliance Matrix (Quick Reference)

| # | Principle | Layer | Enforced by |
|---|-----------|-------|-------------|
| P1 | Architecture First | All | PIP PIR, D-028 |
| P2 | SSOT | L2–L4 | G118, G137–G142, D-012 |
| P3 | Compile, never duplicate | L4→L2 | MDP-5, G142 |
| P4 | Foundation Frozen | L2 | D-001, gates G31–G261 |
| P5 | Metadata First | L4 | MDP spec, generator |
| P6 | Backward Compatibility | All | Amendment Process, D-025 |
| P7 | Observability by Design | L3 | 1F.3 (target) |
| P8 | Global by Default | L4/L7 | MDP labels, 1F.1 |
| P9 | Security by Default | L3 | Auth module, tenant schema |
| P10 | Scale by Design | L0–L3 | D-028, 1F.4 |
| P11 | No Parallel Platforms | L2–L5 | Constitution doc 08 |
| P12 | Everything Versioned | L4 | MDP-5 |
| P13 | API First | L3–L4 | MDP routes before Studio |
| P14 | Studio edits definitions | L5 | Studio brief |
| P15 | Runtime consumes CRB | L2 | Program 1E |
| P16 | AI via APIs only | L6 | Master Architecture §6.3 |
| P17 | Marketplace definitions only | L6 | Master Architecture §L6.1 |
| P18 | Reduce complexity | All | Promotion, TECH-DEBT |

---

## 5. Relationship to Constitution Doc 02

[02-ARCHITECTURE-PRINCIPLES.md](../constitution/02-ARCHITECTURE-PRINCIPLES.md) remains the **Constitution-level** summary (metadata-driven cadastro, layers, SSOT). **This document operationalizes and extends** those rules into eighteen permanent engineering principles for the post-MDP, pre-Studio/global era.

No conflict: Constitution = *what*; Engineering Principles = *how to implement consistently*.

---

## 6. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-29 | Initial eighteen principles — D-029 |

---

*Build accordingly. When in doubt, stop and register an architectural review.*
