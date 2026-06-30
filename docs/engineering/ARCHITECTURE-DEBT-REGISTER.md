# Architecture Debt Register

**Status:** Official — Living register (discovery from Program 3.5B)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5B — Enterprise Architecture Consolidation Audit  
**Decision:** D-061  
**Parent:** [ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md](./ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md)

> **Rule:** Items here are **documented only**. Remediation occurs in **dedicated missions** — not in this audit.

---

## Severity legend

| Level | Meaning |
|-------|---------|
| **P0 — Critical** | Blocks decade-scale evolution or next implementation without rework |
| **P1 — High** | Significant inconsistency; remediate before broad implementation |
| **P2 — Medium** | Document or align; can parallelize with implementation |
| **P3 — Low** | Hygiene; schedule when convenient |

---

## P0 — Critical

| ID | Category | Description | Evidence | Remediation mission (proposed) |
|----|----------|-------------|----------|------------------------------|
| AD-P0-01 | Runtime | **Dual formula evaluation** — Foundation `campoEngine.jsx` + `runMakFormulaEvaluation.js` parallel to Studio Computation/Expression/Evaluation | `src/framework/cadastro/fields/campoEngine.jsx`, `src/framework/mak/formula/` | Runtime Formula Unification |
| AD-P0-02 | Runtime | **Studio preview vs production semantic split** for computed fields | CRB V17 hydration vs legacy campoEngine path | Same as AD-P0-01 |
| AD-P0-03 | Governance | **G304 gate ID collision** — deploy (`gate-railway-docker.mjs`) vs planned Intent Resolver gate (D-059) | `scripts/gate-railway-docker.mjs`, `MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md` §10 | Gate Registry Consolidation |
| AD-P0-04 | Documentation | **ROADMAP vs PROJECT-STATUS** — next mission 2.3.6 vs Program 3.5 Resolver | `ROADMAP.md` L153 vs `PROJECT-STATUS.md` | Documentation SSOT Sync |
| AD-P0-05 | Documentation | **Program 3.5A (D-060) approved but not on `main`** — intelligence vision docs missing from canonical branch | Branch `cursor/enterprise-intelligence-vision-0b52` | **✅ Resolved** — merged to `main` via PR #346 (2026-06-30) |

---

## P1 — High

| ID | Category | Description | Evidence | Remediation mission (proposed) |
|----|----------|-------------|----------|------------------------------|
| AD-P1-01 | Governance | **G303 namespace overlap** — deploy bootstrap vs Studio G303A/B family | `gate-backend-bootstrap.mjs`, D-059 G304 plan | Gate Registry Consolidation |
| AD-P1-02 | Governance | **No gate coverage** for Foundation parallel formula evaluators | G298/G302 scope = `src/studio/` only | Foundation Formula Gate |
| AD-P1-03 | Decisions | **Superseded decisions not recorded** — D-058→D-059 sequencing, D-056 "3.3 Computed Fields" | `DECISIONS.md` Superseded section empty | Decision Register Cleanup |
| AD-P1-04 | Decisions | **Computed Fields authorization chain** — D-056 → D-058 → D-059 conflict on timing | D-056, D-058, D-059 consequences | Decision Register Cleanup |
| AD-P1-05 | Programs | **Program 3.x track absent from ROADMAP** — only in PROJECT-STATUS / journal | `ROADMAP.md` | ROADMAP Program 3 section |
| AD-P1-06 | Programs | **Program number schism** — 2.3.6 brief vs 3.0.5/3.1 renumbering | `IFM-PHASE-2.3.6-*`, D-054/055 | Brief retirement / redirect |
| AD-P1-07 | Business | **Intent Resolver** — architecture without brief, gate, or D-number for implementation | D-059 §3.6 | Intent Resolver Brief (pre-3.5) |
| AD-P1-08 | Studio | **Formula Builder pattern exceptions** not summarized in Studio Architecture | vs Layout/Field designers | Studio Architecture amendment |
| AD-P1-09 | Dependencies | **Four dependency graph namesakes** — governance, Core, Dependency Engine, MDP compile | Multiple paths | Glossary + Language Standard |
| AD-P1-10 | Documentation | **PROJECT-STATUS gates table** says "Next: Business Computed Fields" while Program Tracking says Resolver first | `PROJECT-STATUS.md` L181 vs L57 | SSOT sync |

---

## P2 — Medium

| ID | Category | Description | Evidence |
|----|----------|-------------|----------|
| AD-P2-01 | Terminology | Enterprise DNA vs Business DNA vs Intent Business DNA overlap | Intelligence, Computation, Intent Authoring docs |
| AD-P2-02 | Terminology | Process Mining in 4+ architecture documents | Continuous Improvement, Knowledge, D-058/059 hooks, 3.5A doc |
| AD-P2-03 | Terminology | Decision Platform vs Intelligence vs Decision Intelligence naming | Platform Vision, Intelligence arch, 3.5A doc |
| AD-P2-04 | Studio | Formula missing from `studioCapabilities.catalog.js` and `src/studio/index.js` | Registry catalogs |
| AD-P2-05 | Studio | Dual Computation Engine instances (field vs formula domainId) | `fieldComputationSetup.js`, `formulaCoreSetup.js` |
| AD-P2-06 | Documentation | DECISIONS.md header stale (D-040 vs D-059) | `DECISIONS.md` line 4 |
| AD-P2-07 | Documentation | AI-STARTUP-GUIDE stale (2.3.6, D-052, RC1) | `AI-STARTUP-GUIDE.md` |
| AD-P2-08 | Documentation | NEXT-SPRINT obsolete (MDP-4) | `NEXT-SPRINT.md` |
| AD-P2-09 | Documentation | MAK-2035-PLATFORM-VISION §8 stale next mission | Vision doc |
| AD-P2-10 | Documentation | MAK-PLATFORM-EVOLUTION stale (2.3.6 next) | Architecture doc |
| AD-P2-11 | Foundation | D-052 freeze text references 2.3.6 uncertified while G302 ✅ | PROJECT-STATUS, CURRENT-STATE |
| AD-P2-12 | Parameterization | DDL dual-path Prisma + ensureSchema (TD-005) | TECH-DEBT |
| AD-P2-13 | Parameterization | No unified catalog schema doc for Intent/Computation kind catalogs | D-058/059 contracts only |
| AD-P2-14 | Programs | ROADMAP "Program 3 = Marketplace" vs current "Program 3 = Studio Intelligence" | ROADMAP Phase 6 |

---

## P3 — Low

| ID | Category | Description | Evidence |
|----|----------|-------------|----------|
| AD-P3-01 | Studio | `mdpRegistrySyncLayoutEntries` used for field sync — naming | `fieldPreviewBridge.js` |
| AD-P3-02 | Studio | Field preview swallows registry sync errors | `.catch(() => {})` |
| AD-P3-03 | Documentation | Deprecated computed-fields brief stubs still in tree | `IFM-PHASE-2.3.3–2.3.5` stubs |
| AD-P3-04 | Terminology | Business Language no standalone architecture doc | Knowledge Architecture only |
| AD-P3-05 | Decisions | "Foundation Freeze" phrase in D-001 vs D-052 — scope confusion risk | DECISIONS |

---

## Debt summary

| Severity | Count |
|----------|-------|
| P0 | 4 (1 resolved: AD-P0-05) |
| P1 | 10 |
| P2 | 14 |
| P3 | 5 |
| **Total** | **33** (34 at audit; AD-P0-05 resolved) |

---

## Remediation sequencing (recommended — not part of 3.5B)

1. ~~AD-P0-05~~ — ✅ D-060 / 3.5A merged to `main` (PR #346)
2. AD-P0-03, AD-P1-01 — Gate registry renumbering (e.g. deploy G303/G304 → G401/G402 or G30D-*)
3. AD-P0-04, AD-P1-05, AD-P1-06, AD-P2-* docs — Documentation SSOT sync mission
4. AD-P1-03, AD-P1-04 — Decision supersession cleanup
5. AD-P0-01, AD-P0-02 — Runtime formula unification (before Business Computed Fields)
6. AD-P1-07 — Intent Resolver brief + gate assignment
7. Resume **Program 3.5 — Intent Resolver** implementation

---

*Register maintained per D-061. Update only via consolidation or remediation missions.*
