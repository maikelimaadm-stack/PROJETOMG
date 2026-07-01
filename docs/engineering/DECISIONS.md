# DECISIONS — Architectural Decision Register

**Status:** Living document  
**Last updated:** 2026-06-30 (D-088 Portfolio Intelligence & Command Center MVP)
**Format:** D-numbered decisions, immutable once accepted (supersede, don't edit)

---

## D-001 — Foundation Freeze (Enterprise V10)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Foundation (ModeloBase1 + framework/mak + cadastro-engine + generator) is frozen. Evolution only backward-compatible. |
| **Evidence** | `scripts/governance-baseline.json` v10.1.0 |
| **Consequences** | All structural changes require gates + Amendment Process |

---

## D-002 — ModeloBase1 as Structural SSOT

| Field | Value |
|-------|-------|
| **Date** | 2026-06-26 |
| **Status** | Accepted |
| **Decision** | ModeloBase1 owns all structural cadastro UI. Modules are thin config consumers (~10 LOC pages). |
| **Evidence** | Gates G127–G136; `docs/ENTERPRISE_SSOT_CERTIFICATION_REPORT.md` (historical) |
| **Consequences** | No module may implement toolbar/table/form/search/dock |

---

## D-003 — Generator-Only Module Creation

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | New cadastro modules created exclusively via `scripts/generate-cadastro-module.mjs`. |
| **Evidence** | Gates G103–G108 |
| **Consequences** | Manual scaffolding prohibited for certified modules |

---

## D-004 — Config Engines as Capability Pack (V13–V20)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Capabilities implemented as config engines with Map registries per moduleId — not parallel implementations. |
| **Evidence** | Gates G156–G261; `framework/mak/*ConfigEngine*` |
| **Consequences** | New capabilities follow engine + registry + bootstrap + gate pattern |

---

## D-005 — Bootstrap Inversion (Foundation ↔ Domain)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Foundation must not import `modules/*`. Engine registration via `makBootstrap` side-effects. |
| **Evidence** | Gate G109; `src/modules/makBootstrap/` |
| **Consequences** | Domain configs pulled into bootstrap at app start |

---

## D-006 — Grouping Disabled in Certified Table

| Field | Value |
|-------|-------|
| **Date** | 2026-06-27 |
| **Status** | Accepted |
| **Decision** | Column grouping/pivot removed from certified ModeloBase1. Requires future Capability Pack. |
| **Evidence** | `createMakGroupingEngine.js` → `disabled_certified` |
| **Consequences** | Do not re-enable without V21+ certification |

---

## D-007 — Constitution as Highest Authority

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | `docs/constitution/` is the permanent memory of the platform. Supersedes chat and informal reports. |
| **Evidence** | Mission 0.1 — `docs/constitution/00-MAK-CONSTITUTION.md` |
| **Consequences** | All missions read Constitution first; Amendment Process for changes |

---

## D-008 — Permanent Governance Directive

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Every mission follows 4-perspective analysis + 10-item mandatory certification + engineering doc updates. |
| **Evidence** | `docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md`, `README_AI.md` |
| **Consequences** | No mission complete without certification block |

---

## D-009 — Multi-Tenant Custom JWT (Not Supabase Auth)

| Field | Value |
|-------|-------|
| **Date** | 2026-06 (production) |
| **Status** | Accepted |
| **Decision** | Authentication via custom JWT (Fastify + bcrypt). Supabase used for storage admin, not primary auth. |
| **Evidence** | `backend/src/modules/auth/` |
| **Consequences** | AI Platform must respect existing auth boundaries |

---

## D-010 — CADCPS as Partial Data Dictionary

| Field | Value |
|-------|-------|
| **Date** | 2026-06 |
| **Status** | Accepted |
| **Decision** | CADCPS provides field-level metadata. Full entity catalog is future work — no parallel field metadata tables. |
| **Evidence** | `CadCps*` Prisma models; `CustomFieldEngine.js` |
| **Consequences** | Data Dictionary evolution extends CADCPS pattern |

---

## D-011 — Programa 1 (IFM) Before MAK Studio

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted — refined by D-012/D-013 |
| **Decision** | Official next architectural program is **Programa 1 — IFM**, not MAK Studio. Studio becomes Program 2 after MDP (IFM 1C). |
| **Evidence** | Mission 0.2 GAP analysis; P0 Produto migration; TD-001–TD-003 |
| **Consequences** | Sprint work follows IFM 1A→1D before Studio; Phase 1C = MAK DATA PLATFORM |

---

## D-012 — MAK DATA PLATFORM as Official Layer

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **MAK DATA PLATFORM (MDP)** is the official metadata nucleus — Entity Dictionary, Data Dictionary, Relationship Dictionary, Metadata Registry. Lives within IFM Phase 1C, not a separate program. |
| **Evidence** | IFM Mission 1 strategy review; CADCPS + registries as promotion seeds |
| **Consequences** | All Studio/IA/Marketplace/Low-Code work depends on MDP; no parallel metadata systems |

---

## D-013 — IFM Phase 1C Reorganized as MDP

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Replace vague "entity catalog + introspection API" with structured MDP phases MDP-1 through MDP-5. |
| **Evidence** | `docs/engineering/MAK-DATA-PLATFORM.md`, `IFM-MISSION-1-STRATEGY-REVIEW.md` |
| **Consequences** | ROADMAP Phase 3 renamed; implementation missions reference MDP IDs |

---

## D-014 — MAK 2035 Master Architecture

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **`docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md`** is the definitive platform map (L0–L7). All future capabilities must align with layer boundaries, flows, and compatibility rules defined there. |
| **Evidence** | Strategic mission MAK 2035; conflict resolutions §9; capability matrix §7 |
| **Consequences** | Constitution hierarchy updated (priority 3); README_AI pre-flight includes Master Architecture; layer topology changes require D-register amendment |

---

## D-015 — MAK Platform Language Standard

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **`docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md`** is the official platform nomenclature. All future documentation, Studio surfaces, and capabilities must use terms defined there. Legacy code identifiers remain unchanged until explicit migration missions. |
| **Evidence** | Program 0.5 — term inventory §4; glossary §5; legacy/discontinued lists §6 |
| **Consequences** | Constitution hierarchy priority 4; README_AI pre-flight; no conflicting terms in new docs without D-register |

---

## D-016 — Platform Maturity Index (PMI)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **`docs/engineering/PLATFORM-MATURITY-INDEX.md`** is the official strategic maturity dashboard. Scores must be evidence-based (code, gates, audits). Updated on every mission that significantly changes an evaluated area. |
| **Evidence** | Program 0.6 — 32 areas scored with objective criteria |
| **Consequences** | Closes structural documentation phase (Programs 0–0.6); next missions prioritize code (IFM 1A, Platform Core) |

---

## D-017 — ModeloBase1 as First Official Base Template

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **ModeloBase1** is **Official Base Template 1** — the first certified Base Template, not the only template the platform will support. Future **Template Registry** (MDP Metadata Registry type) manages multiple Base Templates. No current architecture decision blocks new visual or operational templates. |
| **Evidence** | Program 0.6 strategic adjustment; Master Architecture §L2.1/L2.1b; Constitution 04 §12 |
| **Consequences** | PMI scores ModeloBase1 as template 1 of N; Studio/MDP must model `baseTemplateId`; Foundation remains shared across templates |

---

## D-018 — Platform Implementation Protocol (PIP)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **`docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md`** is the mandatory 10-phase lifecycle for all implementation missions. Closes documentation era (Programs 0–0.7); implementation era starts under PIP. |
| **Evidence** | Program 0.7 — PIR through mission freeze; artifact rules §6 |
| **Consequences** | README_AI + Constitution 11 reference PIP; all Program 1+ missions follow Phases 1–10 |

---

## D-019 — Repository Health Protocol (RHP)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **Repository Health Protocol (RHP)** is mandatory at every mission **start** and **end**, plus **post-merge** verification. Integrated into [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md) §10. |
| **Evidence** | Emenda D-019 — PR hygiene, branch sync, build/lint/gates, doc sync, merge readiness, deploy health |
| **Consequences** | Repository must never finish a mission in worse health than at start; reduce debt when possible |

---

## D-020 — MDP Architecture Specification (MDP-0)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | **`docs/architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md`** is the definitive MDP architecture spec. All MDP-1..5 implementations must conform. No code in MDP-0 mission. |
| **Evidence** | Mission MDP-0 — 5 components fully specified; conceptual DB + API; certification 10/10 |
| **Consequences** | MAK-DATA-PLATFORM.md v2.0.0 becomes engineering summary; implementation may begin at MDP-1 |

---

## D-021 — MDP-1 Entity Dictionary Schema Addenda (Pre-Migration)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Before the first MDP-1 migration, extend the conceptual MDP-1 schema with: (1) **`mdp_definition_version` stub** (platform v1 published) referenced by all MDP-1 rows; (2) **`mdp_entity` addenda** — `entityKind`, `sortOrder`, `iconKey`, `extendsEntityId`, `originKind`, `originRef`, `isRuntimeModule`, `legacyEntityName`, `permissionResourceKey`; (3) **`mdp_entity_route` addenda** — `clientTarget`, `menuSection`, `sortOrder`, `targetEntityId`; (4) **cadcps seed semantics** — meta entity for field catalog admin, not `CadCpsCampo` as business entity; `CadCpsTela` → routes/target bindings. |
| **Evidence** | [IFM-1C-MDP-1-PRE-DESIGN-REVIEW.md](./IFM-1C-MDP-1-PRE-DESIGN-REVIEW.md) — certification 10/10 with amendments |
| **Consequences** | MDP-1 table shapes freezable after first migration; avoids 2–3 structural rework migrations before Marketplace/multi-template |

---

## D-022 — MDP-2 Data Dictionary Schema (CADCPS Promotion)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement MDP-2 as unified field SSOT via `mdp_field*` tables. CADCPS admin (`repCps`) reads/writes exclusively through MDP bridge — no parallel field storage on write path. Legacy `CadCpsCampo*` migrates idempotently; tables remain for rollback reference only. Native Empresas fields seeded with `source=native|system`. Governance gate **G138** enforces export + bridge alignment. |
| **Evidence** | [IFM-1C-MDP-2-CERTIFICATION-REPORT.md](./IFM-1C-MDP-2-CERTIFICATION-REPORT.md) |
| **Consequences** | Field SSOT persisted; CADCPS moduleId unchanged; Foundation compile boundary (I-2) preserved; MDP-3 can reference `relationship_ref` on fields |

---

## D-023 — MDP-3 Relationship Dictionary Schema

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement MDP-3 as unified relationship SSOT via `mdp_relationship*` tables. Support physical (Prisma FK), logical, and computed relationships. `MdpRelationshipDependencyClass` reserves workflow, automation, dashboard, pivot, report, permission, layout, ai_context, integration — disabled in v1 seeds where appropriate. Field bindings via `mdp_relationship_field_binding`. Governance gate **G139**. |
| **Evidence** | [IFM-1C-MDP-3-CERTIFICATION-REPORT.md](./IFM-1C-MDP-3-CERTIFICATION-REPORT.md) |
| **Consequences** | Relationship graph persisted; AI/Marketplace/Offline snapshot-ready; MDP-4 registry bindings can reference relationships |

---

## D-024 — MDP-4 Metadata Registry Schema

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement MDP-4 as unified metadata SSOT via `mdp_registry_*` tables. Support 25 entry types (layout through studio_definition). JSON Schema contracts in `mdp_registry_schema`. Bindings link entries to entities/fields/relationships/modules. Introspection API for Studio/AI. Foundation remains decoupled (I-2) — runtime registries are compile caches until MDP-5. Governance gate **G140**. |
| **Evidence** | [IFM-1C-MDP-4-CERTIFICATION-REPORT.md](./IFM-1C-MDP-4-CERTIFICATION-REPORT.md) |
| **Consequences** | All structural definitions have single persistence path; MAK Studio can write to MDP-4; MDP-5 publish engine can compile from registry entries |

---

## D-025 — MDP-1..4 Architecture Freeze

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | After IFM 1C-MDP-4.5 Final Architecture Review, **freeze** MDP-1..4 Prisma schemas, API route contracts, and governance gates G137–G140. Two pre-freeze fixes applied: registry `empresaScope` validator alignment; `CadcpsFieldCatalog` export persistence drift. Transitional parallel registries (`cadastro-modules.registry.json`, `*ModuleMetadata.js`) remain boot caches until MDP-5 compile-on-publish — not SSOT defects. |
| **Evidence** | [IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md](./IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md) |
| **Consequences** | MDP-5 may proceed; schema changes to MDP-1..4 require new decision + gate updates |

---

## D-026 — MDP-5 Versioning & Publication Engine

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement MDP-5 as official publish engine: compile-on-publish → `mdp_compiled_bundle` (CRB), snapshots, environment pins (dev/qa/prod), rollback (full + partial), unified introspect API. Governance gate **G142**. IFM 1C (MAK DATA PLATFORM) complete. |
| **Evidence** | [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md) |
| **Consequences** | All future published defs must pass MDP-5; MAK Studio (Program 2) unblocked |

---

## D-027 — Platform Architecture Reassessment (Post MDP-5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | After IFM 1C (MDP-1→5) completion, **MAK Studio (Program 2) remains the official next priority.** Full Platform Core L3 infrastructure (Event Bus, Scheduler, Job Queue, Notification Engine, Background Workers, Integration Platform, Migration Platform, Package/Extension Loaders) **must not antecede** MAK Studio. Add **Program 1E Runtime Bridge** (CRB hydration + deploy pin activation) as **parallel co-requisite** with Studio Phase 2.1. IFM 1B A5 (Event Bus) deferred until after Layout Studio MVP. |
| **Evidence** | [IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md](./IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md); Master Architecture §L3–L5; MDP-5 APIs; `backend/src/modules/auth/` production auth |
| **Consequences** | ROADMAP updated; Studio + 1E briefs official; PMI scores refreshed; Platform Core full build scheduled post-Studio MVP |

---

## D-028 — Engineering Governance Evolution

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | From this mission forward, **every implementation decision** must pass mandatory **long-term enterprise impact analysis** (10 questions: 10K clients, hundreds of modules, multi-template, multi-country, multi-language, Marketplace, IA, Offline, thousands of publishes, no structural refactor). Uncertainty → stop and register architectural review. Create **Program 1F — Enterprise Readiness** (documentation-only, not implemented now) with subprograms 1F.1–1F.6. Add **Enterprise Readiness Index (ERI)** to PMI. Update PIP Phase 1 (PIR) with D-028 gate. |
| **Evidence** | [IFM-D028-ENTERPRISE-READINESS-AUDIT-REPORT.md](./IFM-D028-ENTERPRISE-READINESS-AUDIT-REPORT.md); [ROADMAP.md](./ROADMAP.md) Program 1F; PMI §3.3 ERI |
| **Consequences** | All future missions use long-term gate; 1F documents 20-year enterprise evolution; does **not** change Program 2 / 1E priority (D-027 preserved) |

---

## D-029 — Engineering Principles

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Establish **MAK Engineering Principles** as permanent implementation doctrine — 18 principles (Architecture First through Reduce Complexity). Insert in document hierarchy: Constitution → Master Architecture → **Engineering Principles** → Architecture Specifications → Engineering Docs → Implementation. All future implementation must comply. |
| **Evidence** | [MAK-ENGINEERING-PRINCIPLES.md](../architecture/MAK-ENGINEERING-PRINCIPLES.md); [IFM-D029-ENGINEERING-PRINCIPLES-AUDIT-REPORT.md](./IFM-D029-ENGINEERING-PRINCIPLES-AUDIT-REPORT.md) |
| **Consequences** | Constitution hierarchy updated; README_AI pre-flight + Architecture perspective updated; MAK Studio missions governed by P13–P15 |

---

## D-030 — Runtime Bridge Phase 1

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 1E Runtime Bridge Phase 1** as bootstrap-layer adapter: CRB → Foundation registries for empresas pilot. Runtime Bridge is the **sole runtime hydration entry point**. Foundation remains frozen. Governance gate **G143**. Legacy boot cache retained as offline fallback only. |
| **Evidence** | [IFM-PHASE-1E-CERTIFICATION-REPORT.md](./IFM-PHASE-1E-CERTIFICATION-REPORT.md) |
| **Consequences** | MAK Studio Phase 2.1 unblocked for parallel start; publish→live path requires 1E-2 deploy reload hook for full automation |

---

## D-031 — MAK Studio Foundation Architecture

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Establish **MAK Studio Architecture** (`docs/architecture/MAK-STUDIO-ARCHITECTURE.md` v1.0.0) as the permanent L5 reference for Program 2. Defines Shell, Navigation, Workspace, Dock, Explorer, Inspector, Properties, Outline, Asset Manager, Runtime Console, Preview Engine, Publish Center, History, Command Palette, AI Assistant (future), Collaboration (future), Marketplace Surface, Studio APIs, Permissions, and integrations with MDP, Publish Engine, and Runtime Bridge. **No implementation in this mission** — architecture only. |
| **Evidence** | [IFM-PROGRAM-2.0-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0-CERTIFICATION-REPORT.md) |
| **Consequences** | Program 2.1 Layout Studio implements against this spec; README_AI pre-flight updated |

---

## D-032 — MAK Studio SDK & Registry Foundation

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.0.5** — reusable MAK Studio SDK (`createStudioSdk`) with 12 API contracts, official Component/Property/Event/Action/Capability registries, Designer and Plugin contracts. Layout Studio and all future designers **must** consume SDK + registries — never hardcode components. Governance gates **G262–G266**. |
| **Evidence** | [IFM-PROGRAM-2.0.5-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0.5-CERTIFICATION-REPORT.md) |
| **Consequences** | Program 2.1 Studio Shell implements against SDK; Layout Studio deferred to 2.2 |

---

## D-033 — MAK Design System Foundation

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.0.6** — permanent Design System Foundation layer (`src/studio/designSystem/`) between Studio SDK and Studio Shell. Official Token, Theme, Motion, Accessibility, and Manifest registries; Component Manifest contract; Universal Component Model (platform `"mak"`, multi-renderer bindings); AI Component Knowledge; integration with existing Studio registries without breaking compatibility. Governance gates **G267–G272**. No UI, themes, or renderers in this mission. |
| **Evidence** | [IFM-PROGRAM-2.0.6-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0.6-CERTIFICATION-REPORT.md) |
| **Consequences** | All visual values resolve via Token Registry; Studio Shell (2.1) consumes Design System + SDK; Layout Studio (2.2) uses Component Manifest |

---

## D-034 — MAK Studio Event Architecture

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.0.7** — official Studio Event Architecture (`src/studio/events/`) with Event Hub (publish/subscribe/once/broadcast/scope), Event Registry (17 official events + manifests), Plugin/Designer/History/Preview integration bridges, and future Collaboration contracts. All internal Studio module communication **must** use the Event Hub. Governance gates **G273–G278**. **Closes MAK Studio foundation phase** — no new structural layers before Program 2.1. |
| **Evidence** | [IFM-PROGRAM-2.0.7-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0.7-CERTIFICATION-REPORT.md) |
| **Consequences** | Studio Shell (2.1) wires all panels via Event Hub; direct cross-module calls prohibited when equivalent event exists |

---

## D-035 — MAK Studio Architecture Governance

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.0.8** — permanent Studio Architecture Governance (`src/studio/governance/`) with automatic dependency graph validation, designer isolation rules, registry protection, public API enforcement, and architecture boundary checks. Gates **G279–G284** integrated into CI. **Last Studio infrastructure mission** — foundation permanently closed; Program 2.1 Studio Shell is next. |
| **Evidence** | [IFM-PROGRAM-2.0.8-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0.8-CERTIFICATION-REPORT.md) |
| **Consequences** | All future Studio code (Shell, Designers) validated by governance gates; architecture self-protected |

---

## D-036 — MAK Studio UX Framework

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Establish **MAK Studio UX Framework** (`docs/architecture/MAK-STUDIO-UX-FRAMEWORK.md` v1.0.0) as the permanent interaction language for all MAK Studios. Defines Workspace, Dock, Explorer, Property Grid, Command Palette, History, Preview, and 20+ surfaces with unified behavior, shortcuts, states, icons, feedback, nomenclature, accessibility, and responsiveness contracts. **Doc-only** — no React UI. Gate **G285**. **Last exclusive documentation mission before Studio Shell.** |
| **Evidence** | [IFM-PROGRAM-2.0.9-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.0.9-CERTIFICATION-REPORT.md) |
| **Consequences** | Program 2.1 Shell implements all panels per UX Framework; no Studio may create custom interaction patterns |

---

## D-037 — MAK Studio Shell Prototype (Program 2.1A)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.1A** — first **visual** Studio Shell prototype (`src/studio/shell/`, `dock/`, `panels/`, `navigation/`, `mock/`) with mock data only. Validates UX Framework layout, dock ergonomics, SDK + Event Hub wiring, and Design System tokens **without** MDP, Runtime Bridge, persistence, or business logic. Route `/studio/prototype`. Gate **G286**. Consumer layer extended to include `panels` and `mock`. |
| **Evidence** | [IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A-CERTIFICATION-REPORT.md) |
| **Consequences** | Visual validation before production; Program 2.1B replaces mock deps with auth + MDP clients; Layout Studio (2.2) follows 2.1B |

---

## D-038 — Universal Studio Components Foundation (Program 2.1A.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.1A.5** — universal presentational Studio components (`src/studio/components/`) with public Provider contracts for Explorer, Inspector, Property Grid, Workspace, Dock, Tabs, Status Bar, Notification Area, Breadcrumb, and Command Palette. Components render only; all logic injected via Providers. **No designer-specific imports.** New governance layer `studio-universal-components`. Gate **G288**. |
| **Evidence** | [IFM-PROGRAM-2.1A.5-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A.5-CERTIFICATION-REPORT.md) |
| **Consequences** | All future Studios reuse universal library; 2.1A.6 State Engine extracts provider wiring from shell; 2.1B swaps Provider data sources only |

---

## D-039 — Studio Domain Engine Foundation (Program 2.1A.6)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.1A.6** — official MAK Studio Domain Engine (`src/studio/domain/`) with single shared state model (12 slices), service contracts (6 services — interfaces only), adapter registry, public hooks, and domain→universal provider bridge. **No designer may duplicate official domain state.** Gate **G289**. Replaces simple State Engine concept with full domain architecture. |
| **Evidence** | [IFM-PROGRAM-2.1A.6-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A.6-CERTIFICATION-REPORT.md) |
| **Consequences** | All Studios use domain hooks; 2.1B swaps service adapters for MDP; IA/Marketplace/Collaboration extend via adapters |

---

## D-040 — Studio Contribution Engine Foundation (Program 2.1A.7)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.1A.7** — official Contribution Engine (`src/studio/contributions/`) with Contribution Manager (7 register* APIs), Registry Manager (sole access to official registries), contribution store, lifecycle (register/enable/disable/unload), validators, and makpkg manifest contracts. **No designer may register directly in registries.** Gate **G290**. **Last structural layer — Studio foundation closed.** |
| **Evidence** | [IFM-PROGRAM-2.1A.7-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1A.7-CERTIFICATION-REPORT.md) |
| **Consequences** | All future designers/plugins use Contribution Manager; 2.1B begins functional implementation era; no new structural layers unless critical architectural risk |

---

## D-041 — Studio Shell Production (Program 2.1B)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.1B** — production Studio Shell with MDP public API clients (`src/studio/services/`), `createProductionDomainAdapters`, JWT auth gate, official Selection Model + Workspace Session contracts, localStorage persistence, CRB Preview via `previewCrbAdapter` (no Runtime Bridge import). Prototype preserved at `/studio/prototype`. Gate **G287**. |
| **Evidence** | [IFM-PROGRAM-2.1B-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.1B-CERTIFICATION-REPORT.md) |
| **Consequences** | Functional implementation era begins; Program 2.2 Layout Studio mounts first designer plugin on production shell |

---

## D-042 — Layout Studio Engine (Program 2.2)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.2** — Layout Studio Engine with official Layout Document, Layout AST, Canvas Engine (extensible), Command System (mandatory mutations), Validation Engine, MDP Property Grid writes via document, Preview via Document→Compile→CRB. Gate **G291**. First functional designer at `/studio/empresas/layout`. |
| **Evidence** | [IFM-PROGRAM-2.2-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.2-CERTIFICATION-REPORT.md) |
| **Consequences** | Establishes permanent visual authoring engine pattern for all future Studios; Program 2.3 Field Studio follows same architecture |

---

## D-043 — Studio Core Engine (Program 2.2.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.2.5** — Studio Core Engine with Document, AST, Validation, Command, Studio Project Model, Dependency Graph, and Refactoring engines. Layout Studio migrated to consume Core exclusively. Gate **G293** forbids designers from implementing engines locally. |
| **Evidence** | [IFM-PROGRAM-2.2.5-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.2.5-CERTIFICATION-REPORT.md) |
| **Consequences** | Field Studio (2.3), Workflow Studio, Dashboard Studio, and all future designers reuse Core foundation — no structural duplication |

---

## D-044 — Studio Object Model (Program 2.2.6)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.2.6** — Studio Object Model (SOM) with Object Model, Property Engine, Binding Engine, Behavior Engine, Object Identity System, and Studio Package Model. Layout Studio migrated to consume SOM exclusively. Gate **G294** forbids designers from implementing object/property/binding/behavior models locally. |
| **Evidence** | [IFM-PROGRAM-2.2.6-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.2.6-CERTIFICATION-REPORT.md) |
| **Consequences** | Enables consistent evolution, AI integration, Marketplace, collaboration, and Runtime without structural duplication across all future Designers |

---

## D-045 — Studio Editor Engine (Program 2.2.7)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-29 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.2.7** — Studio Editor Engine with reusable services (Explorer, Workspace, Inspector, Property Grid, Canvas, Preview, History, Publish, Selection). Layout Studio migrated as first consumer via editor catalog registration. Gate **G295** forbids designers from implementing local editor structures. |
| **Evidence** | [IFM-PROGRAM-2.2.7-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.2.7-CERTIFICATION-REPORT.md) |
| **Consequences** | Field Studio, Workflow Studio, Dashboard Studio, and Automation Studio reuse the same editor; Layout is first consumer only |

---

## D-046 — Field Studio Phase 1 (Program 2.3)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3** — Field Studio Phase 1 with official Field Document, Field AST, Command System (CRUD + reorder + property edit), Field Canvas, MDP Field Dictionary client, Explorer + Property Grid integration, Preview via Document→Compile→CRB. Second functional designer at `/studio/empresas/field`. Gate **G296**. No new Studio infrastructure. |
| **Evidence** | [IFM-PROGRAM-2.3-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3-CERTIFICATION-REPORT.md) |
| **Consequences** | Establishes field authoring pattern for all modules; Program 2.3.1 Advanced Field Capabilities follows; Layout Studio behavior preserved |

---

## D-047 — Field Studio Smart Authoring (Program 2.3.1)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3.1** — Smart Field Templates (10 official), Business Field Types catalog (architecture only), advanced properties (mask, placeholder, help text, min/max, precision, scale, categories, groupings), centralized presentation adapter. Gate **G297**. No relationships, computed, derived, or formula in this phase. |
| **Evidence** | [IFM-PROGRAM-2.3.1-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.1-CERTIFICATION-REPORT.md) |
| **Consequences** | Field creation is one-click intelligent; Program 2.3.2 Computed & Formula Fields follows |

---

## D-048 — Studio Expression Engine (Program 2.3.2)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3.2** — Studio Expression Engine with official Expression Document, AST, Parser, Compiler, Validator, Type System, Function Catalog, Context, Dependency Graph, and Refactoring. Single expression foundation for all Studios. Field Studio first consumer. Gate **G298** forbids parallel parser/AST/evaluator in designers. |
| **Evidence** | [IFM-PROGRAM-2.3.2-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.2-CERTIFICATION-REPORT.md) |
| **Consequences** | Computed, Derived, Formula, Workflow, Dashboard, Automation, and AI Studios reuse one expression layer |

---

## D-049 — Studio Dependency Engine (Program 2.3.3)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3.3** — Studio Dependency Engine with official Dependency Graph, Nodes, Edges, Analyzer, Cycle Detection, Resolver, Cache, Invalidation, Impact Analyzer, Safe Rename/Delete, and AI-ready metadata. Single dependency infrastructure for all Studios. Field Studio first consumer; Expression Engine variable refs delegate to this engine. Gate **G299** forbids parallel graphs, resolvers, cycle detection, caches, and impact analyzers in designers. |
| **Evidence** | [IFM-PROGRAM-2.3.3-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.3-CERTIFICATION-REPORT.md) |
| **Consequences** | Computed/Derived Fields, Workflow, Dashboard, Automation, AI, and Marketplace Studios reuse one dependency layer |

---

## D-050 — Studio Type System (Program 2.3.4)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3.4** — Studio Type System with official Type Registry, Primitive/Business/Reference/Collection/Enum types, Compatibility Engine, Inference Engine, Coercion Engine, Validation Engine, and AI-ready metadata. Single type infrastructure for all Studios. Field Studio first consumer; Expression Engine delegates inference and compatibility. Gate **G300** forbids parallel type registries, inference, coercion, and semantic validation in designers. |
| **Evidence** | [IFM-PROGRAM-2.3.4-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.4-CERTIFICATION-REPORT.md) |
| **Consequences** | Computed/Derived Fields, Workflow, Dashboard, and Automation Studios reuse one type layer |

---

## D-051 — Studio Evaluation Engine (Program 2.3.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-28 |
| **Status** | Accepted |
| **Decision** | Implement **Program 2.3.5** — Studio Evaluation Engine with official Evaluation Pipeline, Context, Session, Cache, Scheduler, Strategy, Result, Diagnostics, Profiler, Hooks, and AI-ready metadata. Single evaluation infrastructure for all Studios. Field Studio first consumer path; Expression Engine delegates execution. Gate **G301** forbids parallel evaluators, schedulers, caches, and execution pipelines in designers. |
| **Evidence** | [IFM-PROGRAM-2.3.5-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.5-CERTIFICATION-REPORT.md) |
| **Consequences** | Computed/Derived Fields, Workflow, Dashboard, and Automation Studios reuse one evaluation layer |

---

## D-052 — Studio Foundation Freeze (Program 2.3.X)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | **Freeze** the MAK Studio Foundation (Programs 2.0–2.3.5) in `main` after Repository Stabilization. Consolidate stacked PR chain via merge commit (PR #329). Issue internal Release Candidate **v0.4.0-RC1**. **Authorize** Program 2.3.6 (Studio Computation Engine). No new Foundation layers until Computation Engine is certified. |
| **Evidence** | [IFM-PROGRAM-2.3.X-REPOSITORY-STABILIZATION-REPORT.md](./IFM-PROGRAM-2.3.X-REPOSITORY-STABILIZATION-REPORT.md) |
| **Consequences** | Program 2.3.6 may begin; structural debt TD-S01–S07 tracked for cleanup missions; superseded branches deleted |

---

## D-053 — Project Continuity Protocol (Program 2.3.Y)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Establish permanent **Project Continuity Protocol** — no AI session may depend on chat history. Official continuity via `PROJECT-STATUS.md`, `AI-STARTUP-GUIDE.md`, `CONTINUITY-PROTOCOL.md`, and `DOCUMENT-MAP.md`. All future sessions start from repository documents only. |
| **Evidence** | [IFM-PROGRAM-2.3.Y-CONTINUITY-CERTIFICATION-REPORT.md](./IFM-PROGRAM-2.3.Y-CONTINUITY-CERTIFICATION-REPORT.md) |
| **Consequences** | Any AI tool can assume development; README_AI updated with CURRENT PROJECT STATUS section |

---

## D-054 — Studio Computation Architecture (Program 3.0.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Studio Computation Architecture** — official contracts for Computation Document, Computation AST, Computation Graph, Execution Graph, evaluation order, dependency resolution, lazy/incremental/batch/parallel strategies, cache layers, Studio/Runtime/Computation contexts, field models (computed, derived, aggregations, rollups, lookups, calculated collections), validation pipeline, diagnostics, optimizer, cost analyzer, profiler, circular dependency policy, versioning, migration strategy, and AI/Marketplace extension points. Computation Engine **composes** Expression (D-048), Dependency (D-049), Type (D-050), and Evaluation (D-051) engines — no parallel evaluators in designers. Version constants: `mak-computation-document-v1`, `mak-computation-ast-v1`, `mak-computation-graph-v1`, `mak-execution-graph-v1`, `mak-computation-ir-v1`, `mak-studio-computation-v1`. v1 **forbids mutual recursion** between computed fields. **Authorize** Program 2.3.6 implementation against this spec; gate **G302** enforces structure. |
| **Evidence** | [MAK-STUDIO-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) |
| **Consequences** | Program 2.3.6 may begin implementation; Formula Builder, Dashboard, and Automation Studios reuse same computation stack; distributed execution reserved via Execution Graph layers without IR break |

---

**Next:** **Program 3.2** — Formula Builder

---

## D-055 — Studio Computation Engine (Program 3.1)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement **Studio Computation Engine** as the sole official orchestration layer for all computed behavior in MAK Studio. Infrastructure-only delivery: Computation Document, Computation AST, Computation Graph, Execution Graph, Computation IR, Studio/Runtime/Computation contexts, Validation Pipeline, Optimizer (compile-time stub), Cost Analyzer, and field model contracts. Engine **composes** Expression (D-048), Dependency (D-049), Type System (D-050), and Evaluation (D-051) — no parallel evaluators or computation graphs in designers. Gate **G302** enforces structure and integration. Version facade: `mak-studio-computation-v1`. **Authorize** Program 3.2 Formula Builder against this engine. |
| **Evidence** | `src/studio/computation/` · `scripts/gate-studio-computation-engine.mjs` · [MAK-STUDIO-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) |
| **Consequences** | All future designers (Formula Builder, Computed Fields, Dashboard, Workflow) must consume Computation Engine; Field Studio adapter (`designers/field/computation/`) deferred to Program 3.2+ |

---

## D-056 — Formula Builder (Program 3.2)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement **Formula Builder** as the official visual formula authoring environment for MAK Studio. Consumes exclusively Computation Engine (D-055), Expression, Dependency, Type System, and Evaluation engines. Formula Document mutations only via `applyFormulaDocumentEdit`; pipeline syncs Formula Document → Computation Document → Expression AST → Execution Graph → Preview. Gate **G303A** enforces no parallel parser/evaluator and no direct AST access in UI. Extension points stubbed for Formula Assist, AI, NL, Marketplace, Templates. **Authorize** Program 3.3 Computed Fields. |
| **Evidence** | `src/studio/designers/formula/` · `scripts/gate-studio-formula-builder.mjs` · `src/studio/designers/field/computation/` |
| **Consequences** | Authors build formulas visually without manual syntax; Business Computation Layer (3.3) sits above Formula Builder; Business Computed Fields (next) binds to same pipeline |

---

## D-057 — Enterprise Business Platform Vision (Program 3.1.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Enterprise Business Platform Vision** — MAK evolves from ERP positioning to **Enterprise Operating System (EOS)** at the vision layer. Register 8 architecture/vision documents: Business Intent, Business Object Model, Knowledge, Intelligence, Digital Twin, Business Capabilities, Continuous Improvement, Platform Vision. Register 7 mandatory principles: Business Asset, Business Capability, Business First, Technology Transparency, AI Acceleration, Universal Reuse, Business Intelligence (vision). **Documentation only** — no code, API, database, Runtime, Foundation, or Studio behavior changes. All future implementation must remain compatible with Master Architecture L0–L7. |
| **Evidence** | [MAK-2035-PLATFORM-VISION.md](../vision/MAK-2035-PLATFORM-VISION.md) · `docs/architecture/MAK-BUSINESS-*.md` · `MAK-KNOWLEDGE-ARCHITECTURE.md` · `MAK-INTELLIGENCE-ARCHITECTURE.md` · `MAK-DIGITAL-TWIN-ARCHITECTURE.md` · `MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md` |
| **Consequences** | Future Studio Intelligence, Knowledge, AI, Marketplace, and Twin programs have official north star; Program 3.3 Business Computation Layer builds on Business Intent SSOT |

---

## D-058 — Business Computation Layer (Program 3.3)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Business Computation Layer** — business-language authoring surface above Formula Builder (D-056). Register **Business Computation Document** (`mak-business-computation-document-v1`), computation kind catalog, derivation pipeline (Intent → Business Computation → Formula Builder → Computation Engine → Runtime), and permanent principles: Business Intent SSOT, unified derivation (Formulas, Workflows, Automations, Dashboards, Reports, Integrations, AI), Business Capabilities as reusable assets, Universal Business Assets, Business Pattern Library, Business DNA, Process Mining (architecture hooks only). **Documentation only** — no code, API, runtime, Foundation, MDP, AI, NLP, or natural language interpretation. Gate **G303B** planned for implementation. **Authorize** Business Computed Fields as first implementation mission. |
| **Evidence** | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) |
| **Consequences** | Users work in business language only (guided authoring); Formula Builder remains technical layer; all engines reused; Program 3.4 Intent Authoring supersedes authoring scope; Resolver implementation next, then Business Computed Fields |

---

## D-059 — Business Intent Authoring Architecture (Program 3.4)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Business Intent Authoring Architecture** — the sole paradigm by which any business intention is created on MAK. User creates **Business Intentions only**; never Workflows, Formulas, or Automations directly. Register all permanent concepts: Business Intent Authoring, Business Intent Document (`mak-business-intent-document-v1`), Catalog, Templates, Library, Intent Resolver (architecture only), Lifecycle, Versioning, Capabilities, Dependencies, Validation, Diagnostics, Metadata, Categories, Relationships, Marketplace Model, Intent Knowledge, Intent Business DNA, Process Mining hooks. Register principles: Intent SSOT for all functional logic; unified derivation to Formulas, Computed Fields, Workflows, Dashboards, Reports, Integrations, Permissions, AI; universal reuse across Business Objects; module-agnostic Templates; Marketplace shares Intentions not technical artifacts; Resolver is sole authorized transformation layer. **Documentation only** — no code, API, runtime, Foundation, MDP, AI, or NLP. Gate **G304** planned. **Authorize** Business Intent Resolver as next implementation mission; Business Computed Fields **after** Resolver. |
| **Evidence** | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| **Consequences** | Platform authoring origin unified under Intent Document; all Studios derive from same SSOT; eliminates parallel authoring paths; Formula Builder and Computation Engine remain as resolver output layers |

---

---

## D-060 — Enterprise Intelligence Vision (Program 3.5A)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Enterprise Intelligence Vision** — freeze long-horizon architecture for enterprise intelligence on MAK. Register 8 vision documents: Enterprise Memory, Business DNA, Process Mining, Decision Intelligence, Consulting Engine, Business Health, Evolution Engine, Enterprise Operating System Principles. Register binding principles: memory and knowledge belong to the enterprise; continuous observation without external consulting; explainable intelligence; measurable evolution; AI accelerates but is never mandatory. **Documentation only** — no code, API, runtime, Foundation, Studio, MDP, Business Intent, Business Computation, Formula Builder, or Computation Engine changes. **Does not alter roadmap** — Program 3.5 Intent Resolver remains next implementation mission after consolidation remediation. |
| **Evidence** | `docs/architecture/MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md` · `MAK-BUSINESS-DNA-ARCHITECTURE.md` · `MAK-PROCESS-MINING-ARCHITECTURE.md` · `MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md` · `MAK-CONSULTING-ENGINE-ARCHITECTURE.md` · `MAK-BUSINESS-HEALTH-ARCHITECTURE.md` · `MAK-EVOLUTION-ENGINE-ARCHITECTURE.md` · `MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md` |
| **Consequences** | Decades-long intelligence evolution has official contracts; future Memory, Mining, DNA, Health, Consulting programs avoid rework; implementation sequence unchanged |

---

## D-061 — Enterprise Architecture Consolidation Audit (Program 3.5B)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Execute the largest architectural audit in MAK history — **discovery only, zero implementation**. Audit all layers (Master Architecture, Foundation, Studio, Runtime, MDP, Business, Intelligence), all documentation, all Decisions (D-001–D-060), all Programs, all Gates, and all parameterization. Register findings in [ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md](./ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md), [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md), [ARCHITECTURE-CONSISTENCY-REPORT.md](./ARCHITECTURE-CONSISTENCY-REPORT.md), and [PROGRAM-SEQUENCE-VALIDATION.md](./PROGRAM-SEQUENCE-VALIDATION.md). **Permanent rule:** no new implementation may start until consolidation remediation missions complete. **Verdict:** platform **not officially consolidated** — 34 architecture debt items (5 P0 at audit time; AD-P0-05 resolved when D-060 merged to `main`). Studio engine stack certified; remaining P0 in doc drift, gate ID collisions, dual formula runtime plan. |
| **Evidence** | [ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md](./ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md) · [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md) |
| **Consequences** | Implementation resume blocked pending Program 3.5C remediation; Program 3.5 Intent Resolver authorized by D-059 but **blocked** by D-061 rule until remediation minimum |

---

## D-062 — Enterprise Architecture Remediation (Program 3.5C)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Complete **Enterprise Architecture Remediation** — eliminate all P0 debt from D-061 audit through **consolidation only** (no functional implementation). Establish official registries: [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md), [GATE-REGISTRY.md](./GATE-REGISTRY.md), [SSOT-REGISTRY.md](./SSOT-REGISTRY.md), [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md), [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md), [DOCUMENT-CLASSIFICATION.md](./DOCUMENT-CLASSIFICATION.md). Renumber deploy gates **G303/G304 → G401/G402**; reserve **G304 exclusively** for Business Intent Resolver. Approve [FORMULA-RUNTIME-UNIFICATION-PLAN.md](./FORMULA-RUNTIME-UNIFICATION-PLAN.md) (plan only — no implementation). Sync ROADMAP/SSOT hierarchy. **Declare platform state: ARCHITECTURE CONSOLIDATED.** **Authorize** Program 3.5 — Business Intent Resolver implementation. **Permanent rule:** no D-xxx, G-xxx, Program, or SSOT doc without registry update. |
| **Evidence** | [ARCHITECTURE-REMEDIATION-REPORT.md](./ARCHITECTURE-REMEDIATION-REPORT.md) |
| **Consequences** | D-061 implementation block lifted; all P0 resolved; implementation resumes from consolidated baseline; formula runtime unification deferred to future program per plan |

---

## D-063 — Business Derivation Architecture (Program 3.6)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Business Derivation Architecture** — official infrastructure by which any business asset is derived from Business Intent. Register all permanent concepts: Business Derivation, Derivation Document, Catalog, Library, Registry, Metadata, Lifecycle, Versioning, Identity, Policies, Validation, Diagnostics, Dependencies, Relationships, Contracts, Compatibility, Lineage, Traceability, History, Ownership, Provenance, Explainability, Regeneration, Synchronization, Invalidation, Diff, Merge, Rollback, Migration, Extension Points. Register official pipeline: Intent → Derivation → Asset → Artifact → Technical Projection → Studio → MDP → Runtime. Register policies: Synchronization (§8), Explainability (§9), Marketplace (§10), AI (§11), Evolution (§12). Register mandatory derivation metadata and 13 derivation categories. **Documentation only** — no code, API, runtime, Foundation, Studio, or Resolver implementation. **Authorize** Program 3.7 — Business Intent Resolver implementation using exclusively this architecture. **Permanent rule:** no Studio may implement proprietary derivation; all derivation reuses this infrastructure. |
| **Evidence** | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |
| **Consequences** | Decades-scale derivation SSOT established; Intent Resolver (3.7) implements Derivation Engine contract (G304); all future Studios consume derivations — never origin business logic |

---

## D-064 — Business Intent Resolver Architecture (Program 3.6.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Business Intent Resolver Architecture** — official SSOT for the sole authorized infrastructure that transforms Business Intent into derived business assets. Register all permanent concepts: Intent Resolver, Resolver Document, Session, Context, Pipeline, Metadata, Lifecycle, Policies, Contracts, Diagnostics, Validation, Explainability, Versioning, Lineage, Dependency Resolution, Strategy, Extension Points, Marketplace Hooks, AI Hooks, Runtime Projection, Preview, Diff, Regeneration, Synchronization, Incremental Update, Rollback, Compatibility, Migration, Cache, Cost Analysis, Optimization, Telemetry, Audit, Security. Register official pipeline: Intent → Capability Resolution → Capability Validation → Capability Compatibility → Business Derivation → Assets → Artifacts → Technical Projection → Studio → MDP → Runtime. Register decision criteria for all derivation kinds, lifecycle operations, integration contracts, and platform guarantees (determinism, idempotence, traceability, reproducibility). **Documentation only** — no code, API, runtime, Foundation, Studio, or Resolver implementation. **Authorize** Program 3.7 — Business Intent Resolver **Implementation** using exclusively this architecture and Business Derivation Architecture (D-063). **Permanent rules:** Resolver is sole resolution authority; no Studio resolution logic; no AI direct resolution. |
| **Evidence** | [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) |
| **Consequences** | Resolver architecture frozen for decades; Program 3.7 (G304) implements this contract; all future derivation depends on Resolver; Studios remain projection editors only |

---

## D-065 — Business Language Architecture (Program 3.6.8)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Business Language Architecture** — official SSOT for how business users create any platform asset using exclusively business language (Objectives, Rules, Processes, Events, Conditions, Expected Results) — never Formulas, AST, JSON, Code, SQL, Engines, or Runtime. Register all permanent concepts: Business Language, Vocabulary, Grammar, Terms, Dictionary, Synonyms, Templates, Sentences, Validation, Semantics, Context, Categories, Confirmation, Suggestions, Wizards, Guided/Visual/Assisted Authoring, Conversation, Prompting, Translation, Explainability, Review, Approval, Evolution, Localization, Marketplace, Versioning, Metadata, Contracts, Compatibility. Register official policies: Intent birth, user conversation, AI assist, platform without AI, confirmation, ambiguity avoidance, no technical exposure, decision explainability. **Documentation only** — no code, API, runtime, Foundation, Studio, or implementation. **Architecture freeze:** no new architecture documentation programs before Program 3.7 — Business Intent Resolver Implementation (G304). **Permanent rule:** Business Language transforms user expression into Business Intent (D-059); all technical derivation remains Resolver-only (D-064). |
| **Evidence** | [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](../architecture/MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) |
| **Consequences** | Business language layer frozen; architecture stack complete (3.4 + 3.6 + 3.6.5 + 3.6.8); Program 3.7 Implementation authorized as immediate next mission; no further architecture docs until 3.7 delivered |

---

## D-066 — Enterprise Digital Organization Architecture (Program 3.6.9)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Adopt permanent **Enterprise Digital Organization Architecture** — official SSOT defining the enterprise as a **Digital Organism**. Register all permanent concepts: Enterprise Organization, Business Organization, Departments, Teams, Roles, Responsibilities, Business Units, Processes, Capabilities, Policies, Knowledge, Goals, Objectives, KPIs, Metrics, Resources, Assets, Risks, Compliance, Approvals, Decision Chains, Organizational Relationships, Operational Networks, Communication Flows, Responsibility Matrix, Business Ownership, Organizational Evolution, Enterprise Topology, Organizational Metadata, Identity, Versioning, Lifecycle. Register official policies for departmental relationships, shared responsibilities, and organizational ownership of processes, workflows, dashboards, automations. Register integration with Business DNA, Enterprise Memory, Knowledge Graph, Process Mining, Consulting Engine, Decision Engine, Evolution Engine. **Enterprise Organization** is official root Business Object (`organization.enterprise`). **Documentation only** — no code, API, runtime, Foundation, Studio, or implementation. **Final structural architecture freeze:** no new structural architecture programs after D-066; platform enters **continuous implementation phase** with Program 3.7 — Business Intent Resolver Implementation (G304). MAK is officially an **Enterprise Operating System** — not a traditional module-centric ERP. |
| **Evidence** | [MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md](../architecture/MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md) |
| **Consequences** | Last structural architecture mission complete; full Intent-driven + organizational stack frozen; continuous implementation authorized; all intelligence operates on organizational graph |

---

## D-067 — Business Intent Resolver Implementation (Program 3.7)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first functional **Business Intent Resolver** under `src/studio/intent/` — sole authorized resolution path. Scope: Resolver Session, Context, Pipeline, Capability Resolution/Validation/Compatibility, Derivation Planning, Diagnostics, Explainability, Metadata, Lineage, Telemetry; end-to-end pipeline Business Language → Intent → Resolver → Derivation → Formula Document → Computation → AST → Evaluation preview; **Formula Document derivation only** — other kinds as extension points. Integrate with Computation Engine (no designer bypass). Register gate **G305**. Authorize **Program 3.8 — Business Computed Fields**. **No new structural architecture.** |
| **Evidence** | `src/studio/intent/` · `scripts/gate-studio-intent-resolver.mjs` (G305 16/16) |
| **Consequences** | Continuous implementation phase begins; Resolver functional; G305 active; Program 3.8 authorized |

---

## D-068 — Business Computed Fields + Business Asset Authoring Principles (Program 3.8)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement the **first official Business Asset** — **Business Computed Field** — under `src/studio/business/`. The asset belongs to **business**, not Field Studio, Formula Builder, Runtime, or Resolver. Official pipeline: Business Language → Intent → Resolver → **Business Computed Field** → Formula Document (projection) → Computation Document → AST → Evaluation → Runtime. Scope: Business Computed Field, Document, Metadata, Lifecycle, Validation, Lineage, Diagnostics, Explainability, Versioning, Compatibility, Policies, Contracts, Preview, Synchronization, Regeneration. Register gate **G306**. Register permanent **Business Asset Authoring Principles** (Dual Authoring, User Choice, Assisted Creation, Business Freedom, Human in Control, Reusable Assets, Technology Transparency, Explainable Platform, **Continuous Business Improvement**) in [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) — principles only, no additional implementation. Authorize **Program 3.9 — Business Workflow**. **No Foundation, Runtime, Studio, Resolver, MDP, or roadmap changes.** |
| **Evidence** | `src/studio/business/` · `scripts/gate-business-computed-fields.mjs` (G306) · [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) |
| **Consequences** | First Business Asset certified; Studios edit assets only; Runtime receives derived projections; permanent authoring principles registered; Program 3.9 authorized |

---

## D-069 — Enterprise Vision Compliance Audit (Program 3.8.5)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Conduct mandatory **Enterprise Vision Compliance Audit** (Program 3.8.5) — documentation-only strategic audit validating platform adherence to [MAK 2035 Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) and EOS principles as of Program 3.8. Produce five audit reports: ENTERPRISE-VISION-COMPLIANCE-AUDIT, USER-EXPERIENCE-JOURNEY-AUDIT, BUSINESS-AUTHORING-AUDIT, PLATFORM-CONSISTENCY-AUDIT, FUTURE-RISKS-AUDIT. Classify findings P0–P3. **Authorize Program 3.9** contingent on audit completion and P0 acknowledgment. **No code, API, database, Foundation, Runtime, Studio, or implementation changes.** |
| **Evidence** | `docs/engineering/ENTERPRISE-VISION-COMPLIANCE-AUDIT.md` · `USER-EXPERIENCE-JOURNEY-AUDIT.md` · `BUSINESS-AUTHORING-AUDIT.md` · `PLATFORM-CONSISTENCY-AUDIT.md` · `FUTURE-RISKS-AUDIT.md` |
| **Consequences** | Vision–implementation delta documented; P0 runtime/UX debt explicit; Program 3.9 authorized |

---

## D-070 — Enterprise Platform Deep Audit (Program 3.8.6)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Conduct mandatory **Enterprise Platform Deep Audit** (Program 3.8.6) — largest platform audit to date. Documentation-only evidence-based audit across Foundation, Runtime, Studio, Business Layer, Enterprise Layer, Intelligence, Business Assets, Business Objects, UX journeys, parameterization, future programs, and technical debt. Produce eleven audit reports: ENTERPRISE-PLATFORM-DEEP-AUDIT (master), PLATFORM-IMPLEMENTATION-AUDIT, BUSINESS-ASSET-AUDIT, BUSINESS-OBJECT-AUDIT, USER-JOURNEY-DEEP-AUDIT, ENTERPRISE-INTELLIGENCE-AUDIT, ARCHITECTURE-CONFORMANCE-REPORT, PARAMETERIZATION-AUDIT, TECHNICAL-DEBT-MASTER-REGISTER, PROGRAM-IMPLEMENTATION-MAP, EXAMPLES-AND-SCENARIOS. Answer central question: conditional YES on architecture trajectory; NO if code/UX frozen today. Classify all findings P0–P3. **Does not block Program 3.9**; informs parallel P0 tracks (Runtime Unification, Business Language UX). **No code, API, database, Foundation, Runtime, Studio, or implementation changes.** |
| **Evidence** | `docs/engineering/ENTERPRISE-PLATFORM-DEEP-AUDIT.md` · full 3.8.6 audit suite (11 documents) |
| **Consequences** | Complete platform evidence baseline; 20 certification answers; consolidated debt register; Program 3.9 scope informed |

---

## D-071 — Platform Sanitization Cycle 1

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Execute **Platform Sanitization Cycle 1** after Program 3.8.6 audit. Correct **only** items classified as BUG or DÍVIDA TÉCNICA that pass mandatory gates 1–10. **Do not** advance Program 3.9 or anticipate roadmap. Cycle 1 scope: (1) fix capability catalog / compatibility SSOT for `compute.formula` + `compute.computed_field` (PARAM-C03); (2) add G305 gate check; (3) register [INTENT-DERIVATION-KIND-SSOT.md](./INTENT-DERIVATION-KIND-SSOT.md); (4) document seed/E2E alignment in `backend/.env.example`. **No UI change · No Runtime behavior change · No Foundation change.** |
| **Evidence** | [PLATFORM-SANITIZATION-CYCLE-1-REPORT.md](./PLATFORM-SANITIZATION-CYCLE-1-REPORT.md) · `capabilityCatalog.js` · G305 |
| **Consequences** | PARAM-C03 resolved; sanitization methodology established; Program 3.9 remains next but blocked until post-sanitization audit certifies classifications |

---

## D-072 — Enterprise Vision Alignment Audit (Program 3.8.7)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Conduct mandatory **Enterprise Vision Alignment Audit** (Program 3.8.7) — vision-only audit of product convergence toward EOS. **Forget roadmap as justification.** Audit architecture → implementation → Runtime → UX → future evolution as one product destiny. Verdict: **SIM, COM AJUSTES** — eight vision adjustments (VA-01–VA-08) required before resuming implementation. **No code, API, UI, Runtime, Foundation, Studio, or implementation.** All Programs paused until vision alignment registered. |
| **Evidence** | [ENTERPRISE-VISION-ALIGNMENT-AUDIT.md](./ENTERPRISE-VISION-ALIGNMENT-AUDIT.md) |
| **Consequences** | Implementation freeze continues; VA-01–08 must be registered in architecture SSOT before any Program resumes |

---

## D-073 — Platform Remediation & Product Alignment

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Execute **Platform Remediation & Product Alignment** phase after D-072 vision audit. **No new Programs. No new features. No UI/Runtime/Foundation/Studio code changes in Cycle 1.** Register vision adjustments VA-01–06 and VA-08 in permanent SSOT: Business Operating Shell Architecture, Product Identity, Expert Mode & Studio Boundary, Navigation & Capability Model, Legacy Transition Register, Platform Remediation Register. Consolidate product identity: BOS = primary surface; ModeloBase1 = runtime template; Formula Builder = platform-only; module navigation = transition. **Implementation remains paused** until remediation gate (VA-07 event bus decision + BOS implementation plan). |
| **Evidence** | [PLATFORM-REMEDIATION-REGISTER.md](./PLATFORM-REMEDIATION-REGISTER.md) · architecture SSOT docs · [ENTERPRISE-VISION-ALIGNMENT-AUDIT.md](./ENTERPRISE-VISION-ALIGNMENT-AUDIT.md) |
| **Consequences** | VA-01–06, VA-08 architecturally binding; LT/LC registers active; Programs 3.9+ blocked until remediation gate |

---

## D-074 — Product Identity Freeze (Program 3.8.8)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted — **FROZEN** |
| **Decision** | **Officially freeze definitive MAK product identity.** No open decisions on UX paradigm, product positioning, BOS, Business First, Expert Mode, Dual Authoring, Business Language, Business Assets, capability navigation, platform home, ModeloBase1 role, Formula Builder role, Studios role, Runtime/Resolver/IA/Marketplace/Intelligence pillars, or any central platform concept. Publish [MAK-PRODUCT-IDENTITY-FREEZE.md](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) as supreme product-identity SSOT. **Close VA-07:** mandatory tenant-scoped domain event bus (L3) for Intelligence identity — implementation deferred, decision frozen. Legacy module-menu UX is **not** product identity; destination = BOS home frozen. **Implementation may resume** under frozen spec. **No Foundation/Runtime/API/DB/UI code in this mission.** |
| **Evidence** | [MAK-PRODUCT-IDENTITY-FREEZE.md](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) |
| **Consequences** | Product identity closed; D-074 gates all future UX/product missions; continuous implementation authorized **under frozen identity** |

---

## D-075 — Business Operating Shell MVP (Program 3.9)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first functional **Business Operating Shell** surface under frozen D-074 identity. Default authenticated route = BOS home (`/`). Preserve `/CadastroEmpresas` and all cadastro runtime. Add Business First entry (`/bos/business-first`), Expert Mode entry (`/bos/expert`), capability/asset-centric home regions, `StudioTechnicalGuard` blocking Formula Builder for business users. Gate **G307** certifies identity compliance. No Foundation/Runtime/API/DB/Studio structural changes. |
| **Evidence** | `src/bos/**` · [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](../architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md) · `scripts/gate-business-operating-shell.mjs` |
| **Consequences** | Product identity visible in UI; legacy module menu demoted; Program 3.10+ builds on BOS surface |

---

## D-076 — Business Workflow MVP (Program 3.10)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Business Workflow** as official reusable Business Asset under D-074. Pipeline: Business Language → Intent → Resolver → Business Workflow → technical projection. Business vocabulary states/transitions/SLA/escalation/assignments. BOS integration (asset, Business First, inbox). No BPMN, no Studio for business users. Gate **G308**. |
| **Evidence** | `src/studio/business/workflow/**` · [PROGRAM-3.10-BUSINESS-WORKFLOW-REPORT.md](./PROGRAM-3.10-BUSINESS-WORKFLOW-REPORT.md) |
| **Consequences** | Workflow asset type implemented; Automation/Dashboard remain extension points |

---

## D-077 — Enterprise Intelligence Foundation (Program 3.11)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement **Enterprise Intelligence Foundation** under D-074: tenant-scoped Domain Event Bus (VA-07 implementation start), Business Memory Foundation, Observation Layer, event timeline, health signals, explainable intelligence records, outcome/decision capture from BOS/Workflow/Intent. Observational only — no AI chat, no autonomous execution. Gate **G309**. |
| **Evidence** | `src/intelligence/**` · [PROGRAM-3.11-ENTERPRISE-INTELLIGENCE-FOUNDATION-REPORT.md](./PROGRAM-3.11-ENTERPRISE-INTELLIGENCE-FOUNDATION-REPORT.md) |
| **Consequences** | Domain events MVP live; Memory/Knowledge/Consulting/Decision/Evolution engines remain extension points |

---

## D-078 — Enterprise Memory Engine MVP (Program 3.12)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Enterprise Memory Engine** under D-074/D-077. Tenant-scoped memory store, event-to-memory persistence, retrieval, replay, context assembly, summaries, BOS projections. Memory belongs to enterprise — not AI. Gate **G310**. |
| **Evidence** | `src/intelligence/memory/engine/**` · [PROGRAM-3.12-ENTERPRISE-MEMORY-ENGINE-REPORT.md](./PROGRAM-3.12-ENTERPRISE-MEMORY-ENGINE-REPORT.md) |
| **Consequences** | Operational memory consultable on BOS; future engines consume memory bridge |

---

## D-079 — Enterprise Knowledge Graph MVP (Program 3.13)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Enterprise Knowledge Graph** from certified Memory Engine. Tenant-scoped nodes/edges, semantic relationships, traversal, retrieval, BOS projections. Knowledge belongs to enterprise — not AI/Studio/Runtime. Gate **G311**. |
| **Evidence** | `src/intelligence/knowledge/graph/**` · [PROGRAM-3.13-ENTERPRISE-KNOWLEDGE-GRAPH-REPORT.md](./PROGRAM-3.13-ENTERPRISE-KNOWLEDGE-GRAPH-REPORT.md) |
| **Consequences** | Knowledge graph MVP live; Consulting/Decision/Evolution consume bridges |

---

## D-080 — Consulting Engine MVP (Program 3.14)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Consulting Engine** consuming Memory + Knowledge Graph. Tenant-scoped analyses, improvement plans, explainable recommendations. Consulting belongs to enterprise — observational, never autonomous. Gate **G312**. |
| **Evidence** | `src/intelligence/consulting/engine/**` · [PROGRAM-3.14-CONSULTING-ENGINE-REPORT.md](./PROGRAM-3.14-CONSULTING-ENGINE-REPORT.md) |
| **Consequences** | Consulting MVP live; Decision/Evolution consume bridges; BOS shows operational recommendations |

---

## D-081 — Decision Engine MVP (Program 3.15)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Decision Engine** consuming Memory + Knowledge Graph + Consulting. Tenant-scoped alternatives, scenarios, confidence, approval workflow, BOS projections. Decisions belong to enterprise — supportive, never autonomous. Gate **G313**. |
| **Evidence** | `src/intelligence/decision/engine/**` · [PROGRAM-3.15-DECISION-ENGINE-REPORT.md](./PROGRAM-3.15-DECISION-ENGINE-REPORT.md) |
| **Consequences** | Decision support MVP live; Evolution consumes bridges; human approval required |

---

## D-082 — Evolution Engine MVP (Program 3.16)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Evolution Engine** consuming full intelligence stack. Tenant-scoped maturity, timeline, progress, roadmaps, BOS projections. Evolution belongs to enterprise — measurable, never autonomous. Gate **G314**. |
| **Evidence** | `src/intelligence/evolution/engine/**` · [PROGRAM-3.16-EVOLUTION-ENGINE-REPORT.md](./PROGRAM-3.16-EVOLUTION-ENGINE-REPORT.md) |
| **Consequences** | Evolution MVP live; Business DNA prepared via seeds; organizational growth trackable on BOS |

---

## D-083 — Business DNA & Maturity MVP (Program 3.17)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Business DNA Engine** consuming full intelligence stack. Tenant-scoped operational identity, capability maturity, fingerprint, patterns, authorized portfolio aggregation, BOS projections. Business DNA belongs to enterprise — descriptive, never autonomous or individual profiling. Gate **G315**. |
| **Evidence** | `src/intelligence/dna/engine/**` · [PROGRAM-3.17-BUSINESS-DNA-MATURITY-REPORT.md](./PROGRAM-3.17-BUSINESS-DNA-MATURITY-REPORT.md) |
| **Consequences** | Organizational identity live on BOS; portfolio layer ready for multi-empresa clients; segmentation/benchmarking foundation prepared |

---

## D-084 — Segmentation, Templates & Advanced Maturity MVP (Program 3.18)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Business Segmentation Engine** consuming Business DNA + full intelligence stack. Tenant-scoped operational segments, template matching, advanced maturity scoring, authorized group benchmarking, BOS projections. Segmentation belongs to enterprise — classifies and explains, never autonomous or individual profiling. Gate **G316**. |
| **Evidence** | `src/intelligence/segmentation/engine/**` · [PROGRAM-3.18-SEGMENTATION-TEMPLATES-MATURITY-REPORT.md](./PROGRAM-3.18-SEGMENTATION-TEMPLATES-MATURITY-REPORT.md) |
| **Consequences** | Segment classification live on BOS; template library for acceleration; authorized benchmarking prepared |

---

## D-085 — Recommendation & Replication MVP (Program 3.19)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Recommendation & Replication Engine** consuming Business DNA + Segmentation + full intelligence stack. Tenant-scoped recommendations, assisted replication within authorized scope, human approval required, BOS projections. Gate **G317**. |
| **Evidence** | `src/intelligence/recommendation/engine/**` · [PROGRAM-3.19-RECOMMENDATION-REPLICATION-REPORT.md](./PROGRAM-3.19-RECOMMENDATION-REPLICATION-REPORT.md) |
| **Consequences** | Corporate recommendations live on BOS; assisted replication prepared; no autonomous execution |

---

## D-086 — Adoption Tracking & Corporate Intelligence MVP (Program 3.20)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Adoption Tracking Engine** and **Corporate Intelligence Engine** consuming Recommendation & Replication + full intelligence stack. Tenant-scoped adoption tracking, authorized corporate aggregation, human approval required, BOS projections. Gate **G318**. |
| **Evidence** | `src/intelligence/adoption/engine/**` · `src/intelligence/corporate/engine/**` · [PROGRAM-3.20-ADOPTION-CORPORATE-INTELLIGENCE-REPORT.md](./PROGRAM-3.20-ADOPTION-CORPORATE-INTELLIGENCE-REPORT.md) |
| **Consequences** | Adoption tracking and corporate intelligence live on BOS; no autonomous execution; no cross-tenant mixing without authorization |

---

## D-087 — Continuous Improvement & Optimization Loop MVP (Program 3.21)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Continuous Improvement Engine** and **Optimization Loop Engine** consuming Adoption + Corporate Intelligence + full intelligence stack. Tenant-scoped improvement cycles, optimization loops with human approval, BOS feedback loop. Gate **G319**. |
| **Evidence** | `src/intelligence/improvement/engine/**` · `src/intelligence/optimization/engine/**` · [PROGRAM-3.21-CONTINUOUS-IMPROVEMENT-OPTIMIZATION-REPORT.md](./PROGRAM-3.21-CONTINUOUS-IMPROVEMENT-OPTIMIZATION-REPORT.md) |
| **Consequences** | Closed loop Recommendation → Adoption → Improvement → Optimization on BOS; no autonomous optimization |

---

## D-088 — Portfolio Intelligence & Command Center MVP (Program 3.22)

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | Accepted |
| **Decision** | Implement first **Portfolio Intelligence Engine** and **Corporate Command Center** consuming Optimization Loop + full intelligence stack. Authorized group-scoped aggregation only, explainable executive view, BOS command center projections. Gate **G320**. |
| **Evidence** | `src/intelligence/portfolio/engine/**` · [PROGRAM-3.22-PORTFOLIO-INTELLIGENCE-COMMAND-CENTER-REPORT.md](./PROGRAM-3.22-PORTFOLIO-INTELLIGENCE-COMMAND-CENTER-REPORT.md) |
| **Consequences** | Multi-company executive view live on BOS with tenant isolation; no cross-tenant mixing without authorization; no autonomous corporate command |

---

## Pending Decisions

| Topic | Blocker |
|-------|---------|
| Backend event bus design | **✅ Resolved D-074** — mandatory tenant-scoped domain event bus; see [MAK-PRODUCT-IDENTITY-FREEZE.md](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) §10 |
| Desktop shell technology | Tauri vs Electron — L7 implementation choice; does not affect topology |

**Resolved (D-014):** Offline sync architecture → Sync Platform (L6.4) + Offline client capability (L7). MAK Studio metadata storage → MDP Metadata Registry (L4).

---

## Superseded

| Item | Superseded aspect | Successor | Register |
|------|-------------------|-----------|----------|
| D-056 consequence | "Program 3.3 Computed Fields first impl" | Resolver first (D-059) | [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md) |
| D-058 consequence | "Computed Fields first mission" | Resolver first (D-059) | SUPERSESSION-REGISTER |
| D-052 freeze text | "until 2.3.6" | G302 done (3.1) | SUPERSESSION-REGISTER |
| D-061 block | All implementation blocked | Lifted by D-062 | SUPERSESSION-REGISTER |
| Deploy G303/G304 | Gate IDs | G401/G402 | [GATE-REGISTRY.md](./GATE-REGISTRY.md) |
| Program 2.3.6 | Program ID | 3.0.5 + 3.1 | [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) |

Full traceability: [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md)

---

*New decisions: add D-011+ with date, status, evidence, consequences. Update [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md).*
