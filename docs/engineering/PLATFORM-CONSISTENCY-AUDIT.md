# Platform Consistency Audit

**Status:** Official — Strategic audit report  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8.5 — Enterprise Vision Compliance Audit  
**Scope:** Cross-layer consistency as of Program 3.8

---

## Consistency matrix (mandatory)

| Pair | Consistent? | Severity | Detail |
|------|-------------|----------|--------|
| **Documentation ↔ Implementation** | ⚠️ Partial | **P1** | Governance docs reflect 3.8; PMI/AI-STARTUP stale; vision UX not shipped |
| **Business Layer ↔ Runtime** | ❌ No | **P0** | G306 uses Studio Computation stack; production runtime uses legacy formula paths ([FORMULA-RUNTIME-UNIFICATION-PLAN.md](./FORMULA-RUNTIME-UNIFICATION-PLAN.md)) |
| **Studios ↔ Business Assets** | ⚠️ Partial | **P1** | D-068 rule registered; Field/Formula Studio still first-class; 1 Business Asset |
| **Resolver ↔ Capability Engine** | ✅ Yes | — | Resolver owns capability resolution; no parallel engine |
| **Capability Engine ↔ Marketplace** | ❌ No | **P2** | No marketplace manifest → capability wiring |
| **Business Language ↔ Business Intent** | ✅ Yes | — | `businessLanguageToIntent` aligned at API level |
| **Business Intent ↔ Computed Fields** | ✅ Yes | — | G306 pipeline when Resolver invoked |
| **Business Assets ↔ Formula Builder** | ⚠️ Partial | **P0** | FB can operate without Computed Field; should consume projection only |
| **Formula Builder ↔ Runtime** | ❌ No | **P0** | Preview uses G302; runtime uses campoEngine / runMakFormulaEvaluation |
| **Runtime ↔ Foundation** | ⚠️ Partial | **P2** | CRB Phase 1; not all modules on CRB |
| **Enterprise Intelligence ↔ Business Assets** | ❌ No | **P2** | Intelligence architecture docs; no runtime suggestion → asset loop |

---

## Layer stack consistency (today)

```
VISION (2035 EOS)          ████████████████████  100% documented
ARCHITECTURE (D-052–068)   ████████████████████  100% frozen SSOT
STUDIO ENGINES (G298–303A) ████████████████████  100% certified
BUSINESS STACK (G305–306)  ████████░░░░░░░░░░░░   ~40% (Resolver + 1 Asset)
EOS UX (BAAP)              ██░░░░░░░░░░░░░░░░░░   ~10% (principles only)
INTELLIGENCE (D-060)       ░░░░░░░░░░░░░░░░░░░░    0% code
RUNTIME UNIFICATION        ████░░░░░░░░░░░░░░░░   ~20% (plan only)
MARKETPLACE                █░░░░░░░░░░░░░░░░░░░    ~5%
```

---

## Duplication analysis

| Duplication | Layers | Risk | Severity |
|-------------|--------|------|----------|
| **Formula evaluation** | Studio Computation vs Foundation campoEngine vs runMakFormulaEvaluation | Semantic drift | **P0** (AD-P0-01/02 plan exists) |
| **Field "computed" vs Business Computed Field** | Field Studio fieldKind vs `business.asset.computed_field` | Concept collision | **P1** |
| **Dependency graph** | Governance graph vs Core vs Dependency Engine vs MDP compile | Naming confusion | **P2** (AD-P1-09) |
| **Business DNA / Intent DNA / Enterprise DNA** | Multiple architecture docs | Terminology drift | **P2** |
| **Program 3 naming** | Marketplace vs Studio Intelligence | Historical | **P2** |

---

## Documentation consistency issues

| Document | Issue | Severity |
|----------|-------|----------|
| PLATFORM-MATURITY-INDEX.md | Pre-3.8 scores; Studio 2.0; ERI 3.8 | P2 |
| AI-STARTUP-GUIDE.md | Stale program references | P2 |
| FORMULA-RUNTIME-UNIFICATION-PLAN | Says "not authorized" but P0 marked resolved in debt register | P2 |
| MAK-2035-PLATFORM-VISION §8 | Stale next mission | P3 |

---

## Governance consistency

| Registry | Aligned with 3.8? |
|----------|-------------------|
| PROJECT-STATUS | ✅ Updated at 3.8 |
| GATE-REGISTRY G306 | ✅ |
| PROGRAM-REGISTRY 3.9 next | ✅ |
| SSOT-REGISTRY BAAP doc | ✅ |
| ARCHITECTURE-DEBT-REGISTER | ⚠️ P1 items partially stale post-3.7/3.8 |

---

## Findings register

| ID | Sev | Finding |
|----|-----|---------|
| PC-P0-01 | P0 | Business Layer pipeline ≠ production Runtime evaluation |
| PC-P0-02 | P0 | Formula Builder can author without Business Asset chain |
| PC-P1-01 | P1 | Studios remain primary UX; Business Asset rule not enforced in UI |
| PC-P1-02 | P1 | Doc maturity indexes stale vs Program 3.8 |
| PC-P2-01 | P2 | Intelligence stack disconnected from Resolver outputs |
| PC-P2-02 | P2 | Marketplace ↔ Capability catalog gap |
| PC-P2-03 | P2 | CRB hydration incomplete across modules |
| PC-P3-01 | P3 | Historical program numbering in secondary docs |

---

## Answers

| Question | Answer |
|----------|--------|
| Duplication of concepts? | **YES** — see table above |
| Layer causing future rework? | **YES** — Runtime split (P0) |
| Doc vs implementation inconsistency? | **YES** — UX maturity understated in vision docs |

---

*Cross-ref: [FUTURE-RISKS-AUDIT.md](./FUTURE-RISKS-AUDIT.md)*
