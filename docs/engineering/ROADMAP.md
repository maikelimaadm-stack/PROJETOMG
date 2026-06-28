# ROADMAP — MAK Gestão Platform

**Status:** Living document  
**Last updated:** 2026-06-28 (Mission 0.2 certification)  
**Horizon:** Technical roadmap based on verified platform state (not legacy planning docs)

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

---

## Official Next Program — Programa 1 (IFM)

**Programa 1 — Integridade e Fundação de Metadados (IFM)**

Strategic decision **D-011**: IFM precedes MAK Studio because P0 schema gaps, registry desync, legacy layer, and missing entity catalog/introspection API would cause Studio to build parallel implementations.

| Sub-phase | Roadmap refs | Goal |
|-----------|--------------|------|
| **1A Estabilidade** | S1–S4 | Reliable deploys, registry SSOT |
| **1B Arquitetura** | A1–A2 | Legacy promotion, generic naming |
| **1C Metadata Foundation** | P1–P2 | Entity catalog + introspection API |
| **1D Governance** | TD-013 | V13–V20 gates in CI |

**MAK Studio = Program 2** — starts after IFM 1C.

---

## Phase 1 — Estabilidade (IFM Phase 1A — Current Priority)

| ID | Item | Priority | Blocks |
|----|------|----------|--------|
| S1 | Migration SQL for `Produto` table | P0 | produtos module in fresh DB |
| S2 | Sync backend `cadastro-modules.registry.json` | P1 | Registry SSOT |
| S3 | npm audit fix (frontend) | P1 | Supply chain |
| S4 | Consolidate DDL path (Prisma-only primary) | P2 | Deploy predictability |

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

## Phase 3 — Preparação da Plataforma (IFM Phase 1C)

| ID | Item | Priority |
|----|------|----------|
| P1 | Entity catalog schema (full Data Dictionary) | P1 |
| P2 | Metadata introspection API for future Studio | P1 |
| P3 | Module definition versioning | P2 |
| P4 | Unified registry sync (FE/BE/bootstrap) | P1 |

---

## Phase 4 — MAK Studio (Program 2 — Future)

Prerequisite: **Program 1 (IFM) complete** through Phase 1C. **No parallel UI framework.**

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

After Phase 1 (S1–S2) complete:

- All new cadastro modules via `npm run generate:module`
- Follow marcas/produtos minimal factory pattern
- Complex runtime only with formal exception (cadcps model)

---

## Phase 6 — Future Platforms (Not Scheduled)

| Platform | Dependency |
|----------|------------|
| Marketplace | Module versioning + sandbox + `ClienteModulo` evolution |
| Knowledge Platform | Independent content layer |
| AI Platform | API boundaries + RBAC; no shadow integrations |
| Offline / Sync | Outbox/replication design — not started |

---

## Anti-Roadmap (Will Not Do)

- Rewrite Foundation without Amendment Process
- Imperative cadastro pages per module
- Parallel config engines outside V13–V20 pattern
- MAK Studio as separate UI stack

---

*Update when priorities shift. Cross-reference [NEXT-SPRINT.md](./NEXT-SPRINT.md) for active work.*
