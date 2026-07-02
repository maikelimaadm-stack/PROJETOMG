# ROADMAP — MAK Gestão Platform

**Status:** Living document  
**Last updated:** 2026-06-30 (Program 3.5C — Enterprise Architecture Remediation — D-062)
**Horizon:** Technical roadmap aligned with [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md)

> **SSOT for "next mission":** [PROJECT-STATUS.md](./PROJECT-STATUS.md). This roadmap documents **platform-wide sequence and phases** — see [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md).
>
> **Not the MMM roadmap:** Universal Meta Model implementation phases live in **[docs/meta-model/ROADMAP.md](../meta-model/ROADMAP.md)** (Programs 4.02–4.16+).

---

## Guiding Principle

Priority order for all work:

1. **Estabilidade**
2. **Arquitetura**
3. **Correções**
4. **Preparação da Plataforma**
5. **MAK Studio**
6. **Novos módulos**

**D-028 — Long-term impact gate (mandatory from 2026-06-29):** Before any implementation, every mission must pass the [10-question enterprise impact checklist](./IFM-D028-ENTERPRISE-READINESS-AUDIT-REPORT.md#7-d-028-long-term-impact-gate--assessment-of-current-next-missions). If any answer is uncertain → stop and register architectural review.

**D-029 — Engineering Principles (mandatory from 2026-06-29):** All implementation must comply with [MAK-ENGINEERING-PRINCIPLES.md](../architecture/MAK-ENGINEERING-PRINCIPLES.md) — 18 permanent principles.

**Enterprise evolution map:** [Program 1F — Enterprise Readiness](#program-1f--enterprise-readiness-documentation-only) (not implemented now; informs all future decisions).

---

## Phase 0 — Sistema Operacional ✅ Complete

| Item | Status |
|------|--------|
| Constitution (`docs/constitution/`) | ✅ v1.0.0 (11 docs) |
| Permanent Governance Directive (doc 11) | ✅ |
| README_AI.md | ✅ |
| Engineering docs (`docs/engineering/`) | ✅ Certified Mission 0.2 |
| Documentation certification | ✅ `DOCUMENTATION-CERTIFICATION.md` |
| **Master Architecture** | ✅ `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` v1.0.0 (D-014) |
| **Engineering Principles** | ✅ `docs/architecture/MAK-ENGINEERING-PRINCIPLES.md` v1.0.0 (**D-029**) |
| **Platform Language Standard** | ✅ `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` v1.0.0 (D-015) |
| **Platform Maturity Index** | ✅ `docs/engineering/PLATFORM-MATURITY-INDEX.md` v1.3.0 (D-016, D-017, D-027, D-028 ERI) |
| **Platform Implementation Protocol** | ✅ `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` v1.2.0 (D-018, D-019, D-028) |

**Phase 0 (Programs 0–0.7) — structural OS + protocol: ✅ Complete.**  
**Implementation era begins** — all missions follow [PIP](./PLATFORM-IMPLEMENTATION-PROTOCOL.md) + [RHP](./PLATFORM-IMPLEMENTATION-PROTOCOL.md#10-repository-health-protocol-rhp).

---

## Official Next Program — Program 2 (MAK Studio) + Program 1E (parallel)

**Programa 1 — Integridade e Fundação de Metadados (IFM) — ✅ Complete (IFM 1C)**

Strategic decisions **D-011**, **D-012**, **D-013**, **D-026**, **D-027**: IFM 1C (MDP) complete. **MAK Studio = Program 2** is the official next priority.

| Sub-phase | Roadmap refs | Goal | Status |
|-----------|--------------|------|--------|
| **1A Estabilidade** | S3–S4 | Supply chain, DDL predictability | S3 ✅; S4 pending |
| **1B Arquitetura** | A1–A5 | Legacy promotion, generic naming, event bus | Background — non-blocking Studio |
| **1C MAK DATA PLATFORM** | MDP-0→5 | Metadata nucleus | **✅ Complete** |
| **1D Governança CI** | 1D-1 | V13–V20 gates in CI | ✅ |
| **1E Runtime Bridge** | 1E-1 | CRB hydration → Foundation registries | ✅ **Phase 1 complete** — [Cert](./IFM-PHASE-1E-CERTIFICATION-REPORT.md) |
| **1E Runtime Bridge** | 1E-2 | Environment pin → runtime reload hook | P1 — next slice |

**Program 2 — MAK Studio** — [Architecture](../architecture/MAK-STUDIO-ARCHITECTURE.md) · [Brief](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) · [2.1 Layout Studio](./IFM-PHASE-2.1-LAYOUT-STUDIO-BRIEF.md)  
**Reassessment:** [IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md](./IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md) (D-027)

**Spec:** [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)  
**Execution roadmap (authoritative):** [IFM-PHASE-1-TECHNICAL-ROADMAP.md](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)

---

## Phase 1D — Governança CI (IFM)

| ID | Item | Priority | Blocks |
|----|------|----------|--------|
| **1D-1** | V13–V20 gates in CI | **P1 — mission #2** | TD-013; protects MDP work |

*Full mission sequence: [IFM-PHASE-1-TECHNICAL-ROADMAP.md § Part 2](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)*

---

## Phase 1 — Estabilidade (IFM Phase 1A)

| ID | Item | Priority | Status |
|----|------|----------|--------|
| S2 | Sync backend `cadastro-modules.registry.json` | ~~P1~~ | ✅ Baseline recovery 2026-06-28 |
| **S3** | npm audit fix (frontend) | ~~P1~~ | ✅ IFM 1A-S3 — [Report](./IFM-1A-S3-CERTIFICATION-REPORT.md) |
| S4 | Consolidate DDL path (Prisma-only primary) | P2 | After MDP-1 |

**Removed:** S1 Produto migration (obsolete — PR #285).

---

## Phase 2 — Arquitetura (IFM Phase 1B)

| ID | Item | Priority |
|----|------|----------|
| A1 | Deprecate `framework/cadastro/` via promotion | P1 |
| A2 | Decouple Empresas nomenclature in ModeloBase1 | P1 |
| A3 | Decompose `MakCadastroTable.jsx` (~2.4K LOC) | P2 |
| A4 | Remove deprecated aliases (Empresas*) | P3 |
| A5 | Backend domain event bus (Events/Workflow prep) | P2 |

---

## Phase 3 — MAK DATA PLATFORM (IFM Phase 1C)

| Phase | ID | Deliverable | Spec |
|-------|-----|-------------|------|
| 1C.0 | **MDP-0** | Architecture specification | ✅ [Architecture Spec](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) |
| 1C.1 | MDP-1 | Entity Dictionary — schema + API + registry sync | ✅ Spec §3 |
| 1C.2 | MDP-2 | Data Dictionary — evolve CADCPS to all fields | ✅ Spec §4 |
| 1C.3 | MDP-3 | Relationship Dictionary — schema + API | ✅ Spec §5 |
| 1C.4 | MDP-4 | Metadata Registry + introspection + compile API | ✅ Spec §6 |
| 1C.4.5 | MDP-4.5 | Final architecture review + freeze | ✅ [Report](./IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md) |
| 1C.5 | MDP-5 | Versioning + publish + snapshot engine | ✅ [Report](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md) |

Definitive spec: [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md)  
Engineering summary: [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md)

---

## Phase 4 — MAK Studio (Program 2 — **Official Next**)

Prerequisite: **IFM 1C complete** ✅ · **Program 1E Phase 1 complete** ✅ · **Program 2.0 Architecture complete** ✅ (D-031)

Architecture: [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **2.0** | Studio foundation architecture | ✅ Complete (D-031) |
| **2.0.5** | Studio SDK + registries | ✅ Complete (D-032) |
| **2.0.6** | Design System Foundation | ✅ Complete (D-033) |
| **2.0.7** | Studio Event Architecture | ✅ Complete (D-034) |
| **2.0.8** | Studio Architecture Governance | ✅ Complete (D-035) |
| **2.0.9** | Studio UX Framework (doc) | ✅ Complete (D-036) — **Last pre-Shell doc mission** |
| **2.1A** | Studio Shell Prototype (visual, mock) | ✅ Complete (D-037) |
| **2.1A.5** | Universal Studio Components | ✅ Complete (D-038) |
| **2.1A.6** | Studio Domain Engine | ✅ Complete (D-039) |
| **2.1A.7** | Studio Contribution Engine | ✅ Complete (D-040) — **Foundation closed** — [Report](./IFM-PROGRAM-2.1A.7-CERTIFICATION-REPORT.md) |
| **2.1B** | Studio Shell Production (auth + MDP + persistence) | ✅ Complete (D-041) — [Report](./IFM-PROGRAM-2.1B-CERTIFICATION-REPORT.md) |
| **2.2** | Layout Studio Engine (empresas pilot) | ✅ Complete (D-042) — [Report](./IFM-PROGRAM-2.2-CERTIFICATION-REPORT.md) |
| **2.2.5** | Studio Core Engine (shared designer foundation) | ✅ Complete (D-043) — [Report](./IFM-PROGRAM-2.2.5-CERTIFICATION-REPORT.md) |
| **2.2.6** | Studio Object Model (SOM) | ✅ Complete (D-044) — [Report](./IFM-PROGRAM-2.2.6-CERTIFICATION-REPORT.md) |
| **2.2.7** | Studio Editor Engine | ✅ Complete (D-045) — [Report](./IFM-PROGRAM-2.2.7-CERTIFICATION-REPORT.md) |
| **2.3** | Field Studio Phase 1 | ✅ Complete (D-046) — [Report](./IFM-PROGRAM-2.3-CERTIFICATION-REPORT.md) |
| **2.3.1** | Field Studio Smart Authoring | ✅ Complete (D-047) — [Report](./IFM-PROGRAM-2.3.1-CERTIFICATION-REPORT.md) |
| **2.3.2** | Studio Expression Engine | ✅ Complete (D-048) — [Report](./IFM-PROGRAM-2.3.2-CERTIFICATION-REPORT.md) |
| **2.3.3** | Studio Dependency Engine | ✅ Complete (D-049) — [Report](./IFM-PROGRAM-2.3.3-CERTIFICATION-REPORT.md) |
| **2.3.4** | Studio Type System | ✅ Complete (D-050) — [Report](./IFM-PROGRAM-2.3.4-CERTIFICATION-REPORT.md) |
| **2.3.5** | Studio Evaluation Engine | ✅ Complete (D-051) — [Report](./IFM-PROGRAM-2.3.5-CERTIFICATION-REPORT.md) |
| **2.3.X** | Repository Stabilization + Foundation Freeze | ✅ Complete (D-052) — [Report](./IFM-PROGRAM-2.3.X-REPOSITORY-STABILIZATION-REPORT.md) · **Release `v0.4.0-RC1`** |
| **2.3.Y** | Project Transition & Continuity | ✅ Complete (D-053) — [Report](./IFM-PROGRAM-2.3.Y-CONTINUITY-CERTIFICATION-REPORT.md) |
| ~~**2.3.6**~~ | ~~Studio Computation Engine~~ | **Superseded → Program 3.0.5 + 3.1** — [SUPERSESSION-REGISTER](./SUPERSESSION-REGISTER.md) |

---

## Phase 4B — Program 3 Studio Intelligence (current track)

Architecture: [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) · Registry: [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **3.0.5** | Studio Computation Architecture | ✅ Complete (D-054) |
| **3.1** | Computation Engine (G302) | ✅ Complete (D-055) |
| **3.2** | Formula Builder (G303A) | ✅ Complete (D-056) |
| **3.1.5** | Enterprise Platform Vision | ✅ Complete (D-057) |
| **3.3** | Business Computation Layer | ✅ Complete docs (D-058) |
| **3.4** | Business Intent Authoring | ✅ Complete docs (D-059) |
| **3.5A** | Enterprise Intelligence Vision | ✅ Complete docs (D-060) |
| **3.5B** | Architecture Consolidation Audit | ✅ Complete (D-061) |
| **3.5C** | Architecture Remediation | ✅ Complete (D-062) — **ARCHITECTURE CONSOLIDATED** |
| **3.6** | Business Derivation Architecture | ✅ Complete docs (D-063) |
| **3.6.5** | Business Intent Resolver Architecture | ✅ Complete docs (D-064) |
| **3.6.8** | Business Language Architecture | ✅ Complete docs (D-065) |
| **3.6.9** | Enterprise Digital Organization Architecture | ✅ Complete docs (D-066) — **final structural architecture** |
| **3.7** | Business Intent Resolver (Implementation) | ✅ Complete (D-067, G305) |
| **3.8** | Business Computed Fields | ✅ Complete (D-068, G306) |
| **3.9** | Business Workflow | **Next** |

| Studio | Prerequisite | Status |
|--------|--------------|--------|
| Layout Studio | V13 + introspect + compile API + Studio Shell Production | ✅ **2.2 complete** |
| Field Studio | Smart Authoring 2.3.1 + Core/Editor/SOM | ✅ **2.3.1 complete** |
| Table Studio | Preferences + column metadata | Not started |
| Formula/Validation Studio | V16–V17 engines | Not started |
| Workflow/Automation Studio | V18–V20 + backend events | Not started |
| Permission Studio | RBAC model externalized | Not started |
| Deploy pipeline | Generator + versioning | Not started |

---

## Phase 5 — Novos Módulos

After **MDP-4** (Metadata Registry + introspection API):

- All new cadastro modules via `npm run generate:module`
- Follow `empresas` reference factory or `cadcps` domain-runtime exception pattern
- Complex runtime only with formal exception (cadcps model)

**Removed:** marcas/produtos minimal factory (modules deleted PR #285).

---

## Phase 1E — Runtime Bridge (Parallel — D-027)

| ID | Item | Priority | Status |
|----|------|----------|--------|
| **1E-1** | CRB hydration → Foundation registries (empresas pilot) | **P1** | ✅ Complete (D-030) |
| **1E-2** | Environment pin → runtime reload hook | P1 | Pending |

Brief: [IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md) · Certification: [IFM-PHASE-1E-CERTIFICATION-REPORT.md](./IFM-PHASE-1E-CERTIFICATION-REPORT.md)

---

## Program 1F — Enterprise Readiness (Documentation Only)

**Status:** Documented — **NOT implemented now**  
**Decision:** D-028  
**Purpose:** Map all evolution required to operate MAK Gestão as a **global enterprise platform** (10K+ clients, hundreds of modules, multi-country, Marketplace, IA, Offline) over the next 20 years.

**Does NOT block:** Program 2 (MAK Studio), Program 1E (Runtime Bridge).  
**Tracked by:** [Enterprise Readiness Index (ERI)](./PLATFORM-MATURITY-INDEX.md#33-enterprise-readiness-index-eri) in PMI.

### 1F.1 — Globalization Platform

| Scope | Notes |
|-------|-------|
| Internacionalização (i18n) | Runtime locale resolution; builds on MDP-2 label tables |
| Localização (l10n) | Regional formats, RTL, plural rules |
| Idiomas | Tenant/user locale preferences |
| Países | Country registry + tenant default |
| Fusos horários | UTC storage + tenant TZ display |
| Calendários | Fiscal/business calendars per region |
| Moedas | Multi-currency fields + display |
| Formatos regionais | Date, number, address formats |
| Impostos | Tax rule hooks (domain + platform) |
| Documentos fiscais | NF-e and regional doc templates (future) |

*Absorbs prior "1E-1 i18n infrastructure" from IFM technical roadmap.*

### 1F.2 — Enterprise Security

| Scope | Notes |
|-------|-------|
| LGPD / GDPR | Data subject rights, consent, retention |
| Criptografia | At-rest + in-transit standards |
| MFA | Multi-factor authentication |
| Auditoria | Full platform audit trail (MDP + business) |
| Device Management | Trusted devices, session binding |
| Secrets | Vault pattern, no plaintext in env |
| Rotação de chaves | JWT, API keys, encryption keys |
| Sessões globais | Cross-region session invalidation |
| Zero Trust | Service-to-service auth, least privilege |

### 1F.3 — Observability Platform

| Scope | Notes |
|-------|-------|
| Logs estruturados | JSON logs, correlation IDs |
| Tracing distribuído | OpenTelemetry / W3C trace context |
| Métricas | Prometheus-compatible counters/histograms |
| APM | End-to-end request tracing |
| Dashboards | Platform + tenant views |
| Alertas | SLO-based alerting |
| Tenant Health | Per-tenant error/latency saturation |
| Runtime Health | CRB hydration, engine registry status |
| Studio Health | Authoring errors, publish failures |
| Publish Health | CRB integrity, pin drift, rollback events |

### 1F.4 — Scale Platform

| Scope | Notes |
|-------|-------|
| Redis | Cache, rate limit, session denylist at scale |
| Cache distribuído | CRB + introspect cache tiers |
| Filas | Job queue (publish, compile, migration) |
| Workers | Background processing |
| Cluster | Horizontal API scaling |
| Auto Scaling | Load-based replica scaling |
| Rate Limiting | Per-tenant + global limits |
| Balanceamento | Load balancer + health checks |
| Performance contínua | Regression budgets in CI |

*Partial overlap with IFM 1B A5 (Event Bus) — A5 remains near-term; 1F.4 is full scale tier.*

### 1F.5 — Disaster Recovery

| Scope | Notes |
|-------|-------|
| Backup | Automated DB + object storage backup |
| Restore | Tested restore procedures |
| Snapshots | MDP snapshot retention policy |
| Runbooks | Operational DR documentation |
| Failover | Multi-AZ / region failover design |
| Recovery Tests | Scheduled chaos/recovery drills |

*Absorbs prior "1F-1 Backup/DR runbook" from IFM technical roadmap.*

### 1F.6 — Migration Platform

Architecture for migrating **all platform artifacts** — not database-only:

| Artifact type | Mechanism |
|---------------|-----------|
| Dados | Tenant export/import |
| Layouts, workflows, dashboards, relatórios | MDP registry + CRB bundles |
| Permissões | MDP permission registry entries |
| Templates | Base template + theme definitions |
| Campos | MDP Data Dictionary |
| Publicações | MDP-5 version chain |
| Bundles / snapshots | `.makpkg` + `mdp_snapshot` |
| Preferências | User overlay merge rules |
| ERP externo | Import adapters (future ISV path) |

---

## Phase 6 — Future Platforms (Programs 3–6)

| Platform | Dependency | Precedes Studio? |
|----------|------------|------------------|
| Marketplace | MDP bundles + versioning ✅ | **No** — **Program 6** (future; was labeled "Program 3" pre-D-062) |
| Knowledge Platform | MDP entity links | **No** — Program 5 |
| AI Platform | MDP introspect ✅ + Event Bus (A5) | **No** — future program (post-MMM); see [meta-model/ROADMAP.md](../meta-model/ROADMAP.md) |
| Offline / Sync | MDP snapshots ✅ + Sync Platform | **No** — Program 6 |
| Integration Platform | Public API + Marketplace | **No** |
| Migration Platform | MDP versioning ✅ + tenant tooling | **No** |
| Platform Event Bus (A5) | MDP-4 ✅ | **No** — after Studio Layout MVP |

---

## Anti-Roadmap (Will Not Do)

- Rewrite Foundation without Amendment Process
- Imperative cadastro pages per module
- Parallel config engines outside V13–V20 pattern
- MAK Studio as separate UI stack

---

*Update when priorities shift. Cross-reference [NEXT-SPRINT.md](./NEXT-SPRINT.md) for active work.*
