# ROADMAP — MAK Gestão Platform

**Status:** Living document  
**Last updated:** 2026-06-28 (IFM Phase 1 Replanning — official technical roadmap)
**Horizon:** Technical roadmap aligned with [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md)

---

## Guiding Principle

Priority order for all work:

1. **Estabilidade**
2. **Arquitetura**
3. **Correções**
4. **Preparação da Plataforma**
5. **MAK Studio**
6. **Novos módulos**

---

## Phase 0 — Sistema Operacional ✅ Complete

| Item | Status |
|------|--------|
| Constitution (`docs/constitution/`) | ✅ v1.0.0 (11 docs) |
| Permanent Governance Directive (doc 11) | ✅ |
| README_AI.md | ✅ |
| Engineering docs (`docs/engineering/`) | ✅ Certified Mission 0.2 |
| Documentation certification | ✅ `DOCUMENTATION-CERTIFICATION.md` |
| **Master Architecture** | ✅ `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` v1.0.0 (D-014) |
| **Platform Language Standard** | ✅ `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` v1.0.0 (D-015) |
| **Platform Maturity Index** | ✅ `docs/engineering/PLATFORM-MATURITY-INDEX.md` v1.1.0 (D-016, D-017) |
| **Platform Implementation Protocol** | ✅ `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` v1.1.0 (D-018, D-019) |

**Phase 0 (Programs 0–0.7) — structural OS + protocol: ✅ Complete.**  
**Implementation era begins** — all missions follow [PIP](./PLATFORM-IMPLEMENTATION-PROTOCOL.md) + [RHP](./PLATFORM-IMPLEMENTATION-PROTOCOL.md#10-repository-health-protocol-rhp).

---

## Official Next Program — Programa 1 (IFM)

**Programa 1 — Integridade e Fundação de Metadados (IFM)**

Strategic decisions **D-011**, **D-012**, **D-013**: IFM precedes MAK Studio. Phase 1C is explicitly **MAK DATA PLATFORM (MDP)** — the metadata nucleus.

| Sub-phase | Roadmap refs | Goal |
|-----------|--------------|------|
| **1A Estabilidade** | S3–S4 | Supply chain, DDL predictability |
| **1B Arquitetura** | A1–A5 | Legacy promotion, generic naming, event bus |
| **1C MAK DATA PLATFORM** | MDP-1→5 | Entity · Data · Relationship Dictionaries + Metadata Registry |
| **1D Governança CI** | 1D-1 | V13–V20 gates in CI |

**MAK Studio = Program 2** — starts after IFM 1C (MDP-4 minimum).  
**Spec:** [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)  
**Execution roadmap (authoritative):** [IFM-PHASE-1-TECHNICAL-ROADMAP.md](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)

---

## Phase 1D — Governança CI (IFM)

| ID | Item | Priority | Blocks |
|----|------|----------|--------|
| **1D-1** | V13–V20 gates in CI | **P1 — mission #2** | TD-013; protects MDP work |

*Full mission sequence: [IFM-PHASE-1-TECHNICAL-ROADMAP.md § Part 2](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)*

---

## Phase 1 — Estabilidade (IFM Phase 1A)

| ID | Item | Priority | Status |
|----|------|----------|--------|
| S2 | Sync backend `cadastro-modules.registry.json` | ~~P1~~ | ✅ Baseline recovery 2026-06-28 |
| **S3** | npm audit fix (frontend) | **P1 — next** | [Brief](./IFM-1A-S3-SUPPLY-CHAIN-HARDENING.md) |
| S4 | Consolidate DDL path (Prisma-only primary) | P2 | After MDP-1 |

**Removed:** S1 Produto migration (obsolete — PR #285).

---

## Phase 2 — Arquitetura (IFM Phase 1B)

| ID | Item | Priority |
|----|------|----------|
| A1 | Deprecate `framework/cadastro/` via promotion | P1 |
| A2 | Decouple Empresas nomenclature in ModeloBase1 | P1 |
| A3 | Decompose `MakCadastroTable.jsx` (~2.4K LOC) | P2 |
| A4 | Remove deprecated aliases (Empresas*) | P3 |
| A5 | Backend domain event bus (Events/Workflow prep) | P2 |

---

## Phase 3 — MAK DATA PLATFORM (IFM Phase 1C)

| ID | Item | Priority | MDP ref |
|----|------|----------|---------|
| MDP-1 | Entity Dictionary — schema + API + registry sync | P1 | §3.1 |
| MDP-2 | Data Dictionary — evolve CADCPS to all fields | P1 | §3.2 |
| MDP-3 | Relationship Dictionary — schema + API | P1 | §3.3 |
| MDP-4 | Metadata Registry + introspection API | P1 | §3.4 |
| MDP-5 | Definition versioning + publish pipeline | P2 | §4 |
| ~~P4~~ | ~~Unified registry sync~~ | — | **Absorbed into MDP-1** |

Full specification: [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)

---

## Phase 4 — MAK Studio (Program 2 — Future)

Prerequisite: **IFM 1C complete** (MDP-4 minimum — Metadata Registry + introspection API). **No parallel UI framework.**

| Studio | Prerequisite | Status |
|--------|--------------|--------|
| Layout Studio | Layout Config Engine V13 + introspection API | Not started |
| Field Studio | Field Config Engine V14 | Not started |
| Table Studio | Preferences + column metadata | Not started |
| Formula/Validation Studio | V16–V17 engines | Not started |
| Workflow/Automation Studio | V18–V20 + backend events | Not started |
| Permission Studio | RBAC model externalized | Not started |
| Deploy pipeline | Generator + versioning | Not started |

---

## Phase 5 — Novos Módulos

After **MDP-4** (Metadata Registry + introspection API):

- All new cadastro modules via `npm run generate:module`
- Follow `empresas` reference factory or `cadcps` domain-runtime exception pattern
- Complex runtime only with formal exception (cadcps model)

**Removed:** marcas/produtos minimal factory (modules deleted PR #285).

---

## Phase 6 — Future Platforms (Not Scheduled)

| Platform | Dependency |
|----------|------------|
| Marketplace | MDP definition bundles + versioning + sandbox |
| Knowledge Platform | MDP entity links + independent content layer |
| AI Platform | MDP introspection API + RBAC boundaries |
| Offline / Sync | MDP definition snapshots + outbox (future) |

---

## Anti-Roadmap (Will Not Do)

- Rewrite Foundation without Amendment Process
- Imperative cadastro pages per module
- Parallel config engines outside V13–V20 pattern
- MAK Studio as separate UI stack

---

*Update when priorities shift. Cross-reference [NEXT-SPRINT.md](./NEXT-SPRINT.md) for active work.*
