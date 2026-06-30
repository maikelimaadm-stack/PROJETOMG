# Enterprise Architecture Consolidation Audit

**Status:** Official — Audit report (discovery only)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5B — Enterprise Architecture Consolidation Audit  
**Decision:** D-061  
**Scope:** Read-only audit — **no corrections performed**

> **Permanent rule (post-audit):** No new implementation may start before architecture consolidation remediation missions complete.

---

## Executive summary

This is the largest architectural audit executed on MAK Gestão to date. **59 Decisions (D-001–D-059)** on `main`, **25 architecture documents**, **45 gate scripts**, and **~352 Studio source files** were reviewed.

**Verdict:** The **long-horizon vision and L5 Studio engine stack are sound and well-gated**. Structural risks concentrate in **(1) documentation/roadmap drift**, **(2) Foundation runtime parallel formula stacks**, **(3) gate ID collisions**, and **(4) approved-but-unmerged vision docs (D-060 / Program 3.5A)**.

**Platform is NOT yet officially consolidated** for decade-scale implementation without remediation. See [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md).

---

## Audit methodology

| Phase | Scope | Method |
|-------|-------|--------|
| 1 | Master Architecture layers | Doc + code boundary review |
| 2 | Foundation / Studio engines | `src/studio/`, gates G262–G303A |
| 3 | Business architecture | D-057–D-059 docs + vision pillars |
| 4 | Studio designers | Layout / Field / Formula pattern compare |
| 5 | Runtime / MDP / CRB | Frontend + backend publish path |
| 6 | Documentation corpus | ~99 docs classified |
| 7 | Decisions D-001–D-059 | Register analysis |
| 8 | Programs / roadmap | ROADMAP vs PROJECT-STATUS |
| 9 | Gates | All `gate-*.mjs` + ID registry |
| 10 | Parameterization | Registries, catalogs, config engines |
| 11 | Enterprise consistency | Business ownership vs module/UI coupling |
| 12 | Vision consistency | EOS vs implementation |
| 13 | Long-term evolution | 5 / 10 / 20 / 30 year structural fit |

---

## Phase 1 — Master Architecture audit

### Layers reviewed

| Layer | Artifact | Status on `main` |
|-------|----------|------------------|
| L0 Constitution | `docs/constitution/` | ✅ Frozen |
| L1 Master | `MAK-2035-MASTER-ARCHITECTURE.md` | ✅ SSOT |
| L2 Foundation | `framework/mak`, ModeloBase1 | ✅ Frozen V10.2.0 |
| L4 MDP | Spec + backend modules | ✅ Frozen (D-025/026) |
| L5 Studio | Engines + designers | ✅ Certified through G303A |
| L5 Business | Intent + Computation (D-058/059) | ✅ Docs on `main` |
| L6 Vision | D-057 pillars + **3.5A pending merge** | ⚠️ Partial |
| L6 Intelligence detail | 8 docs on branch `enterprise-intelligence-vision-0b52` | ⚠️ Approved, not on `main` |
| L2 Runtime Bridge | CRB Phase 1 | ✅ D-030 |
| L3 Platform Core | Event bus | ❌ Not started |

### Findings

| # | Finding | Severity |
|---|---------|----------|
| MA-01 | **L6 Enterprise Intelligence** split across D-057 summary docs and approved **Program 3.5A** docs not yet on `main` | High |
| MA-02 | **L3 event bus** referenced by Automation/Workflow vision but absent — acceptable gap if documented | Medium |
| MA-03 | **No layer mispositioning** of certified Studio engines — dependency stack in `studioArchitectureConstants.js` is coherent | — |
| MA-04 | **Preview path** (Studio HTTP → MDP compile) parallel to **Runtime Bridge** import path — intentional isolation, not duplicate layer | Low |
| MA-05 | **Missing layer (future):** Business Intent Resolver runtime service (architecture only in D-059) | Expected |

### Phase 1 answers

| Question | Answer |
|----------|--------|
| Camada mal posicionada? | **Não** nas camadas certificadas; **L6 Intelligence** aguarda merge 3.5A |
| Responsabilidade duplicada? | **Sim** — fórmula runtime Foundation vs Studio Computation (ver Fase 5) |
| Dependência invertida? | **Sim potencial** — ROADMAP ainda autoriza 2.3.6 após 3.1 entregue (doc drift, não código) |
| Camada que deveria existir? | **Intent Resolver runtime**, **event bus L3**, **Business Derivation orchestration** (planejados) |
| Camada removível? | **Não** — nenhuma camada certificada é obsoleta; `framework/cadastro/` é legado conhecido (TD-003) |

---

## Phase 2 — Foundation / Studio engines audit

### Engines audited

Studio SDK · Design System · Events · Governance · Core · SOM · Expression · Dependency · Type System · Evaluation · Computation · Editor · Contribution · Universal Components · Domain · Layout · Field · Formula designers.

### Findings

| ID | Finding | Severity |
|----|---------|----------|
| FE-01 | **Legacy formula evaluator** in `src/framework/cadastro/fields/campoEngine.jsx` — parallel to Expression/Evaluation/Computation | **Critical** |
| FE-02 | **MAK formula stack** in `src/framework/mak/formula/runMakFormulaEvaluation.js` — separate dependency graph + builtins | **Critical** |
| FE-03 | **Three “dependency graph” concepts** — governance static, Core artifact, Dependency Engine (+ backend compile graph) | High |
| FE-04 | **Dual Computation Engine instances** — `formula-builder` vs `field-studio` domainIds (allowed by G302, state divergence risk) | Medium |
| FE-05 | **Formula Builder exceptions** — no Core/SOM/MDP sync/CRB preview vs Layout/Field (by design D-056, document as pattern debt) | Medium |
| FE-06 | **Formula absent** from `studioCapabilities.catalog.js` and `src/studio/index.js` public export | Medium |
| FE-07 | **Studio gates do not scan Foundation** — parallel evaluators undetected by G298/G302 | High |
| FE-08 | **Single-responsibility engines** within `src/studio/` — **confirmed** for certified stack | — |

### Phase 2 answers

| Question | Answer |
|----------|--------|
| Engine executa responsabilidade de outro? | **Sim (Foundation)** — campoEngine + makFormula vs Studio engines |
| Duplicação de conceitos? | **Sim** — dependency graphs, formula evaluation, function catalogs |
| Dependência inadequada? | **Não** inside Studio layer; **Sim** Foundation → bypasses Studio for runtime formulas |

---

## Phase 3 — Business architecture audit

### Concepts audited

Business Objects · Intent (vision + authoring) · Computation · Capabilities · Memory · DNA · Knowledge · Intelligence · Health · Consulting · Decision Intelligence · Process Mining · Evolution · Business Language · Intent Authoring.

### SSOT matrix

| Concept | SSOT document | Owner layer | On `main`? |
|---------|---------------|-------------|------------|
| Business Intent (authoring) | `MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md` | L5 | ✅ D-059 |
| Business Intent (vision) | `MAK-BUSINESS-INTENT-ARCHITECTURE.md` | L6 vision | ✅ |
| Business Computation | `MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md` | L5 facet | ✅ D-058 |
| Business Objects | `MAK-BUSINESS-OBJECT-MODEL.md` | L6 | ✅ |
| Business Capabilities | `MAK-BUSINESS-CAPABILITIES.md` | L6 | ✅ |
| Enterprise Memory | `MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md` | L6 | ⚠️ Branch only (D-060 pending) |
| Business DNA | `MAK-BUSINESS-DNA-ARCHITECTURE.md` + hooks in D-058/059 | L6 | ⚠️ Branch only |
| Process Mining | `MAK-PROCESS-MINING-ARCHITECTURE.md` + Continuous Improvement | L6 | ⚠️ Partial |
| Decision Intelligence | `MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md` + Intelligence overview | L6 | ⚠️ Branch only |
| Knowledge | `MAK-KNOWLEDGE-ARCHITECTURE.md` | L6 | ✅ |
| Consulting / Health / Evolution | Dedicated 3.5A docs | L6 | ⚠️ Branch only |

### Findings

| ID | Finding | Severity |
|----|---------|----------|
| BA-01 | **Enterprise DNA vs Business DNA vs Intent Business DNA** — three terms, no glossary reconciliation in Platform Language Standard | Medium |
| BA-02 | **Process Mining** registered in 4+ documents (Continuous Improvement, Knowledge, Computation hooks, Intent hooks, dedicated 3.5A doc) | Medium |
| BA-03 | **Decision Platform** (vision) vs **Intelligence Architecture** vs **Decision Intelligence Architecture** — naming split | Medium |
| BA-04 | **D-058 vs D-059** parallel principles; D-059 supersedes authoring scope but D-058 consequences still say "Computed Fields first" | High |
| BA-05 | **Intent Resolver** — architecture contract exists; **no implementation brief, no gate script** | High |
| BA-06 | **Business Language** — referenced everywhere; no standalone Business Language Architecture doc (vocabulary in Knowledge only) | Low |

### Phase 3 answers

| Question | Answer |
|----------|--------|
| Conceito duplicado? | **Sim** — DNA variants, Process Mining, Decision/Intelligence naming |
| Conceito sem proprietário? | **Não** para core business SSOT; **Sim** para Business Language as first-class doc |
| Conceito sem arquitetura? | **Sim** — Marketplace Intelligence, Observability Platform, Intent Resolver impl brief |
| Responsabilidade mal definida? | **Sim** — sequencing Computed Fields vs Resolver across decisions/docs |

---

## Phase 4 — Studio audit

### Pattern compliance

| Component | Layout | Field | Formula |
|-----------|--------|-------|---------|
| Contribution registration | ✅ | ✅ | ✅ |
| Core + SOM + Editor | ✅ | ✅ | ❌ (by design) |
| MDP sync + CRB preview | ✅ | ✅ | ❌ (in-memory only) |
| Expression/Dependency/Type/Eval | ❌ | ✅ | via Computation |
| Command bus / history | ✅ | ✅ | ❌ |
| Public API export | ✅ | ✅ | ❌ |
| Capability catalog entry | ✅ | ✅ | ❌ |

**Conclusion:** Layout and Field are **pattern-aligned**. Formula is **intentionally divergent** (Program 3.2) but **under-documented as exception** in Studio Architecture.

| ID | Finding | Severity |
|----|---------|----------|
| ST-01 | Formula not in capability catalog / public index | Medium |
| ST-02 | `mdpRegistrySyncLayoutEntries` used for field registry sync — misleading name | Low |
| ST-03 | Field preview swallows registry sync errors (`.catch(() => {})`) | Low |
| ST-04 | No unauthorized AST access in Formula UI — G303A confirmed | — |

---

## Phase 5 — Runtime audit

### Paths traced

```
Authoring: Designer → MDP clients → compile/introspect/publish → CRB
Runtime:   runtimeLoader → crbHydrationAdapter → Foundation registries (V13–V20)
Legacy:    campoEngine / runMakFormulaEvaluation (parallel)
```

| ID | Finding | Severity |
|----|---------|----------|
| RT-01 | **Studio preview ≠ production formula execution** until CRB V17 path fully replaces legacy | **Critical** |
| RT-02 | Backend `mdpCompileService.buildDependencyGraph` — separate from Studio Dependency Engine (naming) | Medium |
| RT-03 | No bypass of MDP publish for certified modules — **confirmed** | — |
| RT-04 | `previewCrbAdapter` correctly avoids Runtime Bridge import in Studio | — |

---

## Phase 6 — Documentation audit

See [ARCHITECTURE-CONSISTENCY-REPORT.md](./ARCHITECTURE-CONSISTENCY-REPORT.md) § Documentation classification.

**Summary:** Strong SSOT for architecture contracts (D-054–D-059). **High drift** in ROADMAP, AI-STARTUP-GUIDE, NEXT-SPRINT, PLATFORM-EVOLUTION, 2.3.6 brief, DECISIONS header, PROJECT-STATUS internal gates table.

---

## Phase 7 — Decision audit (D-001–D-059)

| ID | Finding | Severity |
|----|---------|----------|
| DC-01 | **Superseded section empty** despite implicit supersessions (D-058→D-059, D-056 3.3 naming, D-052 vs G302) | High |
| DC-02 | **DECISIONS.md header** stale (claims D-040 last) | Medium |
| DC-03 | **D-060 absent on `main`** — user-approved 3.5A not merged | High |
| DC-04 | **No conflicting decision IDs** — register integrity OK | — |
| DC-05 | **Foundation Freeze** (D-001 vs D-052) — same phrase, different scope — document clearly | Low |

---

## Phase 8 — Roadmap audit

See [PROGRAM-SEQUENCE-VALIDATION.md](./PROGRAM-SEQUENCE-VALIDATION.md).

**Critical:** `ROADMAP.md` authorizes **Program 2.3.6** as next; `PROJECT-STATUS.md` authorizes **Program 3.5 Intent Resolver**.

---

## Phase 9 — Governance audit

| Gate range | Count | Role |
|------------|-------|------|
| Foundation G31–G142 area | certification + governance | ModeloBase1 |
| V13–V20 (G156–G261 area) | Config engines | Capabilities |
| G262–G303A | Studio stack | Intelligence authoring |
| G303 (deploy) | backend-bootstrap | **Deploy** |
| G304 (deploy) | railway-docker | **Deploy** |
| G303A | formula-builder | **Studio** |
| G303B (planned) | Business Computation | **Studio** |
| G304 (planned) | Intent Resolver | **Studio** — **ID COLLISION** |

| ID | Finding | Severity |
|----|---------|----------|
| GV-01 | **G304 used twice** — deploy (`gate-railway-docker.mjs`) and planned Intent Resolver gate | **Critical** |
| GV-02 | **G303 used twice** — deploy bootstrap and Studio sub-gate family (G303A/B) | High |
| GV-03 | **No gate** for Foundation formula parallel stacks | High |
| GV-04 | **No gate** for Intent Resolver (planned G304 blocked by collision) | High |
| GV-05 | Studio gate coverage **strong** for designers G262–G303A | — |

---

## Phase 10 — Parameterization audit

| Area | Pattern | Finding |
|------|---------|---------|
| Studio registries | `src/studio/registry/` + ContributionManager | ✅ Official |
| Design System catalogs | Separate from studio registries | ✅ By design |
| Config engines V13–V20 | Versioned gates | ✅ Consistent |
| MDP registry/fields | Backend services | ✅ SSOT for publish |
| `cadastro-modules.registry.json` | Parallel cache of MDP export | Known (TD) |
| Hardcoded module routes | `generatedModules.json` | Generated — OK |
| Formula capability | Missing from capability catalog | Medium |
| Business Intent Catalog | Architecture only — not in runtime | Expected |

| ID | Finding | Severity |
|----|---------|----------|
| PM-01 | Config scattered between Prisma, `ensureSchema.js`, env (TD-005) | Medium |
| PM-02 | Several vision catalogs (Intent, Computation kind) — **docs only**, no unified registry schema doc | Medium |
| PM-03 | Field `businessTypeCatalog` — designer-local vs platform catalog pattern inconsistent | Low |

---

## Phase 11 — Enterprise consistency audit

| Asset | Belongs to business (vision)? | Still module/UI-bound (today)? |
|-------|--------------------------------|--------------------------------|
| Automations | ✅ Vision (Intent-derived) | ⚠️ V18–V20 config engines module-scoped |
| Formulas | ✅ Vision | ⚠️ Formula Builder + legacy runtime |
| Workflows | ✅ Vision | ⚠️ V20 + module config |
| Dashboards | ✅ Vision | ❌ Not implemented |
| Integrations | ✅ Vision | ⚠️ Partial |
| IA | ✅ Vision (opt-in) | Stubs only |
| Reports | ✅ Vision | ❌ Not implemented |
| Knowledge | ✅ Vision | ❌ Not implemented |

**Conclusion:** Vision declares business ownership; **implementation still module/config-engine centric** for V13–V20 — expected pre-Resolver, but must not persist post-derivation architecture.

---

## Phase 12 — Vision consistency audit

| Vision pillar | Architecture support | Implementation |
|---------------|---------------------|----------------|
| EOS Principles | 3.5A doc (branch) | None — OK |
| Business Intent SSOT | D-059 ✅ | Resolver not built |
| Business Computation | D-058 ✅ | Not built |
| Enterprise Memory / DNA / Mining / Health | 3.5A docs (branch) | Not built |
| Formula Builder / Computation Engine | G303A/G302 ✅ | Built |
| Knowledge / Twin / Intelligence (D-057) | Summary docs ✅ | Not built |

**Gap:** Vision ahead of implementation — **by design**. **Doc merge gap (3.5A)** is not by design.

---

## Phase 13 — Long-term evolution (5 / 10 / 20 / 30 years)

| Horizon | Support | Risk |
|---------|---------|------|
| **5 years** | MDP + Studio engines + Intent architecture | Doc/gate debt remediation required |
| **10 years** | EOS vision + extension points in engines | Runtime unification mandatory |
| **20 years** | Metadata-first + versioning + Decision register | Event bus + Memory platform required |
| **30 years** | Layered L0–L7 + marketplace vision | Legacy `framework/cadastro` must be retired |

| ID | Finding | Severity |
|----|---------|----------|
| LT-01 | **Dual formula runtime** will force redesign if not unified before Business Computed Fields | **Critical** |
| LT-02 | **Gate ID namespace** too small / colliding — needs registry before more programs | High |
| LT-03 | **ROADMAP/SSOT drift** will compound without consolidation mission | High |

---

## Consolidation verdict

| Dimension | Consolidated? |
|-----------|---------------|
| Studio engine architecture | ✅ Yes (certified) |
| Business authoring architecture (docs) | ✅ Yes on `main` (D-058/059) |
| Enterprise Intelligence vision (docs) | ⚠️ Approved, merge pending |
| Documentation corpus | ❌ Drift |
| Governance gate registry | ❌ Collisions |
| Runtime vs Studio semantics | ❌ Parallel stacks |
| **Overall platform** | ❌ **Not officially consolidated** |

**Remediation:** Tracked in [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md). **No fixes in Program 3.5B.**

---

*Audit complete. Compatible with D-061. Next: consolidation remediation missions, then Program 3.5 implementation resume.*
