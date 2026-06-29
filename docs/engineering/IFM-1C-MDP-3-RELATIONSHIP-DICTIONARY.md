# IFM 1C-MDP-3 — Relationship Dictionary Implementation Brief

**Mission ID:** IFM 1C-MDP-3 (MDP-3)  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Priority:** P1  
**Status:** Complete — [certification report](./IFM-1C-MDP-3-CERTIFICATION-REPORT.md)  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §5

---

## Prerequisites

| Mission | Status |
|---------|--------|
| MDP-1 Entity Dictionary | ✅ Complete |
| MDP-2 Data Dictionary | ✅ Complete |
| MDP-0 Architecture Specification | ✅ Complete (D-020) |
| IFM 1D-1 CI Capability Gates | ✅ Complete |

---

## Objective

Implement **MDP-3 Relationship Dictionary** — explicit catalog of all relationships between entities (cardinality, FK mapping, cascade rules, inheritance).

---

## Scope (from MDP-0 §5)

### In scope

- Prisma: `mdp_relationship`, `mdp_relationship_label`, `mdp_relationship_field_binding`, `mdp_relationship_audit`
- API: `/api/mdp/relationships` CRUD + list (tenant-scoped)
- Seed/migration: Prisma schema relation introspection + `CadCpsCampo.relation_entity` / `mdp_field.relationship_ref` hints
- Governance gate G139 (relationship export alignment)

### Out of scope

- Metadata Registry (MDP-4)
- Publish engine (MDP-5 full)
- Prisma migration generation from relationships (informative only in v1)
- Studio UI implementation

---

## Acceptance criteria

- [x] Prisma relations for `EmpresaCadastro` pilot documented in `mdp_relationship`
- [x] Field-level `relationship_ref` on `mdp_field` resolves to relationship rows
- [x] Tenant isolation on all relationship APIs
- [x] `npm run verify:governance` + `verify:ci` pass
- [x] CURRENT-STATE + ENGINEERING-JOURNAL updated

---

## Risks

| Risk | Mitigation |
|------|------------|
| Drift vs Prisma L0 FK graph | Introspection seed from `schema.prisma` as SSOT bootstrap |
| CADCPS relation hints incomplete | Migrate `mdp_field.relation_entity` → relationship bindings |
| Circular dependency entity↔field | MDP-3 references entities (MDP-1) and fields (MDP-2) by stable ID only |

---

## Next mission after MDP-3

**IFM 1C-MDP-4** — Metadata Registry

---

*Prepared by IFM 1C-MDP-2 mission.*
