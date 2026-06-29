# DECISIONS — Architectural Decision Register

**Status:** Living document  
**Last updated:** 2026-06-29 (D-040 Contribution Engine — foundation closed)
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

## Pending Decisions

| Topic | Blocker |
|-------|---------|
| Backend event bus design | Automation Studio requirements — L3 Platform Core event bus spec in Master Architecture §L3 |
| Desktop shell technology | Tauri vs Electron — L7 implementation choice; does not affect topology |

**Resolved (D-014):** Offline sync architecture → Sync Platform (L6.4) + Offline client capability (L7). MAK Studio metadata storage → MDP Metadata Registry (L4).

---

## Superseded

_None yet._

---

*New decisions: add D-011+ with date, status, evidence, consequences. Update [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md).*
