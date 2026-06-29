# IFM 1C-MDP-5 — Versioning & Publication Implementation Brief

**Mission ID:** IFM 1C-MDP-5 (MDP-5)  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Priority:** P1  
**Status:** ✅ Complete — [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md)  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §7

---

## Prerequisites

| Mission | Status |
|---------|--------|
| MDP-1 Entity Dictionary | ✅ Complete — **frozen** |
| MDP-2 Data Dictionary | ✅ Complete — **frozen** |
| MDP-3 Relationship Dictionary | ✅ Complete — **frozen** |
| MDP-4 Metadata Registry | ✅ Complete — **frozen** |
| MDP-4.5 Architecture Review | ✅ Complete — [D-025](./DECISIONS.md) |
| MDP-0 Architecture Specification | ✅ Complete (D-020) |
| IFM 1D-1 CI Capability Gates | ✅ Complete |

---

## Objective

Implement **MDP-5 Versioning, Publication & Snapshot Engine** — govern lifecycle of all MDP definitions: draft → published, compile-on-publish, rollback, snapshot export (`.makpkg`), and environment pinning.

---

## Scope (from MDP-0 §7)

### In scope

- Draft → review → published state machine (extend existing `status` on all MDP tables)
- Compile-on-publish → immutable `MdpCompiledBundle` artifact
- Rollback to prior published revision
- Snapshot export for Offline, Marketplace, environment promotion
- Pin `definitionVersion` per tenant/environment
- Governance gate G141 (compile bundle alignment)
- Hydrate Foundation runtime `*ConfigRegistry.js` from compiled bundle (Empresas pilot cutover)

### Out of scope

- Studio UI (Program 2)
- Application code deployment (Platform Core deploy pipeline)
- AI agent runtime
- Marketplace storefront

---

## Acceptance criteria

- [x] Publish API transitions registry entries draft → published with revision counter
- [x] Compile produces bundle consumed by ModeloBase1 without direct MDP DB reads at runtime
- [x] Rollback restores prior published revision
- [x] Snapshot export includes entity + field + relationship + registry entries for one module
- [x] `npm run verify:governance` + `verify:ci` pass (G142)
- [x] CURRENT-STATE + ENGINEERING-JOURNAL updated

---

## Key dependencies on MDP-4

| MDP-4 artifact | MDP-5 use |
|----------------|-----------|
| `mdp_registry_entry.content_hash` | Compile cache invalidation |
| `mdp_registry_entry.status` | Publish state machine entry point |
| `mdp_registry_schema` | Bundle schema validation |
| `/api/mdp/registry/introspect` | Studio/AI read contract (unchanged) |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking Empresas runtime | Parallel read; feature flag cutover gate |
| Bundle size | Module-scoped compile; lazy engine hydration |
| Tenant overlay merge | Overlay rules defined in spec §7.4 |

---

## Next mission after MDP-5

**IFM Phase 1C complete** → unlock **Program 2 MAK Studio** (Layout Studio first)

---

*Prepared by IFM 1C-MDP-4 mission.*
