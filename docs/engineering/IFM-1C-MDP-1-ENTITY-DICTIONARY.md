# IFM 1C-MDP-1 — Entity Dictionary Implementation

**Mission ID:** IFM 1C-MDP-1 (MDP-1)  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Priority:** P1  
**Status:** **Prepared — ready to execute**  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §3

---

## Prerequisites (must complete first)

| Mission | Status |
|---------|--------|
| IFM 1A-S3 — Frontend supply chain hardening | ✅ Complete |
| IFM 1D-1 — V13–V20 gates in CI | ✅ Complete |
| MDP-0 — Architecture specification | ✅ Complete (D-020) |

---

## Objective

Implement **MDP-1 Entity Dictionary** — persisted SSOT for platform entities, replacing `config/cadastro-modules.registry.json` as authoritative source.

---

## Scope (from MDP-0 §3)

### In scope

- Prisma models: `mdp_entity`, `mdp_entity_label`, `mdp_entity_capability`, `mdp_entity_route`, `mdp_entity_audit`
- Backend API: `/api/mdp/entities` CRUD + list (tenant-scoped)
- Seed migration: `empresas` + `cadcps` from current registry + `CadCpsTela` + Prisma introspection
- Generator update: read Entity Dictionary API (or exported JSON cache) instead of file-only registry
- G118 gate validation against MDP entity count
- Tests: API integration + governance gates

### Out of scope

- Data Dictionary (MDP-2)
- Relationship Dictionary (MDP-3)
- Metadata Registry (MDP-4)
- Publish/versioning (MDP-5) — entities created as `published` v1 simplification OR draft-only until MDP-5

---

## Acceptance criteria

- [ ] `empresas` and `cadcps` exist in `mdp_entity` with correct `entityId`, `moduleId`, persistence bindings
- [ ] `cliente_id` tenant isolation enforced on all API endpoints
- [ ] Platform-scoped builtins (`scope: platform`) seeded; tenant extensions creatable
- [ ] `config/cadastro-modules.registry.json` generated from MDP export (or deprecated with compile step)
- [ ] `npm run verify:governance` pass
- [ ] CURRENT-STATE, ENGINEERING-JOURNAL, TECH-DEBT updated

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking generator/registry flow | Parallel run: file registry + MDP until cutover gate passes |
| CADCPS `CadCpsTela` overlap | Map to `mdp_entity_route` — do not duplicate entity rows |
| Foundation imports MDP tables | **Forbidden** — API/compile export only (MDP-0 I-2) |

---

## Effort

**L (large)** — schema + API + seed + generator integration + tests

---

## Next mission after MDP-1

**IFM 1C-MDP-2** — Data Dictionary (CADCPS evolution)

---

*Prepared by MDP-0 mission. Execute under [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md).*
