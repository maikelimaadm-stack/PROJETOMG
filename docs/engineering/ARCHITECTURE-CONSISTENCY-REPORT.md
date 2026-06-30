# Architecture Consistency Report

**Status:** Official — Cross-cutting consistency analysis  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5B — Enterprise Architecture Consolidation Audit  
**Decision:** D-061  
**Companion:** [ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md](./ENTERPRISE-ARCHITECTURE-CONSOLIDATION-AUDIT.md)

---

## 1. Purpose

Report **consistency and inconsistency** across architecture, documentation, governance, vision, and implementation boundaries — without applying fixes.

---

## 2. Layer consistency matrix

| Layer | Internal consistency | Vision alignment | Implementation alignment |
|-------|---------------------|------------------|-------------------------|
| L0 Constitution | ✅ High | ✅ | ✅ |
| L1 Master Architecture | ✅ High | ✅ | ✅ |
| L2 Foundation | ⚠️ Medium | ⚠️ Legacy cadastro | ❌ Parallel formula stacks |
| L4 MDP | ✅ High | ✅ | ✅ |
| L5 Studio engines | ✅ High | ✅ | ✅ G262–G302 |
| L5 Studio designers | ⚠️ Formula exception | ✅ | ⚠️ Formula partial |
| L5 Business (Intent/Computation) | ✅ High (docs) | ✅ | ❌ Not implemented |
| L6 Vision (D-057) | ✅ High | ✅ | N/A |
| L6 Intelligence (3.5A) | ✅ High (branch) | ✅ | ⚠️ Not on `main` |
| L2 Runtime Bridge | ✅ Phase 1 | ✅ | ⚠️ Formula path split |
| L3 Platform Core | ❌ Gap (event bus) | Documented gap | Not started |

---

## 3. Documentation classification

### SSOT (authoritative position)

| Document | Role |
|----------|------|
| `PROJECT-STATUS.md` | Project continuity SSOT |
| `DOCUMENT-MAP.md` | Doc hierarchy index |
| `DECISIONS.md` | Decision register |
| `MAK-2035-MASTER-ARCHITECTURE.md` | Layer topology |
| `MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md` | MDP spec |
| `MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md` | Business authoring SSOT |
| `MAK-STUDIO-ARCHITECTURE.md` | Studio SSOT (frozen) |

### Permanent architecture

All `docs/architecture/MAK-*.md` with Decision references D-029+.

### Vision (non-binding implementation)

`docs/vision/MAK-2035-PLATFORM-VISION.md`, `MAK-2040-VISION-BACKLOG.md`, D-057 pillars, 3.5A docs (pending merge).

### Engineering / living

`CURRENT-STATE.md`, `ROADMAP.md`, `ENGINEERING-JOURNAL.md`, `CAPABILITIES-REGISTRY.md`, `TECH-DEBT.md`.

### Historical / certification

All `IFM-PROGRAM-*-CERTIFICATION-REPORT.md`, `IFM-1C-*`, deployment recovery reports.

### Deprecated / stale (do not use for continuity)

| Document | Issue |
|----------|-------|
| `NEXT-SPRINT.md` | MDP-4 era |
| `IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md` | Pre-3.1 renumbering |
| `IFM-PHASE-2.3.3–2.3.5` computed stubs | Renumbered |
| `MAK-PLATFORM-EVOLUTION.md` | Next = 2.3.6 (stale) |
| `AI-STARTUP-GUIDE.md` | RC1 / 2.3.6 / D-052 only |

---

## 4. Duplicate documentation topics

| Topic | Documents | Consistency |
|-------|-----------|-------------|
| Business Intent | Intent Architecture + Intent Authoring | ✅ Intentional (vision vs SSOT) |
| Business DNA | Intelligence, Computation §6.6, Intent §3.18, Business DNA arch | ⚠️ Terminology drift |
| Process Mining | Continuous Improvement, Knowledge, Computation, Intent, Process Mining arch | ⚠️ Multi-register |
| Computation stack | Studio Computation, Business Computation, 2.3.6 brief | ⚠️ Program number drift |
| Decision support | Intelligence, Decision Intelligence, Platform Vision | ⚠️ Naming split |
| Deploy vs Studio gates | PROJECT-STATUS, DEPLOYMENT docs, D-059 | ❌ G303/G304 collision |

---

## 5. Conflicting documentation pairs

| Source A | Source B | Conflict |
|----------|----------|----------|
| `ROADMAP.md` | `PROJECT-STATUS.md` | Next mission: 2.3.6 vs 3.5 Resolver |
| `PROJECT-STATUS` Program Tracking | `PROJECT-STATUS` Gates table | Resolver first vs Computed Fields first |
| `D-058` consequences | `D-059` consequences | Computed Fields timing |
| `D-052` freeze text | G302 certified | 2.3.6 prerequisite obsolete |
| `MAK-2035-PLATFORM-VISION` §8 | PROJECT-STATUS | 3.3 Computed Fields vs 3.5 Resolver |
| Deploy G304 | Architecture G304 (planned) | Same gate ID |

---

## 6. Vision vs implementation consistency

| Vision principle (EOS) | Architecture doc | Implementation today |
|------------------------|------------------|---------------------|
| User sees business only | D-059 ✅ | Formula Builder still technical (expected) |
| Intent SSOT | D-059 ✅ | No Resolver |
| Memory belongs to enterprise | 3.5A (branch) | None |
| Explainable intelligence | 3.5A (branch) | None |
| AI optional | D-057, EOS-17 | Stubs only — ✅ |
| Universal reuse | D-057, D-058/059 | V13–V20 module-scoped |
| No external consulting dependency | 3.5A Consulting | Not built — OK |

**Conflict:** Vision assumes **derivation from Intent**; implementation still has **direct config-engine authoring** (V13–V20) and **legacy runtime formulas** — transitional, not vision-aligned long term.

---

## 7. Enterprise asset ownership consistency

| Asset type | Vision: business-owned | Current binding |
|------------|------------------------|-----------------|
| Formula | ✅ | Module field config + Formula Builder route |
| Workflow | ✅ | V20 module config |
| Automation | ✅ | V18–V19 module config |
| Dashboard | ✅ | Not implemented |
| Integration | ✅ | Partial backend |
| Intent | ✅ | Docs only |

**Finding:** Ownership model is **architecturally declared** but **not yet enforced** in runtime metadata — expected until Resolver + derivation platform exist.

---

## 8. Governance consistency

| Area | Consistent? | Notes |
|------|-------------|-------|
| Studio gate chain G262→G303A | ✅ | Dependencies enforced |
| Foundation gates | ✅ | Separate track |
| Deploy gates in CI | ✅ | G303/G304 deploy |
| Planned Studio gates G303B/G304 | ❌ | ID collision with deploy |
| Gate coverage map | ⚠️ | Foundation formula gap |
| PIP + RHP protocol | ✅ | Documented |

---

## 9. Parameterization consistency

| Pattern | Studio | Backend | Foundation |
|---------|--------|---------|------------|
| Versioned config engines | V13–V20 ✅ | Prisma models ✅ | Registry hydration ✅ |
| Registry SSOT | ContributionManager ✅ | MDP registry ✅ | CRB ✅ |
| Catalog-driven authoring | Field business types | MDP dictionaries | Module registry |
| Business Intent Catalog | Doc only | — | — |

**Inconsistency:** Future catalogs (Intent, Computation kind) defined in architecture but **no shared catalog schema specification** across business layer.

---

## 10. Consistency verdict

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Certified Studio stack | **Strong** | Best-consolidated area |
| Business architecture docs | **Strong** | D-058/059 coherent |
| Intelligence vision docs | **Strong** (branch) | Awaiting merge |
| Documentation corpus | **Weak** | SSOT drift |
| Gate registry | **Weak** | ID collisions |
| Runtime semantics | **Weak** | Dual formula path |
| **Overall** | **Partial** | Consolidation remediation required |

---

## 11. Documents recommended for future action (not in 3.5B)

| Action | Documents |
|--------|-----------|
| **Merge** | 3.5A intelligence docs → `main` |
| **Update** | ROADMAP, AI-STARTUP-GUIDE, PLATFORM-VISION §8, STUDIO arch (Formula exception) |
| **Retire/redirect** | 2.3.6 brief → Program 3.1 reference |
| **Split** | None required |
| **Unify** | DNA terminology → Platform Language Standard |
| **Supersede register** | D-058 partial supersession by D-059 |

---

*Report-only per D-061. No documents modified except audit deliverables.*
