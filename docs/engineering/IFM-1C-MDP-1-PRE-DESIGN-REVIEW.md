# IFM 1C — MDP-1 Pre-Design Review

**Mission ID:** IFM 1C — MDP-1 Pre-Design Review  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Date:** 2026-06-28  
**Status:** Complete — review only (no code, no migrations)  
**Authority:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) (MDP-0)  
**Implementation brief:** [IFM-1C-MDP-1-ENTITY-DICTIONARY.md](./IFM-1C-MDP-1-ENTITY-DICTIONARY.md)

---

## 0. Executive Summary

The MDP-0 conceptual model for **MDP-1 Entity Dictionary** is **architecturally sound** and aligned with MAK 2035 (L4 definition layer, compile boundary I-2, multi-tenant scope, i18n label tables, `baseTemplateId` for multi-template).

**Verdict:** The model **supports the 2035 vision** with **targeted schema amendments** documented below (Decision **D-021**). These must be incorporated into the **first migration** to avoid structural rework in MDP-2, MDP-5, Marketplace, or Sync.

**Do not freeze** the schema exactly as written in MDP-0 §3.5 without D-021 addenda.  
**Do freeze** after D-021 is accepted and reflected in the MDP-1 migration spec.

---

## 1. Scope of Review

| In scope | Out of scope |
|----------|--------------|
| MDP-1 Entity Dictionary conceptual model | Prisma implementation |
| Cross-layer fit (Studio, AI, Marketplace, Offline, clients) | API implementation |
| PK/FK, identifiers, versioning, audit, i18n | Foundation / Runtime code |
| Gaps vs MAK 2035 Master Architecture | MDP-2..5 full design (referenced where MDP-1 depends) |

**Evidence base:** MDP-0 §3, §8.2; MAK-2035 §L4–L7; `config/cadastro-modules.registry.json`; Prisma L0 models (`Empresa`, `CadCpsTela`, `RegistroGlobal`, `AuditLog`); module configs (`entityName` usage).

---

## 2. Conceptual Model Validation

### 2.1 Core entity (`mdp_entity`)

| Dimension | Assessment | Notes |
|-----------|------------|-------|
| **Primary key** | ✅ Adequate | `id` (cuid) + stable business key `entityId` |
| **Global identifiers** | ⚠️ Amend | `entityId` is SSOT for definitions; L0 uses `entity_name` — need **`legacyEntityName`** in PersistenceBinding for migration |
| **Versioning** | ⚠️ Amend | `versionRef` → MDP-5 required; **stub `mdp_definition_version` in MDP-1** (platform v1 published) |
| **Audit** | ✅ Adequate | `mdp_entity_audit` + Platform Core `AuditLog` (I-5) |
| **Labels** | ✅ Adequate | `mdp_entity_label(locale, singular, plural, description)` |
| **Lifecycle** | ⚠️ Clarify | `lifecycle` = catalog state (`active/deprecated/archived`); **not** draft/publish — that lives on `MdpDefinitionVersion` (MDP-5) |
| **Publication** | ✅ Deferred | Entity rows versioned in batch via MDP-5; MDP-1 seeds `published` v1 |
| **States** | ⚠️ Clarify | Do not duplicate MDP-5 `status` on entity row — use `version_id` FK only |
| **Ownership** | ⚠️ Add | **`originKind`** + **`originRef`** for platform / tenant / marketplace provenance |
| **Extensibility** | ⚠️ Add | Tenant extensions: `scope=tenant` + optional **`extendsEntityId`** overlay |
| **Inheritance** | ⚠️ Partial | Entity-level inheritance via `extendsEntityId`; graph inheritance stays MDP-3 |
| **Composition** | ✅ Adequate | `moduleId` + 1:N routes; future multi-entity modules supported |
| **Dependencies** | ⚠️ Optional | **`compileOrder`** or defer to MDP-3 relationship graph |

### 2.2 Satellite tables

| Table | Assessment |
|-------|------------|
| `mdp_entity_label` | ✅ Full i18n anchor for entity names |
| `mdp_entity_capability` | ✅ Queryable engine flags (V13–V20 + customFields, attachments) |
| `mdp_entity_route` | ⚠️ Add **`clientTarget`** (web \| mobile \| desktop \| all), **`menuSection`**, **`sortOrder`** |
| `mdp_entity_audit` | ✅ Row-level before/after JSON |

### 2.3 Common columns (MDP-0 §8.2)

All recommended for MDP-1 first migration:

`id`, `cliente_id`, `scope`, `lifecycle`, `version_id`, `created_at`, `updated_at`, `created_by`, `updated_by`

**Index strategy (confirmed):** `(cliente_id, entity_id)`, `(cliente_id, module_id, lifecycle)`, partial `WHERE lifecycle = 'active'`.

---

## 3. Per-Entity Capability Matrix (2035 Dimensions)

Evaluates whether **MDP-1 conceptual model** (with D-021) supports each platform need.

| Dimension | Supported? | Mechanism | Gap / Amendment |
|-----------|------------|-----------|-----------------|
| **MAK Studio** | ✅ Yes | Entity picker: `entityId`, labels, routes, capabilities, `sortOrder`, `entityKind` | Add `sortOrder`, `iconKey`, `entityKind` on `mdp_entity` |
| **AI Platform** | ✅ Yes | `entityId` + capabilities + introspect (MDP-4) + published version pin | Add optional **`aiScopeTags[]`** or defer to MDP-4 permission entries |
| **Marketplace** | ⚠️ With D-021 | Package bundles reference stable `entityId`; provenance via `originKind/originRef` | Add origin fields; snapshot includes entity slice (MDP-5) |
| **Offline** | ✅ Yes | Entity list + persistence binding + routes in `MdpSnapshot` / CRB | Route `clientTarget` for mobile offline deep links |
| **Desktop** | ✅ Yes | Same CRB; `baseTemplateId` + routes | Route table clientTarget |
| **Mobile** | ✅ Yes | Same CRB; adaptive layouts in MDP-4 (not MDP-1) | Route + template reference sufficient at entity level |
| **Internacionalização** | ✅ Yes | Normalized `mdp_entity_label` per locale; compile resolves labels (MDP-0 §10) | Document `entityId` fallback when label missing |
| **Multi-tenant** | ✅ Yes | `cliente_id` + `scope: platform \| tenant` (I-1) | Unique `(scope, cliente_id, entityId)` |
| **Multi-empresa** | ✅ Yes | `empresaScope: none \| optional \| required` on entity | Maps to `X-Empresa-Id` header rules |
| **Versionamento** | ⚠️ With stub | `version_id` FK → `mdp_definition_version` | **Create minimal MDP-5 stub table in MDP-1 migration** |
| **Publish** | ⚠️ MDP-5 | Batch publish of version, not per-row | MDP-1 seeds platform v1 as `published` |
| **Rollback** | ⚠️ MDP-5 | Version chain + recompile | Entity table unchanged; version pointer moves |
| **Snapshot** | ✅ Yes | Entity + labels + routes + capabilities exported in snapshot payload | MDP-5 responsibility; MDP-1 schema snapshot-ready |
| **Compile Runtime Bundle** | ✅ Yes | Entity slice: ids, persistence, capabilities, template, routes, resolved labels | Full CRB assembled at MDP-4/5 compile |

---

## 4. Seed & Registry Alignment Issues

### 4.1 `empresas` — ✅ Clean mapping

| Source | MDP-1 target |
|--------|--------------|
| `moduleId: empresas` | `moduleId` |
| `entityName: EmpresaCadastro` | `entityId: EmpresaCadastro`, `legacyEntityName: EmpresaCadastro` |
| Prisma `Empresa` model | `persistence.prismaModel: Empresa`, `tenantKey: cliente_id`, `idGlobalKey: id_global` |
| `empresaScope` | `required` (operational cadastro per company) |
| `baseTemplateId` | `modelobase1` |

### 4.2 `cadcps` — ⚠️ Semantic correction required (D-021)

**Problem:** Registry maps `entityName: CadCpsCampo`, but `CadCpsCampo` is a **field definition** (MDP-2), not a business entity.

| Current | Correct MDP-1 semantics |
|---------|-------------------------|
| Entity = `CadCpsCampo` | Module = `cadcps`, **`entityKind: meta`** admin module |
| Single entity row | One **meta entity** `CadcpsAdmin` (or similar) for admin UI **OR** zero business entities with module-only routes |
| `CadCpsTela` | Maps to **`mdp_entity_route`** + target **`entityId`** references (screens for `EmpresaCadastro`, etc.) — **not** duplicate entity rows per tela |

**Recommendation:** Seed `cadcps` as:

- `entityId: CadcpsFieldCatalog` (meta), `entityKind: meta`, persistence → `CadCpsCampo` (admin CRUD of catalog)
- `CadCpsTela` rows → `mdp_entity_route` entries linking admin module to target entities
- Do **not** treat each `CadCpsTela.entity_name` as a separate MDP entity in v1 (those are **target entities** already in catalog or future modules)

This avoids polluting Entity Dictionary with field-level rows and aligns CADCPS → MDP-2 migration path (MDP-0 §8.4).

### 4.3 L0 `entity_name` → MDP `entityId` bridge

Tables using `entity_name` today: `RegistroGlobal`, `CadastroRegistro`, `RegistroAnexo`, `AuditLog`, `EntidadeCodigoSequencia`.

**Requirement:** PersistenceBinding must expose **`legacyEntityName`** equal to current `entity_name` values until L0 columns are renamed in a later Platform Core migration (non-blocking for MDP-1).

---

## 5. Structural Amendments (D-021 — Pre-Migration)

These fields **must** be in the **first MDP-1 migration** to avoid future structural migrations:

### 5.1 `mdp_entity` addenda

| Field | Type | Purpose |
|-------|------|---------|
| `entityKind` | enum | `business \| meta \| system \| certification` |
| `sortOrder` | int | Menu/module ordering (from registry `ordem`) |
| `iconKey` | string? | Studio / mobile nav |
| `extendsEntityId` | string? | Tenant/marketplace overlay of platform entity |
| `originKind` | enum | `platform \| tenant \| marketplace` |
| `originRef` | string? | Package id / tenant id provenance |
| `isRuntimeModule` | boolean | `true` for empresas/cadcps; `false` for cert modules |
| `legacyEntityName` | string? | L0 `entity_name` compatibility |
| `permissionResourceKey` | string? | RBAC resource binding (until MDP-4 permission registry) |

### 5.2 `mdp_entity_route` addenda

| Field | Type | Purpose |
|-------|------|---------|
| `clientTarget` | enum | `web \| mobile \| desktop \| all` |
| `menuSection` | string? | Studio menu grouping |
| `sortOrder` | int | Nav ordering |
| `targetEntityId` | string? | For meta routes (CADCPS admin → target entity) |

### 5.3 MDP-5 minimal stub (in MDP-1 migration)

Create **`mdp_definition_version`** with seed row:

```
versionId: platform-v1
scope: platform
semver: 1.0.0
revision: 1
status: published
```

All MDP-1 seed rows reference this `version_id`. Full MDP-5 state machine implemented in MDP-5 phase without altering MDP-1 table shapes.

---

## 6. Relationships Not Yet in MDP-1 (Expected)

| Relationship | Owner | MDP-1 action |
|--------------|-------|--------------|
| Entity → Fields | MDP-2 | FK `entityId` only |
| Entity → Entity graph | MDP-3 | No FK in MDP-1 |
| Entity → Registry entries | MDP-4 | Optional `entityId` scope on entries |
| Entity → Module licensing | Platform Core | `ClienteModulo.modulo` ↔ `moduleId` (existing) |
| Entity → Knowledge anchors | Knowledge Platform | `entityId` reference (L6 — not MDP-1 table) |

**No blocking missing relationships** for MDP-1 start.

---

## 7. Risk Assessment — Future Structural Migrations

| Risk | Severity | Mitigation |
|------|----------|------------|
| MDP-1 without `version_id` stub | **High** | Create `mdp_definition_version` in first migration |
| `CadCpsCampo` as business entity | **High** | D-021 cadcps semantic correction |
| Missing `legacyEntityName` | **Medium** | Breaks RegistroGlobal / AuditLog correlation |
| Missing Marketplace provenance | **Medium** | Add `originKind/originRef` now |
| Conflating lifecycle vs publish status | **Medium** | Document: lifecycle ≠ draft/publish |
| Missing route client targets | **Low** | Add `clientTarget` on routes |
| No `extendsEntityId` | **Medium** | Required for tenant/marketplace overlays |

**Without D-021:** expect **2–3 structural migrations** before Marketplace or multi-template production.  
**With D-021:** MDP-1 schema **freezable** after first migration.

---

## 8. Pending Architectural Decisions

| ID | Decision | Blocking MDP-1? | Recommendation |
|----|----------|-----------------|----------------|
| **D-021** | MDP-1 schema addenda (§5) | **Yes — resolve before migration** | Accept addenda in this review |
| MDP-1 cadcps seed semantics | Meta entity vs module-only | **Yes** | Meta entity `CadcpsFieldCatalog` + routes |
| AI scope tags on entity vs registry | No | Defer to MDP-4 permission entries |
| Event bus (TD-010) | No | Platform Core — not MDP-1 |
| Rename L0 `entity_name` → `entity_id` | No | Platform Core migration post-MDP-1 |

---

## 9. Certification (10 Questions)

| # | Question | Answer | Justification |
|---|----------|--------|---------------|
| **1** | Modelo suporta visão MAK 2035? | **SIM (com D-021)** | MDP-0 L4 topology, compile boundary, multi-tenant, i18n, templates, snapshot path — all consistent with Master Architecture §L4–L7 |
| **2** | Atributo importante ausente? | **SIM — 9 campos** | §5.1: `entityKind`, `sortOrder`, `iconKey`, `extendsEntityId`, `originKind`, `originRef`, `isRuntimeModule`, `legacyEntityName`, `permissionResourceKey` |
| **3** | Relacionamento não previsto? | **NÃO (bloqueante)** | Entity→Field (MDP-2), Entity→Graph (MDP-3), Entity→Registry (MDP-4) correctly deferred; module licensing exists in L3 |
| **4** | Risco de migrations estruturais futuras? | **MÉDIO sem D-021; BAIXO com D-021** | Main risks: version stub, cadcps semantics, legacy entity name bridge |
| **5** | Decisão arquitetural pendente? | **SIM — D-021** | Must accept schema addenda + cadcps seed semantics before first migration |
| **6** | Suporta múltiplos Base Templates? | **SIM** | `baseTemplateId` on entity + Template Registry in MDP-4 (D-017); ModeloBase1 = template 1 |
| **7** | Suporta internacionalização completa? | **SIM** | Normalized label table + locale-aware compile (MDP-0 §10); MessageFormat/plural rules can extend labels later without schema break |
| **8** | Suporta Marketplace e pacotes? | **SIM (com D-021)** | Stable `entityId` + `originKind/originRef` + snapshot bundles (MDP-5 `.makpkg`) |
| **9** | Modelo pode ser congelado? | **SIM após D-021** | Freeze MDP-1 table shapes after first migration incorporating §5 addenda |
| **10** | Iniciar implementação MDP-1 imediatamente? | **SIM** | Prerequisites met (S3, 1D-1, MDP-0); implement with D-021 addenda in first migration — no Foundation/Runtime changes |

---

## 10. Implementation Checklist (MDP-1 First Migration)

Before writing Prisma models:

- [ ] Accept **D-021** in DECISIONS.md
- [ ] Include **`mdp_definition_version`** stub + platform v1 seed
- [ ] Apply **`mdp_entity`** and **`mdp_entity_route`** addenda (§5)
- [ ] Seed `empresas` / `cadcps` per §4 semantics
- [ ] Enforce unique `(scope, cliente_id, entityId)`
- [ ] Map `legacyEntityName` for all L0-correlated entities
- [ ] Update IFM-1C-MDP-1 brief with D-021 reference
- [ ] G118 gate: count runtime modules from MDP export (parallel file registry until cutover)

---

## 11. Document Hierarchy Update

```
MDP-0 (architecture spec)
  └── THIS REVIEW (pre-migration validation)
        └── D-021 (schema addenda decision)
              └── MDP-1 implementation (first migration)
```

---

*Review complete. No code, Prisma, API, or runtime files altered.*
