# MAK DATA PLATFORM (MDP)

**Status:** Official architectural layer — **specification complete (MDP-0)**  
**Version:** 2.0.0  
**Effective date:** 2026-06-28  
**Decision:** D-012 (layer), D-020 (architecture specification)  
**Program:** IFM Phase 1C  
**Definitive spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) (MDP-0)

---

## Quick Reference

**MAK DATA PLATFORM (MDP)** is the metadata nucleus (L4) — persisted SSOT for entities, fields, relationships, and platform definitions.

MDP is **not** business data. It is the **definition layer**.

| Component | ID | Status |
|-----------|-----|--------|
| Entity Dictionary | MDP-1 | **✅ Implemented** — [certification](./IFM-1C-MDP-1-CERTIFICATION-REPORT.md) |
| Data Dictionary | MDP-2 | Brief ready — [IFM-1C-MDP-2-DATA-DICTIONARY.md](./IFM-1C-MDP-2-DATA-DICTIONARY.md) |
| Data Dictionary | MDP-2 | Spec ✅ — not implemented |
| Relationship Dictionary | MDP-3 | Spec ✅ — not implemented |
| Metadata Registry | MDP-4 | Spec ✅ — not implemented |
| Versioning & Publication | MDP-5 | Spec ✅ — not implemented |

---

## Definition

MDP answers: *What entities exist? What fields do they have? How do they relate? What layouts, rules, and behaviors apply?*

---

## Position in Architecture

```
Program 3: IA · Marketplace · Knowledge · Offline
Program 2: MAK Studio
★ MAK DATA PLATFORM (L4) ★  ← this document
Foundation Runtime (L2) — ModeloBase1 · engines V13–V20
Domain Modules (L1)
Business Data (L0) — PostgreSQL
```

Detail: [MAK-2035-MASTER-ARCHITECTURE.md §L4](../architecture/MAK-2035-MASTER-ARCHITECTURE.md)

---

## Boundary Rules

| Layer | Owns | Does not own |
|-------|------|--------------|
| **MDP** | Definitions, dictionaries, versioned metadata | UI rendering, runtime execution |
| **Foundation** | Runtime engines, boot registries (cache) | Persisted definition SSOT |
| **Modules** | Domain business logic (constants migrating to MDP) | Structural UI |
| **Prisma L0** | Business record instances | Field/entity definitions |

---

## Current Seeds (Code @ 2026-06-28)

| Component | Seed in code | Target |
|-----------|--------------|--------|
| Entity Dictionary | `cadastro-modules.registry.json` (2 modules: empresas, cadcps), `CadCpsTela`, Prisma models | `mdp_entity*` tables |
| Data Dictionary | `CadCpsCampo*` (~45%), module `*Form.constants.js` | `mdp_field*` tables |
| Relationship Dictionary | `relation_entity` hints, Prisma `@relation` implicit | `mdp_relationship*` tables |
| Metadata Registry | Runtime `*ConfigRegistry.js`, `*ModuleMetadata.js` (~30%) | `mdp_registry_entry*` tables |
| Versioning | `versao_schema` in preferences only | `mdp_definition_version*` tables |

---

## Implementation Phases

| Phase | ID | Deliverable | Spec section |
|-------|-----|-------------|--------------|
| 1C.1 | MDP-1 | Entity Dictionary schema + API + registry sync | Spec §3 |
| 1C.2 | MDP-2 | Data Dictionary (CADCPS → all fields) | Spec §4 |
| 1C.3 | MDP-3 | Relationship Dictionary | Spec §5 |
| 1C.4 | MDP-4 | Metadata Registry + introspection + compile | Spec §6 |
| 1C.5 | MDP-5 | Versioning + publish + snapshot | Spec §7 |

**Execution order:** [IFM-PHASE-1-TECHNICAL-ROADMAP.md](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)

---

## API Surface (Conceptual — Not Implemented)

Full API design: [Architecture Spec §9](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md#9-api-architecture-conceptual)

```
/api/mdp/entities · /fields · /relationships · /registry
/api/mdp/introspect · /compile/{moduleId}
/api/mdp/publish · /rollback · /snapshots · /versions
```

All endpoints: `cliente_id` scoped, RBAC enforced, audit logged.

---

## Platform Dependencies

| Platform | MDP dependency |
|----------|----------------|
| **MAK Studio** | Direct — all designers read/write MDP |
| **AI Platform** | Introspection + entity/field/relationship graph |
| **Marketplace** | `.makpkg` = versioned MDP snapshot |
| **Offline** | Definition snapshot sync |
| **i18n** | Label tables in Entity/Data/Relationship/Registry |
| **Multi-tenant** | All dictionaries scoped by `cliente_id` |

---

## Anti-Patterns

- ❌ Studio editing module JS in production
- ❌ Parallel metadata tables outside MDP path
- ❌ Runtime engine registries as SSOT
- ❌ MDP definitions inside frozen Foundation code

Full list: [Architecture Spec §13](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md#13-anti-patterns-forbidden)

---

## Success Criteria (IFM 1C Complete)

1. Entity Dictionary lists all certified modules (`empresas`, `cadcps`)
2. Data Dictionary includes native + custom fields for ≥1 module (pilot: `empresas`)
3. Relationship Dictionary has schema + ≥1 documented relationship
4. Metadata Registry API returns layout/event/action defs for ≥1 module
5. Publish pipeline produces compiled bundle consumed by Foundation boot
6. MAK Studio specifiable against real introspection API (Program 2 gate)

---

*Definitive architecture: [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md)*  
*Strategy review: [IFM-MISSION-1-STRATEGY-REVIEW.md](./IFM-MISSION-1-STRATEGY-REVIEW.md)*  
*Program context: [ROADMAP.md](./ROADMAP.md)*
