# Gate Registry — Official SSOT

**Status:** Official — Single source of truth for all Gate IDs  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062  
**Parent:** [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md)

> **Rule:** No Gate (G-xxx) may exist outside this registry. New gates require D-number + registry update before merge.

---

## Registry schema

| Field | Required | Description |
|-------|----------|-------------|
| **ID** | Yes | Unique gate identifier (e.g. G302, G303A, G401) |
| **Name** | Yes | Human-readable name |
| **Objective** | Yes | What the gate protects |
| **Scope** | Yes | Paths / systems validated |
| **Owner** | Yes | Layer or team (Foundation, Studio, Deploy) |
| **Program** | Yes | Program that introduced the gate |
| **Decision** | Yes | Related D-number |
| **Status** | Yes | `active` · `planned` · `superseded` |
| **Created** | Yes | Date first registered |
| **Superseded** | When applicable | Date + successor ID |

---

## Namespace policy (D-062)

| Range | Track | Notes |
|-------|-------|-------|
| G00 | Smoke | Functional smoke |
| G31–G154 | Foundation | ModeloBase1, generator, completion |
| G156–G261 | Config engines | V13–V20 capability packs |
| G262–G284 | Studio foundation | SDK, design system, governance |
| G285–G303A | Studio programs | UX through Formula Builder |
| **G305** | Studio (active) | **Intent Resolver Implementation** (Program 3.7) |
| **G306** | Studio (active) | **Business Computed Fields** (Program 3.8) |
| **G307** | Product (active) | **Business Operating Shell MVP** (Program 3.9) |
| **G308** | Product (active) | **Business Workflow MVP** (Program 3.10) |
| **G309** | Product (active) | **Enterprise Intelligence Foundation** (Program 3.11) |
| **G310** | Product (active) | **Enterprise Memory Engine MVP** (Program 3.12) |
| **G311** | Product (active) | **Enterprise Knowledge Graph MVP** (Program 3.13) |
| **G312** | Product (active) | **Consulting Engine MVP** (Program 3.14) |
| **G313** | Product (active) | **Decision Engine MVP** (Program 3.15) |
| **G314** | Product (active) | **Evolution Engine MVP** (Program 3.16) |
| **G315** | Product (active) | **Business DNA & Maturity MVP** (Program 3.17) |
| **G316** | Product (active) | **Segmentation, Templates & Advanced Maturity MVP** (Program 3.18) |
| **G317** | Product (active) | **Recommendation & Replication MVP** (Program 3.19) |
| **G318** | Product (active) | **Adoption Tracking & Corporate Intelligence MVP** (Program 3.20) |
| **G319** | Product (active) | **Continuous Improvement & Optimization Loop MVP** (Program 3.21) |
| **G320** | Product (active) | **Portfolio Intelligence & Command Center MVP** (Program 3.22) |
| **G321** | Product (active) | **Platform Governance & Portfolio Control Center MVP** (Program 3.23) |
| **G322** | Product (active) | **Compliance, Retention & Audit Fortress MVP** (Program 3.24) |
| **G323** | Product (active) | **Data Lifecycle, Archive & Controlled Expunge MVP** (Program 3.25) |
| **G324** | Product (active) | **Data Lifecycle Persistence & Approval Workflow MVP** (Program 3.26) |
| **G325** | Product (active) | **Lifecycle Sync, Storage Integration & Audit Operations MVP** (Program 3.27) |
| **G303B** | Studio (planned) | Business Computation implementation |
| **G304** | Studio (architecture) | Intent Resolver architecture reference (D-064) — implementation certified by **G305** |
| **G401–G402** | Deploy pipeline | Renumbered from G303/G304 deploy (D-062) |
| **G420+** | MMM specification | G421 PlatformSchema coverage — [G421-SPEC.md](../meta-model/spec/G421-SPEC.md) |
| ~~G303~~ (deploy) | — | **Superseded → G401** |
| ~~G304~~ (deploy) | — | **Superseded → G402** |

---

## Deploy pipeline gates

| ID | Name | Objective | Scope | Owner | Program | Decision | Status | Created | Superseded |
|----|------|-----------|-------|-------|---------|----------|--------|---------|------------|
| **G401** | Backend Bootstrap Validation | Prevent RC-001 class deploy failures (ESM graph, pre-listen bootstrap) | `backend/src`, import graph | Deploy / Platform | 2.3.X.1 | D-052 area | **active** | 2026-06-30 | — (successor to deploy G303) |
| **G402** | Railway Docker Build Validation | Simulate Dockerfile.railway build before merge | `Dockerfile.railway`, `railway.json`, prisma | Deploy / Platform | 2.3.X.1 | D-052 area | **active** | 2026-06-30 | — (successor to deploy G304) |
| **G401+G402** | Deploy Pipeline Bundle | Runs G401 then G402 | CI deploy path | Deploy | 2.3.X.1 | D-062 | **active** | 2026-06-30 | — |

**Scripts:** `gate-backend-bootstrap.mjs` · `gate-railway-docker.mjs` · `gate-deploy-pipeline.mjs`

---

## Studio program gates (active)

| ID | Name | Program | Decision | Script | Status |
|----|------|---------|----------|--------|--------|
| G262–G266 | Studio SDK Foundation | 2.0.5 | D-032 | `gate-studio-sdk-foundation.mjs` | active |
| G267–G271 | Design System Foundation | 2.0.6 | D-033 | `gate-design-system-foundation.mjs` | active |
| G273–G278 | Studio Event Architecture | 2.0.7 | D-034 | `gate-studio-event-architecture.mjs` | active |
| G279–G284 | Studio Architecture Governance | 2.0.8 | D-035 | `gate-studio-architecture-governance.mjs` | active |
| G285 | Studio UX Framework | 2.0.9 | D-036 | `gate-studio-ux-framework.mjs` | active |
| G286 | Studio Shell Prototype | 2.1A | D-037 | `gate-studio-shell-prototype.mjs` | active |
| G287 | Studio Shell Production | 2.1B | D-041 | `gate-studio-shell-production.mjs` | active |
| G288 | Universal Studio Components | 2.1A.5 | D-038 | `gate-universal-studio-components.mjs` | active |
| G289 | Studio Domain Engine | 2.1A.6 | D-039 | `gate-studio-domain-engine.mjs` | active |
| G290 | Studio Contribution Engine | 2.1A.7 | D-040 | `gate-studio-contribution-engine.mjs` | active |
| G291 | Layout Studio Engine | 2.2 | D-042 | `gate-studio-layout-engine.mjs` | active |
| G293 | Studio Core Engine | 2.2.5 | D-043 | `gate-studio-core-engine.mjs` | active |
| G294 | Studio Object Model (SOM) | 2.2.6 | D-044 | `gate-studio-object-model.mjs` | active |
| G295 | Studio Editor Engine | 2.2.7 | D-045 | `gate-studio-editor-engine.mjs` | active |
| G296 | Field Studio Engine | 2.3 | D-046 | `gate-studio-field-engine.mjs` | active |
| G297 | Field Smart Authoring | 2.3.1 | D-047 | `gate-studio-field-smart-authoring.mjs` | active |
| G298 | Expression Engine | 2.3.2 | D-048 | `gate-studio-expression-engine.mjs` | active |
| G299 | Dependency Engine | 2.3.3 | D-049 | `gate-studio-dependency-engine.mjs` | active |
| G300 | Type System | 2.3.4 | D-050 | `gate-studio-type-system.mjs` | active |
| G301 | Evaluation Engine | 2.3.5 | D-051 | `gate-studio-evaluation-engine.mjs` | active |
| G302 | Computation Engine | 3.1 | D-055 | `gate-studio-computation-engine.mjs` | active |
| G303A | Formula Builder | 3.2 | D-056 | `gate-studio-formula-builder.mjs` | active |
| **G305** | Business Intent Resolver Implementation | 3.7 | D-067 | `gate-studio-intent-resolver.mjs` | **active** |
| **G306** | Business Computed Fields | 3.8 | D-068 | `gate-business-computed-fields.mjs` | **active** |
| **G307** | Business Operating Shell MVP | 3.9 | D-075 | `gate-business-operating-shell.mjs` | **active** |
| **G308** | Business Workflow MVP | 3.10 | D-076 | `gate-business-workflow.mjs` | **active** |
| **G309** | Enterprise Intelligence Foundation | 3.11 | D-077 | `gate-enterprise-intelligence-foundation.mjs` | **active** |
| **G310** | Enterprise Memory Engine MVP | 3.12 | D-078 | `gate-enterprise-memory-engine.mjs` | **active** |
| **G311** | Enterprise Knowledge Graph MVP | 3.13 | D-079 | `gate-enterprise-knowledge-graph.mjs` | **active** |
| **G312** | Consulting Engine MVP | 3.14 | D-080 | `gate-enterprise-consulting-engine.mjs` | **active** |
| **G313** | Decision Engine MVP | 3.15 | D-081 | `gate-enterprise-decision-engine.mjs` | **active** |
| **G314** | Evolution Engine MVP | 3.16 | D-082 | `gate-enterprise-evolution-engine.mjs` | **active** |
| **G315** | Business DNA & Maturity MVP | 3.17 | D-083 | `gate-enterprise-business-dna.mjs` | **active** |
| **G316** | Segmentation, Templates & Advanced Maturity MVP | 3.18 | D-084 | `gate-enterprise-segmentation.mjs` | **active** |
| **G317** | Recommendation & Replication MVP | 3.19 | D-085 | `gate-enterprise-recommendation-replication.mjs` | **active** |
| **G318** | Adoption Tracking & Corporate Intelligence MVP | 3.20 | D-086 | `gate-enterprise-adoption-corporate-intelligence.mjs` | **active** |
| **G319** | Continuous Improvement & Optimization Loop MVP | 3.21 | D-087 | `gate-enterprise-continuous-improvement-optimization.mjs` | **active** |
| **G320** | Portfolio Intelligence & Command Center MVP | 3.22 | D-088 | `gate-enterprise-portfolio-intelligence-command-center.mjs` | **active** |
| **G321** | Platform Governance & Portfolio Control Center MVP | 3.23 | D-089 | `gate-enterprise-platform-governance-portfolio-control.mjs` | **active** |
| **G322** | Compliance, Retention & Audit Fortress MVP | 3.24 | D-090 | `gate-enterprise-compliance-retention-audit-fortress.mjs` | **active** |
| **G323** | Data Lifecycle, Archive & Controlled Expunge MVP | 3.25 | D-091 | `gate-enterprise-data-lifecycle-archive-expunge.mjs` | **active** |
| **G324** | Data Lifecycle Persistence & Approval Workflow MVP | 3.26 | D-092 | `gate-enterprise-lifecycle-persistence-approval.mjs` | **active** |
| **G325** | Lifecycle Sync, Storage Integration & Audit Operations MVP | 3.27 | D-093 | `gate-enterprise-lifecycle-sync-storage-audit.mjs` | **active** |

---

## Studio program gates (planned)

| ID | Name | Objective | Program | Decision | Status |
|----|------|-----------|---------|----------|--------|
| **G303B** | Business Computation Layer | Business Computation path; Intent SSOT wiring; no parallel engines | 3.3 impl | D-058 | **planned** |
| **G304** | Business Intent Resolver (architecture) | Architecture contract reference (D-064); **implementation gate = G305** | 3.6.5 | D-064 | **architecture-only** |

> **G304 is exclusively reserved for Intent Resolver** per D-062. Deploy gates use G401/G402.

---

## MMM program gates (planned)

| ID | Name | Objective | Program | Decision | Status |
|----|------|-----------|---------|----------|--------|
| **G421** | MMM PlatformSchema Coverage | 226 payload schemas + envelope + manifest + persistence wiring | 4.03 | D-MMM-17 | **active** |
| **G422** | MMM Publish Pipeline PUB-C-1→PUB-C-16 | Compile, sign, persist `mmm-crb-v1`, pin, rollback | 4.04 | D-MMM-17 | **active** |
| **G435** | MMM module dependency acyclicity | Publish-time dependency graph acyclic | 4.04 | D-MMM-17 | **planned** |
| **G436** | Critical automation approval | Critical automation path approval tests | 4.04 | D-MMM-10 | **planned** |

Spec: [G421-SPEC.md](../meta-model/spec/G421-SPEC.md)

---

## Foundation doc gates (B.5–C.0)

| ID | Name | Objective | Foundation | Decision | Status |
|----|------|-----------|------------|----------|--------|
| **G420B** | Platform Behavior (B.5) | USM, lifecycles, events SSOT complete | B.5 | D-PB-30 | **active** |
| **G420C** | Universal Execution Protocol (B.6) | UEP SSOT complete | B.6 | D-UP-30 | **active** |
| **G420D** | Universal Authoring Specification (B.7) | UAS SSOT complete | B.7 | D-UA-35 | **active** |
| **G420E** | Runtime Implementation Plan (C.0) | Six-block plan + C.0.2 remediation | C.0 | D-RI-14 | **active** |

---

## Foundation Runtime gates (Foundation C)

| ID | Name | Objective | Foundation | Decision | Status |
|----|------|-----------|------------|----------|--------|
| **G423** | Universal Runtime complete | RT-0→RT-8 E2E; all G423-NN PASS | C | D-RI-05 | **planned** |
| **G424** | Studio MMM-native roundtrip | 28 designers → MMM API (17 core first) | D | D-UA-06 | **planned** |
| **G425** | Legacy elimination | Zero boot cache SSOT paths | E | D-PA-03 | **planned** |
| **G426** | Event Bus L1 production | DB-backed domain event transport | F | D-PA-17 | **planned** |
| **G427** | Generic Repository unified | GR CRUD via CRB field configs | G | D-MMM-04 | **planned** |
| **G428** | Low-code certification | Zero-code module publish→run | H | D-PA-08 | **planned** |
| **G429** | Marketplace v1 | .makpkg install/publish | I | D-MMM-11 | **planned** |
| **G430** | AI Gateway production | AICandidate → MMM batch pipeline | J | D-MMM-09 | **planned** |
| **G431** | Intelligence L10 ingestion | L10 event-driven analysis | K | D-PA-01 | **planned** |
| **G432** | ERP application package | First ERP-as-Application package | L | D-PA-08 | **planned** |
| **G423-01** | Bootstrap | M01 RT-0 orchestration | C.1 | D-RI-02 | **planned** |
| **G423-02** | Context | M02 immutable context | C.1 | D-RI-02 | **planned** |
| **G423-03** | Session | M03 auth/refresh | C.2 | D-RI-06 | **planned** |
| **G423-04** | Registry | M04 typed registry | C.2 | D-RI-02 | **planned** |
| **G423-05** | Loader | M05 resource load | C.3 | D-RI-04 | **planned** |
| **G423-06** | CRB Loader | M06 verify/hydrate RT-2→RT-3 | C.3 | D-RI-04 | **planned** |
| **G423-07** | Dependency Resolver | M07 acyclic init order | C.4 | D-RI-02 | **planned** |
| **G423-08** | Router | M08 route match + guards | C.4 | D-RI-02 | **planned** |
| **G423-09** | Permission Engine | M09 fail-closed RBAC | C.5 | D-RI-06 | **planned** |
| **G423-10** | Action Engine | M10 UEC dispatch | C.6 | D-RI-03 | **planned** |
| **G423-11** | Workflow Engine | M11 USM instance host | C.7 | D-RI-12 | **planned** |
| **G423-12** | Render Engine | M12 table + form adapters | C.8 | D-RI-11 | **planned** |
| **G423-13** | Expression Engine | M13 G302 adapter | C.9 | D-RI-10 | **planned** |
| **G423-14** | Formula Engine | M14 G302 adapter | C.9 | D-RI-10 | **planned** |
| **G423-15** | Validation Engine | M15 UEC validation stage | C.10 | D-RI-03 | **planned** |
| **G423-16** | Execution Engine | M16 UP-09 pipeline | C.11 | D-RI-03 | **planned** |
| **G423-17** | State Engine | M17 screen + USM state | C.12 | D-RI-02 | **planned** |
| **G423-18** | Plugin Engine | M18 manifest loader | C.13 | D-RI-02 | **planned** |
| **G423-19** | Connector Engine | M19 HTTP connector | C.14 | D-RI-03 | **planned** |
| **G423-20** | Service Locator | M20 DI container | C.5 | D-RI-02 | **planned** |
| **G423-21** | Cache | M21 CRB/scope cache | C.15 | D-RI-04 | **planned** |
| **G423-22** | Event Bus | M22 in-process stub | C.15 | D-RI-08 | **planned** |
| **G423-23** | Transaction Manager | M23 BE unit of work | C.16 | D-RI-06 | **planned** |
| **G423-24** | Observability | M24 trace/log/health | C.17 | D-RI-03 | **planned** |

Spec: [09-GATES.md](../runtime-implementation/09-GATES.md)

---

## Foundation & config engine gates (summary)

| Range | Name | Owner | Decision area | Script pattern | Status |
|-------|------|-------|---------------|----------------|--------|
| G00 | Functional smoke | Foundation | V7 | `gate-00-functional-smoke.mjs` | active |
| G31–G45 | ModeloBase1 certification | Foundation | D-002 | `gate-modelo-base1-cert.mjs` | active |
| G58–G72 | Paridade Empresas | Foundation | — | `gate-paridade-empresas.mjs` | active |
| G73–G85 | Promoção visual | Foundation | — | `gate-paridade-visual-promocao.mjs` | active |
| G86–G99 | Promoção componentes | Foundation | — | `gate-promocao-componentes.mjs` | active |
| G103–G108 | Generator ModeloBase1 | Foundation | D-003 | `gate-generator-modelobase1.mjs` | active |
| G109–G125 | Foundation governance | Foundation | D-001 | `gate-foundation-governance.mjs` | active |
| G127–G136 | SSOT propagation | Foundation | D-002 | `gate-ssot-propagation.mjs` | active |
| G137–G145 | Functional completion | Foundation | — | `gate-functional-completion.mjs` | active |
| G146–G154 | Foundation completion | Foundation | — | `gate-foundation-completion.mjs` | active |
| G156–G165 | Layout config V13 | Config engine | D-004 | `gate-layout-config-engine-v13.mjs` | active |
| G166–G175 | Field config V14 | Config engine | D-004 | `gate-field-config-engine-v14.mjs` | active |
| G176–G185 | Business boundary V15 | Config engine | — | `gate-business-boundary-v15.mjs` | active |
| G186–G195 | ModeloBase1 consolidation V15.1 | Foundation | — | `gate-modelobase1-consolidation-v151.mjs` | active |
| G196–G206 | Visual cert V15.2 | Foundation | — | `gate-modelobase1-visual-cert-v152.mjs` | active |
| G207–G217 | Validation config V16 | Config engine | D-004 | `gate-validation-config-engine-v16.mjs` | active |
| G218–G228 | Formula config V17 | Config engine | D-004 | `gate-formula-config-engine-v17.mjs` | active |
| G229–G239 | Event config V18 | Config engine | D-004 | `gate-event-config-engine-v18.mjs` | active |
| G240–G250 | Action config V19 | Config engine | D-004 | `gate-action-config-engine-v19.mjs` | active |
| G251–G261 | Workflow config V20 | Config engine | D-004 | `gate-workflow-config-engine-v20.mjs` | active |

Full supersession history: [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md)

---

## Superseded gate IDs

| Old ID | New ID | Reason | Date | Decision |
|--------|--------|--------|------|----------|
| G303 (deploy) | G401 | Namespace collision with Studio G303A/B | 2026-06-30 | D-062 |
| G304 (deploy) | G402 | Namespace collision with planned Intent Resolver G304 | 2026-06-30 | D-062 |

---

*Update this registry in the same PR as any new gate script or ID assignment.*
