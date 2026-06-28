# MAK 2035 — Master Architecture

**Status:** Official — Definitive platform map  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Decision:** D-014  
**Mission:** Strategic — MAK 2035 Master Architecture  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); supersedes conflicting engineering vision docs

---

## 1. Purpose

This document is the **definitive architectural map** of MAK Gestão at full maturity (horizon 2035). It describes the platform **as it will be when complete** — not only what exists today.

Every future implementation must be compatible with this architecture. No capability may violate layer boundaries, dependency rules, or flows defined here.

| Document role | Relationship |
|---------------|--------------|
| **Constitution** | Rules and prohibitions — highest authority |
| **This document** | Layer topology, flows, platform map — **structural reference** |
| **Platform Language Standard** | Official nomenclature — **vocabulary reference** |
| **MAK-DATA-PLATFORM.md** | Detailed MDP specification |
| **CURRENT-STATE.md** | What exists in code today |
| **ROADMAP.md** | Implementation sequence |

**Amendment:** Layer topology and dependency rules require Decision register entry (D-0XX). Internal layer evolution follows layer-specific governance (Foundation = frozen code).

---

## 2. Platform Vision (2035)

MAK Gestão is a **metadata-driven, multi-tenant, low-code enterprise platform** where:

1. **Definitions** live in MAK DATA PLATFORM (MDP) — entities, fields, relationships, behaviors.
2. **Design** happens in MAK Studio — visual designers over MDP, never parallel UI stacks.
3. **Execution** runs through **Foundation Runtime** — ModeloBase1 + config engines (frozen, backward-compatible).
4. **Business data** persists in PostgreSQL — tenant-scoped, RBAC-protected.
5. **Extensions** publish via **Marketplace** — versioned MDP packages, sandboxed.
6. **Intelligence** operates through **AI Platform** — RBAC-bound agents over MDP graph + APIs.
7. **Knowledge** links to entities via **Knowledge Platform**.
8. **Clients** (Web, Desktop, Mobile) consume the same compiled runtime — online or via **Sync Platform (L6) + Offline capability (L7)**.

---

## 3. Master Layer Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  L7  EXPERIENCE          Web · Desktop · Mobile · Embedded widgets          │
├─────────────────────────────────────────────────────────────────────────────┤
│  L6  PLATFORM SERVICES   Marketplace · Knowledge · AI · Sync                │
├─────────────────────────────────────────────────────────────────────────────┤
│  L5  MAK STUDIO          Visual designers · simulators · publish UI         │
├─────────────────────────────────────────────────────────────────────────────┤
│  L4  MAK DATA PLATFORM   Entity · Data · Relationship Dict. · Metadata Reg. │
├─────────────────────────────────────────────────────────────────────────────┤
│  L3  PLATFORM CORE       Auth · Tenant · RBAC · Deploy · Events · APIs      │
├─────────────────────────────────────────────────────────────────────────────┤
│  L2  FOUNDATION RUNTIME  ModeloBase1 · framework/mak · engines V13–V20      │
│                          cadastro-engine · generator · governance gates     │
├─────────────────────────────────────────────────────────────────────────────┤
│  L1  DOMAIN MODULES      Thin config · business rules · repositories        │
├─────────────────────────────────────────────────────────────────────────────┤
│  L0  DATA & INFRA        PostgreSQL · Redis · Object storage · Cloud/Edge   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer freeze policy

| Layer | Topology | Implementation |
|-------|----------|----------------|
| L2 Foundation Runtime | **Frozen** (Constitution) | Code frozen V10; backward-compatible only |
| L4 MDP | **Stable structure** | Dictionaries + Registry schema evolves via MDP versioning |
| L3 Platform Core | **Stable interfaces** | Services replaceable; contracts stable |
| L5–L7 | **Evolvable** | Built on stable L3–L4 contracts |
| Master Architecture (this doc) | **Versioned** | Amend via D-register; topology changes rare |

---

## 4. Layer Specifications

### L0 — Data & Infrastructure

| Component | Role | 2035 state |
|-----------|------|------------|
| **PostgreSQL** | Business records + MDP definitions + audit | Primary store; multi-tenant `cliente_id` |
| **Redis** (optional) | Rate limit, cache, session denylist | Scale tier |
| **Object storage** | Attachments (Supabase/S3-compatible) | Per-tenant paths |
| **Cloud** | Vercel (web), Railway (API), edge CDN | Primary deployment |
| **Edge** (future) | Read replicas, sync relay nodes | Scale tier |

**Today:** PostgreSQL + optional Redis + Supabase storage + Vercel/Railway.

---

### L1 — Domain Modules

| Attribute | Rule |
|-----------|------|
| Structure | Thin page (~10 LOC) + config factory + metadata |
| Creation | Official generator only |
| Business logic | Repositories, services, Zod schemas, domain hooks |
| Structural UI | **Forbidden** — ModeloBase1 only |
| MDP migration | Module `*Form.constants.js` → Data Dictionary over time |

**2035:** Hundreds of modules; all definitions sourced from MDP publish pipeline; modules hold only irreducible domain rules (pricing engines, fiscal logic, integrations).

---

### L2 — Foundation Runtime

The **frozen execution layer** — certified, governed, SSOT for structural UI.

#### L2.1 ModeloBase1

| Responsibility | Component |
|----------------|-----------|
| Cadastro page orchestration | `ModeloBase1CadastroPage` |
| Visual SSOT | `modeloBase1VisualTokens.js` |
| Config factory | `buildModeloBase1ConfigFromMakModule` |
| Hooks | Infinite list, preferences, search, custom fields |

#### L2.2 framework/mak

| Responsibility | Component |
|----------------|-----------|
| Module runtime | `defineMakModule`, `createMakRuntime` |
| Metadata builders | `buildMakFormMetadata`, `buildMakTableMetadata`, … |
| Config engines | V13 Layout · V14 Field · V16 Validation · V17 Formula · V18 Events · V19 Actions · V20 Workflow |
| Preferences motor | `MakPreferencesEngine`, bootstrap, flush, cross-tab |
| Runtime registries | `*ConfigRegistry.js` — **boot cache**, hydrated from MDP |

#### L2.3 cadastro-engine

| Engine | Role |
|--------|------|
| LayoutEngine | Form layout, panels |
| FieldEngine | Field types, masks |
| ValidationEngine | Client validation primitives |
| RenderEngine | Dynamic rendering |
| CustomFieldEngine | MDP field consumer |

#### L2.4 Generator & Governance

| Tool | Role |
|------|------|
| `generate-cadastro-module.mjs` | Full-stack module scaffold |
| Gates G31–G261 | Architectural enforcement |
| `governance-baseline.json` | Frozen exceptions |

**Conflict resolved:** `framework/cadastro/` (legacy Emp*) is **not** part of 2035 Foundation — fully promoted or removed by IFM 1B.

---

### L3 — Platform Core

**Definition (resolved):** Platform Core is the **operational services layer** — everything required to run a multi-tenant SaaS platform that is **neither UI structure (L2) nor metadata definitions (L4)**.

| Service | Responsibility | Today | 2035 |
|---------|----------------|-------|------|
| **Identity & Auth** | JWT, sessions, token denylist | ✅ Fastify auth | + SSO, MFA |
| **Tenant** | `Cliente`, isolation, limits | ✅ | + usage metering |
| **Multi-empresa** | `Empresa`, `PermissaoEmpresa`, header scope | ✅ | Stable |
| **RBAC** | CONSULTA / OPERADOR / ADMIN | ✅ `cadastroRbac.js` | → MDP Permission Registry |
| **Module licensing** | `ClienteModulo` | ✅ | → Marketplace entitlements |
| **Event bus** | Domain + platform events | ❌ | Server-side automation, AI triggers |
| **Audit** | `AuditLog`, field history | ✅ partial | Full platform audit |
| **Sequencing** | `id_global`, entity codes | ✅ | Stable |
| **API gateway pattern** | `/api/*` Fastify routes | ✅ | + public API, webhooks |
| **Deploy & config** | Env, health, migrations | ✅ partial | Unified deploy pipeline |
| **Metrics & observability** | Latency, counters | ✅ partial | Full APM |

Platform Core **does not** render UI or store field definitions — it **secures, routes, and operates** the platform.

---

### L4 — MAK DATA PLATFORM (MDP)

The **metadata nucleus** — persisted SSOT for all platform definitions.

| Dictionary / Registry | Purpose |
|-----------------------|---------|
| **Entity Dictionary** | All entities, modules, persistence mapping, lifecycle |
| **Data Dictionary** | All fields — native, custom, computed (evolved from CADCPS) |
| **Relationship Dictionary** | Entity graph — cardinality, dependencies, inheritance |
| **Metadata Registry** | Layouts, events, actions, formulas, validations, workflows, permissions, dashboards, pivots, reports, integrations |

| API group | Consumers |
|-----------|-----------|
| `/api/mdp/entities` | Studio, generator, IA |
| `/api/mdp/fields` | Studio, Field Engine |
| `/api/mdp/relationships` | Studio, IA graph |
| `/api/mdp/registry` | All designers, compile pipeline |
| `/api/mdp/introspect` | IA agents, SDK |
| `/api/mdp/compile/{moduleId}` | Runtime hydration |
| `/api/mdp/publish` | Versioning, Marketplace |

**Boot flow (2035):**

```
MDP (persisted, versioned)
  → compile(moduleId, version)
  → runtime config bundle
  → makBootstrap hydration
  → engine registries (cache)
  → ModeloBase1 factory
  → rendered application
```

Detail: [MAK-DATA-PLATFORM.md](../engineering/MAK-DATA-PLATFORM.md)

---

### L5 — MAK Studio

Visual design surface — **never a parallel runtime**.

| Studio | Edits (via MDP) | Foundation engine |
|--------|-----------------|-------------------|
| Layout Studio | Layout definitions | V13 Layout Config |
| Field Studio | Field definitions | V14 Field Config |
| Table Studio | Columns, sort, filters | Table metadata + prefs |
| Cards Studio | Card fields, view modes | Search metadata |
| Formula Studio | Formula definitions | V17 Formula |
| Validation Studio | Rules | V16 Validation |
| Events Studio | Lifecycle hooks | V18 Events |
| Actions Studio | Toolbar/form actions | V19 Actions |
| Workflow Studio | Steps, conditions | V20 Workflow |
| Permission Studio | Role capabilities | MDP Permission Registry |
| Dashboard Studio | Widgets, KPIs | MDP Dashboard type |
| Integration Studio | External connectors | MDP Integration type |
| Theme Studio | Tokens, branding | Visual tokens (tenant scope) |

**Rule:** Studio writes MDP only. Preview uses `compile` + Foundation runtime — same path as production.

**Prerequisite:** MDP-4 (Metadata Registry + introspection API).

---

### L6 — Platform Services

#### L6.1 Marketplace

| Component | Role |
|-----------|------|
| **Package format** | Versioned MDP bundle (`.makpkg`) — entities, fields, modules, themes |
| **Publisher** | ISV / partner submission |
| **Sandbox** | Isolated compile + test runtime |
| **Entitlements** | Extends `ClienteModulo` — install, license, revoke |
| **Ratings & compatibility** | Platform version matrix |

Flow: Publish package → review → Marketplace listing → tenant install → MDP merge → compile → deploy.

#### L6.2 Knowledge Platform

| Component | Role |
|-----------|------|
| **Content store** | Articles, procedures, help, training |
| **Entity linking** | `entityId` + `fieldId` anchors to MDP |
| **Contextual help** | In-app from Knowledge + IA |
| **Separate from MDP** | Content layer; references metadata |

#### L6.3 AI Platform

| Component | Role |
|-----------|------|
| **Agent runtime** | Orchestrated LLM + tools |
| **Context** | MDP introspection — entities, fields, relationships |
| **Tools** | CRUD APIs (RBAC-scoped), workflow triggers, report generation |
| **Guardrails** | No bypass of auth; no direct DB; audit all actions |
| **Studio assist** | Design suggestions, formula generation, validation hints |
| **Agents** | Configurable per tenant — roles, allowed entities, tools |

**Rule:** IA never trains on tenant data without contract; inference uses API boundaries only.

#### L6.4 Sync Platform

| Component | Role |
|-----------|------|
| **Outbox** | Mutation queue per client/device |
| **Replication** | Business records + MDP definition snapshots |
| **Conflict resolution** | Optimistic concurrency (extends preferences model) |
| **Real-time** (optional) | WebSocket / SSE for live updates |

**Conflict resolved:** Sync Platform (L6.4) owns replication protocol. Offline is an **L7 client capability** (definition cache, local data store, mutation queue) that consumes Sync — not a separate platform layer.

---

### L7 — Experience Layer

| Client | Technology (2035 target) | Foundation reuse |
|--------|--------------------------|------------------|
| **Web** | React + Vite (today) | Full ModeloBase1 |
| **Desktop** | Tauri/Electron + shared runtime bundle | Same compile output |
| **Mobile** | React Native or PWA + adaptive shell | Same MDP compile; mobile layout variants in MDP |
| **Embedded widgets** | iframe / web component SDK | Scoped module render |

#### L7 — Offline capability

| Component | Role |
|-----------|------|
| **Definition cache** | Compiled MDP bundle local |
| **Data cache** | IndexedDB / SQLite (Desktop/Mobile) |
| **Mutation queue** | Offline writes → Sync Platform (L6) on reconnect |
| **Sync status** | Extends current prefs `syncStatus` pattern |

**Rule:** One compiled runtime per module version — multiple shells, zero duplicate business logic.

---

## 5. Cross-Cutting Concerns

### Versionamento (Versioning)

| Object | Version model |
|--------|---------------|
| MDP definitions | Semantic version + revision; draft → published |
| Module runtime bundle | Compiled hash pinned per tenant/environment |
| Marketplace packages | `makpkg` version + platform compatibility range |
| User preferences | `versao_schema` (existing) + overlay on published layout |
| Foundation code | Governance baseline version (V10.x) |

### Publicação (Publication)

```
Studio design (draft)
  → validate (gates + schema)
  → publish to MDP (version bump)
  → compile(moduleId, version)
  → deploy pipeline
  → tenant activation (ClienteModulo / feature flag)
  → runtime hydration
  → live application
```

Rollback = activate previous MDP version + recompile.

### Pacotes & Extensions

| Type | Format | Installed via |
|------|--------|---------------|
| **Module package** | `.makpkg` | Marketplace or private registry |
| **Theme extension** | MDP theme definitions | Marketplace |
| **Integration extension** | MDP integration registry entry | Marketplace |
| **SDK extension** | npm `@mak/sdk-*` | Developer install |

Extensions **must not** patch Foundation code — only MDP definitions + approved hooks.

### SDK (2035)

| SDK | Audience | Capabilities |
|-----|----------|--------------|
| **@mak/sdk-core** | Partners | MDP read, compile, validate |
| **@mak/sdk-studio** | Studio plugins | Designer extensions |
| **@mak/sdk-agent** | IA builders | Tool registration, context |
| **@mak/cli** | DevOps | Deploy, migrate, package publish |

### Public APIs

| API surface | Auth | Scope |
|-------------|------|-------|
| `/api/*` | JWT + tenant | Business CRUD (today) |
| `/api/mdp/*` | JWT + admin | Metadata management |
| `/api/public/v1/*` | API key + OAuth | Partner integrations (2035) |
| `/api/ai/v1/*` | JWT + agent scope | IA tools |
| `/api/marketplace/v1/*` | JWT + publisher | Package management |
| Webhooks | Signed payloads | Event bus outbound |

---

## 6. Master Flow — End to End

### 6.1 Design-time flow

```
Platform Engineer / Consultant
        ↓
   MAK Studio (L5)
        ↓ read/write
   MAK DATA PLATFORM (L4)
   Entity · Data · Relationship · Metadata Registry
        ↓ validate + publish
   Version & Publish Pipeline
        ↓ compile
   Runtime Config Bundle
        ↓ optional
   Marketplace (L6) — package export/import
```

### 6.2 Runtime flow

```
End User
        ↓
Experience Layer (L7) — Web · Desktop · Mobile
        ↓
Platform Core (L3) — Auth · Tenant · RBAC · Module Guard
        ↓
Foundation Runtime (L2)
   ModeloBase1 → framework/mak → Config Engines V13–V20
        ↓ hydrated from
   MDP compiled bundle (L4 cache)
        ↓
Domain Module (L1) — business rules, repository
        ↓
Platform Core API
        ↓
PostgreSQL (L0) — business data
```

### 6.3 Intelligence flow

```
User / Scheduler / Event
        ↓
AI Platform (L6) — Agent runtime
        ↓ context from
MDP introspection (entities · fields · relationships)
        ↓ tools via
Platform Core APIs (RBAC-scoped)
        ↓ optional write
MDP (suggestions) · Business data (actions)
        ↓ audit
AuditLog
```

### 6.4 Offline flow

```
Mobile / Desktop client
        ↓
Offline Platform (L7 capability)
   local MDP snapshot + IndexedDB/SQLite
        ↓ queue mutations
Sync Platform (L6)
        ↓ on reconnect
Platform Core API → PostgreSQL
        ↓ conflict resolve
Merge + audit
```

### 6.5 Complete platform flow (single diagram)

```
                    ┌──────────────┐
                    │   Usuário    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         MAK Studio    Aplicação    Marketplace
         (design)    Web/Desktop/   (packages)
              │         Mobile          │
              ▼            │            ▼
         ┌────────────────────────────────┐
         │     MAK DATA PLATFORM (MDP)    │
         │  Entity · Data · Relationship  │
         │       Metadata Registry        │
         └───────────────┬────────────────┘
                         │ compile/publish
                         ▼
         ┌────────────────────────────────┐
         │       PLATFORM CORE          │
         │  Auth · Tenant · RBAC · API  │
         │  Events · Deploy · Audit       │
         └───────────────┬────────────────┘
                         ▼
         ┌────────────────────────────────┐
         │     FOUNDATION RUNTIME       │
         │  ModeloBase1 · mak · engines │
         └───────────────┬────────────────┘
                         ▼
         ┌────────────────────────────────┐
         │      DOMAIN MODULES          │
         └───────────────┬────────────────┘
                         ▼
         ┌────────────────────────────────┐
         │   PostgreSQL · Storage · CDN   │
         └────────────────────────────────┘
              ▲                    ▲
              │                    │
         Sync Platform         AI Platform
              ▲                    │
         Offline cache       Knowledge Platform
```

---

## 7. Capability Positioning Matrix

| Capability | Layer | Status today | MDP type |
|------------|-------|--------------|----------|
| Cadastro list/form/search | L2 ModeloBase1 | ✅ | Layout + Field |
| Layout config | L2 V13 | ✅ | Registry: layout |
| Field config | L2 V14 | ✅ | Registry: field |
| Validation | L2 V16 | ✅ | Registry: validation |
| Formula | L2 V17 | ✅ | Registry: formula |
| Events | L2 V18 | ✅ client-only | Registry: event |
| Actions | L2 V19 | ✅ client-only | Registry: action |
| Workflow | L2 V20 | ✅ client-only | Registry: workflow |
| Custom fields | L4 CADCPS partial | ⚠️ | Data Dictionary |
| Preferences/layout | L2 + L0 | ✅ | Registry + user overlay |
| Permissions | L3 RBAC | ✅ hardcoded | Registry: permission |
| Dashboards | L5 Studio | ❌ | Registry: dashboard |
| Pivots/grouping | L2 disabled | ❌ | Registry: pivot (V21+ engine) |
| Reports/export | L1 domain | ⚠️ | Registry: report |
| Integrations | L6 | ❌ | Registry: integration |
| Multi-tenant | L3 | ✅ | Entity scope |
| Marketplace | L6 | ❌ | Package format |
| Knowledge | L6 | ❌ | Content + entity links |
| IA / Agents | L6 | ❌ | Agent + tools |
| Sync | L6 | ❌ | Outbox protocol |
| Offline | L7 capability | ⚠️ prefs only | Definition snapshot |
| Desktop | L7 | ❌ | Same compile |
| Mobile | L7 | ❌ | Same compile + adaptive layout |
| SDK | L6/L7 | ❌ | npm packages |
| Versioning | L4 MDP-5 | ⚠️ prefs only | Full MDP versioning |
| Publication | L4 MDP-5 | ❌ | Publish pipeline |

---

## 8. Implementation Programs (Sequence)

Aligned with [ROADMAP.md](../engineering/ROADMAP.md) — no conflict.

| Program | Delivers | Master layers |
|---------|----------|---------------|
| **0** OS | Constitution, governance, docs | All (rules) |
| **1 IFM** | Stability, architecture cleanup, MDP | L0–L4 foundation |
| **2 Studio** | MAK Studio designers | L5 |
| **3 Ecosystem** | Marketplace, SDK, public API | L6 packages |
| **4 Intelligence** | AI Platform, agents | L6 AI |
| **5 Knowledge** | Knowledge Platform | L6 Knowledge |
| **6 Omnichannel** | Sync, Offline, Desktop, Mobile | L6 Sync + L7 |
| **Ongoing** | Domain modules via generator | L1 |

---

## 9. Architectural Conflicts — Resolved

| Conflict | Resolution in this document |
|----------|----------------------------|
| "Platform Core" undefined | Defined as L3 — auth, tenant, RBAC, events, deploy, APIs |
| MDP vs Foundation registries | MDP = persisted SSOT; engine registries = boot cache |
| Sync vs Offline separate platforms | Sync = L6 service; Offline = L7 client capability on Sync |
| Studio as parallel UI | Studio = L5 MDP editor only; preview uses Foundation |
| CADCPS vs Data Dictionary | CADCPS evolves into MDP Data Dictionary (D-012) |
| `framework/cadastro` in 2035 | Not in target architecture — promoted/removed (IFM 1B) |
| Constitution vs Master Architecture authority | Constitution > Master Architecture > engineering docs |
| IA direct DB access | Forbidden — API + MDP introspection only |
| Marketplace code injection | Forbidden — MDP packages only |

---

## 10. Compatibility Rules (Binding)

1. **No layer skipping** — Studio cannot write directly to Foundation code in production.
2. **No parallel metadata** — all definitions in MDP (L4).
3. **No parallel UI runtime** — all cadastro through ModeloBase1 (L2).
4. **Tenant isolation** — every L0–L4 operation scoped by `cliente_id`.
5. **RBAC everywhere** — including IA agents and Marketplace installs.
6. **Compile before run** — no interpreted module JS in production path (2035 target).
7. **Version pinning** — production runs pinned MDP version per environment.
8. **Foundation amendment** — L2 code changes require Constitution amendment process.
9. **Master architecture amendment** — layer topology changes require D-register entry.
10. **Promotion over duplication** — Constitution Pillar 5 applies across all layers.

---

## 11. Document Map

| Question | Read |
|----------|------|
| What are the rules? | [Constitution](../constitution/00-MAK-CONSTITUTION.md) |
| What is the full platform map? | **This document** |
| What is the official vocabulary? | [MAK-PLATFORM-LANGUAGE-STANDARD.md](./MAK-PLATFORM-LANGUAGE-STANDARD.md) |
| What exists in code today? | [CURRENT-STATE.md](../engineering/CURRENT-STATE.md) |
| What is MDP detail? | [MAK-DATA-PLATFORM.md](../engineering/MAK-DATA-PLATFORM.md) |
| What to build next? | [ROADMAP.md](../engineering/ROADMAP.md) |
| Why was this decided? | [DECISIONS.md](../engineering/DECISIONS.md) |

---

## 12. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-28 | Initial master architecture — D-014 |

---

*This is the definitive map. Build accordingly.*
