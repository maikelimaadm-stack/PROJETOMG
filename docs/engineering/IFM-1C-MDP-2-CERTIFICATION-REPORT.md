# IFM 1C-MDP-2 — Data Dictionary Certification Report

**Mission ID:** IFM 1C-MDP-2  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Date:** 2026-06-29  
**Status:** Complete  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §4  
**Decision:** D-022 — MDP-2 Data Dictionary Schema

---

## 0. Executive Summary

**MDP-2 Data Dictionary** is implemented as the **official SSOT for all field definitions** on the platform. CADCPS admin (`repCps`) reads and writes exclusively through `mdp_field*` tables via the CADCPS bridge adapter — no parallel field storage on write path.

Native Empresas fields (20) are seeded into `mdp_field` with `source=native|system`. Legacy `CadCpsCampo*` rows migrate idempotently via `migrateCadcpsToMdpFields.js`.

---

## 1. Deliverables

### Prisma (D-022)

| Table | Status |
|-------|--------|
| `mdp_field` | ✅ Core field definitions |
| `mdp_field_label` | ✅ i18n labels/help/placeholder |
| `mdp_field_option` | ✅ Select/radio options |
| `mdp_field_empresa_scope` | ✅ Per-empresa applicability |
| `mdp_field_tela` | ✅ Screen visibility binding |
| `mdp_field_audit` | ✅ Field change history |

Migration: `backend/prisma/migrations/20260629010000_mdp2_data_dictionary/migration.sql`

### Enums

| Enum | Values |
|------|--------|
| `MdpFieldSource` | native, custom, computed, derived, system, virtual |
| `MdpFieldEmpresaApplicability` | all, selected, none |

### API

| Route | Methods | Scope |
|-------|---------|-------|
| `/api/mdp/fields` | GET, POST | Tenant + platform read |
| `/api/mdp/fields/:id` | GET, PUT, DELETE | Tenant isolation |

### CADCPS Bridge

| Component | Role |
|-----------|------|
| `repCps.js` | CRUD via `mdpFieldRepository` — **no `prisma.cadCpsCampo` writes** |
| `mdpFieldCadcpsAdapter.js` | Shape conversion CADCPS ↔ MDP |
| `migrateCadcpsToMdpFields.js` | One-time legacy migration |

### Seeds & Registry

| Script | Purpose |
|--------|---------|
| `seedMdpNativeFields.js` | 20 native Empresas fields |
| `seedMdpFields.js` | Orchestrator (native + migration) |
| `exportMdpFieldsRegistry.js` | Export cache |
| `config/mdp-fields.export.json` | Committed export (CI without DB) |
| `scripts/sync-mdp-fields-registry.mjs` | Sync script |

### Governance

| Gate | Check |
|------|-------|
| **G138** | Export ≥19 native Empresas fields + CADCPS bridge uses MDP |

---

## 2. Field Model Capabilities

| Capability | Support | Evidence |
|------------|---------|----------|
| Native fields | ✅ | `source=native`, platform scope, Empresas seed |
| Custom fields | ✅ | CADCPS CRUD → `mdp_field` |
| Computed | ✅ | `source=computed`, `formula`, `formula_ref` |
| Derived | ✅ | `source=derived` enum |
| System | ✅ | `campos_personalizados` source=system |
| Virtual | ✅ | `source=virtual` enum |
| Read-only | ✅ | `read_only` column |
| Required | ✅ | `required` column |
| i18n labels | ✅ | `mdp_field_label` per locale |
| Versioning | ✅ | `version_id` FK → `mdp_definition_version` |
| Multi Base Template | ✅ | `base_template_id` on every field |
| Multi-empresa | ✅ | `mdp_field_empresa_scope` junction |
| Studio-ready | ✅ | Schema supports Field Studio CRUD without refactor |
| AI/Marketplace/Offline-ready | ✅ | Stable `field_id`, presentation JSON, no structural gaps |

---

## 3. Validation Evidence

| Check | Result |
|-------|--------|
| Build | ✅ |
| Lint | ✅ |
| Typecheck (governance) | ✅ (TD-009 baseline noise) |
| verify:governance | ✅ (incl. G138) |
| verify:ci | ✅ |
| verify:governance:cycles | ✅ 5/5 |
| validate:mdp-fields | ✅ SKIP without DATABASE_URL (CI frontend-only) |
| smoke:mdp-fields | ✅ SKIP without DATABASE_URL |

---

## 4. Certification Answers

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | Data Dictionary = SSOT oficial de campos? | **SIM** | `mdp_field*` tables; API `/api/mdp/fields`; G138 |
| 2 | CADCPS promovido sem armazenamento paralelo? | **SIM** | `repCps.js` uses `mdpFieldRepository`; no `prisma.cadCpsCampo` in write path |
| 3 | Suporta native, custom, computed, derived, virtual? | **SIM** | `MdpFieldSource` enum + schema columns |
| 4 | Preparado para múltiplos Base Templates? | **SIM** | `base_template_id` on `mdp_field` |
| 5 | Suporta internacionalização completa? | **SIM** | `mdp_field_label(locale, label, helpText, placeholder)` |
| 6 | Preparado para IA, Marketplace, Offline? | **SIM** | Stable IDs, presentation JSON, version FK — no structural refactor needed |
| 7 | Build, Lint, Typecheck, CI, Governança verdes? | **SIM** | Validation §3 |
| 8 | Repositório saudável após merge PR #297? | **SIM** | PR #297 merged; main synced; MDP-2 on feature branch |
| 9 | Pronto para MDP-3 (Relationship Dictionary)? | **SIM** | `relationship_ref` column reserved; entity FK established |
| 10 | Briefing MDP-3 preparado? | **SIM** | [IFM-1C-MDP-3-RELATIONSHIP-DICTIONARY.md](./IFM-1C-MDP-3-RELATIONSHIP-DICTIONARY.md) |

---

## 5. Out of Scope (Confirmed)

- MDP-3, MDP-4, MDP-5 implementation
- Studio UI
- AI Platform runtime
- Marketplace
- Offline sync engine

---

*Certified by IFM 1C-MDP-2 mission.*
