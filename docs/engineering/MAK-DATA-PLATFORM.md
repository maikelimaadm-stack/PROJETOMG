# MAK DATA PLATFORM (MDP)

**Status:** Official architectural layer — specification (not yet implemented)  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Decision:** D-012  
**Program:** IFM Phase 1C  
**Prerequisite for:** MAK Studio (Program 2), Marketplace, IA, Low-Code

---

## 1. Definition

**MAK DATA PLATFORM (MDP)** is the metadata nucleus of MAK Gestão — the persisted, versioned, introspectable source of truth for everything the platform knows about its own structure.

MDP answers: *What entities exist? What fields do they have? How do they relate? What layouts, rules, and behaviors apply?*

MDP is **not** the business data layer (Prisma records). It is the **definition layer** that describes how business data is structured, presented, validated, and automated.

---

## 2. Position in Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Program 3: IA · Marketplace · Knowledge · Offline          │
├─────────────────────────────────────────────────────────────┤
│  Program 2: MAK Studio (visual designers)                   │
├─────────────────────────────────────────────────────────────┤
│  ★ MAK DATA PLATFORM ★                                      │
│  Entity · Data · Relationship Dictionaries + Metadata Reg.  │
├─────────────────────────────────────────────────────────────┤
│  Foundation Runtime (frozen)                                │
│  ModeloBase1 · framework/mak · config engines V13–V20       │
├─────────────────────────────────────────────────────────────┤
│  Domain Modules (thin config + business rules)              │
├─────────────────────────────────────────────────────────────┤
│  Business Data (Prisma / PostgreSQL)                        │
└─────────────────────────────────────────────────────────────┘
```

### Boundary rules

| Layer | Owns | Does not own |
|-------|------|--------------|
| **MDP** | Definitions, dictionaries, versioned metadata | UI rendering, runtime execution |
| **Foundation** | Runtime engines, registries (boot cache), UI motor | Persisted definition SSOT |
| **Modules** | Domain constants (until migrated to MDP), business logic | Structural UI |
| **Prisma** | Business record instances | Field/entity definitions (migrating to MDP) |

---

## 3. Four Dictionaries + Registry

### 3.1 Entity Dictionary

**Purpose:** Official catalog of all entities in the platform.

| Attribute | Description |
|-----------|-------------|
| entityId | Stable identifier (e.g. `EmpresaCadastro`) |
| moduleId | Owning module (`empresas`) |
| label | Singular/plural display names |
| persistence | Prisma model name, table, scope (cliente/empresa) |
| capabilities | Enabled engines, custom fields allowed |
| lifecycle | active, deprecated, draft |

**Current seed (code today):**

- `config/cadastro-modules.registry.json` — 4 entities
- `CadCpsTela.entity_name` — screen-to-entity binding
- Prisma models: `Empresa`, `Marca`, `Produto`, + CADCPS entities
- Generator output — new modules auto-register

**Target:** Single Entity Dictionary table/API — generator and CADCPS consume it.

---

### 3.2 Data Dictionary

**Purpose:** Official catalog of **all fields** — native and configurable.

Replaces the limited "custom fields only" view of CADCPS.

| Attribute | Description |
|-----------|-------------|
| fieldId | Stable identifier |
| entityId | Parent entity |
| fieldName | Technical name (`razao_social`) |
| type | Canonical type (18 types today in CADCPS) |
| labels, masks, formulas | Presentation and computation |
| visibility | form, table, report, filter flags |
| source | `native` \| `custom` \| `computed` |
| scope | cliente, empresa applicability |

**Current seed (code today):**

- `CadCpsCampo` model — ~30 metadata columns per field
- `CadCpsCampoOpcao` — select options
- `CadCpsHistorico` — field change audit
- Module `*Form.constants.js` — native field defs (not yet in dictionary)
- `CustomFieldEngine.js` — runtime consumer

**Target:** Native fields migrated from module constants into Data Dictionary; CADCPS admin UI evolves into Field Dictionary management.

---

### 3.3 Relationship Dictionary

**Purpose:** Official catalog of relationships between entities.

| Attribute | Description |
|-----------|-------------|
| relationshipId | Stable identifier |
| fromEntity / toEntity | Endpoints |
| type | one-to-one, one-to-many, many-to-many |
| cardinality | min/max |
| dependency | cascade, restrict, optional |
| inheritance | parent entity (if applicable) |
| referenceFields | FK field mappings |

**Current seed (code today):**

- `CadCpsCampo.relation_entity` — field-level relation hint only
- Prisma `@relation` — implicit, not cataloged
- No relationship graph API

**Target:** Explicit Relationship Dictionary — required for Studio relation designer, IA context, Marketplace package validation.

---

### 3.4 Metadata Registry

**Purpose:** Central registry of all reusable platform definitions.

| Definition type | Current location | MDP target |
|-----------------|------------------|------------|
| Layouts | `UsuarioPreferencia`, module cadastroConfig | Registry entry + user overlay |
| Fields | Data Dictionary | Linked |
| Events | `*ModuleMetadata.js`, `EVENT_CATALOG.md` | Registry entry |
| Actions | `*ModuleMetadata.js`, `ACTION_CATALOG.md` | Registry entry |
| Formulas | field defs, `FORMULA_FUNCTION_CATALOG.md` | Registry entry |
| Validations | Zod schemas, validation engine | Registry entry |
| Workflows | workflow defs, `WORKFLOW_CATALOG.md` | Registry entry |
| Permissions | `cadastroRbac.js` (hardcoded) | Registry entry (future) |
| Dashboards | Not implemented | Registry type reserved |
| Pivots | Grouping disabled (`disabled_certified`) | Registry type reserved |
| Reports | Export configs per module | Registry entry |
| Integrations | Not implemented | Registry type reserved |

**Runtime vs persisted:**

- `framework/mak/*ConfigRegistry.js` — **runtime Map** (execution cache at boot)
- MDP Metadata Registry — **persisted SSOT** (versioned, API-accessible)

Boot flow (target):

```
MDP Metadata Registry (DB)
  → compile/hydrate on module load
  → framework/mak engine registries (runtime)
  → ModeloBase1 config factory
  → UI
```

---

## 4. MDP Implementation Phases (IFM 1C)

| Phase | ID | Deliverable | Depends on |
|-------|-----|-------------|------------|
| 1C.1 | MDP-1 | Entity Dictionary schema + API + registry sync | IFM 1A (S1–S2) |
| 1C.2 | MDP-2 | Data Dictionary evolution (CADCPS → all fields) | MDP-1 |
| 1C.3 | MDP-3 | Relationship Dictionary schema + API | MDP-1 |
| 1C.4 | MDP-4 | Metadata Registry + introspection API | MDP-1, MDP-2 |
| 1C.5 | MDP-5 | Definition versioning + publish pipeline | MDP-4 |

---

## 5. API Surface (Future — Not Implemented)

Planned API groups (names indicative):

```
/api/mdp/entities          — Entity Dictionary CRUD
/api/mdp/fields            — Data Dictionary CRUD
/api/mdp/relationships     — Relationship Dictionary CRUD
/api/mdp/registry          — Metadata Registry query/mutate
/api/mdp/registry/publish  — Versioned publish
/api/mdp/introspect        — Studio/IA read surface
/api/mdp/compile/{moduleId}— Compile definitions → runtime config
```

All endpoints: `cliente_id` scoped, RBAC enforced, audit logged.

---

## 6. Platform Dependencies

| Platform | MDP dependency |
|----------|----------------|
| **MAK Studio** | Direct — all designers read/write MDP |
| **Low-Code** | Definition bundles = MDP export format |
| **IA** | Entity/Field/Relationship graph for context |
| **Knowledge Platform** | Links articles to entityIds |
| **Marketplace** | Packages = versioned MDP bundles |
| **Versionamento** | Registry revision model |
| **Publicação** | compile + deploy pipeline from MDP |
| **Offline** | Definition snapshots synced to client |
| **Multi-tenant** | All dictionaries scoped by `cliente_id` |

---

## 7. Anti-Patterns (Constitution-aligned)

- ❌ Studio editing module JS source directly in production
- ❌ Parallel metadata tables outside MDP evolution path
- ❌ Bypassing CADCPS migration — create new ad-hoc field storage
- ❌ Putting MDP definitions inside Foundation frozen layers
- ❌ Runtime engine registries as SSOT (they are boot caches)

---

## 8. Success Criteria

MDP Phase 1C complete when:

1. Entity Dictionary lists all certified modules + Prisma entities
2. Data Dictionary includes native + custom fields for ≥1 module (pilot: marcas)
3. Relationship Dictionary has schema + ≥1 documented relationship
4. Metadata Registry API returns layout/event/action defs for ≥1 module
5. MAK Studio can be specified against real API contracts (Program 2 gate)

---

*Strategy review: [IFM-MISSION-1-STRATEGY-REVIEW.md](./IFM-MISSION-1-STRATEGY-REVIEW.md)*  
*Program context: [ROADMAP.md](./ROADMAP.md)*
