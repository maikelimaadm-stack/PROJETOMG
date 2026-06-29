# IFM 1C-MDP-4.5 — Final Architecture Review Report

**Mission ID:** IFM 1C-MDP-4.5  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Date:** 2026-06-29  
**Status:** Complete  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md)  
**Decision:** D-025 — MDP-1..4 Architecture Freeze

---

## 0. Executive Summary

A full architectural audit of **MDP-1 (Entity Dictionary)**, **MDP-2 (Data Dictionary)**, **MDP-3 (Relationship Dictionary)**, and **MDP-4 (Metadata Registry)** was performed as an integrated platform layer.

**Verdict:** The four-layer architecture is **structurally sound and approved for freeze** before MDP-5. Two pre-freeze corrections were applied (validator enum alignment, entity export persistence drift). Remaining items are **documented transitional debt** explicitly owned by MDP-5 (compile, publish, legacy retirement) — not structural defects.

PR #300 merged to `main` (`03f6115a`).

---

## 1. Audit Scope

| Layer | Tables / API | Governance |
|-------|--------------|------------|
| MDP-1 | `mdp_entity*` | G137 |
| MDP-2 | `mdp_field*` | G138 |
| MDP-3 | `mdp_relationship*` | G139 |
| MDP-4 | `mdp_registry*` | G140 |
| Shared | `mdp_definition_version` | — |

Reviewed: Prisma schema, migrations, repositories, services, routes, exports, gates, compile boundary (Foundation `src/`), spec §3–§8.

---

## 2. Layer Responsibilities — No Duplication of SSOT

| Concern | Owner | Other layers |
|---------|-------|--------------|
| Entity catalog, persistence binding, routes | **MDP-1** | Registry references `entity_id` |
| Field definitions (native/custom/computed) | **MDP-2** | Registry `field_config` = compiled view |
| Relationship graph | **MDP-3** | Field hints via `relationship_ref` |
| Layout/engine/template/permission defs | **MDP-4** | Does not store entity/field rows |

**Tenant visibility** is consistent: `platform (cliente_id=null) OR tenant (cliente_id=scope)` in all four repositories.

**Platform row immutability** via API is enforced in all four services (403 on platform official rows).

---

## 3. Findings

### 3.1 Fixed before freeze (structural)

| ID | Issue | Fix | Evidence |
|----|-------|-----|----------|
| F-01 | Registry `empresaScope` validator used wrong enum (`all/selected` vs Prisma `none/optional/required`) | Aligned validator to `MdpEmpresaScope` | `mdpRegistryValidators.js` L49 |
| F-02 | `CadcpsFieldCatalog` export persistence drifted to legacy `CadCpsCampo` while seed declares `MdpField` | Corrected `config/mdp-entities.export.json`; G137 extended | `seedMdpPlatformEntities.js` L60–68; export JSON |

### 3.2 Transitional debt — MDP-5 owned (not freeze blockers)

| ID | Observation | Why not a structural defect | MDP-5 action |
|----|-------------|----------------------------|--------------|
| T-01 | `cadastro-modules.registry.json` still consumed by Foundation bootstrap | Spec §3.2: compile cache until publish engine | Compile-on-publish → generated artifact |
| T-02 | `*ModuleMetadata.js` runtime engine config vs MDP-4 persisted entries | Foundation I-2 boundary; boot caches until compile | CRB hydration for empresas pilot |
| T-03 | Legacy `CadCpsCampo*` tables remain; writes go to `mdp_field` | Rollback reference per D-022 | Read-path audit + table retirement |
| T-04 | `MdpFieldTela` FK to `CadCpsTela` | Transitional screen catalog | Bind to `mdp_entity_route` |
| T-05 | `MdpRegistryEntry.status` + `lifecycle` dual axes | `status`=publication (MDP-5); `lifecycle`=dictionary | State machine in publish engine |
| T-06 | `GET /api/mdp/introspect` (unified) and `/compile` not implemented | Explicitly MDP-5 scope per spec §7, §9 | Implement with versioning |
| T-07 | `counterService` counts legacy `cadCpsCampo` | Materialized column semantics | Migrate counter to `mdp_field` |
| T-08 | Registry JSON Schema stubs (`additionalProperties: true`) | Contract placeholders v1 | Tighten per entryType in Studio phase |

### 3.3 Explicitly sound (evidence)

1. **Four-layer SSOT model** maps to Prisma groups in spec §8.1.
2. **Compile boundary PASS:** G140 — no Foundation `src/` imports of MDP persistence.
3. **CADCPS write path unified:** `repCps.js` → `mdpFieldRepository` (G138).
4. **MDP-3 relationship model** supports physical/logical/computed + dependency classes for future consumers.
5. **MDP-4** provides 25 entry types, `content_hash`, bindings, audit, introspect — ready as compile inputs.
6. **Scale patterns:** `cliente_id`-leading indexes, stable string IDs (`entity_id`, `field_id`, `relationship_id`, `entry_id`), `MdpDefinitionVersion` FK on all layers.
7. **Future programs schema-ready:** `owner_kind: marketplace`, `MdpClientTarget`, label tables per layer, `base_template_id` denormalized on all dictionary rows.

---

## 4. Cross-Cutting Readiness Matrix

| Concern | MDP-1..4 readiness | Notes |
|---------|-------------------|-------|
| **MAK 2035** | ✅ Schema + API contracts | Compile/publish = MDP-5 |
| **IA Platform** | ✅ Partial | Registry introspect; unified graph = MDP-5 |
| **Marketplace** | ✅ Schema-ready | `.makpkg` snapshots = MDP-5 |
| **Offline** | ✅ Schema-ready | Snapshot export = MDP-5 |
| **Desktop / Mobile** | ✅ Partial | `MdpClientTarget` on routes; client compile = MDP-5 |
| **i18n** | ✅ Schema-ready | Label tables all layers; multi-locale seeds = Studio |
| **Multiple Base Templates** | ✅ | `base_template_id` + registry `base_template` entries |
| **1000s of tenants** | ✅ Adequate | Tenant-scoped indexes; version pins = MDP-5 |
| **Multi-country** | ✅ Schema-ready | Locale columns; country rules = Platform Core |
| **Tenant migration** | ✅ Partial | Stable IDs + exports; promotion API = MDP-5 |
| **Import / export** | ✅ Partial | Static `config/mdp-*.export.json`; snapshot API = MDP-5 |

---

## 5. Validation Evidence

| Check | Result |
|-------|--------|
| PR #300 merge | ✅ |
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
| `npm run verify:governance` | ✅ (G137 persistence check) |
| `npm run verify:ci` | ✅ |
| `npm run verify:governance:cycles` | ✅ 5/5 |
| Smoke / validate MDP scripts | ✅ SKIP without DATABASE_URL |

---

## 6. Certification Answers

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | Inconsistência estrutural MDP-1..4? | **NÃO** (após F-01, F-02) | §3.1 fixes; §3.3 sound items |
| 2 | Duplicação de responsabilidades? | **NÃO** no SSOT persistido | §2 layer table; parallel JS registries = transitional T-01/T-02 |
| 3 | Melhorias antes do congelamento? | **NÃO** (restante = MDP-5) | §3.2 transitional debt |
| 4 | Suporta MAK 2035 integralmente? | **SIM** (schema/API) | §4 matrix; spec §8 |
| 5 | IA, Marketplace, Offline, Mobile, Desktop, Base Templates sem refatoração estrutural? | **SIM** | Enums, owner_kind, bindings, stable IDs |
| 6 | Milhares de clientes, países, migração? | **SIM** (patterns) | Indexes, tenant isolation, export snapshots |
| 7 | Build, Lint, CI, Governança verdes? | **SIM** | §5 |
| 8 | Repo saudável após merge PR #300? | **SIM** | main @ `03f6115a` |
| 9 | Pode congelar antes do MDP-5? | **SIM** | D-025 |
| 10 | Briefing MDP-5 preparado? | **SIM** | [IFM-1C-MDP-5-VERSIONING-PUBLICATION.md](./IFM-1C-MDP-5-VERSIONING-PUBLICATION.md) |

---

## 7. Freeze Declaration

**MDP-1, MDP-2, MDP-3, and MDP-4 Prisma schemas, API contracts, and governance gates (G137–G140) are frozen** as of 2026-06-29.

Changes before MDP-5 completion require:
- Decision record in `DECISIONS.md`
- Governance gate update if export/API contracts change

**Next mission:** IFM 1C-MDP-5 — Versioning & Publication Engine.

---

*Certified by IFM 1C-MDP-4.5 mission.*
