# Business Authoring Audit

**Status:** Official — Strategic audit report  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8.5 — Enterprise Vision Compliance Audit  
**Scope:** Business authoring stack vs [BAAP principles](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md)

---

## Official pipeline (normative)

```
Business Language → Business Intent → Intent Resolver → Business Capability Resolution
→ Business Derivation → Business Asset → Technical Projection → Runtime
```

---

## Layer-by-layer authoring audit

### 1. Business Language (D-065)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| User expresses objectives only | ⚠️ Partial | `createBusinessLanguageInput` in intent package |
| No formula/AST/JSON exposure | ⚠️ Partial | API clean; **UI bypasses via Formula Builder** |
| Vocabulary governance | ❌ | Enterprise Vocabulary not implemented |
| Ambiguity resolution | ❌ | Not in product |
| Explicit confirmation before Resolver | ❌ | Not in product |
| AI assist optional | ❌ | Not implemented |

**Finding BA-P1-01 (P1):** Business Language is **engine-ready**, **authoring-surface missing**.

---

### 2. Business Intent (D-059)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Intent Document SSOT | ✅ | `mak-business-intent-document-v1` |
| User creates intentions not artifacts | ⚠️ | Normative; Studio creates field docs directly |
| Lifecycle/versioning | ⚠️ | Document model; no Intent UI |
| Marketplace Intent sharing | ❌ | Not wired |

**Finding BA-P1-02 (P1):** Production authoring **still creates Studio documents**, not Intent Documents, for fields/layouts.

---

### 3. Business Capability (D-057)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Universal capability catalog | ⚠️ | Architecture doc + `capability.calculation` in resolver |
| Capability → asset mapping | ⚠️ | Single derivation kind implemented |
| Marketplace capabilities | ❌ | No integration |

**Finding BA-P1-03 (P1):** Capability catalog **under-implemented** vs architecture breadth.

---

### 4. Business Derivation (D-063)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Single derivation infrastructure | ✅ | Resolver pipeline |
| Mandatory metadata | ✅ | G305/G306 |
| 13+ derivation categories | ⚠️ | 1 implemented; rest extension points |
| Regeneration/sync policies | ⚠️ | Computed Field facets; not productized |

**Finding BA-P2-01 (P2):** Derivation architecture **complete**; **coverage = 1/N asset types**.

---

### 5. Intent Resolver (D-064/D-067)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Sole authorized path | ✅ | G305 — no designer bypass |
| Deterministic | ✅ | G305/G306 idempotence |
| Capability resolution | ✅ | G305 stages |
| End-to-end preview | ✅ | Evaluation preview in gate |

**Compliance: ✅** — strongest implemented layer.

---

### 6. Business Assets (D-068)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Business Asset First | ✅ | Policy + G306 |
| Reusable | ✅ | `reusable: true` |
| Not Studio-owned | ✅ | `studioOwned: false` |
| Org ownership | ✅ | Ownership facet |
| Cross-module binding | ⚠️ | Model supports; UI binds per Studio project |
| Workflow/Dashboard/… | ❌ | Extension points |

**Finding BA-P0-01 (P0):** Only **Computed Field** exists — **Business Asset paradigm not yet user-visible** across platform.

---

### 7. Business Computed Field (D-068/G306)

| Facet | Implemented | Product UI |
|-------|-------------|------------|
| Field, Document, Metadata | ✅ | ❌ |
| Lifecycle, Validation, Lineage | ✅ | ❌ |
| Diagnostics, Explainability | ✅ | ❌ |
| Versioning, Compatibility | ✅ | ❌ |
| Policies, Contracts | ✅ | ❌ |
| Preview, Sync, Regeneration | ✅ | ❌ |
| Dependency Metadata | ✅ | ❌ |
| Runtime Projection | ✅ | ❌ |
| Publishing/Marketplace/Knowledge/Evolution metadata | ✅ (contracts) | ❌ |
| Audit Trail, Ownership, Security | ✅ | ❌ |
| Extension Points | ✅ | N/A |

**Finding BA-P1-04 (P1):** Full **facet model in code**; **zero business-user surface** for Computed Field authoring via Business Language.

---

### 8. Formula Builder (D-056) — projection editor role

| Criterion | Expected (D-068) | Actual |
|-----------|------------------|--------|
| Edits projection of Business Asset | Yes | Can open without Computed Field |
| User sees business terms only | Yes | User sees **expressionSource** |
| Delegates to Computation Engine | Yes | ✅ G303A |

**Finding BA-P0-02 (P0):** Formula Builder **still primary calculation UX** — contradicts **Zero Technical Authoring (BAAP-13)** until wrapped in Business Language shell.

---

## Principle compliance matrix (BAAP-0..13)

| Principle | Architecture | Implementation | UX |
|-----------|--------------|----------------|-----|
| BAAP-0 Business Asset First | ✅ | ⚠️ | ❌ |
| BAAP-1 Dual Authoring | ✅ | ❌ | ❌ |
| BAAP-2 User Choice | ✅ | ❌ | ❌ |
| BAAP-3 Progressive Disclosure | ✅ | ❌ | ❌ |
| BAAP-4 Assisted Creation | ✅ | ❌ | ❌ |
| BAAP-5 Business Freedom | ✅ | N/A | N/A |
| BAAP-6 Human in Control | ✅ | N/A | N/A |
| BAAP-7 Reusable Assets | ✅ | ⚠️ | ❌ |
| BAAP-8 Business Ownership | ✅ | ⚠️ | ❌ |
| BAAP-9 Technology Transparency | ✅ | ⚠️ | ❌ |
| BAAP-10 Explainable Platform | ✅ | ⚠️ | ❌ |
| BAAP-11 Explain Before Execute | ✅ | ⚠️ | ❌ |
| BAAP-12 Continuous Improvement | ✅ | ❌ | ❌ |
| BAAP-13 Zero Technical Authoring | ✅ | ❌ | ❌ |

---

## Authoring path comparison

| Path | Reaches Intent? | Creates Business Asset? | User technical exposure |
|------|-----------------|-------------------------|-------------------------|
| G306 gate (Business Language API) | ✅ | ✅ Computed Field | None (API) |
| Formula Builder UI | ❌ | ❌ | **High** |
| Field Studio UI | ❌ | ❌ | **Medium** |
| Empresas cadastro | ❌ | ❌ | Low (forms) |

---

## Findings summary

| ID | Sev | Finding |
|----|-----|---------|
| BA-P0-01 | P0 | Single Business Asset — paradigm not productized |
| BA-P0-02 | P0 | Formula Builder remains primary calc authoring |
| BA-P1-01 | P1 | Business Language UI missing |
| BA-P1-02 | P1 | Studio documents bypass Intent for fields/layouts |
| BA-P1-03 | P1 | Capability catalog narrow |
| BA-P1-04 | P1 | Computed Field facets not exposed to users |
| BA-P2-01 | P2 | Derivation categories mostly extension points |
| BA-P3-01 | P3 | Intent UI branding vs "Business Intent" vocabulary |

---

## Certification

| # | Question | Answer |
|---|----------|--------|
| 6 | Assets independent of Studios? | **Normatively YES** · **Product still Studio-centric** |
| 7 | Intelligence belongs to business? | **Policy YES** · **No intelligence authoring yet** |

---

*Cross-ref: [PLATFORM-CONSISTENCY-AUDIT.md](./PLATFORM-CONSISTENCY-AUDIT.md)*
