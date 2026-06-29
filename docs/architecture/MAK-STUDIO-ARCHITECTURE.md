# MAK Studio Architecture

**Status:** Official — Permanent architecture reference for Program 2  
**Version:** 1.4.0  
**Effective date:** 2026-06-29  
**Decision:** D-031 · **SDK:** D-032 · **Design System:** D-033 · **Events:** D-034 · **Governance:** D-035 (Program 2.0.8)  
**Mission:** Program 2.0 — MAK Studio Foundation Architecture  
**Layer:** L5 (Experience Authoring)  
**Hierarchy:** Constitution → Master Architecture → **This document** → Engineering Docs → Implementation

---

## 1. Purpose

This document defines the **internal architecture of MAK Studio** — the visual metadata authoring environment at L5 of the MAK 2035 stack. It is the permanent reference for all Program 2 sub-phases (Layout Studio, Field Studio, Workflow Studio, etc.).

MAK Studio is **not** a parallel runtime. It is a **design surface** that reads and writes exclusively to the MAK DATA PLATFORM (MDP, L4) and previews through the same compile path as production (MDP-5 → CRB → Runtime Bridge → Foundation).

### 1.1 Scope of this document

| In scope | Out of scope (later missions) |
|----------|----------------------------|
| Shell, navigation, workspace, dock, panels | Layout Studio editor implementation |
| Preview, publish, history, command palette | Field / Workflow / Dashboard editors |
| MDP / Runtime Bridge / Publish integration | Marketplace install UI |
| Permissions model, Studio APIs | Collaboration realtime sync |
| Extension points for AI, Marketplace, multi-template | Business module changes |

### 1.2 Binding rules

1. **Studio writes MDP only** — no parallel metadata storage (P2, P5, P14).
2. **Preview = production compile path** — `mdpCompileService` for draft and publish (P3).
3. **Foundation frozen** — Studio never patches `src/framework/mak/` or `ModeloBase1` (P4).
4. **Runtime read-only** — Studio never calls runtime registries for writes (P15).
5. **API first** — all Studio operations go through `/api/mdp/*` (P13).

**Related:** [MAK-2035-MASTER-ARCHITECTURE.md](./MAK-2035-MASTER-ARCHITECTURE.md) §L5 · [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](./MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) · [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](../engineering/IFM-PHASE-2-MAK-STUDIO-BRIEF.md)

---

## 2. Position in the Platform

```
┌─────────────────────────────────────────────────────────────────────────┐
│ L7 Experience          Web · Desktop · Mobile · Embedded widgets        │
├─────────────────────────────────────────────────────────────────────────┤
│ L6 Platform Services   Marketplace · Knowledge · AI · Sync              │
├─────────────────────────────────────────────────────────────────────────┤
│ L5 MAK STUDIO ◄─────── THIS DOCUMENT                                    │
│   Shell · Workspace · Designers · Preview · Publish Center              │
├─────────────────────────────────────────────────────────────────────────┤
│ L4 MAK DATA PLATFORM   Entity · Data · Relationship · Registry · Publish│
├─────────────────────────────────────────────────────────────────────────┤
│ L3 Platform Core       Auth · Tenant · RBAC · Event Bus (future)        │
├─────────────────────────────────────────────────────────────────────────┤
│ L2 Foundation Runtime  ModeloBase1 · framework/mak · Runtime Bridge       │
├─────────────────────────────────────────────────────────────────────────┤
│ L1 Domain Modules      empresas · cadcps · …                            │
├─────────────────────────────────────────────────────────────────────────┤
│ L0 Data                PostgreSQL · Prisma · tenant-scoped records        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Design-time data flow

```
Author (Studio UI)
      ↓ write draft
MDP-4 Metadata Registry  (/api/mdp/registry)
      ↓ preview request
MDP-5 Compile Service     (/api/mdp/compile/:moduleId)
      ↓ CRB payload
Preview Engine (Studio)   → same hydration adapter as Runtime Bridge
      ↓ publish
MDP-5 Publish Engine      (/api/mdp/publish)
      ↓ pin + deploy
Runtime Bridge (L2 boot)  → reloadRuntimeBridgeModule()
      ↓
Foundation Registries → ModeloBase1 → live application
```

---

## 3. Architectural Principles

| Principle | Studio application |
|-----------|-------------------|
| **P2 SSOT** | MDP is the only metadata store; Studio session state is ephemeral |
| **P3 Compile never duplicate** | Preview and production share `mdpCompileService.buildCrb()` |
| **P5 Metadata first** | Designers edit registry entries, not React components |
| **P11 No parallel platforms** | Studio is not a second ERP UI — it is an MDP editor |
| **P13 API first** | No direct Prisma or registry file writes from Studio |
| **P14 Studio edits definitions** | Studio → MDP; never Studio → Foundation code |
| **P15 Runtime never edits metadata** | Preview iframe/surface is read-only consumer of CRB |

---

## 4. Studio Shell

The **Studio Shell** is the persistent chrome wrapping every designer session. It owns authentication gate, tenant context, module scope, and global services.

### 4.1 Responsibilities

| Concern | Owner | Notes |
|---------|-------|-------|
| Auth gate | Studio Shell | Reuses Platform Core JWT; redirect if expired |
| Tenant / cliente scope | Studio Shell | `cliente_id` from token; platform scope for engineers |
| Module selector | Navigation | Lists modules from MDP entity registry + permissions |
| Base template selector | Navigation | `baseTemplateId` (default `modelobase1`; extensible) |
| Environment badge | Publish Center | Shows pinned version per env (dev/qa/production) |
| Designer router | Shell | `/studio/:moduleId/:designerId` — lazy-loads designer plugins |
| Global error boundary | Shell | Surfaces MDP API errors; never silent fallback to local config |
| Session persistence | Shell | Last module, dock layout, panel sizes — **UI prefs only**, not metadata |

### 4.2 Shell layout (conceptual)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Studio Shell — Top Bar (module · env · version · publish · user)         │
├────────┬─────────────────────────────────────────────────┬───────────────┤
│        │                                                 │               │
│  Dock  │              Workspace                          │  Dock         │
│  Left  │         (active designer canvas)                │  Right        │
│        │                                                 │               │
│ Explorer│                                                │ Inspector     │
│ Outline │                                                │ Properties    │
│ Assets  │                                                │               │
│         │                                                 │               │
├────────┴─────────────────────────────────────────────────┴───────────────┤
│ Dock Bottom — Runtime Console · Preview controls · Validation messages   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Code location

```
src/studio/
├── sdk/                    ← Studio SDK (Program 2.0.5)
│   ├── createStudioSdk.js
│   ├── contracts/          ← Workspace, Dock, Explorer, … APIs
│   ├── studioDesignerContract.js
│   └── studioPluginContract.js
├── designSystem/           ← Design System Foundation (Program 2.0.6)
│   ├── registry/           ← Token, Theme, Motion, Accessibility, Manifest
│   ├── contracts/          ← Component Manifest, Universal Component Model, AI Knowledge
│   ├── catalogs/
│   └── integration/        ← Studio registry → manifest bridge
├── events/                 ← Event Architecture (Program 2.0.7)
│   ├── hub/
│   ├── registry/
│   ├── contracts/
│   ├── catalogs/
│   └── integration/
├── governance/             ← Architecture Governance (Program 2.0.8)
│   ├── dependencyGraph.js
│   └── architectureRules.js
├── registry/               ← Component, Property, Event, Action, Capability registries
│   └── catalogs/
├── shell/                  ← Phase 2.1
├── navigation/
├── workspace/
├── dock/
├── services/
└── designers/              ← sub-phase plugins (layout, field, …)
```

**Layer order:** Studio SDK → Design System → Event Architecture → Governance → Studio Shell → Designers

**Rule:** `src/studio/` is a **new L5 package** — it must not import mutation paths into Foundation or domain modules.

---

## 5. Navigation

Navigation provides **context switching** without leaving the shell.

### 5.1 Navigation surfaces

| Surface | Purpose |
|---------|---------|
| **Module picker** | Select `moduleId` (e.g. empresas) from MDP entities with studio permission |
| **Designer picker** | Select active designer: Layout, Field, Validation, Workflow, … |
| **Entity context** | When designer is entity-scoped, show `entityId` from MDP-1 |
| **Version context** | Draft vs published view; link to Publish Center |
| **Environment switcher** | Read-only for preview target (which pin CRB to compare) |
| **Breadcrumb** | `Module › Designer › Entry › Section` |

### 5.2 Routing contract

| Route | Designer |
|-------|----------|
| `/studio` | Module picker (landing) |
| `/studio/:moduleId` | Designer picker for module |
| `/studio/:moduleId/layout` | Layout Studio |
| `/studio/:moduleId/field` | Field Studio (future) |
| `/studio/:moduleId/validation` | Validation Studio (future) |
| `/studio/:moduleId/publish` | Publish Center |

Deep links carry `?entryId=` and `?baseTemplateId=` query params — never store metadata in URL beyond identifiers.

---

## 6. Workspace

The **Workspace** is the central editing region. Each **Designer Plugin** mounts here.

### 6.1 Workspace contract

Every designer plugin implements:

```typescript
interface StudioDesignerPlugin {
  designerId: string;                    // e.g. "layout"
  supportedEntryTypes: MdpEntryType[];   // e.g. ["layout","section","panel"]
  supportedBaseTemplates: string[];      // e.g. ["modelobase1"]
  mount(workspaceContext: WorkspaceContext): ReactNode;
  onSelectionChange?(entryId: string | null): void;
  getUndoScope?(): UndoScope;
}
```

### 6.2 WorkspaceContext (provided by shell)

| Field | Source |
|-------|--------|
| `moduleId` | Navigation |
| `baseTemplateId` | Navigation |
| `draftVersionId` | MDP version API |
| `introspect` | `GET /api/mdp/introspect` |
| `selection` | Explorer / Outline sync |
| `dispatchCommand` | Command Palette |
| `pushHistory` | History service |
| `openPreview` | Preview Engine |

### 6.3 Multi-designer coexistence

- Only **one active designer** occupies the workspace at a time.
- Switching designers **preserves shell state** (docks, selection module) but clears designer-local selection.
- Shared selection (Explorer/Outline) filters to entry types valid for active designer.

---

## 7. Dock System

The **Dock System** manages resizable, collapsible panels around the workspace. Inspired by IDE patterns (VS Code / Figma dev mode) but scoped to metadata authoring.

### 7.1 Dock zones

| Zone | Default panels | Resizable |
|------|----------------|-----------|
| **Left** | Explorer, Outline | Yes |
| **Right** | Inspector, Properties | Yes |
| **Bottom** | Runtime Console, Preview log | Yes |
| **Top** | (reserved — merged into Shell top bar) | — |

### 7.2 Dock state

- Persisted in **Studio UI preferences** (localStorage or user prefs API) — **not** in MDP.
- Default layout defined per designer; user overrides allowed.
- Min/max widths enforced for accessibility (WCAG touch targets).

### 7.3 Panel registry

```typescript
interface DockPanelDefinition {
  panelId: string;
  title: string;
  zone: "left" | "right" | "bottom";
  defaultVisible: boolean;
  component: React.ComponentType<DockPanelProps>;
  designers?: string[];  // omit = all designers
}
```

Shell registers core panels; designer plugins register additional panels (e.g. Layout grid settings in Properties).

---

## 8. Explorer

The **Explorer** is a hierarchical tree of MDP registry entries for the active module and designer.

### 8.1 Data source

| Source | API |
|--------|-----|
| Registry entries | `GET /api/mdp/registry?moduleId=&entryType=` |
| Entity graph | `GET /api/mdp/introspect` |
| Bindings | Included in registry entry payloads |

### 8.2 Tree structure

```
moduleId (empresas)
├── base_template
├── layout
│   ├── section
│   └── panel
├── field_config
├── validation
├── event / action / formula / workflow
└── reserved (dashboard, report, …) — read-only until designer exists
```

### 8.3 Interactions

| Action | Behavior |
|--------|----------|
| Select node | Syncs Outline, Inspector, Workspace selection |
| Create | `POST /api/mdp/registry` (draft entry) |
| Rename | `PUT /api/mdp/registry/:id` (label only) |
| Delete | `DELETE /api/mdp/registry/:id` (draft only; published requires deprecate flow) |
| Filter | By entryType, status, enabled |

**Rule:** Explorer never shows compiled CRB nodes as editable — only MDP registry entries.

---

## 9. Inspector

The **Inspector** shows **read-only contextual metadata** for the selected registry entry or graph node.

### 9.1 Inspector sections

| Section | Content |
|---------|---------|
| **Identity** | entryId, entryType, moduleId, entityId, baseTemplateId |
| **Lifecycle** | status (draft/published), versionId, contentHash |
| **Bindings** | entity/field/relationship links |
| **Dependencies** | From CRB dependencyGraph (read via introspect) |
| **Schema** | JSON Schema from `mdp_registry_schema` |
| **Audit** | Last modified, author (from `mdp_registry_audit`) |

### 9.2 Inspector vs Properties

| Panel | Editable | Purpose |
|-------|----------|---------|
| **Inspector** | Read-only | Diagnostics, IDs, bindings, audit |
| **Properties** | Editable | Payload fields per entryType schema |

---

## 10. Properties Panel

The **Properties Panel** is the **schema-driven editor** for the selected entry's `payload` JSON.

### 10.1 Rendering strategy

1. Fetch JSON Schema for `entryType` from MDP-4 (`mdp_registry_schema`).
2. Render form controls via shared `StudioSchemaForm` component.
3. Validate client-side against schema; server validates on save.
4. Debounced save → `PUT /api/mdp/registry/:id` (optimistic UI with rollback).

### 10.2 Entry-type extensions

Designer plugins may register **custom property editors** for specific payload keys:

```typescript
registerPropertyEditor({
  entryType: "layout",
  payloadKey: "panels",
  component: LayoutPanelsEditor,  // Layout Studio Phase 2.1
});
```

Custom editors still persist through MDP registry API — no local-only state.

---

## 11. Outline

The **Outline** shows the **structural composition** of the current design artifact — e.g. layout hierarchy: Layout → Sections → Panels → Fields.

### 11.1 Difference from Explorer

| Explorer | Outline |
|----------|---------|
| Flat/tree by entryType | Semantic hierarchy for active artifact |
| All registry entries | Focused on current layout/form/view being edited |
| CRUD operations | Reorder, reparent (drag-drop) |

### 11.2 Outline operations

- **Reorder** — updates `sort_order` + bindings via registry API
- **Reparent** — updates `mdp_registry_binding` targets
- **Visibility toggle** — `enabled` flag on entry (draft)

Outline syncs bidirectionally with Workspace canvas selection.

---

## 12. Asset Manager

The **Asset Manager** catalogs **reusable definitions** attachable to designs.

### 12.1 Asset categories

| Category | Source | Examples |
|----------|--------|----------|
| **Entities** | MDP-1 | EmpresaCadastro |
| **Fields** | MDP-2 | Native + custom field defs |
| **Relationships** | MDP-3 | Entity relations |
| **Registry templates** | MDP-4 | Cloned layout/section/panel patterns |
| **Icons / tokens** | MDP-4 `theme` (future) | Brand assets |
| **Marketplace packages** | L6 (future) | Imported `.makpkg` assets |

### 12.2 Drag-to-bind

Dragging an asset onto the workspace creates or updates **bindings** on the target registry entry — never duplicates the asset definition.

---

## 13. Runtime Console

The **Runtime Console** surfaces **compile, validation, and preview diagnostics** in the bottom dock.

### 13.1 Message sources

| Source | Example |
|--------|---------|
| Schema validation | "field_config.nativeFields: missing required field" |
| Compile service | CRB meta counts, integrityHash |
| Preview Engine | Hydration warnings from Runtime Bridge adapter |
| Publish Engine | Publish/rollback events |
| Governance | Gate hints (dev mode only) |

### 13.2 Log levels

`error` · `warn` · `info` · `debug` — filterable; errors block publish.

---

## 14. Preview Engine

The **Preview Engine** renders **draft or pinned CRB** through Foundation runtime without publishing.

### 14.1 Preview flow

```
1. Author saves draft registry entries (MDP-4)
2. Studio calls POST /api/mdp/compile/:moduleId { draft: true, versionId }
3. Compile service returns CRB payload (same shape as publish)
4. Preview Engine passes CRB to shared hydration adapter (Runtime Bridge crbHydrationAdapter)
5. Foundation registries hydrate in isolated preview context
6. ModeloBase1 renders in preview iframe / embedded surface
```

### 14.2 Preview isolation

| Aspect | Strategy |
|--------|----------|
| **Runtime scope** | Separate React root or iframe — no mutation of live app registries |
| **Data** | Mock/sample records or read-only API (tenant-scoped) |
| **Preferences** | Ephemeral — never writes user prefs |
| **Parity** | **Same** `mdpCompileService` + **same** `buildCrbHydrationPlan()` as production |

### 14.3 Preview modes

| Mode | CRB source |
|------|------------|
| **Draft** | Compile current draft version |
| **Pinned** | Environment pin (compare with production) |
| **Diff** | Side-by-side draft vs pinned (future) |

---

## 15. Publish Center

The **Publish Center** orchestrates **validation → publish → pin → runtime activation**.

### 15.1 Publish pipeline (Studio UI)

```
1. Pre-publish validation
   ├── JSON Schema validation (all draft entries)
   ├── Dependency graph acyclic check
   └── Governance gate hints (G144+)
2. POST /api/mdp/publish { moduleId, versionId, ... }
3. CRB created in mdp_compiled_bundle
4. Optional: POST /api/mdp/environment-pins (production pin)
5. POST-1E-2: reloadRuntimeBridgeModule(moduleId) or deploy webhook
6. Publish Center shows semver, revision, integrityHash, pin status
```

### 15.2 Rollback UI

- List published versions from `GET /api/mdp/versions`
- `POST /api/mdp/rollback` with confirmation
- Re-pin previous version

### 15.3 Publish Center surfaces

| Surface | Content |
|---------|---------|
| Version timeline | semver, revision, author, publishedAt |
| Environment pins | dev / qa / production |
| CRB summary | entityCount, registryCount, integrityHash |
| Diff vs previous | Registry entry changelog (future) |

---

## 16. History (Undo / Redo)

Studio **History** manages **session-level undo** for authoring operations.

### 16.1 Scope

| Scope | Storage | Limit |
|-------|---------|-------|
| **Session undo** | In-memory stack in Studio | Last N operations (default 50) |
| **Persistent audit** | MDP `mdp_registry_audit` | Permanent |
| **Version history** | MDP version graph | Permanent |

### 16.2 Undoable operations

- Registry entry create/update/delete (payload diff)
- Binding changes
- Reorder operations
- Bulk schema apply

### 16.3 Non-undoable

- Publish (requires explicit rollback via Publish Center)
- Environment pin changes
- Marketplace install

### 16.4 Command pattern

```typescript
interface StudioCommand {
  id: string;
  label: string;
  execute(): Promise<void>;
  undo(): Promise<void>;
}
```

Each command maps to one or more MDP API calls — undo invokes inverse API calls, not local state rollback alone.

---

## 17. Command Palette

The **Command Palette** provides keyboard-driven access to Studio actions (Cmd/Ctrl+K).

### 17.1 Command categories

| Category | Examples |
|----------|----------|
| **Navigation** | "Go to Layout Studio", "Switch module empresas" |
| **Create** | "New section", "New panel", "New validation rule" |
| **Edit** | "Rename entry", "Duplicate layout" |
| **Preview** | "Refresh preview", "Compare with production" |
| **Publish** | "Publish draft", "Pin to production" |
| **View** | "Toggle Explorer", "Reset dock layout" |

### 17.2 Registration

Designer plugins register commands via `registerStudioCommand()`. Shell merges and deduplicates by id.

---

## 18. AI Assistant

The **AI Assistant** is an **L6 capability** embedded in Studio — not a parallel metadata writer.

### 18.1 Architecture

```
Studio AI Panel (L5 UI)
      ↓ context
AI Platform (L6) — agent runtime
      ↓ tools (RBAC-scoped)
MDP APIs (/api/mdp/introspect, /registry, /compile)
      ↓ never
Direct Foundation / Prisma / business CRUD
```

### 18.2 Context payload

| Context | Source |
|---------|--------|
| Module graph | `GET /api/mdp/introspect` |
| Selected entry | Explorer selection |
| Schema | `mdp_registry_schema` |
| Validation errors | Runtime Console |
| User locale | Tenant preferences |

### 18.3 Allowed AI actions (Phase 1 — suggest only)

- Suggest layout structure
- Generate validation rules (user confirms → registry write)
- Explain bindings and dependencies
- Formula/expression drafts

### 18.4 Forbidden AI actions

- Direct publish without human confirmation
- Bypass RBAC
- Write to Foundation or business tables
- Train on tenant data without contract

**Future:** `@mak/sdk-agent` tool registration for custom tenant agents.

---

## 19. Collaboration (Future)

Collaboration is **documented but not implemented** in Program 2.0–2.1.

### 19.1 Planned model

| Capability | Mechanism |
|------------|-----------|
| **Presence** | WebSocket — who is editing which entry |
| **Locking** | Optimistic lock on registry entry (`contentHash` conflict) |
| **Comments** | Anchored to entryId + payload path |
| **Review workflow** | Draft → review → publish (extends MDP version status) |

### 19.2 Conflict resolution

- Extends existing preferences `syncStatus` / optimistic concurrency pattern
- On conflict: show diff; author chooses merge or discard
- Sync Platform (L6.4) owns replication — Studio consumes events

### 19.3 Extension points reserved

- `StudioCollaborationProvider` slot in shell
- `onRemoteEntryChange` callback in WorkspaceContext
- Event bus integration (IFM 1B A5 — post Layout MVP)

---

## 20. Marketplace Surface

The **Marketplace Surface** is the Studio entry point for **importing and managing packages** (L6.1).

### 20.1 Surfaces (future)

| Surface | Function |
|---------|----------|
| **Browse** | Search Marketplace listings |
| **Install** | Merge `.makpkg` into tenant MDP namespace |
| **Publish** | Export module registry subset as package |
| **Sandbox preview** | Compile isolated CRB before install |

### 20.2 Studio integration point

- Asset Manager → "Installed packages" tab
- Publish Center → "Export as package" action
- Explorer → package-sourced entries tagged with `packageId`

**Rule:** Marketplace packages are **curated registry bundles** — install merges into MDP, then standard compile/publish path applies.

---

## 21. Studio APIs

Studio consumes **existing MDP APIs** — no parallel Studio-specific write path.

### 21.1 Primary API map

| API | Studio consumer | Phase |
|-----|-----------------|-------|
| `GET /api/mdp/introspect` | Shell, Explorer, AI context | 2.1 |
| `GET /api/mdp/registry` | Explorer, Properties | 2.1 |
| `POST /api/mdp/registry` | Explorer create | 2.1 |
| `PUT /api/mdp/registry/:id` | Properties save | 2.1 |
| `DELETE /api/mdp/registry/:id` | Explorer delete | 2.1 |
| `GET /api/mdp/registry/introspect` | Schema discovery | 2.1 |
| `POST /api/mdp/compile/:moduleId` | Preview Engine | 2.1 |
| `POST /api/mdp/publish` | Publish Center | 2.1 |
| `POST /api/mdp/rollback` | Publish Center | 2.2 |
| `GET /api/mdp/versions` | Publish Center timeline | 2.1 |
| `GET /api/mdp/environment-pins` | Shell badge, Publish Center | 2.1 |
| `POST /api/mdp/environment-pins` | Publish Center pin | 2.1 |
| `GET /api/mdp/entities` | Asset Manager | 2.2 |
| `GET /api/mdp/fields` | Asset Manager | 2.2 |
| `GET /api/mdp/relationships` | Asset Manager | 2.2 |

### 21.2 Studio client layer (future)

```
src/studio/services/
├── mdpRegistryClient.js      — wraps /api/mdp/registry
├── mdpCompileClient.js       — wraps compile + introspect
├── mdpPublishClient.js       — wraps publish, rollback, pins
└── studioHistoryService.js   — undo stack (local)
```

All clients use `apiClient` from `src/apis/http/apiClient.js` — same auth and tenant headers as ERP.

### 21.3 Future Studio-specific APIs (L3 — not Phase 2.0)

| API | Purpose | Blocker |
|-----|---------|---------|
| `GET /api/studio/session` | Multi-user presence | Collaboration phase |
| `POST /api/studio/comments` | Review comments | Collaboration phase |
| `GET /api/marketplace/v1/*` | Package browse | Marketplace phase |

---

## 22. Permissions

Studio access is governed by **Platform Core RBAC** extended with **MDP-4 permission entries**.

### 22.1 Role matrix (initial)

| Action | Required role | Scope |
|--------|---------------|-------|
| Open Studio | `CADASTRO_ADMIN` or `PLATFORM_ENGINEER` | Tenant |
| Read registry | `CONSULTA+` | Tenant |
| Write draft | `CADASTRO_ADMIN` | Tenant |
| Publish | `CADASTRO_ADMIN` + publish flag | Tenant |
| Pin environment | `PLATFORM_ENGINEER` | Platform or tenant |
| Rollback | `PLATFORM_ENGINEER` | Platform or tenant |
| Marketplace publish | `ISV_PUBLISHER` | Partner scope |

### 22.2 MDP permission entries

Registry type `permission` (already seeded for empresas) defines resource-level capabilities. Studio consults:

1. JWT role from Platform Core
2. MDP `permission` entry for module resource
3. Entry-level status (draft entries editable only by author role — future)

### 22.3 Enforcement

- **Server-side only** — Studio UI hides actions but API enforces via `preHandler: app.authenticate` + role checks
- No client-side-only publish gates

---

## 23. Integration with Runtime Bridge

Program 1E established the **Runtime Bridge** as the sole runtime hydration entry point. Studio integrates at **preview** and **post-publish** boundaries only.

### 23.1 Shared hydration adapter

| Consumer | Adapter | Location |
|----------|---------|----------|
| Production boot | `bootstrapRuntimeBridge()` | `src/modules/makBootstrap/runtimeBridge/` |
| Studio Preview | `buildCrbHydrationPlan()` | Same adapter — imported by Preview Engine |
| Post-publish reload | `reloadRuntimeBridgeModule()` | Called from Publish Center (1E-2) |

### 23.2 Studio obligations

- Preview Engine **must** use `buildCrbHydrationPlan()` — never a Studio-local registry mapper
- Preview **must not** call `registerMak*ConfigEngine` on the live app singleton
- Runtime Console displays hydration source (`boot-cache` | `api` | `preview`)

### 23.3 Boundary diagram

```
Studio (L5) ──write──► MDP (L4) ──compile──► CRB
                                              │
Studio Preview ◄──read── CRB ◄────────────────┘
       │
       └── hydrate via Runtime Bridge adapter (read-only, isolated context)

Production App ◄── Runtime Bridge boot ◄── CRB (pinned)
```

---

## 24. Integration with MDP

Studio is the **primary writer** to MDP-4 Metadata Registry (per MDP spec §I-3).

### 24.1 Write path

| Studio action | MDP layer | Table/API |
|---------------|-----------|-----------|
| Create layout | MDP-4 | `mdp_registry_entry` |
| Edit field config | MDP-4 | `mdp_registry_entry.payload` |
| Bind to entity | MDP-4 | `mdp_registry_binding` |
| i18n label | MDP-4 | `mdp_registry_entry_label` |

### 24.2 Read path

| Studio panel | MDP source |
|--------------|------------|
| Explorer | Registry query |
| Inspector | Registry + audit |
| Asset Manager | MDP-1/2/3 + registry |
| Preview | Compile snapshot (not raw DB) |

### 24.3 Versioning

- Draft edits attach to draft `mdp_definition_version`
- Publish promotes version status → creates CRB
- Studio always displays `versionId` + `semver` from introspect

---

## 25. Integration with Publish Engine

MDP-5 Publish Engine is the **only path** from draft to production CRB.

### 25.1 Studio ↔ Publish contract

| Step | API | Studio owner |
|------|-----|--------------|
| Validate draft | compile (dry) | Preview Engine |
| Publish | `POST /api/mdp/publish` | Publish Center |
| Pin | `POST /api/mdp/environment-pins` | Publish Center |
| Activate runtime | `reloadRuntimeBridgeModule` | Publish Center (1E-2) |
| Rollback | `POST /api/mdp/rollback` | Publish Center |

### 25.2 Publish gates (Studio-side checks before API call)

1. No schema validation errors
2. No unresolved binding targets
3. Dependency graph valid
4. User has publish permission
5. (Future G144) No writes outside `/api/mdp/*` in Studio code

---

## 26. Multi Base Template Support

Studio is designed for **multiple base templates** from day one.

### 26.1 Template model

| Concept | Storage |
|---------|---------|
| `baseTemplateId` | On every registry entry, entity, field |
| Template registry entry | MDP-4 type `base_template` |
| Runtime template | ModeloBase1 today; future templates via factory |

### 26.2 Studio behavior

- Navigation includes **template selector** when module supports >1 template
- Designer plugins declare `supportedBaseTemplates`
- Preview Engine passes `baseTemplateId` to compile and hydration
- Explorer filters entries by active template

### 26.3 Current state

- **modelobase1** — fully supported (empresas pilot)
- Additional templates — registry-ready; designers activate when factory exists

---

## 27. Designer Plugin Roadmap

| Phase | Designer | entryTypes | Foundation engine |
|-------|----------|------------|-------------------|
| **2.1** | Layout Studio | layout, section, panel | V13 |
| 2.2 | Field Studio | field_config, field | V14 |
| 2.3 | Validation Studio | validation | V16 |
| 2.4 | Formula Studio | formula | V17 |
| 2.5 | Events + Actions | event, action | V18, V19 |
| 2.6 | Workflow Studio | workflow | V20 |
| 3.x | Dashboard, Report, Integration | dashboard, report, integration | Future |
| 3.x | Theme Studio | theme | Visual tokens |
| 3.x | Permission Studio | permission | RBAC registry |

Each designer is a **plugin** — shell architecture unchanged across phases.

---

## 28. Governance

### 28.1 Proposed gates

| Gate | Validates |
|------|-----------|
| **G262–G266** | Studio SDK + registries bootstrapped | Program 2.0.5 |
| **G267–G272** | Design System Foundation (tokens, themes, manifests) | Program 2.0.6 |
| **G273–G278** | Studio Event Architecture (hub, registry, integrations) | Program 2.0.7 |
| **G279–G284** | Studio Architecture Governance (isolation, dependency graph) | Program 2.0.8 |
| **G144** | Studio writes only via `/api/mdp/*` (Phase 2.1+) | Pending |
| **G145** | Preview uses shared hydration adapter (Phase 2.1+) | Pending |

### 28.2 Architecture compliance checklist

- [ ] Studio package under `src/studio/` only
- [ ] No imports from Studio to `src/framework/mak/` mutation APIs
- [ ] Preview compiles via `mdpCompileService` equivalent API
- [ ] Publish flow uses MDP-5 exclusively

---

## 29. Technology Choices (Phase 2.1)

| Concern | Choice | Rationale |
|---------|--------|-----------|
| UI framework | React 18 (existing) | Platform consistency |
| Routing | React Router (existing) | `/studio/*` routes |
| State | React Query for MDP data | Cache + invalidation on publish |
| Forms | Schema-driven (Properties) | Aligns with MDP JSON Schema |
| Preview | iframe or isolated root | Foundation isolation |
| Styling | Tailwind + shadcn (existing) | Design system parity |
| Dock | Custom lightweight dock | No new platform dependency |

---

## 31. Studio SDK & Registry Foundation (Program 2.0.5)

**Decision:** D-032 · **Path:** `src/studio/sdk/` + `src/studio/registry/`

All designers **must** consume the Studio SDK — never reimplement dock, history, selection, or registry lookups.

### 31.1 Studio SDK APIs

| API | Contract | Purpose |
|-----|----------|---------|
| Workspace | `createWorkspaceApi` | Designer mount region |
| Dock | `createDockApi` | Panel zones (left/right/bottom) |
| Explorer | `createExplorerApi` | Registry tree navigation |
| Inspector | `createInspectorApi` | Read-only metadata context |
| History | `createHistoryApi` | Undo/redo command stack |
| Preview | `createPreviewApi` | Draft CRB compile + hydration |
| Publish | `createPublishApi` | Validate → publish → pin |
| Command | `createCommandApi` | Command palette registry |
| Selection | `createSelectionApi` | Shared selection state |
| Clipboard | `createClipboardApi` | Copy/cut/paste fragments |
| DragDrop | `createDragDropApi` | Designer-agnostic DnD |
| Plugin | `createPluginApi` | Designer plugin registration |

**Entry point:** `createStudioSdk({ deps, session })` — Shell wires MDP clients in Phase 2.1.

### 31.2 Official registries

| Registry | SSOT for | Layout Studio rule |
|----------|----------|-------------------|
| **Component Registry** | Studio components (preview, render, metadata) | **Never** hardcode components — always `getStudioComponent()` |
| **Property Registry** | Reusable property definitions | Properties panel reads catalog |
| **Event Registry** | Official event catalog | Event bindings reference registry |
| **Action Registry** | Official action catalog | Action bindings reference registry |
| **Capability Registry** | Designer capabilities | Shell gates features by designer |

### 31.3 Designer & Plugin contracts

- `validateStudioDesigner()` / `defineStudioDesigner()` — designer plugin contract
- `validateStudioPlugin()` / `defineStudioPlugin()` — extension plugin contract
- `registerStudioDesigner()` — designer registry (shell-only registration)

**Governance:** Gates **G262–G266** · Smoke: `scripts/smoke-studio-sdk.mjs`

---

## 32. Design System Foundation (Program 2.0.6)

**Decision:** D-033 · **Path:** `src/studio/designSystem/`

Permanent visual and component metadata foundation between Studio SDK and Studio Shell. **No UI, themes, or renderers** in this layer — architecture and registries only.

### 32.1 Registries

| Registry | SSOT for | Categories / scope |
|----------|----------|-------------------|
| **Token Registry** | All visual values | colors, typography, radius, shadows, spacing, elevation, opacity, motion, icons, borders |
| **Theme Registry** | Theme definitions | light, dark, corporate, agro, industry, hospital, custom |
| **Motion Registry** | Animation contracts | fade, slide, scale, ripple, bounce, loading, hover, success, error |
| **Accessibility Registry** | A11y profiles | keyboard, screenReader, focus, aria, contrast, touchTargets |
| **Manifest Registry** | Component manifests + Universal Component Model | properties, events, actions, tokens, themes, permissions, runtime, preview, marketplace, AI |

**Rule:** Never scatter visual values — always resolve via `getDesignToken()` / `resolveTokenValue()`.

### 32.2 Contracts

| Contract | Purpose |
|----------|---------|
| `defineComponentManifest()` | Official component metadata (properties, events, actions, tokens, themes, permissions, runtime, preview, marketplace, documentation, examples, limitations, dependencies, capabilities, AI) |
| `defineUniversalComponent()` | Platform-agnostic MAK component — `platform: "mak"`, renderer bindings for react/desktop/mobile/pwa/pdf/preview/marketplace |
| `buildAiComponentKnowledge()` | Structured AI knowledge per component (description, examples, limitations, best practices, suggestions, context) |

### 32.3 Registry integration

`integrateDesignSystemWithStudioRegistries()` auto-builds manifests from existing Component/Property/Event/Action/Capability registries — **non-breaking**, no duplication with SDK layer (G272).

**Entry point:** `bootstrapDesignSystem()` — called after `bootstrapStudioRegistries()` in `src/studio/index.js`.

**Governance:** Gates **G267–G272** · Smoke: `scripts/smoke-design-system.mjs`

---

## 33. Studio Event Architecture (Program 2.0.7)

**Decision:** D-034 · **Path:** `src/studio/events/`

Official **decoupled event bus** for all internal Studio module communication. Explorer, Inspector, Outline, Preview, History, Dock, Plugins, and Designers **must** communicate via the Event Hub — never direct cross-module calls when an equivalent event exists.

### 33.1 Studio Event Hub

| API | Purpose |
|-----|---------|
| `publish(eventId, payload, options?)` | Emit registered event with scoped delivery |
| `subscribe(eventId, handler, options?)` | Listen to events (with optional scope filter) |
| `unsubscribe(subscriptionId)` | Remove subscription |
| `once(eventId, handler, options?)` | Single-delivery subscription |
| `broadcast(category, eventId, payload)` | Category-scoped publish |
| `setScope(scopePatch)` / `getScope()` | Module/designer/workspace scoping |
| `onLifecycle(listener)` | Hub lifecycle (ready, destroy, scope.changed) |

**Entry point:** `bootstrapStudioEvents()` → `getStudioEventHub()` — wired in `src/studio/index.js` after Design System bootstrap.

### 33.2 Event Registry

| Field | Required |
|-------|----------|
| eventId, name, category, description | Yes |
| payload contract, origin, consumers | Yes |
| priority, version | Yes |
| documentation, examples, compatibility, breakingChanges, notes | Manifest |

**17 official events** (SelectionChanged, ComponentCreated, LayoutChanged, PreviewUpdated, UndoPerformed, …) + 6 collaboration contracts (future).

**Rule:** No event may exist without registry entry. Plugins may register **extension** events (`origin: plugin:*`) but **cannot override** official events.

### 33.3 Integration bridges

| Bridge | Contract |
|--------|----------|
| `createPluginEventBridge(hub, plugin)` | Plugins publish/listen; `registerExtensionEvent()` |
| `createDesignerEventBridge(hub, designer)` | All designers share same hub (layout, workflow, dashboard, …) |
| `wireHistoryToEventHub(hub, historyApi)` | History responds to events — never calls Layout directly |
| `wirePreviewToEventHub(hub, previewApi)` | Preview responds to events — never depends on Layout Designer |
| `createCollaborationEventContract(hub)` | Future presence/sync contracts (no implementation) |

**Governance:** Gates **G273–G278** · Smoke: `scripts/smoke-studio-events.mjs`

### 33.4 Foundation phase complete

After Program 2.0.8, **MAK Studio foundation is permanently protected and closed**. No new structural layers before Program 2.1 Studio Shell. Shell builds exclusively on SDK + Design System + Event Architecture + Governance.

---

## 34. Studio Architecture Governance (Program 2.0.8)

**Decision:** D-035 · **Path:** `src/studio/governance/`

Automatic protection layer — validates Studio architecture on every CI run. **Last infrastructure mission** before Studio Shell.

### 34.1 Protected rules

| Rule | Enforcement |
|------|-------------|
| Designer isolation | No cross-designer imports; no Foundation/Runtime/Bootstrap access |
| Dependency graph | Official stack: Consumer → SDK → Events → Design System → Registry → MDP APIs |
| Registry protection | No parallel registries; plugins cannot override official events |
| Public API only | Consumers use `index.js` exports — not internal registry/hub paths |
| Event Hub mandatory | No Event Hub bypass from consumer layers |
| MDP write boundary | No direct MDP mutation — official API clients only (G144 in Shell) |

### 34.2 Dependency stack

```
Studio Shell / Designers / Dock
       ↓
Studio SDK + Governance
       ↓
Studio Event Hub
       ↓
Design System
       ↓
Studio Registries
       ↓
MDP APIs (services/)
       ↓
Runtime Bridge (read-only via compile)
       ↓
Foundation (never direct import)
```

**Validator:** `validateStudioArchitecture()` · **Gates:** G279–G284 · Smoke: `scripts/smoke-studio-governance.mjs`

---

## 30. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.4.0 | 2026-06-29 | Architecture Governance — Program 2.0.8 (D-035); foundation permanently closed |
| 1.3.0 | 2026-06-29 | Studio Event Architecture — Program 2.0.7 (D-034) |
| 1.2.0 | 2026-06-29 | Design System Foundation — Program 2.0.6 (D-033) |
| 1.1.0 | 2026-06-29 | SDK & Registry Foundation — Program 2.0.5 (D-032) |
| 1.0.0 | 2026-06-29 | Initial architecture — Program 2.0 (D-031) |

---

*This document is the permanent reference for MAK Studio (Program 2). Implementation missions must not contradict it without a D-register amendment.*
