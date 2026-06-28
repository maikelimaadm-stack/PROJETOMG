# TECH-DEBT — Register

**Status:** Living document  
**Last verified:** 2026-06-28  
**Priority:** P0 (blocker) → P3 (cosmetic)

---

## Active Debt

### TD-001 — Produto table missing migration

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Area** | Database |
| **Evidence** | `Produto` model in `backend/prisma/schema.prisma` L445–463; zero matches in `backend/prisma/migrations/**/*.sql` |
| **Impact** | Fresh DB deploy fails for produtos module |
| **Roadmap** | S1 |
| **Status** | Open |

---

### TD-002 — Backend registry out of sync

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | Governance / registry |
| **Evidence** | `backend/config/cadastro-modules.registry.json` — 1 module; `config/cadastro-modules.registry.json` — 4 modules |
| **Impact** | Backend tooling/bootstrap may miss marcas, produtos, cadcps |
| **Roadmap** | S2 |
| **Status** | Open |

---

### TD-003 — framework/cadastro legacy layer

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | Architecture |
| **Evidence** | ~61 files, ~11,100 LOC in `src/framework/cadastro/`; 50+ imports from codebase |
| **Impact** | Blocks Low-Code abstraction; dual maintenance with cadastro-engine |
| **Roadmap** | A1 |
| **Status** | Open — promotion in progress |

---

### TD-004 — Empresas nomenclature in generic layer

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | ModeloBase1 / SSOT |
| **Evidence** | Props `empresas`, `isLoadingEmpresas` in `ModeloBase1CadastroPage.jsx`; CSS `mg-empresas-scope`; 44 files in framework/mak reference emp/Empresas |
| **Impact** | Cosmetic + cognitive coupling; confuses new module authors |
| **Roadmap** | A2 |
| **Status** | Open — documented exception in Constitution |

---

### TD-005 — Dual-path DDL deployment

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Database / DevOps |
| **Evidence** | `backend/scripts/ensureSchema.js` + `runBlockingDatabaseBoot.js` alongside Prisma migrate |
| **Impact** | Schema drift risk between environments |
| **Roadmap** | S4 |
| **Status** | Open |

---

### TD-006 — UI monoliths

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Frontend maintainability |
| **Evidence** | `MakCadastroTable.jsx` ~2,407 LOC; `ModeloBase1CadastroPage.jsx` ~1,518 LOC |
| **Impact** | Hard to test/decompose; performance risk on change |
| **Roadmap** | A3 |
| **Status** | Open |

---

### TD-007 — Dual design system CSS

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Frontend / UX |
| **Evidence** | shadcn (`shared/ui`) + MG prototype CSS ~281KB + ERP theme ~368KB |
| **Impact** | Bundle size; visual inconsistency risk |
| **Roadmap** | A4 (partial) |
| **Status** | Open |

---

### TD-008 — Frontend npm vulnerabilities

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | Security / supply chain |
| **Evidence** | `npm audit` — 15 vulnerabilities (1 low, 5 moderate, 9 high) as of 2026-06-28 |
| **Impact** | Supply chain risk |
| **Roadmap** | S3 |
| **Status** | Open |

---

### TD-009 — Typecheck noise (shadcn)

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Developer experience |
| **Evidence** | `npm run typecheck` errors only in `src/shared/ui/*` |
| **Impact** | Masks real type errors if introduced elsewhere |
| **Roadmap** | — |
| **Status** | Open — known per AGENTS.md |

---

### TD-010 — No backend domain event bus

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Architecture / future Automation |
| **Evidence** | Events/Workflow engines client-side only |
| **Impact** | Blocks server-side automation, Audit hooks, IA actions |
| **Roadmap** | A5 |
| **Status** | Open — by design until Automation mission |

---

### TD-011 — Deprecated aliases and shims

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Code clarity |
| **Evidence** | 25+ `@deprecated` exports; Empresas* panel aliases; allowlisted legacy hooks |
| **Impact** | Confusion for new contributors |
| **Roadmap** | A4 |
| **Status** | Open |

---

### TD-012 — CADCPS flat backend file structure

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Backend consistency |
| **Evidence** | `repCps.js` / `svcCps.js` vs standard `repositories/` subfolder |
| **Impact** | Naming inconsistency only |
| **Roadmap** | — |
| **Status** | Open |

---

## Resolved Debt

_None recorded yet._

---

## Register Protocol

1. New debt: add TD-0XX with evidence from code (not chat).
2. Resolved: move to Resolved section with date + PR reference.
3. Update CURRENT-STATE known inconsistencies when P0/P1 changes.

---

*Review at sprint start. Do not fix silently — track here first.*
