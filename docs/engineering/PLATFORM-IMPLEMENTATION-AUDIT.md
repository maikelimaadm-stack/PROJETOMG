# Platform Implementation Audit

**Mission:** Program 3.8.6 — Audit 2  
**Evidence:** Codebase scan 2026-06-30 · Gates G262–G306 · `docs/engineering/CURRENT-STATE.md`

---

## Per-module matrix

Legend: **E**=Exists · **P**=Partial · **C**=Complete · **D**=Duplicated · **O**=Obsolete · **N**=Never used · **X**=Contradictory

| Module | E | Impl status | Dup | Legacy | Arch w/o impl | Impl w/o arch | Bypass | Violation |
|--------|---|-------------|-----|--------|---------------|---------------|--------|-----------|
| **Foundation** `framework/mak` | ✅ | **C** frozen | — | cadastro 61 files | — | — | — | — |
| **cadastro-engine** | ✅ | **C** | Facade→campoEngine | campoEngine core | — | — | — | — |
| **framework/cadastro** | ✅ | **P** transitional | vs cadastro-engine | **Yes** TD-003 | — | — | — | Foundation promotion incomplete |
| **Runtime Bridge** | ✅ | **P** | — | boot cache fallback | cadcps CRB | — | — | — |
| **CRB** | ✅ | **P** | — | — | multi-module | — | — | empresas-only pilot |
| **campoEngine** | ✅ | **C** active | vs runMakFormula | **Yes** | — | — | — | Vision: business calc |
| **runMakFormulaEvaluation** | ✅ | **C** V17 | vs Studio stack | calls campoEngine | — | — | — | EPDA-P0-02 |
| **Studio SDK/DS/Events** | ✅ | **C** G262–278 | — | — | — | — | — | — |
| **Studio Governance** | ✅ | **C** G279–284 | — | — | — | — | — | — |
| **Expression G298** | ✅ | **C** | — | — | — | — | — | — |
| **Dependency G299** | ✅ | **C** | 4 namesakes docs | — | — | — | — | AD-P1-09 |
| **Type System G300** | ✅ | **C** | — | — | — | — | — | — |
| **Evaluation G301** | ✅ | **C** | — | — | — | — | — | — |
| **Computation G302** | ✅ | **P** | vs Foundation | — | optimizer stub | — | — | — |
| **Formula Builder G303A** | ✅ | **C** | vs Business Asset path | — | AI/NL ext | — | **Yes** direct edit | EPDA-P0-01 |
| **Intent Resolver G305** | ✅ | **P** | — | — | 8 ext kinds | — | Gate: no designer | — |
| **Business Computed G306** | ✅ | **P** | — | — | 9 ext points | — | Gate enforced | — |
| **Field Studio G296** | ✅ | **C** | — | — | — | creates field docs not Intent | — | BA-P1-02 |
| **Layout Studio G291** | ✅ | **C** | — | — | — | — | — | — |
| **MDP backend** | ✅ | **C** frozen | — | — | — | — | Studio official clients | — |
| **empresas module** | ✅ | **C** | — | ModeloBase1 | — | — | — | Module-centric not Intent |
| **Marketplace** | ⚠️ | **N** code | — | — | **Yes** L6 | flags only | — | — |
| **Knowledge** | ❌ | **N** | — | — | **Yes** D-057 | — | — | — |
| **Enterprise Memory** | ❌ | **N** | — | — | **Yes** D-060 | — | — | — |
| **Business DNA** | ❌ | **N** | — | — | **Yes** | — | — | — |
| **Process Mining** | ❌ | **N** | — | — | **Yes** hooks | — | — | — |
| **Decision Engine** | ❌ | **N** | — | — | **Yes** | ext point | — | — |
| **Consulting Engine** | ❌ | **N** | — | — | **Yes** | — | — | — |
| **Evolution Engine** | ❌ | **N** | — | — | **Yes** | metadata hooks | — | — |
| **Business Health** | ❌ | **N** | — | — | **Yes** | — | — | — |
| **Digital Twin** | ❌ | **N** | — | — | **Yes** D-057 | — | — | — |
| **AI Platform** | ❌ | **N** | — | — | **Yes** | — | — | — |

---

## Dead / orphan code (evidence)

| Path | Status | Evidence |
|------|--------|----------|
| `src/modules/makBootstrap/registerMakFormulaConfigEngine.js` (+6 siblings) | **Orphan in runtime** | Not imported in `src/`; used by gate scripts only |
| `framework/cadastro/` 61 files | **Legacy transitional** | TD-003; 62 files still import |
| `*cert` modules | **Certification-only** | Not production user paths |

---

## Circular dependencies

| Check | Result | Evidence |
|-------|--------|----------|
| Studio dependency graph G284 | **Pass** | `gate-studio-architecture-governance.mjs` (post-3.8 fix for typeSystem/business path) |
| Foundation imports Studio | **Forbidden** | G279 designer isolation |

---

## Violation summary by layer

| Layer | Violation | Severity | ID |
|-------|-----------|----------|-----|
| Business Layer | UX bypasses Intent for fields/formulas | P0 | EPDA-P0-01 |
| Business Assets | Only 1 asset type implemented | P0 | EPDA-P0-03 |
| Resolver | OK in code; bypass in UX | P1 | BA-P1-02 |
| Runtime | 3 eval paths | P0 | EPDA-P0-02 |
| Studio | Correct engines; wrong user paradigm | P1 | PC-P1-01 |
| Vision | Intelligence 0% | P0 | EPDA-P0-05 |

---

*See [ARCHITECTURE-CONFORMANCE-REPORT.md](./ARCHITECTURE-CONFORMANCE-REPORT.md) for cross-layer matrix.*
