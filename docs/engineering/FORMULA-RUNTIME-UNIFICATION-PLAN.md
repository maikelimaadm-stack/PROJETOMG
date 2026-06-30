# Formula Runtime Unification Plan

**Status:** Official — Approved migration plan (implementation NOT authorized)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062  
**Resolves:** AD-P0-01, AD-P0-02

> **IMPORTANT:** This document defines the **official plan only**. No runtime code changes are authorized until a dedicated implementation program is approved after Business Intent Resolver foundation exists.

---

## 1. Problem statement

Three parallel formula evaluation paths exist today:

| Path | Location | Used by |
|------|----------|---------|
| **Legacy campo engine** | `src/framework/cadastro/fields/campoEngine.jsx` | Runtime field display, legacy cadastro |
| **MAK formula stack** | `src/framework/mak/formula/runMakFormulaEvaluation.js` | V17 config engine, module formulas |
| **Studio Computation stack** | `src/studio/computation/` + Expression/Dependency/Type/Evaluation | Formula Builder preview, Field Studio computation adapter |

**Risk:** Semantic divergence between Studio preview and production runtime blocks decade-scale Business Computed Fields and Intent-derived formulas.

---

## 2. Current state

```
Authoring (Studio)                    Runtime (Production)
─────────────────                    ────────────────────
Formula Builder (G303A)              campoEngine.jsx
  → Computation Engine (G302)          runMakFormulaEvaluation.js
  → Expression → Evaluation          V17 formula config engine
  → Preview ✅                       CRB hydration (partial)
                                     ❌ Does NOT use Studio stack
```

| Aspect | Studio | Runtime |
|--------|--------|---------|
| AST / IR | Computation Document | Ad-hoc parsers |
| Dependency graph | Dependency Engine G299 | Separate graphs |
| Type checking | Type System G300 | Partial / none |
| Preview vs prod | Aligned in Studio | **Split from Studio** |

---

## 3. Target state (future)

```
Business Intent (D-059)
  → Intent Resolver (G304 — planned)
    → Business Computation (D-058)
      → Formula Builder / Computation Document
        → UNIFIED RUNTIME ADAPTER
          → Single evaluation semantics (Studio engines)
          → CRB-published formula artifacts
          → Legacy paths retired behind feature flag
```

**Principle:** One semantic core — Studio Expression + Dependency + Type + Evaluation + Computation — with **runtime adapter** layer for production performance.

---

## 4. Migration plan (phased — not implemented)

### Phase F1 — Artifact contract (post Resolver MVP)

| Item | Action |
|------|--------|
| Define `mak-runtime-formula-artifact-v1` | Serialized output from Computation Engine suitable for CRB |
| MDP registry extension | Formula artifacts in metadata registry |
| Version pin | Artifact version in CRB bundle |

**Gate (future):** G305 or extension to G304 — TBD at implementation program.

### Phase F2 — Runtime adapter (read-only parity)

| Item | Action |
|------|--------|
| Create `RuntimeFormulaEvaluator` adapter | Delegates to shared engine package extracted from Studio |
| Pilot module | `empresas` computed fields only |
| Parity tests | Studio preview result === runtime result for same document |

**No removal** of legacy paths in F2.

### Phase F3 — CRB hydration switch

| Item | Action |
|------|--------|
| CRB V17+ hydration | Load formula artifacts via adapter |
| Feature flag | `MAK_UNIFIED_FORMULA_RUNTIME` per tenant |
| Fallback | Legacy path when flag off |

### Phase F4 — Legacy deprecation

| Item | Action |
|------|--------|
| `campoEngine.jsx` | Mark deprecated; redirect to adapter |
| `runMakFormulaEvaluation.js` | Thin wrapper → adapter |
| V17 engine | Delegate to unified core |
| Removal | Only after 2 release cycles with flag default on |

---

## 5. Compatibility

| Concern | Strategy |
|---------|----------|
| Existing module formulas | Adapter translates V17 config → Computation Document (lossless where possible) |
| Published CRB bundles | Version field; old bundles use legacy path until republished |
| Studio preview | Unchanged — already on Studio stack |
| API contracts | No public API change in F1–F2 |

---

## 6. Rollback

| Phase | Rollback |
|-------|----------|
| F2 | Disable adapter import; legacy paths unchanged |
| F3 | Toggle `MAK_UNIFIED_FORMULA_RUNTIME=false` |
| F4 | Re-enable legacy wrappers (kept until F4 complete) |

---

## 7. Versioning

| Artifact | Version constant |
|----------|------------------|
| Runtime formula artifact | `mak-runtime-formula-artifact-v1` |
| Adapter API | Semver in `framework/mak/formula/` |
| CRB bundle | MDP-5 publication chain |

---

## 8. Gates (planned — not created in 3.5C)

| Gate | Purpose | When |
|------|---------|------|
| G305 (proposed) | Runtime formula parity — Studio preview === runtime | F2 implementation |
| G306 (proposed) | No parallel evaluators in certified modules | F4 implementation |

Register in [GATE-REGISTRY.md](./GATE-REGISTRY.md) when created.

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Semantic mismatch during migration | Parity test suite; feature flag |
| Performance regression | Execution graph caching; benchmark gate |
| Intent Resolver delay | F1 can proceed independently of Resolver |
| Foundation freeze | Changes are runtime adapter only — Decision required |

---

## 10. Dependencies

| Dependency | Status |
|------------|--------|
| Computation Engine G302 | ✅ |
| Formula Builder G303A | ✅ |
| Intent Resolver G304 | ⏳ Program 3.5 |
| Business Computed Fields | After Resolver |
| CRB Phase 2 (reload) | Enhances F3 |

---

## 11. Roadmap placement

```
Program 3.5  — Intent Resolver (impl)     ← NEXT (authorized)
Program 3.5+ — Business Computed Fields
Program 3.6  — Formula Runtime Unification (proposed ID — F1–F4)
```

**Not in scope for 3.5C:** Any code, adapter, or gate implementation.

---

## 12. P0 resolution statement

AD-P0-01 and AD-P0-02 are **resolved at architecture level** by this approved plan. Technical debt remains until Program 3.6 (or equivalent) executes the migration.

---

*Approved per D-062. Implementation requires new Decision + Program registration.*
