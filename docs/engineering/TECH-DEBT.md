# TECH-DEBT — Register

**Status:** Living document  
**Last verified:** 2026-09-08 (P1-02A Typecheck Environment Hygiene)  
**Priority:** P0 (blocker) → P3 (cosmetic)

---

## Active Debt

### TD-001 — Produto table missing migration

| Field | Value |
|-------|-------|
| **Priority** | ~~P0~~ |
| **Area** | Database |
| **Status** | **Resolved / Obsolete** 2026-06-28 — `Produto` and `Marca` models removed (PR #285); module `produtos`/`marcas` deleted |
| **Evidence** | No `model Produto` in `schema.prisma`; migration `20260628120000_remove_marcas_produtos` |

---

### TD-002 — Backend registry out of sync

| Field | Value |
|-------|-------|
| **Priority** | ~~P1~~ |
| **Area** | Governance / registry |
| **Status** | **Resolved** 2026-06-28 — IFM 1A baseline recovery; FE/BE both list empresas + cadcps; G118 validates sync |
| **Evidence** | `config/cadastro-modules.registry.json` and `backend/config/cadastro-modules.registry.json` — 2 modules each |

---

### TD-003 — framework/cadastro legacy layer

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | Architecture |
| **Evidence** | ~61 files, ~11,127 LOC in `src/framework/cadastro/`; **82** imports from codebase |
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
| **Priority** | ~~P1~~ |
| **Area** | Security / supply chain |
| **Status** | **Resolved** 2026-06-28 — IFM 1A-S3 |
| **Evidence** | `npm audit` — 0 vulnerabilities (was 15: 9 high); `package-lock.json` only |
| **Report** | [IFM-1A-S3-CERTIFICATION-REPORT.md](./IFM-1A-S3-CERTIFICATION-REPORT.md) |

---

### TD-009 — Typecheck noise (shadcn) — SUBSET de `src/shared/ui/**`

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Developer experience |
| **Evidence (original, 2026-06)** | `npm run typecheck` errors only in `src/shared/ui/*` |
| **Evidence (medida 2026-09-08, P1-02)** | **REFUTADA como descrição do todo.** Em `14de1110` o typecheck legado emitiu 3745 diagnósticos em 594 arquivos; apenas **316 em 44 arquivos** estavam em `src/shared/ui/**` — 8,4%. Os outros 3429 não pertencem a esta dívida |
| **Escopo corrigido** | TD-009 passa a designar **somente** o subconjunto `src/shared/ui/**`: 316 diagnósticos |
| **Impact** | O ruído em si é cosmético; o dano real foi o wrapper de governança atribuir **qualquer** falha a esta dívida e devolver 0 |
| **Roadmap** | Baseline exata em P1-02B |
| **Status** | Open — escopo corrigido em 2026-09-08 (P1-02A). O restante da dívida é TD-016 |

---

### TD-016 — Global legacy typecheck debt / permissive governance bridge

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | CI / type safety |
| **Discovered** | 2026-09-08 — P1-02 parou com `P1_02_BASELINE_SCOPE_DRIFT` ao medir a premissa de TD-009 |
| **Evidence (pós-higiene, P1-02A)** | `npm run typecheck` (escopo de produção, `jsconfig.typecheck.json`): **2365 diagnósticos em 477 arquivos**. Inventário completo `npm run typecheck:legacy-all`: 3745 em 594 |
| **Áreas** | framework 488 · shared 402 (dos quais 316 são TD-009) · studio 393 · runtime 345 · bos 270 · intelligence 163 · modules 110 · ModeloBase1 82 · ModeloBase2 74 · apis 28 · App.jsx 4 · main.jsx 4 · integrations 2 |
| **Códigos dominantes** | TS2339 1308 · TS2322 499 · TS2741 110 · TS2345 98 · TS2353 66 |
| **Finding específico** | 8 diagnósticos de builtins Node permanecem em **7 arquivos de produção** (`src/runtime/core/{completion,context,crb,session,workflow}`, `src/studio/governance/{architectureRules,dependencyGraph}`). Deliberadamente NÃO ocultados |
| **Impact** | `typecheck:governance` é uma ponte permissiva: roda o escopo de produção e ainda devolve 0. Um diagnóstico **novo** não reprova o CI |
| **Owner / remediation** | **P1-02B** — baseline exata + comparação fail-closed. Nenhuma baseline foi criada em P1-02A |
| **Status** | Open |

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

### TD-013 — V13–V20 capability gates not in CI

| Field | Value |
|-------|-------|
| **Priority** | ~~P1~~ |
| **Area** | Governance / CI |
| **Status** | **Resolved** 2026-06-28 — IFM 1D-1 |
| **Evidence** | `.github/workflows/foundation-governance.yml` — parallel matrix for G156–G261; `gate:capabilities` + extended `verify:governance` |
| **Report** | [IFM-1D-1-CERTIFICATION-REPORT.md](./IFM-1D-1-CERTIFICATION-REPORT.md) |

---

### TD-014 — Constitution doc headers inconsistent

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Documentation |
| **Evidence** | Docs 01–10 said "of 10" after doc 11 added — corrected in Mission 0.2 |
| **Impact** | Navigation confusion |
| **Roadmap** | — |
| **Status** | **Resolved** 2026-06-28 (Mission 0.2) |

---

### TD-015 — Subordinate docs may drift from code

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Documentation |
| **Evidence** | `docs/FOUNDATION_GOVERNANCE.md` and `/docs/ENTERPRISE_*` reports are subordinate to Constitution but not auto-synced |
| **Impact** | Risk of stale guidance if read without Constitution |
| **Roadmap** | — |
| **Status** | Open — Constitution §7 declares them historical/subordinate |

---

## Resolved Debt

### TD-014 — Constitution doc headers inconsistent

Resolved 2026-06-28 — Mission 0.2 updated headers to "of 11".

---

## Register Protocol

1. New debt: add TD-0XX with evidence from code (not chat).
2. Resolved: move to Resolved section with date + PR reference.
3. Update CURRENT-STATE known inconsistencies when P0/P1 changes.

---

*Review at sprint start. Do not fix silently — track here first.*
