# MAK DATA PLATFORM — Architecture Specification (MDP-0)

**Mission:** MDP-0 — MAK DATA PLATFORM Architecture Specification  
**Status:** Official — mandatory reference for all MDP implementations  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Decision:** D-020  
**Layer:** L4 — MAK DATA PLATFORM  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md), [MAK-2035-MASTER-ARCHITECTURE.md](./MAK-2035-MASTER-ARCHITECTURE.md), [MAK-PLATFORM-LANGUAGE-STANDARD.md](./MAK-PLATFORM-LANGUAGE-STANDARD.md)

**Supersedes:** Informal sections of [MAK-DATA-PLATFORM.md](../engineering/MAK-DATA-PLATFORM.md) v1.0.0 for implementation detail.  
**Implementation phases:** MDP-1 → MDP-5 per [IFM-PHASE-1-TECHNICAL-ROADMAP.md](../engineering/IFM-PHASE-1-TECHNICAL-ROADMAP.md)

---

## 0. Executive Summary

The **MAK DATA PLATFORM (MDP)** is the persisted, versioned, introspectable **definition layer** (L4) of MAK Gestão. It is **not** business data (L0 Prisma records). It answers:

> *What entities exist? What fields do they have? How do they relate? What layouts, rules, and behaviors apply?*

### Five components (implementation order)

| ID | Component | SSOT for |
|----|-----------|----------|
| **MDP-1** | Entity Dictionary | Entities, modules, persistence mapping, lifecycle, scope |
| **MDP-2** | Data Dictionary | All fields — native, custom, computed |
| **MDP-3** | Relationship Dictionary | Entity graph — cardinality, FK mapping, dependencies |
| **MDP-4** | Metadata Registry | Layouts, engines, templates, permissions, dashboards, integrations |
| **MDP-5** | Versioning, Publication & Snapshot Engine | Draft → publish, rollback, offline snapshots, Marketplace bundles |

### Non-goals (MDP does NOT)

- Render UI (Foundation L2)
- Execute workflows/events (Foundation engines — consume compiled config)
- Store business record instances (Prisma L0)
- Replace Platform Core auth/RBAC (L3 — enforces access to MDP)
- Implement Studio UI (L5 — reads/writes MDP via API)

### Global invariants

| Invariant | Rule |
|-----------|------|
| **I-1 Tenant scope** | Tenant-owned definitions include `cliente_id`; platform builtins use `scope: platform` |
| **I-2 Compile boundary** | Foundation runtime registries are **boot caches** — never SSOT |
| **I-3 Single write path** | Studio, generator, and admin UIs write MDP — not module JS in production |
| **I-4 Version pin** | Runtime executes **published** definition version per tenant/environment |
| **I-5 Audit** | All MDP mutations logged to Platform Core `AuditLog` + component history tables |
| **I-6 Backward compatibility** | Foundation freeze (D-001) — MDP compile output must remain compatible with frozen engines |

---

## 1. Platform Position & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ L5 MAK Studio · L6 AI/Marketplace/Offline · L7 Experience               │
│         │ write/read                    │ read snapshots                  │
│         ▼                               ▼                                 │
│ L4 ★ MAK DATA PLATFORM ★                                                │
│    Entity Dict · Data Dict · Relationship Dict · Metadata Reg · MDP-5     │
│         │ publish + compile                                               │
│         ▼                                                                 │
│ L3 Platform Core — Auth · Tenant · RBAC · Audit · Event Bus (future)      │
│         │                                                                 │
│         ▼                                                                 │
│ L2 Foundation Runtime — ModeloBase1 · engines V13–V20 · boot registries   │
│         │                                                                 │
│         ▼                                                                 │
│ L1 Domain Modules — thin config · repositories · domain hooks             │
│         │                                                                 │
│         ▼                                                                 │
│ L0 Business Data — PostgreSQL tenant records                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Boot / runtime flow (target)

```
1. Resolve tenant + environment + pinned definitionVersion (MDP-5)
2. Load published definitions (MDP-1..4) — cache layer optional
3. compile(moduleId, version) → Compiled Runtime Bundle (CRB)
4. makBootstrap hydrates engine *ConfigRegistry Maps (L2 cache)
5. buildModeloBase1ConfigFromMakModule(CRB) → ModeloBase1
6. UI renders business data from L0 via L1 repositories
```

---

## 2. Scope Model (Multi-tenant · Multi-empresa)

### 2.1 Definition scope levels

| Scope | Key | Applies to | Example |
|-------|-----|------------|---------|
| **Platform** | `scope: platform` | Built-in modules shipped by MAK | `empresas`, `cadcps` builtins |
| **Tenant** | `cliente_id` | Tenant customizations | Custom fields, tenant layouts |
| **Empresa** | `empresa_id` (optional overlay) | Per-company field applicability | CADCPS `CadCpsCampoEmpresa` pattern |
| **User** | `usuario_id` (overlay only) | Preferences — **not** MDP SSOT | `UsuarioPreferencia` stays L3/user layer |

**Rule:** Entity and native field **definitions** are tenant-scoped or platform-scoped. **User layout overlays** remain in preferences motor — MDP stores published defaults; users override via existing preferences engine.

### 2.2 Multi-tenant isolation

- Every tenant-scoped row: `cliente_id NOT NULL` + FK to `Cliente`
- API layer: JWT `cliente_id` mandatory — no cross-tenant reads/writes
- Platform-scoped rows: `cliente_id IS NULL` + `scope = platform` — read-only for tenants; mutable only by platform admin role
- Index strategy: composite indexes leading with `cliente_id` on all dictionary tables

### 2.3 Multi-empresa rules

- Entity Dictionary declares `empresaScope: none | optional | required`
- Data Dictionary fields declare `empresaApplicability: all | selected | none`
- Relationship Dictionary respects empresa-scoped entities (e.g. `EmpresaCadastro` is tenant-level; operational records may carry `empresa_id`)
- CADCPS migration path: `CadCpsCampoEmpresa` → `MdpFieldEmpresaScope` junction (conceptual)

---

## 3. MDP-1 — Entity Dictionary

### 3.1 Objective

Provide the **official catalog of all platform entities** — what exists, which module owns it, how it persists, and what capabilities apply.

### 3.2 Responsibilities

- Register entities for certified modules (`empresas`, `cadcps`, future modules)
- Map `entityId` ↔ Prisma model ↔ `moduleId` ↔ UI routes
- Declare lifecycle: `draft | active | deprecated | archived`
- Declare tenant/empresa scope rules and enabled Config Engines
- Replace `config/cadastro-modules.registry.json` as SSOT (file becomes compile export/cache)

### 3.3 Boundaries (does NOT)

- Define field-level metadata (MDP-2)
- Define inter-entity relationships (MDP-3)
- Store layout/event/workflow defs (MDP-4)
- Store business records

### 3.4 Conceptual model

```
MdpEntity
├── entityId          (stable, e.g. "EmpresaCadastro")
├── moduleId          (e.g. "empresas")
├── codigo            (business code, e.g. "EMPRESAS")
├── labels            (default LabelSet — see §10 i18n)
├── persistence       (PersistenceBinding)
├── capabilities      (CapabilitySet)
├── scope             (platform | tenant)
├── empresaScope      (none | optional | required)
├── lifecycle         (draft | active | deprecated | archived)
├── baseTemplateId    (default "modelobase1" — D-017)
└── versionRef        (FK → MdpDefinitionVersion via MDP-5)
```

**PersistenceBinding:**

| Field | Description |
|-------|-------------|
| `prismaModel` | e.g. `Empresa` |
| `tableName` | physical table |
| `primaryKey` | field name(s) |
| `tenantKey` | default `cliente_id` |
| `empresaKey` | optional `empresa_id` or header-bound |
| `idGlobalKey` | optional `id_global` pattern |

**CapabilitySet:** `{ layout, field, validation, formula, events, actions, workflow, customFields, attachments }` — booleans enabling Config Engines V13–V20.

### 3.5 Conceptual entities (tables)

| Table | Purpose |
|-------|---------|
| `mdp_entity` | Core entity definitions |
| `mdp_entity_label` | i18n labels (locale, singular, plural, description) |
| `mdp_entity_capability` | Enabled engines per entity |
| `mdp_entity_route` | Route/menu binding (`routePath`, `pageCode`) |
| `mdp_entity_audit` | Change history for entity definitions |

**Migration seed:** `config/cadastro-modules.registry.json` (2 entries) + `CadCpsTela` + Prisma model catalog.

### 3.6 Layer relationships

| Layer | Relationship |
|-------|--------------|
| **Foundation** | Consumes compiled entity list for generator validation (G118) and bootstrap |
| **ModeloBase1** | Receives `entityId` + `baseTemplateId` via compile — no direct DB reads |
| **Platform Core** | RBAC checks entity-level permissions; audit logs mutations |
| **MAK Studio** | Entity picker — creates/edits entities (tenant extensions) |
| **AI Platform** | Entity catalog for tool scope (`allowedEntities[]`) |
| **Marketplace** | Packages declare entity bundles for install |
| **Offline** | Entity list included in definition snapshot (read-only) |
| **i18n** | Labels stored as `MdpEntityLabel` locale rows |
| **Multi-tenant** | `cliente_id` on tenant extensions; platform builtins shared |
| **Multi-empresa** | `empresaScope` on entity drives header requirements |

---

## 4. MDP-2 — Data Dictionary

### 4.1 Objective

Catalog **every field** — native (from modules/Prisma), custom (from CADCPS), and computed — as the single field SSOT.

### 4.2 Responsibilities

- Unify native `*Form.constants.js` and `CadCpsCampo` into one dictionary
- Field types, masks, visibility, validation hooks, formula references
- Select options, decimal config, relation hints
- Source tracking: `native | custom | computed | system`
- Per-empresa applicability (extends CADCPS pattern)

### 4.3 Boundaries (does NOT)

- Define entity existence (MDP-1)
- Define relationship cardinality (MDP-3) — may reference `relationshipId`
- Execute formulas (Foundation V17 engine)
- Store field **values** (L0 business data)

### 4.4 Conceptual model

```
MdpField
├── fieldId           (stable, e.g. "empresa.razao_social")
├── entityId          (FK → MdpEntity)
├── fieldName         (technical column/key)
├── source            (native | custom | computed | system)
├── type              (canonical — 18 CADCPS types + extensions)
├── labels            (LabelSet + i18n)
├── presentation      (mask, decimal, width, placeholder, visibility flags)
├── behavior          (required, readOnly, searchable, filterable, exportable)
├── validationRef     (optional → MdpRegistryEntry validation)
├── formulaRef        (optional → MdpRegistryEntry formula)
├── relationshipRef   (optional → MdpRelationship)
├── empresaApplicability (all | selected | none)
└── versionRef
```

### 4.5 Conceptual entities (tables)

| Table | Purpose |
|-------|---------|
| `mdp_field` | Core field definitions |
| `mdp_field_label` | i18n labels/help text |
| `mdp_field_option` | Select/radio options (from `CadCpsCampoOpcao`) |
| `mdp_field_empresa_scope` | Per-empresa field applicability |
| `mdp_field_tela` | Screen visibility binding (from `CadCpsCampoTela`) |
| `mdp_field_audit` | Field change history (evolves `CadCpsHistorico`) |

**Migration seed:** `CadCpsCampo*` models + empresas native constants + Prisma column introspection for native fields.

### 4.6 Layer relationships

| Layer | Relationship |
|-------|--------------|
| **Foundation** | `CustomFieldEngine` reads compiled field defs; Field Engine V14 consumes types |
| **ModeloBase1** | Form/table metadata built from compiled `MdpField` set |
| **Platform Core** | Field-level audit; RBAC on custom field admin |
| **MAK Studio** | Field Studio CRUD on Data Dictionary |
| **AI Platform** | Field schema for form filling / validation suggestions |
| **Marketplace** | Field packs distributed as part of entity bundles |
| **Offline** | Field defs in snapshot — required for offline form render |
| **i18n** | **Primary i18n anchor** — all UI labels resolve through `MdpFieldLabel` |
| **Multi-tenant** | Custom fields scoped by `cliente_id`; native fields platform-defined |
| **Multi-empresa** | `mdp_field_empresa_scope` junction |

---

## 5. MDP-3 — Relationship Dictionary

### 5.1 Objective

Explicit catalog of **all relationships** between entities — cardinality, FK mapping, cascade rules, inheritance.

### 5.2 Responsibilities

- Document Prisma `@relation` graph in introspectable form
- Field-level relation hints (`relation_entity`) elevated to first-class relationships
- Support Studio relation designer and AI graph context
- Validate Marketplace package relationship integrity

### 5.3 Boundaries (does NOT)

- Enforce FK constraints (PostgreSQL/Prisma L0 responsibility)
- Store relationship **instance** data
- Replace Prisma migration generation (informative, not generative, in v1)

### 5.4 Conceptual model

```
MdpRelationship
├── relationshipId    (stable, e.g. "empresa.cadastro_registros")
├── fromEntityId      (FK → MdpEntity)
├── toEntityId        (FK → MdpEntity)
├── type              (one_to_one | one_to_many | many_to_many)
├── cardinality       ({ minFrom, maxFrom, minTo, maxTo })
├── dependency        (restrict | cascade | set_null | optional)
├── fkMapping         (fromField, toField)
├── inheritance       (optional parentEntityId)
├── labels            (LabelSet)
└── versionRef
```

### 5.5 Conceptual entities (tables)

| Table | Purpose |
|-------|---------|
| `mdp_relationship` | Core relationship definitions |
| `mdp_relationship_label` | i18n |
| `mdp_relationship_field_binding` | Maps fields to relationships |
| `mdp_relationship_audit` | Change history |

**Migration seed:** Prisma schema relation introspection + `CadCpsCampo.relation_entity` hints.

### 5.6 Layer relationships

| Layer | Relationship |
|-------|--------------|
| **Foundation** | Relation picker components consume compiled relationship metadata |
| **ModeloBase1** | Lookup fields, search panels use relationship defs |
| **Platform Core** | Referential integrity policies for cross-entity operations |
| **MAK Studio** | Relation designer reads/writes MDP-3 |
| **AI Platform** | **Graph context** — primary AI navigation of platform structure |
| **Marketplace** | Package validation — relationships must resolve |
| **Offline** | Relationship graph in snapshot for lookup cache warming |
| **i18n** | Relationship labels via `MdpRelationshipLabel` |
| **Multi-tenant** | Relationships inherit entity scope — cannot cross tenant boundaries |
| **Multi-empresa** | Optional `empresaScoped` flag on relationship |

---

## 6. MDP-4 — Metadata Registry

### 6.1 Objective

Central **typed registry** for all reusable platform definitions beyond entity/field/relationship structure — layouts, engine configs, templates, permissions, dashboards, integrations.

### 6.2 Responsibilities

- Store typed definition blobs (JSON) with schema version
- Replace scattered `*ModuleMetadata.js` engine registrations as persisted SSOT
- Provide **introspection API** for Studio and AI (Program 2 gate — D-011)
- Host **Template Registry** entries (`baseTemplateId` — D-017)
- Link registry entries to entities/fields (foreign keys by ID)

### 6.3 Boundaries (does NOT)

- Execute engine logic (Foundation V13–V20)
- Replace runtime `*ConfigRegistry.js` Maps (those remain boot caches fed by compile)
- Store user preference overlays (L3 preferences motor)

### 6.4 Registry entry types

| `entryType` | Source today | Consumer |
|-------------|--------------|----------|
| `layout` | `UsuarioPreferencia`, cadastroConfig | V13 Layout Engine |
| `field_config` | Field engine bootstrap | V14 Field Engine |
| `validation` | Zod + validation engine | V16 Validation Engine |
| `formula` | Formula defs + catalog | V17 Formula Engine |
| `event` | `*ModuleMetadata.js`, EVENT_CATALOG | V18 Events Engine |
| `action` | ACTION_CATALOG | V19 Actions Engine |
| `workflow` | WORKFLOW_CATALOG | V20 Workflow Engine |
| `permission` | `cadastroRbac.js` (future) | Platform Core RBAC |
| `base_template` | implicit ModeloBase1 | ModeloBase1 / Template selector |
| `dashboard` | not implemented | Future Studio |
| `integration` | not implemented | Platform Core connectors |
| `report` | export configs | Reporting |
| `theme` | visual tokens (tenant) | Theme Studio |

### 6.5 Conceptual model

```
MdpRegistryEntry
├── entryId           (stable namespaced id, e.g. "empresas.layout.main")
├── entryType         (enum above)
├── entityId          (optional scope)
├── moduleId          (optional scope)
├── payload           (JSON — schemaVersioned)
├── schemaVersion     (payload contract version)
├── labels            (LabelSet)
├── status            (draft | published — see MDP-5)
├── versionRef
└── hash              (content hash for compile cache invalidation)
```

### 6.6 Conceptual entities (tables)

| Table | Purpose |
|-------|---------|
| `mdp_registry_entry` | Typed definition storage |
| `mdp_registry_entry_label` | i18n |
| `mdp_registry_binding` | Links entries to entities/fields/relationships |
| `mdp_registry_schema` | JSON Schema per entryType per schemaVersion |
| `mdp_registry_audit` | Change history |

### 6.7 Layer relationships

| Layer | Relationship |
|-------|--------------|
| **Foundation** | Compile hydrates `*ConfigRegistry.js` from published entries — **cache only** |
| **ModeloBase1** | Factory reads compiled registry bundle — supports multiple `baseTemplateId` |
| **Platform Core** | Serves introspection; enforces RBAC on registry writes |
| **MAK Studio** | **Primary writer** — all designers persist to MDP-4 |
| **AI Platform** | **Primary reader** via `/introspect` — full platform capability map |
| **Marketplace** | Packages are curated registry entry bundles |
| **Offline** | Snapshot includes full registry compile for target module/version |
| **i18n** | Localizable payloads use LabelSet indirection |
| **Multi-tenant** | Tenant-specific entries override platform defaults (overlay merge at compile) |
| **Multi-empresa** | Entries may declare `empresaScope` for company-specific layouts |

### 6.8 ModeloBase1 + multiple Base Templates (D-017)

ModeloBase1 continues as **Base Template 1** (`baseTemplateId: modelobase1`). MDP-4 stores template registry entries:

```
MdpRegistryEntry(entryType: base_template)
├── baseTemplateId: "modelobase1"
├── runtimeEntry: "ModeloBase1CadastroPage"
├── compatibleEngines: ["V13".."V20"]
└── pattern: "cadastro-list-form"
```

Future templates register as additional `base_template` entries. **ModeloBase1 does not hardcode template selection** — compile resolves `baseTemplateId` from Entity Dictionary → Template Registry entry → runtime entry component.

**Certification:** ModeloBase1 remains functional as Template 1; additional templates are additive MDP entries, not Foundation forks.

---

## 7. MDP-5 — Versioning, Publication & Snapshot Engine

### 7.1 Objective

Govern **lifecycle of all MDP definitions** — draft editing, publish, rollback, snapshot export, and environment pinning.

### 7.2 Responsibilities

- Semantic versioning + monotonic revision counter per tenant/module
- Draft → review → published state machine
- Compile-on-publish → immutable `MdpCompiledBundle`
- Snapshot export for Offline, Marketplace (`.makpkg`), and environment promotion
- Rollback to prior published revision
- Pin `definitionVersion` per tenant/environment

### 7.3 Boundaries (does NOT)

- Deploy application code (Platform Core deploy pipeline)
- Version Foundation code (`governance-baseline.json` remains separate)
- Version business records

### 7.4 Conceptual model

```
MdpDefinitionVersion
├── versionId
├── cliente_id          (nullable = platform)
├── moduleId            (nullable = platform-wide release)
├── semver              (e.g. "1.2.0")
├── revision            (monotonic integer)
├── status              (draft | published | archived | rolled_back)
├── publishedAt
├── publishedBy
├── parentVersionId     (rollback chain)
└── changelog

MdpCompiledBundle
├── bundleId
├── versionId           (FK)
├── moduleId
├── contentHash         (SHA-256)
├── payload             (compiled CRB JSON — opaque to MDP clients)
├── createdAt

MdpSnapshot
├── snapshotId
├── versionId
├── snapshotType        (offline | marketplace | backup | environment)
├── payload             (full dictionary export — JSON)
├── expiresAt           (optional)
```

### 7.5 Publication state machine

```
draft ──publish──► published ──archive──► archived
  ▲                    │
  │                    └──rollback──► rolled_back ──publish──► published
  └──── edit (new draft from published)
```

**Rules:**

- Only `published` versions compile to runtime
- Draft edits do not affect production until publish
- Rollback creates new `published` revision pointing to prior snapshot — never mutates history
- User preferences overlay **on top of** published layout — unchanged from today

### 7.6 Conceptual entities (tables)

| Table | Purpose |
|-------|---------|
| `mdp_definition_version` | Version metadata |
| `mdp_compiled_bundle` | Immutable compile output |
| `mdp_snapshot` | Point-in-time exports |
| `mdp_publish_log` | Publish/rollback audit |
| `mdp_environment_pin` | Maps tenant+env → pinned versionId |

### 7.7 Layer relationships

| Layer | Relationship |
|-------|--------------|
| **Foundation** | Loads CRB for pinned version at boot |
| **ModeloBase1** | Receives version-pinned compile |
| **Platform Core** | Deploy pipeline activates pinned version; audit publish events |
| **MAK Studio** | Publish UI; preview uses draft compile without publish |
| **AI Platform** | Reads published version only (not draft) unless sandbox role |
| **Marketplace** | `.makpkg` = signed `MdpSnapshot` |
| **Offline** | Client syncs `MdpSnapshot` of pinned version |
| **i18n** | Snapshots include all locale label tables |
| **Multi-tenant** | Versions scoped per tenant; platform releases are separate channel |
| **Multi-empresa** | Snapshots include empresa scope tables |

---

## 8. Database Architecture (Conceptual)

### 8.1 Table groups

| Group | Tables | Phase |
|-------|--------|-------|
| **Entity (MDP-1)** | `mdp_entity`, `mdp_entity_label`, `mdp_entity_capability`, `mdp_entity_route`, `mdp_entity_audit` | MDP-1 |
| **Field (MDP-2)** | `mdp_field`, `mdp_field_label`, `mdp_field_option`, `mdp_field_empresa_scope`, `mdp_field_tela`, `mdp_field_audit` | MDP-2 |
| **Relationship (MDP-3)** | `mdp_relationship`, `mdp_relationship_label`, `mdp_relationship_field_binding`, `mdp_relationship_audit` | MDP-3 |
| **Registry (MDP-4)** | `mdp_registry_entry`, `mdp_registry_entry_label`, `mdp_registry_binding`, `mdp_registry_schema`, `mdp_registry_audit` | MDP-4 |
| **Versioning (MDP-5)** | `mdp_definition_version`, `mdp_compiled_bundle`, `mdp_snapshot`, `mdp_publish_log`, `mdp_environment_pin` | MDP-5 |

### 8.2 Common columns (all dictionary tables)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | cuid/uuid | Primary key |
| `cliente_id` | varchar nullable | Tenant scope (null = platform) |
| `scope` | enum | `platform | tenant` |
| `lifecycle` | enum | `draft | active | deprecated | archived` |
| `version_id` | FK | Links to MDP-5 version row |
| `created_at`, `updated_at` | timestamp | Standard |
| `created_by`, `updated_by` | varchar | User audit |

### 8.3 Relationships (ER summary)

```
MdpEntity 1──* MdpField
MdpEntity *──* MdpRelationship (from/to)
MdpEntity 1──* MdpRegistryEntry (optional scope)
MdpDefinitionVersion 1──* (all dictionary tables via version_id)
MdpDefinitionVersion 1──* MdpCompiledBundle
MdpDefinitionVersion 1──* MdpSnapshot
MdpField *──* Empresa (via mdp_field_empresa_scope)
```

### 8.4 Coexistence with CADCPS (migration strategy)

| Current table | MDP evolution |
|---------------|---------------|
| `CadCpsTela` | → `mdp_entity` + `mdp_entity_route` |
| `CadCpsCampo` | → `mdp_field` |
| `CadCpsCampoOpcao` | → `mdp_field_option` |
| `CadCpsCampoTela` | → `mdp_field_tela` |
| `CadCpsCampoEmpresa` | → `mdp_field_empresa_scope` |
| `CadCpsHistorico` | → `mdp_field_audit` |

**Rule:** No parallel field storage after MDP-2 — CADCPS UI becomes admin surface over Data Dictionary.

### 8.5 Audit strategy

| Level | Mechanism |
|-------|-----------|
| **Row history** | `*_audit` tables per component (before/after JSON) |
| **Platform audit** | Platform Core `AuditLog` for all API mutations |
| **Publish audit** | `mdp_publish_log` — who published, when, from/to version |
| **Field history** | Preserves CADCPS historico semantics for compliance |

### 8.6 Indexing strategy (1K+ tenants)

- Composite indexes: `(cliente_id, entity_id)`, `(cliente_id, module_id, lifecycle)`
- Partial indexes: `WHERE lifecycle = 'active' AND status = 'published'`
- Content hash index on `mdp_compiled_bundle(content_hash)` for cache lookup
- No table partitioning in v1 — design allows future partition by `cliente_id`

---

## 9. API Architecture (Conceptual)

### 9.1 API groups

| Group | Methods | Purpose | Phase |
|-------|---------|---------|-------|
| `/api/mdp/entities` | CRUD + list | Entity Dictionary | MDP-1 |
| `/api/mdp/fields` | CRUD + list | Data Dictionary | MDP-2 |
| `/api/mdp/relationships` | CRUD + list | Relationship Dictionary | MDP-3 |
| `/api/mdp/registry` | CRUD + query by type | Metadata Registry | MDP-4 |
| `/api/mdp/introspect` | GET (read-only) | Studio/AI discovery surface | MDP-4 |
| `/api/mdp/compile/{moduleId}` | POST | Produce CRB from published defs | MDP-4 |
| `/api/mdp/publish` | POST | Publish draft version | MDP-5 |
| `/api/mdp/rollback` | POST | Rollback to prior version | MDP-5 |
| `/api/mdp/snapshots` | GET/POST | Export/import snapshots | MDP-5 |
| `/api/mdp/versions` | GET | Version history + pins | MDP-5 |

### 9.2 Read vs write split

| Surface | Access | Consumers |
|---------|--------|-----------|
| **Admin write** | RBAC ADMIN + tenant scope | Studio, admin UIs, generator (dev) |
| **Tenant read** | RBAC CONSULTA+ | Runtime compile, AI introspection |
| **Introspect read** | Scoped token — entity/field graph only | AI agents, SDK |
| **Platform read** | Cached compiled bundle | Foundation boot |

### 9.3 Introspection API (MDP-4 — Studio/AI gate)

```
GET /api/mdp/introspect?moduleId=&version=&locale=
→ {
    entities[], fields[], relationships[],
    registryEntries[]{ type, id, schemaVersion, summary },
    templates[], capabilities[], pinnedVersion
  }
```

Optimized for AI context windows — summary mode vs full payload mode.

### 9.4 Cache architecture

| Cache | Location | Invalidation |
|-------|----------|--------------|
| **Compiled bundle** | Redis / in-memory (optional) | `contentHash` change on publish |
| **Introspect response** | Redis per tenant+module+version | Publish/rollback |
| **Runtime registries** | Browser memory / makBootstrap | Page reload after publish |
| **Offline snapshot** | Client IndexedDB/SQLite | Sync Platform push |

**Rule:** Cache is always derived — MDP PostgreSQL is SSOT.

### 9.5 Runtime API flow

```
Client request → Platform Core auth
  → resolve pinned version (MdpEnvironmentPin)
  → fetch CRB (cache → DB)
  → Foundation runtime executes
  → L0 business data via L1 repositories
```

---

## 10. Internacionalização (Globalization)

### 10.1 Design

MDP supports i18n **by design** through normalized label tables — not hardcoded strings in module JS.

| Component | i18n mechanism |
|-----------|----------------|
| Entity Dictionary | `mdp_entity_label(entityId, locale, singular, plural, description)` |
| Data Dictionary | `mdp_field_label(fieldId, locale, label, helpText, placeholder)` |
| Relationship Dictionary | `mdp_relationship_label` |
| Metadata Registry | LabelSet indirection inside JSON payload + `mdp_registry_entry_label` |

### 10.2 Locale resolution order

```
1. User locale preference (L3)
2. Tenant default locale (Platform Core — future)
3. Platform default: pt-BR
4. Fallback: entityId / fieldName (technical)
```

### 10.3 Compile behavior

`compile(moduleId, version, locale)` resolves labels into CRB for target locale. Multi-locale tenants receive locale-specific CRB variants cached by hash.

**Implementation note:** Dedicated i18n infrastructure mission (IFM 1E) builds on MDP-2 labels — no parallel string catalog.

---

## 11. Cross-Platform Support Matrix

| Platform | MDP support | Mechanism |
|----------|-------------|-----------|
| **Foundation** | Consumes CRB | Compile hydrates boot registries — no MDP imports in frozen code |
| **ModeloBase1** | Template + entity compile | `baseTemplateId` from MDP-4; multi-template ready (D-017) |
| **Platform Core** | Auth, audit, version pins | All APIs secured; `AuditLog` for mutations |
| **MAK Studio** | Read/write all MDP components | Primary mutation surface (Program 2) |
| **AI Platform** | Read introspection + graph | RBAC-scoped; published versions only |
| **Marketplace** | Snapshot packaging | `.makpkg` = signed MDP snapshot (MDP-5) |
| **Offline** | Snapshot sync | Full definition snapshot per pinned version |
| **Multi-tenant** | `cliente_id` isolation | All APIs tenant-scoped; platform builtins read-only |
| **Multi-empresa** | Empresa scope tables | Field/entity applicability per company |

---

## 12. Implementation Phase Mapping

| Phase | Delivers | Exit criteria |
|-------|----------|---------------|
| **MDP-1** | Entity Dictionary tables + API + seed from registry | `empresas` + `cadcps` in `mdp_entity`; generator reads API |
| **MDP-2** | Data Dictionary + CADCPS migration path | Native + custom fields for `empresas` pilot |
| **MDP-3** | Relationship Dictionary | ≥1 documented relationship; Prisma graph imported |
| **MDP-4** | Metadata Registry + introspect + compile | Layout/event defs for 1 module via API; Studio spec feasible |
| **MDP-5** | Publish/rollback/snapshot | Draft→publish→compile→runtime; rollback proven |

**Prerequisite missions:** IFM 1A-S3 (security), IFM 1D-1 (CI gates) — per [IFM-PHASE-1-TECHNICAL-ROADMAP.md](../engineering/IFM-PHASE-1-TECHNICAL-ROADMAP.md).

---

## 13. Anti-Patterns (Forbidden)

- ❌ Foundation importing MDP tables directly (compile boundary only)
- ❌ Runtime `*ConfigRegistry.js` as SSOT
- ❌ Studio editing production module JS
- ❌ Parallel metadata tables outside MDP evolution
- ❌ Business data in MDP tables
- ❌ Cross-tenant definition reads
- ❌ Draft definitions in production compile path
- ❌ Skipping version on publish (always creates `MdpDefinitionVersion`)

---

## 14. Certification (MDP-0)

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | MDP architecture completely defined? | **SIM** | §3–7 define all 5 components with model, boundaries, tables, APIs |
| 2 | Duplicated responsibilities? | **NÃO** | Clear split: entity/field/relationship/registry/versioning; Foundation executes only |
| 3 | Foundation vs MDP conflict? | **NÃO** | Compile boundary (I-2); boot registries are cache; Foundation frozen (I-6) |
| 4 | ModeloBase1 works with multiple Base Templates? | **SIM** | §6.8 — Template Registry in MDP-4; ModeloBase1 = template 1 (D-017) |
| 5 | Supports future i18n? | **SIM** | §10 — label tables per component; locale-aware compile |
| 6 | Supports thousands of clients? | **SIM** | §2, §8.6 — tenant isolation, composite indexes, cache, scoped versions |
| 7 | Supports AI? | **SIM** | §9.3 introspect API; §5.6 graph context; published-only guardrail |
| 8 | Supports Marketplace? | **SIM** | §7 — `.makpkg` snapshots; §6 Marketplace bundles |
| 9 | Supports Offline? | **SIM** | §7 `MdpSnapshot`; §9.4 client cache; Sync Platform consumes snapshots |
| 10 | Ready for implementation without pending architecture decisions? | **SIM** | Phase mapping §12; coexistence strategy §8.4; all layer relationships documented |

**Pending (non-blocking — Platform Core, not MDP):** Event bus design (TD-010), SSO/MFA provider selection.

---

## 15. Document Hierarchy

```
Constitution (D-001, D-012)
  └── MAK-2035-MASTER-ARCHITECTURE.md (L4 topology)
        └── THIS DOCUMENT (MDP-0 — definitive MDP spec)
              └── MAK-DATA-PLATFORM.md (engineering summary + links)
                    └── MDP-1..5 implementation missions
```

---

*MDP-0 complete. No code altered. Next: MDP-1 implementation per §12.*
