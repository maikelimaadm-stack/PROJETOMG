# ROADMAP — MAK Gestão Platform

**Status:** Living document  
**Last updated:** 2026-06-29 (Platform Architecture Reassessment — D-027)
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

## Official Next Program — Program 2 (MAK Studio) + Program 1E (parallel)

**Programa 1 — Integridade e Fundação de Metadados (IFM) — ✅ Complete (IFM 1C)**

Strategic decisions **D-011**, **D-012**, **D-013**, **D-026**, **D-027**: IFM 1C (MDP) complete. **MAK Studio = Program 2** is the official next priority.

| Sub-phase | Roadmap refs | Goal | Status |
|-----------|--------------|------|--------|
| **1A Estabilidade** | S3–S4 | Supply chain, DDL predictability | S3 ✅; S4 pending |
| **1B Arquitetura** | A1–A5 | Legacy promotion, generic naming, event bus | Background — non-blocking Studio |
| **1C MAK DATA PLATFORM** | MDP-0→5 | Metadata nucleus | **✅ Complete** |
| **1D Governança CI** | 1D-1 | V13–V20 gates in CI | ✅ |
| **1E Runtime Bridge** | 1E-1 | CRB hydration → Foundation registries | **P1 parallel** — [Brief](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md) |

**Program 2 — MAK Studio** — [Brief](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md)  
**Reassessment:** [IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md](./IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md) (D-027)

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
| **S3** | npm audit fix (frontend) | ~~P1~~ | ✅ IFM 1A-S3 — [Report](./IFM-1A-S3-CERTIFICATION-REPORT.md) |
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

| Phase | ID | Deliverable | Spec |
|-------|-----|-------------|------|
| 1C.0 | **MDP-0** | Architecture specification | ✅ [Architecture Spec](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) |
| 1C.1 | MDP-1 | Entity Dictionary — schema + API + registry sync | ✅ Spec §3 |
| 1C.2 | MDP-2 | Data Dictionary — evolve CADCPS to all fields | ✅ Spec §4 |
| 1C.3 | MDP-3 | Relationship Dictionary — schema + API | ✅ Spec §5 |
| 1C.4 | MDP-4 | Metadata Registry + introspection + compile API | ✅ Spec §6 |
| 1C.4.5 | MDP-4.5 | Final architecture review + freeze | ✅ [Report](./IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md) |
| 1C.5 | MDP-5 | Versioning + publish + snapshot engine | ✅ [Report](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md) |

Definitive spec: [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md)  
Engineering summary: [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)

---

## Phase 4 — MAK Studio (Program 2 — **Official Next**)

Prerequisite: **IFM 1C complete** ✅ (MDP-5 exceeds MDP-4 minimum). **No parallel UI framework.**

Parallel co-requisite: **Program 1E Runtime Bridge** — CRB hydration for preview=production parity.

| Studio | Prerequisite | Status |
|--------|--------------|--------|
| Layout Studio | V13 + introspect + compile API | **Next — Phase 2.1** |
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

## Phase 1E — Runtime Bridge (Parallel — D-027)

| ID | Item | Priority | Blocks Studio? |
|----|------|----------|----------------|
| **1E-1** | CRB hydration → Foundation registries (empresas pilot) | **P1** | Co-requisite for publish→live |
| **1E-2** | Environment pin → runtime reload hook | P1 | Co-requisite |

**Does NOT include:** Event Bus, Scheduler, Job Queue, Notification Engine, Integration Platform, Migration Platform — deferred per D-027.

Brief: [IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md)

---

## Phase 6 — Future Platforms (Programs 3–6)

| Platform | Dependency | Precedes Studio? |
|----------|------------|------------------|
| Marketplace | MDP bundles + versioning ✅ | **No** — Program 3 |
| Knowledge Platform | MDP entity links | **No** — Program 5 |
| AI Platform | MDP introspect ✅ + Event Bus (A5) | **No** — Program 4 |
| Offline / Sync | MDP snapshots ✅ + Sync Platform | **No** — Program 6 |
| Integration Platform | Public API + Marketplace | **No** |
| Migration Platform | MDP versioning ✅ + tenant tooling | **No** |
| Platform Event Bus (A5) | MDP-4 ✅ | **No** — after Studio Layout MVP |

---

## Anti-Roadmap (Will Not Do)

- Rewrite Foundation without Amendment Process
- Imperative cadastro pages per module
- Parallel config engines outside V13–V20 pattern
- MAK Studio as separate UI stack

---

*Update when priorities shift. Cross-reference [NEXT-SPRINT.md](./NEXT-SPRINT.md) for active work.*
