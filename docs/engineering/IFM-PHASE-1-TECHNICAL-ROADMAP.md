# IFM Phase 1 — Official Technical Roadmap (Replanned)

**Mission:** IFM Phase 1 — Replanejamento Técnico Oficial  
**Date:** 2026-06-28  
**Method:** Code-only audit post-baseline recovery (`main` @ `8038075f`)  
**Scope:** Planning only — no code changes  
**Supersedes:** Pre-baseline roadmap assumptions (S1 Produto, 4-module registry, marcas/produtos factory)

**Related:** [ROADMAP.md](./ROADMAP.md) · [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) · [PLATFORM-MATURITY-INDEX.md](./PLATFORM-MATURITY-INDEX.md) · [TECH-DEBT.md](./TECH-DEBT.md)

---

## Executive Summary

| Attribute | Value |
|-----------|-------|
| Baseline | V10.2.0 — CI green, 2 certified modules (`empresas`, `cadcps`) |
| Full platform PMI | **3.6 / 10** |
| Foundation track PMI | **6.8 / 10** |
| Strategic north star | **MAK DATA PLATFORM (MDP)** — D-012, IFM 1C |
| First implementation mission | **IFM 1A-S3** — Frontend supply chain hardening (TD-008) |
| Second mission | **IFM 1D-1** — V13–V20 gates in CI (TD-013) |
| Third mission | **IFM 1C-MDP-1** — Entity Dictionary |

**Removed from roadmap:** S1 Produto migration, S2 registry sync (done), marcas/produtos factory pattern.

---

## Part 1 — Area Analysis (Code Evidence)

Each area: **priority** (P0–P3), **dependencies**, **risks**, **impact**, **justification**.

### 1. Foundation

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — maintain, do not extend |
| **PMI score** | 7.0 / 10 |
| **Current state** | Frozen V10.2.0. G31–G136 pass in CI. V13–V20 pass manually only (TD-013). Legacy `framework/cadastro/` ~11K LOC, **78** importing files. |
| **Dependencies** | governance-baseline.json, gate scripts, makBootstrap |
| **Risks** | Capability regressions merge undetected (TD-013); legacy layer blocks metadata abstraction |
| **Impact** | All cadastro modules and Studio compile against Foundation |
| **Justification** | Foundation is certified and frozen — evolution is backward-compatible promotion only (Constitution, D-001). |

### 2. ModeloBase1 (Official Base Template 1)

| Field | Assessment |
|-------|------------|
| **Priority** | P2 — naming cleanup after MDP-1 |
| **PMI score** | 7.0 / 10 |
| **Current state** | 2 runtime modules. Monoliths: `ModeloBase1CadastroPage.jsx` 1,518 LOC; `MakCadastroTable.jsx` 2,407 LOC. Empresas nomenclature in generic props (TD-004). G38 **passes** post-baseline. |
| **Dependencies** | framework/mak, cadastro-engine, module configs |
| **Risks** | Treating ModeloBase1 as eternal-only template blocks Template Registry (D-017) |
| **Impact** | Every new cadastro module uses this pattern |
| **Justification** | Stable and certified; generic naming (A2) should follow Entity Dictionary so MDP owns labels, not ModeloBase1 props. |

### 3. Platform Core (L3)

| Field | Assessment |
|-------|------------|
| **Priority** | P2 — event bus after MDP-1 |
| **PMI score** | 6.5 / 10 |
| **Current state** | JWT auth, RBAC, multi-tenant, multi-empresa, AuditLog, `/api/health`, metrics routes. **No** Platform Event Bus (TD-010). **No** public API / webhooks. |
| **Dependencies** | PostgreSQL, Fastify, Supabase storage |
| **Risks** | Client-only Events/Workflow engines cannot drive server automation |
| **Impact** | Blocks AI actions, server workflows, Marketplace webhooks |
| **Justification** | Core auth/tenant proven in production health check; event bus is IFM 1B-A5, not blocking MDP-1. |

### 4. Framework MAK

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — protect via CI; P2 — decompose monoliths |
| **PMI score** | (within Foundation 7.0) |
| **Current state** | ~18.9K LOC. Config engines V13–V20 complete with gate scripts. Engine registries per moduleId in makBootstrap. |
| **Dependencies** | cadastro-engine, module metadata |
| **Risks** | Monolith table component slows change velocity (TD-006) |
| **Impact** | All certified UI capabilities |
| **Justification** | Frozen layer — changes require gates + Amendment Process. CI expansion (1D-1) protects before MDP work touches metadata consumers. |

### 5. Cadastro Engine

| Field | Assessment |
|-------|------------|
| **Priority** | P2 — stable |
| **PMI score** | (within Foundation 7.0) |
| **Current state** | ~2K LOC, frozen. Consumed by ModeloBase1. Legacy `framework/cadastro/` duplicates some concerns (TD-003). |
| **Dependencies** | framework/mak |
| **Risks** | Dual engine paths during legacy promotion |
| **Impact** | Listing, form shell, preferences integration |
| **Justification** | No changes until A1 promotion identifies remaining consumers. |

### 6. Runtime (Domain Modules)

| Field | Assessment |
|-------|------------|
| **Priority** | P3 — no new modules until MDP-4 |
| **PMI score** | N/A (2 modules) |
| **Current state** | `empresas` (42 files, reference factory), `cadcps` (18 files, domain runtime exception). 6 cert scaffold modules + template. |
| **Dependencies** | ModeloBase1, registries, backend APIs |
| **Risks** | Adding modules before MDP creates more native field constants outside Data Dictionary |
| **Impact** | Each module adds native fields to migrate later |
| **Justification** | Generator works; defer new modules until MDP-2 reduces migration debt (Constitution priority 6). |

### 7. Registries

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — evolve into MDP-1 |
| **PMI score** | (MDP 2.0) |
| **Current state** | FE/BE `cadastro-modules.registry.json` synced (2 entries). `generatedModules.json` aligned (G125). Engine registries runtime-only (not persisted MDP). |
| **Dependencies** | Generator, makBootstrap, G118 |
| **Risks** | Multiple SSOTs (module registry, CadCpsTela, Prisma models, `*Form.constants.js`) |
| **Impact** | MDP-1 unifies Entity Dictionary from current seeds |
| **Justification** | Registry sync (S2) complete — next step is **elevation to MDP**, not more manual sync. |

### 8. Backend

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — MDP APIs; P2 — event bus |
| **PMI score** | 6.5 / 10 |
| **Current state** | Fastify 5, 14 modules, 0 npm audit vulns. Dual DDL boot path (TD-005). CADCPS flat file layout (TD-012, cosmetic). |
| **Dependencies** | Prisma, PostgreSQL, JWT |
| **Risks** | `ensureSchema.js` + Prisma migrate divergence across environments |
| **Impact** | All MDP dictionaries need backend API + Prisma models |
| **Justification** | Backend is production-healthy; schema/API work is MDP-1 scope. |

### 9. Banco de Dados

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — MDP tables; P2 — DDL consolidation |
| **PMI score** | 6.0 / 10 |
| **Current state** | 17 Prisma models, 11 migrations. Multi-tenant `cliente_id` on operational models. ~60 indexes. |
| **Dependencies** | Prisma migrate, Railway PostgreSQL |
| **Risks** | TD-005 dual DDL; no tenant export/import |
| **Impact** | MDP adds 4+ dictionary tables |
| **Justification** | Schema is consistent post-#285; S4 (DDL) should follow MDP-1 migration patterns established. |

### 10. APIs

| Field | Assessment |
|-------|------------|
| **Priority** | P1 — MDP introspection API (MDP-4) |
| **PMI score** | 5.5 / 10 |
| **Current state** | Internal REST for cadastro modules. No OpenAPI publish. No public/webhook API. |
| **Dependencies** | Platform Core auth, MDP persistence |
| **Risks** | Studio and AI need stable introspection contracts |
| **Impact** | MDP-4 unlocks Program 2 |
| **Justification** | Internal APIs sufficient for current 2 modules; public API is post-MDP-4. |

### 11. Segurança

| Field | Assessment |
|-------|------------|
| **Priority** | **P1 — S3 npm audit (immediate)** |
| **PMI score** | 6.5 / 10 |
| **Current state** | Frontend **15 npm audit vulns** (9 high). Backend 0. JWT + RBAC. No MFA/SSO. |
| **Dependencies** | npm ecosystem, auth module |
| **Risks** | Supply chain exploit on frontend build chain |
| **Impact** | Production SaaS compliance |
| **Justification** | Highest actionable stability risk with bounded scope — **first implementation mission**. |

### 12. Performance

| Field | Assessment |
|-------|------------|
| **Priority** | P2 |
| **PMI score** | 6.0 / 10 |
| **Current state** | Virtualized table/cards. Main chunk 492 KB (142 KB gzip). Monolith components (TD-006). |
| **Dependencies** | ModeloBase1, MakCadastroTable |
| **Risks** | Bundle growth as modules return |
| **Impact** | User experience at scale |
| **Justification** | Acceptable for 2 modules; A3 decomposition after MDP stabilizes metadata-driven rendering. |

### 13. Governança

| Field | Assessment |
|-------|------------|
| **Priority** | **P1 — 1D-1 CI expansion (mission #2)** |
| **PMI score** | 8.5 / 10 |
| **Current state** | G31–G136 in CI ✅. V13–V20 manual only (TD-013). 5-cycle governance verified at baseline recovery. |
| **Dependencies** | GitHub Actions, gate scripts |
| **Risks** | MDP missions may break config engines undetected |
| **Impact** | Protects all Program 1 implementation |
| **Justification** | Low effort, high leverage — run before MDP-1 coding starts. |

### 14. MAK Data Platform (MDP)

| Field | Assessment |
|-------|------------|
| **Priority** | **P0 strategic — P1 implementation (missions 3–6)** |
| **PMI score** | 2.0 / 10 |
| **Current state** | Spec only (D-012). Seeds: registry (2 entities), CADCPS (~45% Data Dictionary), runtime registries (~30% Metadata Registry). |
| **Dependencies** | S3, 1D-1 (recommended), registry SSOT |
| **Risks** | Parallel metadata in module JS files grows debt if delayed |
| **Impact** | **Blocks MAK Studio, AI, Marketplace, Low-Code** |
| **Justification** | D-011/D-012 — IFM core purpose; maximizes MAK 2035 trajectory. |

### 15. MAK Studio

| Field | Assessment |
|-------|------------|
| **Priority** | P4 — Program 2 (after MDP-4) |
| **PMI score** | 0.5 / 10 |
| **Current state** | Zero implementation. Config via legacy configurators + JS files. |
| **Dependencies** | MDP-4 introspection API |
| **Risks** | Parallel UI framework (forbidden by Anti-Roadmap) |
| **Impact** | Low until MDP exists |
| **Justification** | D-011 explicitly gates Studio to Program 2. |

### 16. AI Platform

| Field | Assessment |
|-------|------------|
| **Priority** | P5 — post-MDP-4 + event bus |
| **PMI score** | 0.0 / 10 |
| **Current state** | Zero code. Auth boundaries documented (D-009). |
| **Dependencies** | MDP introspection, Platform Event Bus, RBAC |
| **Risks** | Direct DB access by agents (forbidden) |
| **Impact** | Future capability |
| **Justification** | Not Program 1 scope. |

### 17. Marketplace

| Field | Assessment |
|-------|------------|
| **Priority** | P5 — post-MDP-5 |
| **PMI score** | 1.0 / 10 |
| **Current state** | `ClienteModulo` feature flags only. No package format, sandbox, or publish pipeline. |
| **Dependencies** | MDP versioning (MDP-5), definition bundles |
| **Risks** | Premature marketplace without versioned definitions |
| **Impact** | Future revenue/ecosystem |
| **Justification** | Phase 6 Anti-Roadmap timing. |

### 18. Offline Capability

| Field | Assessment |
|-------|------------|
| **Priority** | P5 — post-Sync Platform |
| **PMI score** | 1.5 / 10 |
| **Current state** | User preferences local cache only. No outbox, no definition snapshots. |
| **Dependencies** | MDP definition snapshots, Sync Platform (L6.4) |
| **Risks** | Offline without MDP versioning causes config drift |
| **Impact** | Future mobile/desktop |
| **Justification** | Master Architecture L6.4 — not Program 1. |

### 19. Internacionalização (Globalization)

| Field | Assessment |
|-------|------------|
| **Priority** | P4 — post-MDP-2 |
| **PMI score** | **~0.5 / 10** (not in PMI v1.1 — assessed here) |
| **Current state** | **Zero i18n infrastructure** — no react-intl, no locale files, Portuguese hardcoded in UI strings and docs. `formatIdGlobal.js` is ID formatting, not locale. |
| **Dependencies** | Data Dictionary labels (MDP-2), Platform Language Standard |
| **Risks** | Retrofitting i18n after more modules increases string debt |
| **Impact** | Required for 1K+ clients in multiple regions |
| **Justification** | Field labels should come from MDP Data Dictionary before UI i18n layer — **MDP-2 enables globalization**; dedicated i18n mission is IFM 1E (new sub-phase, post-MDP-2). |

### 20. Migração de Dados

| Field | Assessment |
|-------|------------|
| **Priority** | P2 — S4 after MDP-1 |
| **PMI score** | 4.5 / 10 |
| **Current state** | 11 Prisma migrations. `ensureSchema.js` boot supplement (TD-005). No tenant export/import. |
| **Dependencies** | Prisma, deploy pipeline |
| **Risks** | Environment schema drift |
| **Impact** | Deploy predictability |
| **Justification** | S4 consolidates after MDP-1 establishes canonical migration pattern for dictionary tables. |

### 21. Multi-tenant

| Field | Assessment |
|-------|------------|
| **Priority** | P3 — maintain; P4 — metering |
| **PMI score** | 7.5 / 10 |
| **Current state** | `cliente_id` on models, JWT tenant scope, module guard, E2E isolation. |
| **Dependencies** | Auth, Prisma schema |
| **Risks** | No automated cross-tenant leak tests |
| **Impact** | SaaS foundation proven |
| **Justification** | Strongest infra area — no Program 1 mission required unless MDP adds tenant-scoped definitions (MDP-1). |

### 22. Multiempresa

| Field | Assessment |
|-------|------------|
| **Priority** | P3 — document in MDP-1 |
| **PMI score** | 7.0 / 10 |
| **Current state** | `PermissaoEmpresa`, `X-Empresa-Id`, CADCPS per-empresa scope. |
| **Dependencies** | Empresas module, Entity Dictionary |
| **Risks** | Header omission on new routes |
| **Impact** | Enterprise customers with multiple companies |
| **Justification** | Entity Dictionary (MDP-1) should encode company scope rules — no standalone mission. |

---

## Part 2 — Official Mission Sequence (Program 1)

Missions ordered by Constitution priority (Estabilidade → Arquitetura → Preparação Plataforma) and MAK 2035 dependency chain.

### Wave 0 — Complete ✅

| ID | Mission | Status |
|----|---------|--------|
| S0 | Repository Health Certification | ✅ PR #290 |
| BR | Architecture Baseline Recovery | ✅ PR #291 |
| S2 | Registry sync FE/BE | ✅ baseline recovery |
| — | Replanejamento Técnico (this doc) | ✅ planning |

### Wave 1 — Estabilidade (IFM 1A)

| ID | Mission | Priority | Objective | Dependencies | Effort | Impact | Order reason |
|----|---------|----------|-----------|--------------|--------|--------|--------------|
| **S3** | Frontend supply chain hardening | **P1** | Resolve TD-008 — reduce 15 npm audit vulns (9 high) | None | **S** | Security compliance; unblocks enterprise procurement | **First implementation** — bounded scope, zero architecture change, Constitution priority 1 |
| **S4** | DDL path consolidation | P2 | Remove dual `ensureSchema.js` + Prisma path (TD-005) | MDP-1 migration pattern | **M** | Deploy predictability | After MDP-1 defines how new tables migrate |

### Wave 2 — Governança CI (IFM 1D)

| ID | Mission | Priority | Objective | Dependencies | Effort | Impact | Order reason |
|----|---------|----------|-----------|--------------|--------|--------|--------------|
| **1D-1** | V13–V20 gates in CI | **P1** | TD-013 — add capability gate jobs to `foundation-governance.yml` | None | **S** | Prevents config engine regressions during MDP | **Second mission** — protects all subsequent IFM work; low effort |

### Wave 3 — MAK DATA PLATFORM (IFM 1C) ★ Strategic core

| ID | Mission | Priority | Objective | Dependencies | Effort | Impact | Order reason |
|----|---------|----------|-----------|--------------|--------|--------|--------------|
| **MDP-1** | Entity Dictionary | **P1** | Prisma schema + API + sync from `cadastro-modules.registry.json` + `CadCpsTela` | S3, 1D-1 (recommended) | **L** | Single entity catalog — foundation of all metadata | **Third mission** — D-012 core; seeds exist; unblocks MDP-2/3/4 |
| **MDP-2** | Data Dictionary | P1 | Evolve CADCPS to all fields; migrate native fields from `*Form.constants.js` | MDP-1 | **XL** | Full field metadata SSOT; enables globalization labels | Native field debt grows if delayed |
| **MDP-3** | Relationship Dictionary | P1 | Schema + API for entity relationships | MDP-1 | **L** | Enables Studio relationship designer | `relation_entity` hints exist in CADCPS |
| **MDP-4** | Metadata Registry + introspection API | **P1** | Persisted registry; read API for Foundation/Studio | MDP-1,2,3 | **XL** | **Unlocks Program 2 (MAK Studio)** | D-011 gate for Studio |
| **MDP-5** | Definition versioning + publish | P2 | Draft/publish pipeline; version pins | MDP-4 | **L** | Marketplace + safe rollout | Required before Marketplace |

### Wave 4 — Arquitetura (IFM 1B)

| ID | Mission | Priority | Objective | Dependencies | Effort | Impact | Order reason |
|----|---------|----------|-----------|--------------|--------|--------|--------------|
| **A1** | Legacy `framework/cadastro/` promotion | P1 | Reduce TD-003 imports from 78 toward <20 | MDP-1 (parallel OK) | **XL** | Removes dual maintenance; enables Low-Code | Can start after MDP-1; configurators need entity context |
| **A2** | Generic naming in ModeloBase1 | P1 | TD-004 — decouple Empresas props/CSS | MDP-1 entity labels | **M** | Cognitive clarity for module authors | Labels from MDP, not hardcoded props |
| **A5** | Platform Event Bus MVP | P2 | TD-010 — backend domain events | MDP-4 | **L** | Server automation, AI, workflows | Client engines exist (V18–V20); server needs bus |
| **A3** | Decompose MakCadastroTable | P2 | TD-006 — split 2,407 LOC monolith | MDP-4 stable | **L** | Maintainability | Defer until metadata-driven columns stable |
| **A4** | Remove deprecated aliases | P3 | TD-011 cleanup | A1, A2 | **S** | Code clarity | Last in 1B |

### Wave 5 — Post-IFM (Not Program 1)

| ID | Mission | Priority | Notes |
|----|---------|----------|-------|
| **1E-1** | i18n infrastructure | P4 | After MDP-2 — labels from Data Dictionary |
| **1F-1** | Backup/DR runbook | P4 | PMI 2.5/10 gap — operational, not code-first |
| **P2** | MAK Studio | Program 2 | After MDP-4 minimum |
| **P3+** | AI, Marketplace, Offline, Mobile, Desktop | Programs 3–6 | Per Master Architecture |

---

## Part 3 — Removed / Obsolete Missions

| Mission | Reason | Evidence |
|---------|--------|----------|
| **S1** Produto SQL migration | Models/modules removed | PR #285, migration `remove_marcas_produtos` |
| **S2** Registry sync | Completed | G118 pass, both registries 2 entries |
| **P4** Unified registry sync (standalone) | Absorbed into MDP-1 | Entity Dictionary supersedes manual sync |
| **Phase 5** marcas/produtos factory | Modules deleted | 0 files in `src/modules/marcas|produtos` |
| **New modules before MDP-4** | Creates native field debt | Only 2 runtime modules; Constitution priority 6 |

---

## Part 4 — Priority Changes vs Previous Roadmap

| Mission | Previous | New | Reason |
|---------|----------|-----|--------|
| S1 Produto | P0 | **Removed** | Obsolete |
| S2 Registry | P1 | **Done** | Baseline recovery |
| S3 npm audit | P1 | **P1 — mission #1** | Unchanged; now first implementation |
| 1D CI gates | IFM 1D (late) | **P1 — mission #2** | ↑ Protect before MDP coding |
| MDP-1 | P1 | **P1 — mission #3** | ↑ Core strategic path |
| A1 legacy | P1 (parallel) | P1 after MDP-1 | ↔ Can overlap MDP-2 |
| A3 table split | P2 | **P2 → defer post-MDP-4** | ↓ Avoid churn during MDP |
| New modules | After S1–S2 | **After MDP-4** | ↓ Prevent metadata debt |
| i18n | Not listed | **1E post-MDP-2** | ↑ Identified gap (0 i18n code) |

---

## Part 5 — Certification (10 Questions)

### 1. Qual é hoje o maior bloqueador técnico da plataforma?

**Frontend supply chain (TD-008)** — 15 npm audit vulnerabilities (9 high) in production frontend build chain. Actionable immediately without architecture change. Evidence: `npm audit` on `main`.

### 2. Qual é hoje o maior bloqueador arquitetural?

**MAK DATA PLATFORM not implemented (PMI 2.0/10)** — D-012 strategic layer absent. Blocks MAK Studio (D-011), AI introspection, Marketplace definitions, and Low-Code abstraction. Evidence: zero MDP Prisma models; spec-only in `MAK-DATA-PLATFORM.md`.

### 3. Qual deve ser oficialmente a próxima missão de implementação?

**IFM 1A-S3 — Frontend Supply Chain Hardening** (TD-008). Bounded stability mission per Constitution priority 1 (Estabilidade). Brief: [IFM-1A-S3-SUPPLY-CHAIN-HARDENING.md](./IFM-1A-S3-SUPPLY-CHAIN-HARDENING.md).

### 4. Existe alguma missão do roadmap que pode ser removida?

**SIM.** S1 Produto migration, standalone S2 registry sync, standalone P4 registry sync, marcas/produtos factory pattern, and "new modules after S1–S2" — all obsolete or absorbed per Part 3.

### 5. Existe alguma missão que deve subir de prioridade?

**SIM.** **IFM 1D-1** (V13–V20 in CI) — from late IFM 1D to **mission #2**. **MDP-1** — confirm as **mission #3** immediately after stability slice. **i18n** — newly identified, scheduled as 1E post-MDP-2.

### 6. Existe alguma missão que deve descer de prioridade?

**SIM.** **A3** (MakCadastroTable decomposition) — defer until MDP-4 stabilizes metadata-driven rendering. **New cadastro modules** — defer until MDP-4 (Program 2 gate). **A4** aliases — remains P3.

### 7. A ordem atual do Programa 1 continua correta?

**NÃO.** Sub-phases 1A→1B→1C→1D is structurally sound but **execution order within 1A/1D must change**: S3 → 1D-1 → MDP-1→4 before heavy 1B work. S1/S2 removed. 1D should precede MDP coding, not follow it.

### 8. Qual sequência maximiza evolução para MAK 2035?

```
S3 (security) → 1D-1 (CI guard) → MDP-1 → MDP-2 → MDP-3 → MDP-4 → [Program 2 Studio]
                ↘ A1/A2 parallel after MDP-1 ↗
                S4 after MDP-1 migrations established
                MDP-5 → Marketplace path
                A5 event bus after MDP-4
```

Maximizes: stability first, then metadata nucleus (L4), then Studio (L5), then ecosystem (L6–L7) — aligned with Master Architecture layers.

### 9. Existe dependência arquitetural ainda não identificada?

**SIM — three additions:**

1. **Globalization depends on MDP-2** — no i18n code exists; field labels must be dictionary-driven before locale infrastructure.
2. **Backup/DR (PMI 2.5/10)** — not in previous IFM roadmap; operational gap for 1K+ clients (document runbook mission 1F).
3. **MDP-1 must define entity scope rules** — encodes multi-empresa/multi-tenant metadata constraints (not a separate mission but MDP-1 acceptance criterion).

### 10. Roadmap Oficial Program 1 reorganizado?

**SIM — delivered in Part 2 (Waves 0–5)** with per-mission priority, objective, dependencies, effort (S/M/L/XL), impact, and ordering justification. This document is the authoritative Program 1 execution roadmap until next replanning mission.

---

## Part 6 — First Implementation Mission (Prepared)

**Mission ID:** IFM 1A-S3  
**Title:** Frontend Supply Chain Hardening  
**Brief:** [IFM-1A-S3-SUPPLY-CHAIN-HARDENING.md](./IFM-1A-S3-SUPPLY-CHAIN-HARDENING.md)

**Entry criteria:** ✅ All met (baseline certified, this replanning complete).

**Exit criteria:**
- `npm audit` — 0 high/critical vulnerabilities (or documented exceptions with ADR)
- `npm run build`, `lint`, `verify:governance` pass
- TECH-DEBT TD-008 resolved or downgraded with evidence
- CURRENT-STATE + ENGINEERING-JOURNAL updated

---

*Planning mission complete. No code altered. Next: execute IFM 1A-S3 under PIP + RHP.*
