# Program Sequence Validation

**Status:** Official — Roadmap and program dependency audit  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5B — Enterprise Architecture Consolidation Audit  
**Decision:** D-061  
**SSOT for next mission (declared):** `PROJECT-STATUS.md` — **subject to remediation** of conflicts noted below

---

## 1. Purpose

Validate program **sequence**, **dependencies**, and **prerequisites** across ROADMAP, PROJECT-STATUS, DECISIONS, and ENGINEERING-JOURNAL.

---

## 2. Authoritative sequence (as delivered on `main`)

### Program 2 — MAK Studio (complete through 2.3.Y)

```
2.0 → 2.0.9 (SDK, Design System, Events, Governance, UX)
2.1A → 2.1A.7 (Shell, Universal, Domain, Contribution)
2.1B (Shell Production)
2.2 → 2.2.7 (Layout, Core, SOM, Editor)
2.3 → 2.3.5 (Field, Expression, Dependency, Type, Evaluation)
2.3.X (Stabilization, D-052 freeze)
2.3.Y (Continuity, D-053)
```

### Program 3 — Studio Intelligence (partial)

| Program | Decision | Deliverable | Status |
|---------|----------|-------------|--------|
| **3.0.5** | D-054 | Computation Architecture spec | ✅ Docs |
| **3.1** | D-055 | Computation Engine (G302) | ✅ Code |
| **3.2** | D-056 | Formula Builder (G303A) | ✅ Code |
| **3.1.5** | D-057 | Enterprise Platform Vision | ✅ Docs |
| **3.3** | D-058 | Business Computation Layer | ✅ Docs |
| **3.4** | D-059 | Business Intent Authoring | ✅ Docs |
| **3.5A** | D-060 | Enterprise Intelligence Vision | ⚠️ Approved, **not on `main`** |
| **3.5B** | D-061 | Architecture Consolidation Audit | ✅ This mission |
| **3.5** | — | Intent Resolver **implementation** | ⏸ Blocked until consolidation |
| **3.5+** | — | Business Computed Fields | After Resolver (D-059) |

### Renumbering history (source of drift)

| Old ID | New ID | Evidence |
|--------|--------|----------|
| Program 2.3.6 Computed/Derived + Computation | **Program 3.0.5** (arch) + **3.1** (engine) | D-054, D-055, journal |
| Program 3.3 Computed Fields | **Program 3.3** Business Computation (docs) | D-058 |
| Computed Fields impl | **Business Computed Fields** after Resolver | D-059 |

---

## 3. ROADMAP.md validation

| Check | Result |
|-------|--------|
| Lists Program 2 complete through 2.3.Y | ✅ |
| Lists 2.3.6 as **next official mission** | ❌ **Stale** — 3.1 delivered |
| Lists Program 3 Studio Intelligence | ❌ **Absent** |
| Lists 3.1.5, 3.3, 3.4, 3.5A, 3.5 | ❌ **Absent** |
| Phase 6 "Program 3" = Marketplace | ❌ **Conflicts** with current Program 3 naming |
| Last updated reference | D-053 / 2.3.Y only |

**Verdict:** ROADMAP is **not valid** for Program 3 continuity without update mission.

---

## 4. PROJECT-STATUS.md validation

| Check | Result |
|-------|--------|
| Program 3.4 complete | ✅ |
| Next = Program 3.5 Intent Resolver | ✅ |
| Then Business Computed Fields | ✅ |
| Gates table "Next expected: Computed Fields" | ❌ **Internal conflict** with L57 |
| Foundation freeze cites 2.3.6 | ❌ **Stale** — G302 done |
| 3.5A / D-060 | ❌ **Not reflected** (pre-audit) |

**Verdict:** PROJECT-STATUS is **mostly valid** — minor internal conflicts.

---

## 5. Decision dependency chain

```
D-054 (Computation Architecture)
  → D-055 (Computation Engine) ✅
    → D-056 (Formula Builder) ✅
      → D-057 (Enterprise Vision) ✅
        → D-058 (Business Computation) ✅
          → D-059 (Intent Authoring) ✅
            → D-060 (Intelligence Vision) ⚠️ branch
              → D-061 (Consolidation Audit) ✅
                → [Remediation missions]
                  → Program 3.5 Intent Resolver (authorized by D-059, blocked by D-061 rule)
                    → Business Computed Fields
```

**Broken links in register text (not IDs):**

- D-056 authorizes "Program 3.3 Computed Fields" → became 3.3 Business Computation docs
- D-058 authorizes "Business Computed Fields first" → superseded by D-059 (Resolver first)

---

## 6. Prerequisite matrix (next implementations)

| Mission | Prerequisites | Met? |
|---------|---------------|------|
| **Gate registry fix** | Audit D-061 | ✅ |
| **Merge 3.5A docs** | User approval | ✅ (merge pending) |
| **Doc SSOT sync** | Audit D-061 | ✅ |
| **Intent Resolver impl** | D-059 arch, G304 (renamed), Dependency Engine, MDP | ⚠️ Partial |
| **Business Computed Fields** | Resolver, D-058, Formula Builder, Computation Engine | ❌ Resolver missing |
| **Runtime formula unification** | Audit AD-P0-01 | Recommended before Computed Fields |

---

## 7. Program split / merge / retire recommendations (documentation only)

| Program | Recommendation | Rationale |
|---------|----------------|-----------|
| **2.3.6** | **Retire as active roadmap ID** | Absorbed by 3.0.5 + 3.1 |
| **3.3 vs 3.4** | **Keep separate** | Computation facet vs Authoring SSOT — valid |
| **3.5A vs 3.5** | **Keep separate** | Vision vs implementation — valid |
| **3.5B** | **Complete** — one-time audit | This mission |
| **Marketplace "Program 3"** | **Renumber in ROADMAP** | Avoid collision with Studio Intelligence Program 3 |
| **Business Derivation Architecture** | **Define as alias or phase of 3.5+** | User referenced post-audit; align with Resolver + derivation pipeline in D-059 |

---

## 8. Missing programs (gaps)

| Gap | Suggested program ID | Dependency |
|-----|---------------------|------------|
| Gate Registry Consolidation | 3.5C (proposed) | D-061 |
| Documentation SSOT Sync | 3.5D (proposed) | D-061 |
| Runtime Formula Unification | 3.5E (proposed) | AD-P0-01 |
| Intent Resolver Brief | Pre-3.5 doc mission | D-059 |
| Event Bus (L3) | Program 1B / 1F | Master Architecture |
| Enterprise Memory impl | Program 4.x | D-060 |

---

## 9. Sequence validation answers

| Question | Answer |
|----------|--------|
| Ordem inadequada? | **Sim** — ROADMAP still orders 2.3.6 after completed 3.1 |
| Program dividir? | **Não** — 3.3/3.4/3.5A/3.5 split is correct |
| Program unificar? | **Sim considerar** — 2.3.6 brief into 3.1 reference doc |
| Program perdeu sentido? | **Sim** — ROADMAP row 2.3.6 as "next" |
| Program faltando? | **Sim** — consolidation remediation, Resolver brief, ROADMAP Program 3 section |

---

## 10. Official sequence post-audit (recommended — not enacted in 3.5B)

```
1. Merge D-060 (3.5A) to main
2. Merge D-061 (3.5B) audit deliverables
3. Consolidation remediation (gate registry, doc SSOT, decision supersession)
4. Runtime formula unification plan
5. Program 3.5 — Intent Resolver implementation
6. Business Computed Fields
7. Enterprise Intelligence implementation programs (Memory, Mining, …) per D-060
```

**Implementation resume rule:** Step 3 minimum before step 5 (permanent architecture rule + D-061 findings).

---

*Validation complete. ROADMAP update required in separate mission.*
