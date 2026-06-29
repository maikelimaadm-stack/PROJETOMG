# IFM 1C-MDP-2 — Data Dictionary Implementation Brief

**Mission ID:** IFM 1C-MDP-2 (MDP-2)  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Priority:** P1  
**Status:** Complete — [certification report](./IFM-1C-MDP-2-CERTIFICATION-REPORT.md)  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §4

---

## Prerequisites

| Mission | Status |
|---------|--------|
| MDP-1 Entity Dictionary | ✅ Complete |
| MDP-0 Architecture Specification | ✅ Complete (D-020) |
| IFM 1D-1 CI Capability Gates | ✅ Complete |

---

## Objective

Implement **MDP-2 Data Dictionary** — unified SSOT for all fields (native, custom, computed), evolving CADCPS (`CadCpsCampo*`) into `mdp_field*`.

---

## Scope (from MDP-0 §4)

### In scope

- Prisma: `mdp_field`, `mdp_field_label`, `mdp_field_option`, `mdp_field_empresa_scope`, `mdp_field_tela`, `mdp_field_audit`
- API: `/api/mdp/fields` CRUD + list (tenant-scoped)
- Seed/migration: `CadCpsCampo*` → MDP-2; native fields from `*Form.constants.js` + Prisma introspection (empresas pilot)
- CADCPS admin UI continues over Data Dictionary API (no parallel storage)
- G118/G137 alignment + governance gates for field SSOT

### Out of scope

- Relationship Dictionary (MDP-3)
- Metadata Registry (MDP-4)
- Publish engine (MDP-5 full)
- Studio UI implementation

---

## Acceptance criteria

- [x] Native + custom fields for `empresas` in `mdp_field`
- [x] `CadCpsCampo` migration path documented and pilot-complete
- [x] Tenant isolation on all field APIs
- [x] `npm run verify:governance` + `verify:ci` pass
- [x] CURRENT-STATE + ENGINEERING-JOURNAL updated

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking CADCPS runtime | Parallel read path until cutover gate |
| Field type drift (18 CADCPS types) | Canonical type enum in MDP-2 schema |
| Foundation imports MDP tables | Compile/export boundary only (I-2) |

---

## Next mission after MDP-2

**IFM 1C-MDP-3** — Relationship Dictionary

---

*Prepared by IFM 1C-MDP-1 mission.*
