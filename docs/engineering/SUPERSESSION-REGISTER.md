# Supersession Register — Official Traceability

**Status:** Official — All superseded artifacts  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062

> **Rule:** Nothing is "replaced" without an entry here. Immutable decisions are superseded, not edited — see [DECISIONS.md](./DECISIONS.md).

---

## Decisions — partial supersession

| Decision | Superseded aspect | Authoritative successor | Date | Evidence |
|----------|-------------------|-------------------------|------|----------|
| **D-056** | "Authorize Program 3.3 Computed Fields" as next impl | Program 3.3 = Business Computation **docs** (D-058); impl = Business Computed Fields **after Resolver** (D-059) | 2026-06-30 | D-058, D-059, D-062 |
| **D-058** | "Business Computed Fields as **first** implementation mission" | **Intent Resolver first** (D-059); Computed Fields after | 2026-06-30 | D-059 consequences |
| **D-052** | Freeze text: "until Program 2.3.6 certified" | G302 certified (Program 3.1); freeze lifted for Studio Intelligence track | 2026-06-30 | D-055, PROJECT-STATUS |
| **D-061** | Block all implementation | Lifted for Program 3.5 **after** D-062 remediation complete | 2026-06-30 | D-062 |
| **D-065** | "No architecture docs before Program 3.7 delivery" | **Program 3.6.9** inserted as final structural architecture; D-066 declares **no new structural architecture ever** before continuous impl | 2026-06-30 | D-066 |
| **D-PB-21** | B.5-only prerequisite for Foundation C code | **D-UP-25** (B.6) → **D-UA-26** (B.7) → **D-RI-14** (C.0.2) | 2026-06-30 | C.0.2 remediation |
| **D-UP-25** | B.6-only prerequisite | **D-UA-26** → **D-RI-14** | 2026-06-30 | C.0.2 remediation |
| **D-UP-30** | "Four pillars complete" | **Six blocks complete** (D-UA-34, D-RI-15) | 2026-06-30 | C.0.2 remediation |
| **D-PA-07** | "17 designers only" (total count) | **D-UA-06**: 28 normative (17 core + 11 extended); Foundation D phase 1 = 17 core | 2026-06-30 | C.0.2 remediation |
| **D-PA-19** | "Gate PASS" only for code start | **D-RI-14**: G420E doc gate + C.0.2 remediation authorizes C.1; master **G423** for C complete | 2026-06-30 | C.0.2 remediation |

**Note:** D-056, D-058, D-059 remain **Accepted** — only specific **consequences** are superseded.

---

## Programs — superseded IDs

| Old ID | Successor | Reason | Date |
|--------|-----------|--------|------|
| **Program 2.3.6** (Computation Engine impl) | **Program 3.0.5** (arch) + **Program 3.1** (G302) | Renumbering to Studio Intelligence track | 2026-06-30 |
| **Program 2.3.6** (Computed Fields brief) | **Program 3.5+** Business Computed Fields | Intent-first architecture (D-059) | 2026-06-30 |
| **Program 3.3** (Computed Fields impl — D-056 wording) | **Program 3.3** Business Computation **docs** (D-058) | Scope redefinition | 2026-06-30 |
| Program 3.5 Intent Resolver (pre-3.6) | **Program 3.7** Intent Resolver | Program 3.6 Derivation Architecture inserted (D-063) | 2026-06-30 |
| **ROADMAP "Program 3"** (Marketplace) | **Program 6** (future Marketplace) | Naming collision with Studio Intelligence Program 3 | 2026-06-30 |

---

## Gates — superseded IDs

| Old ID | New ID | Name | Reason | Date | Decision |
|--------|--------|------|--------|------|----------|
| **G303** (deploy) | **G401** | Backend Bootstrap Validation | Collision with Studio G303A/B family | 2026-06-30 | D-062 |
| **G304** (deploy) | **G402** | Railway Docker Build Validation | Collision with planned Intent Resolver G304 | 2026-06-30 | D-062 |
| **G423** (MMM planned) | **G435** | MMM module dependency acyclicity | Collision with Foundation Runtime G423 | 2026-06-30 | C.0.2 |
| **G424** (MMM planned) | **G436** | Critical automation approval | Collision with Foundation Studio G424 | 2026-06-30 | C.0.2 |

**Studio G304** is **not superseded** — it is the reserved ID for Business Intent Resolver (planned).

---

## Documents — superseded / deprecated

| Document | Status | Successor | Date |
|----------|--------|-----------|------|
| [IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md](./IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md) | **superseded** | [MAK-STUDIO-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) + Program 3.1 | 2026-06-30 |
| [NEXT-SPRINT.md](./NEXT-SPRINT.md) | **deprecated** | [PROJECT-STATUS.md](./PROJECT-STATUS.md) | 2026-06-30 |
| [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md) (stale sections) | **derived — update required** | [PROJECT-STATUS.md](./PROJECT-STATUS.md) + D-062 registries | 2026-06-30 |
| Deploy docs referencing G303/G304 (deploy) | **historical** | [GATE-REGISTRY.md](./GATE-REGISTRY.md) G401/G402 | 2026-06-30 |
| [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) (metadata scope) | **reference — persistence substrate** | [docs/meta-model/24-PERSISTENCE.md](../meta-model/24-PERSISTENCE.md) + [docs/meta-model/README.md](../meta-model/README.md) | 2026-06-30 |
| [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (authoring flow) | **reference — pre-MMM** | [docs/meta-model/20-BUSINESS-LANGUAGE.md](../meta-model/20-BUSINESS-LANGUAGE.md) + [21-INTENT-ENGINE.md](../meta-model/21-INTENT-ENGINE.md) | 2026-06-30 |
| [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) | **reference — pre-MMM** | [docs/meta-model/21-INTENT-ENGINE.md](../meta-model/21-INTENT-ENGINE.md) | 2026-06-30 |
| [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) | **reference — pre-MMM** | [docs/meta-model/21-INTENT-ENGINE.md](../meta-model/21-INTENT-ENGINE.md) | 2026-06-30 |
| [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](../architecture/MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) | **reference — pre-MMM** | [docs/meta-model/20-BUSINESS-LANGUAGE.md](../meta-model/20-BUSINESS-LANGUAGE.md) | 2026-06-30 |
| [INTENT-DERIVATION-KIND-SSOT.md](./INTENT-DERIVATION-KIND-SSOT.md) (runtime kinds) | **derived — implementation SSOT** | [docs/meta-model/21-INTENT-ENGINE.md](../meta-model/21-INTENT-ENGINE.md) (19 MMM derivation kinds) | 2026-06-30 |
| **4.01.2** | Taxonomy count "222" (planning) | **227 objectTypes / 226 PlatformSchemas** | [02-OBJECT-TAXONOMY.md](../meta-model/02-OBJECT-TAXONOMY.md) D-MMM-16 | 2026-06-30 |

---

## Architecture concepts — terminology supersession

| Old term | Context | Preferred term | SSOT |
|----------|---------|----------------|------|
| "Program 4 Computed Fields" | D-056 era | Business Computed Fields (post-Resolver) | D-059 |
| "Program 4" (Enterprise Intelligence impl) | Pre-MMM era | **Program 4 = Universal Meta Model**; Intelligence impl = future program ID TBD | PROGRAM-REGISTRY |
| "Next mission 2.3.6" | ROADMAP stale | Program 3.5 Intent Resolver | PROGRAM-REGISTRY |
| Deploy "G304" | Pre-D-062 | G402 (deploy) / G304 (Resolver only) | GATE-REGISTRY |
| Publish phase "C-N" | Pre-C.0.2 | **PUB-C-N** (publish pipeline) | meta-model/17-PUBLISH-PIPELINE |
| Runtime contract "C-N" | Pre-C.0.2 | **RT-C-N** (runtime modules) | runtime-implementation/04-MODULE-CONTRACTS |
| MMM contract "C-N" | Pre-C.0.2 | **MMM-C-N** (inter-subsystem) | meta-model/CONTRACTS |
| Event envelope field `type` | Pre-C.0.2 | **`eventType`** (UEP UP-08) | platform-protocol/08-UNIVERSAL-EVENT |
| `workflow.completed` | Pre-C.0.2 | **`workflow.finished`** (canonical) | platform-behavior/17-UNIVERSAL-EVENTS |
| MAK-2035 layer index Ln | Pre-C.0.2 | Platform layer L0–L10 via D-PA-01 mapping | platform-architecture/01-LAYERS |
| Taxonomy count "222" | Pre-D-MMM-16 | **227 / 226** | meta-model/02-OBJECT-TAXONOMY |

---

## Audit debt — resolved supersession

| Debt ID | Resolution | Mission |
|---------|------------|---------|
| AD-P0-03 | Deploy gates renumbered G401/G402; G304 reserved for Resolver | 3.5C / D-062 |
| AD-P0-04 | ROADMAP synced; PROJECT-STATUS = position SSOT | 3.5C / D-062 |
| AD-P0-05 | D-060 merged PR #346 | Pre-3.5C |
| AD-P0-01/02 | Official plan — no impl | [FORMULA-RUNTIME-UNIFICATION-PLAN.md](./FORMULA-RUNTIME-UNIFICATION-PLAN.md) |

---

*Append-only for supersession events. Never delete entries.*
