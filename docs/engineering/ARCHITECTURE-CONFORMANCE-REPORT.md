# Architecture Conformance Report — Program 3.8.6

**Date:** 2026-06-30  
**Scope:** Cross-layer conformance — Foundation, Runtime, Studio, Business, Enterprise, Vision  
**Evidence:** D-057–D-068, gates G262–G306, codebase structure

---

## 1. Layer Conformance Matrix

| Layer | Architecture doc | Code exists | Conforms to arch | Violations |
|-------|------------------|-------------|------------------|------------|
| **Foundation** | MAK V10.2.0 frozen | ✅ 192 files | ✅ | cadastro legacy parallel (TD-003) |
| **Runtime** | Runtime Bridge D-027/030 | ⚠️ Partial | ⚠️ | 3 formula paths; CRB empresas-only |
| **Studio** | MAK-STUDIO-ARCHITECTURE | ✅ 404 files | ✅ | UX paradigm not EOS |
| **Business Layer** | D-058–068 | ⚠️ Partial | ⚠️ | 1 asset; Intent partial |
| **Enterprise Layer** | D-066 | ❌ Docs only | N/A | Not started |
| **Marketplace** | L6 vision | ❌ | N/A | Metadata stubs only |
| **Intelligence** | D-060 | ❌ | N/A | 0% code |
| **Governance** | D-062 registries | ✅ | ✅ | ROADMAP drift |
| **MDP** | D-025/026 frozen | ✅ Backend | ✅ | Cache staleness risk |
| **Vision** | MAK-2035 | ✅ Docs | ✅ trajectory | Implementation delta |

---

## 2. Foundation Conformance

| Rule | Status | Evidence |
|------|--------|----------|
| Foundation frozen V10.2.0 | ✅ | D-052, G401/G402 |
| Studio cannot import breaking Foundation changes | ✅ | G279 isolation |
| cadastro-engine is official facade | ✅ | `cadastro-engine/` |
| framework/cadastro transitional | ⚠️ | TD-003 — 62 imports remain |
| campoEngine legacy formula | ❌ Vision | Still primary for custom fields |

**Verdict:** Foundation **conforms to freeze** but **legacy paths violate Business Layer vision**.

---

## 3. Runtime Conformance

| Rule | Status | Evidence |
|------|--------|----------|
| Runtime executes projections, not Studio logic | ⚠️ | Bridge partial |
| CRB from MDP | ⚠️ | empresas pilot only |
| Single formula semantics | ❌ | EPDA-P0-02 |
| Business Computed Field → Runtime | ❌ | Projection builder exists; not wired empresas |

**Verdict:** Runtime **violates** Business Asset First for production empresas path.

---

## 4. Studio Conformance

| Rule | Status | Evidence |
|------|--------|----------|
| Studios edit assets only (BAAP) | ⚠️ | Formula Builder edits expressions directly |
| G262–G306 gates pass | ✅ | verify:ci |
| Designer isolation | ✅ | G279 |
| Dependency graph acyclic | ✅ | G284 (post-3.8 fix) |
| Engines: Expression, Dependency, Type, Evaluation, Computation | ✅ | G298–G302 |
| Intent Resolver | ⚠️ | 2/10 derivation kinds |
| Business package | ⚠️ | 1 asset |

**Verdict:** Studio **architecturally conformant**; **UX and asset coverage** non-conformant with vision.

---

## 5. Business Layer Conformance

| Principle | Status | Evidence |
|-----------|--------|----------|
| Business Language → Intent → Resolver → Asset | ⚠️ | Pipeline in code; UX bypass |
| Business Asset First (D-068) | ⚠️ | Computed Field only |
| Dual Authoring (D-065) | ❌ | No product UI |
| Resolver derives assets | ✅ | `computedFieldDerivation.js` |
| Runtime receives projections | ❌ | Not end-to-end |
| BAAP-0..13 principles | ⚠️ | Documented; partially applied |

**Verdict:** Business Layer **architecture conformant**; **production conformance failing**.

---

## 6. Resolver Conformance

| Rule | Status | Evidence |
|------|--------|----------|
| Resolver is derivation SSOT | ✅ | D-064, G305 |
| Extension points for new kinds | ✅ | `extensionPoints.js` |
| All kinds implemented | ❌ | 8/10 `implemented: false` |
| No designer bypass in architecture | ⚠️ | Formula Builder bypasses in UX |

---

## 7. Business Assets / Objects Conformance

| Rule | Status | Evidence |
|------|--------|----------|
| Universal asset lifecycle (BAAP) | ⚠️ | Pattern on 1 asset |
| BOM object model | ⚠️ | Docs; 1 object in Studio |
| Metadata facets complete | ✅ | Computed Field 15+ facets |
| Marketplace/Evolution metadata | ⚠️ | Stubs without consumers |

---

## 8. Vision Conformance

| Vision element | Architecture | Implementation |
|----------------|--------------|----------------|
| Enterprise Operating System | ✅ D-057, D-066 | ❌ ERP+Studio |
| No-code business authoring | ✅ BAAP | ❌ Expressions visible |
| Continuous improvement | ✅ D-060 | ❌ 0% code |
| Digital Organization | ✅ D-066 | ❌ Docs only |
| Marketplace ecosystem | ✅ L6 | ❌ Not started |
| Technology transparency | ✅ BAAP-7 | ❌ Formula Editor |

---

## 9. Coupling & Dependencies

| Check | Result | Evidence |
|-------|--------|----------|
| Circular deps Studio | None | G284 |
| Foundation → Studio forbidden reverse | OK | Layer rules |
| Resolver → Business → Computation | One-way | Import graph |
| Legacy cadastro ↔ Studio | **Coupled** | 62 imports TD-003 |
| Backend ↔ MDP | OK | Official clients |

---

## 10. Bypass Register

| Bypass | Layer violated | Severity |
|--------|----------------|----------|
| PAGEMP → MakCadastroForm (no Intent) | Business Layer | P0 |
| Formula Builder direct expression | BAAP / Resolver | P0 |
| campoEngine for custom fields | Runtime / Asset | P0 |
| ensureSchema parallel to Prisma | Governance | P2 |
| Gate-only config engines | Runtime | P1 |

---

## 11. Structural Duplication

| Duplication | Locations | Remediation |
|-------------|-----------|-------------|
| Formula evaluation | campoEngine, runMakFormula, Studio computation | Program 5.1 |
| Cadastro layers | framework/cadastro, cadastro-engine | TD-003 promotion |
| Computation Engine instances | field, formula, intent-resolver domainIds | AD-P2-05 |
| Dependency graph concepts | 4 namesakes (docs) | AD-P1-09 glossary |

---

## 12. Overall Conformance Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture ↔ Vision | **85%** | D-066 freeze aligned |
| Implementation ↔ Architecture | **35%** | Early Business Layer |
| UX ↔ Vision | **25%** | ERP paradigm |
| Governance ↔ Code | **90%** | Strong gates |
| **Weighted ERI alignment** | **3.8/10** | Matches PMI |

---

## 13. Certification

1. **Structural architecture conforms to vision?** **YES**
2. **Implementation conforms to architecture?** **PARTIAL — NO for production paths**
3. **Decisions blocking conformance?** **NO structural — execution programs needed**
4. **Eliminate concepts?** **NO — deprecate legacy paths over time**

**Primary misalignment:** Not architecture — **coverage**, **legacy runtime**, **UX paradigm**, **Intelligence absence**.
