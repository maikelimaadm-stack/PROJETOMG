# Future Risks Audit

**Status:** Official — Strategic audit report  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8.5 — Enterprise Vision Compliance Audit  
**Scope:** Consolidated findings P0–P3 · Risks before Program 3.9

---

## Master findings register

### P0 — Critical (vision-blocking if unaddressed before EOS production)

| ID | Category | Finding | Impact | Recommended action |
|----|----------|---------|--------|-------------------|
| **VCA-P0-01** | Business Assets | Only Computed Field implemented — EOS promises universal assets | Users cannot experience EOS | Continue 3.9+ asset programs; **do not claim EOS-complete** |
| **VCA-P0-02** | UX | Technology Transparency violated in Formula Builder | User thinks as developer | **Business Language Product Shell** program before mass rollout |
| **VCA-P0-03** | Studio | Studios remain primary authoring UX | Contradicts Business Asset First in product | Studio repositioning: "Asset editors" + mandatory Intent entry |
| **VCA-P0-04** | Runtime | Studio preview ≠ production formula evaluation | Wrong business numbers in prod | **Authorize Runtime Unification implementation** (post-3.8 plan) |
| **UX-P0-01** | UX | Beginner cannot calculate without expressions | EOS onboarding failure | Same as VCA-P0-02 |
| **UX-P0-02** | UX | Expert sees expressionSource | BAAP-13 violation | Wrap FB behind Computed Field asset editor |
| **BA-P0-01** | Authoring | Business Asset paradigm not productized | Vision–product gap | Asset catalog UI + Business First shell |
| **BA-P0-02** | Authoring | Formula Builder primary calc path | Bypasses Intent/Asset | Deprecate direct FB entry for new calcs |
| **PC-P0-01** | Consistency | Business pipeline ≠ Runtime | Computed Fields wrong at runtime | Runtime Unification program |
| **PC-P0-02** | Consistency | FB without Business Asset | Architectural bypass in UX | Gate: new formulas require Resolver path |

---

### P1 — High (remediate during Programs 3.9–3.12)

| ID | Category | Finding | Recommended action |
|----|----------|---------|-------------------|
| VCA-P1-01 | Business Language | No production UI | Business Language Shell (guided wizard) |
| VCA-P1-02 | Intent | Studio creates docs not Intents | Intent migration for Field/Layout saves |
| VCA-P1-03 | Capability | Narrow catalog | Expand capability catalog with 3.9 Workflow |
| VCA-P1-04 | Marketplace | Not connected | Defer until asset catalog stable |
| VCA-P1-05 | Dual Authoring | Modes not in UI | Expert asset picker + Business First home |
| VCA-P1-06 | Explainability | Engine-only | Surface explainability in Studio shell |
| VCA-P1-07 | Reuse | No asset library | Enterprise Asset Registry UI |
| VCA-P1-08 | Asset model | Single asset schema instance | Generalize Business Asset base contract |
| UX-P1-01..04 | UX | See USER-EXPERIENCE-JOURNEY-AUDIT | Progressive Disclosure program |
| BA-P1-01..04 | Authoring | See BUSINESS-AUTHORING-AUDIT | Parallel UX track |
| PC-P1-01 | Consistency | Studio-centric UX | UX repositioning |
| PC-P1-02 | Consistency | Stale PMI | Refresh PMI post-3.8 audit |

---

### P2 — Medium (parallelize with implementation)

| ID | Category | Finding |
|----|----------|---------|
| VCA-P2-01..06 | Architecture | Intelligence docs-only; BOM partial alignment |
| VCA-P2-02 | Intelligence | Knowledge/Memory/DNA zero code |
| VCA-P2-03 | Continuous Improvement | No observation loop |
| VCA-P2-04 | Organization | D-066 docs only |
| VCA-P2-05 | Ownership | Metadata without org UI |
| UX-P2-01..02 | UX | Suggestion/onboarding flows |
| BA-P2-01 | Derivation | 1/N categories |
| PC-P2-01..03 | Consistency | Intelligence disconnect; CRB partial |
| AD-P1-* (legacy) | Governance | See ARCHITECTURE-DEBT-REGISTER — refresh post-3.8 |

---

### P3 — Low (hygiene)

| ID | Category | Finding |
|----|----------|---------|
| VCA-P3-01 | Policy | Human-in-control not testable (no AI) |
| UX-P3-01 | UX | Studio branding |
| BA-P3-01 | Authoring | Intent vocabulary in UI |
| PC-P3-01 | Docs | Stale secondary docs |

---

## §4 — Functionality not yet foreseen (Q11)

| Gap | Description | Register as |
|-----|-------------|-------------|
| **Enterprise Asset Registry (UI)** | Single search/browse for all Business Assets | Program 3.10+ or UX track |
| **Runtime Unification (implementation)** | Plan exists; not a numbered Program yet | **Recommend Program 3.8.6 or 3.11** |
| **Business Language Product Shell** | Wizard/conversation UI — architecture only | **Recommend before 3.9 UX integration** |
| **Intent persistence service** | Intent SSOT storage in MDP | MDP extension |
| **Asset impact analyzer (user-facing)** | Dependency Engine exists; no business impact UI | Studio UX |
| **Formula parity gate (G305-class for runtime)** | AD-P1-02 still open | Foundation gate |

---

## §5 — Decisions recommended before Program 3.9 (Q12)

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | **Runtime Unification timing** | Before vs after Workflow | **Parallel track** — Workflow architecture can proceed; **production Workflow execution** needs runtime strategy |
| 2 | **Business Language UI** | Block 3.9 vs parallel | **Parallel** — 3.9 Workflow **asset + Resolver**; UX shell separate |
| 3 | **Studio repositioning** | Rebrand vs new shell | Incremental: "Business Asset Editor" framing in Studio shell |
| 4 | **Generalized Business Asset base** | Per-asset vs shared base class | **Shared contract** before 3rd asset type |
| 5 | **PMI refresh** | Now vs post-3.9 | **Now** — update ERI after 3.8 audit |

---

## Risk heat map (Program 3.9 impact)

| Risk | If 3.9 starts without mitigation |
|------|----------------------------------|
| Workflow asset without Runtime unification | Workflow preview ≠ production execution (**same class as formulas**) |
| Workflow UI in Studio only | Repeats Field/Formula Studio-centric pattern |
| No Business Language shell | Workflow created technically, not via Intent |

**Mitigation for 3.9:** Implement **Business Workflow as Business Asset** (mirror 3.8 pattern) + **extension points only for execution** until Runtime program completes.

---

## Certification answers (risks lens)

| # | Question | Answer |
|---|----------|--------|
| 1 | Exact vision representation? | **NO** — acceptable at 3.8 stage |
| 10 | Walking toward EOS? | **YES** — with documented P0 debt |
| 11 | Unforeseen functionality? | **YES** — Asset Registry UI, Runtime impl program, Language shell |
| 12 | Decision needed now? | **YES** — Runtime Unification authorization + Language UX track |

---

## Program 3.9 authorization condition

Program 3.9 **may proceed** as **Business Workflow Business Asset** (architecture + Resolver derivation + G307) **provided**:

1. This audit is registered (D-069)
2. P0 items are **acknowledged debt**, not ignored
3. 3.9 scope excludes **production Workflow runtime execution** unless Runtime Unification is addressed
4. No new structural architecture (D-066 freeze holds)

---

*Consolidates: VCA-* · UX-* · BA-* · PC-* · legacy AD-* references*
