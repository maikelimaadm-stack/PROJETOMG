# IFM — Platform Architecture Reassessment Report

**Mission ID:** Platform Architecture Reassessment (post IFM 1C)  
**Program:** Strategic planning — no product code  
**Date:** 2026-06-29  
**Status:** Complete  
**Decision:** D-027  
**Authority:** [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) L0–L7

---

## 0. Executive Summary

After certifying **MAK DATA PLATFORM (MDP-1 → MDP-5)**, this mission re-evaluates whether **MAK Studio (Program 2)** remains the correct next priority versus building **Platform Core (L3)** infrastructure first.

**Conclusion:** **MAK Studio remains the official next priority.** Full Platform Core infrastructure (Event Bus, Scheduler, Job Queue, Notification Engine, Background Workers, Integration Platform, Migration Platform, Package/Extension Loaders) **must not antecede** MAK Studio.

**Roadmap adjustment (D-027):** Add **Program 1E — Runtime Bridge** as a **parallel co-requisite** with Studio Phase 2.1 — CRB hydration into Foundation registries and environment-pin deploy activation. This is an **L4→L2 integration slice**, not a new L3 platform.

---

## 1. Fase 0 — Repository Health Protocol

| Check | Result | Evidence |
|-------|--------|----------|
| Open PRs | ⚠️ 1 open | PR #296 only — obsolete pre-design docs; branch deleted; **close blocked** (token lacks `closePullRequest`) |
| PR #302 merge | ✅ Already merged | `mergedAt: 2026-06-29T01:57:55Z`; commit `cd3e6726` on `main` |
| `main` synced | ✅ | `git pull origin main` → `cd3e6726` |
| Work branch | ✅ | `cursor/platform-architecture-reassessment-579b` from `main` |
| Build / Lint / Governance / CI | ✅ | See §8 Validation |
| 5 governance cycles | ✅ | `npm run verify:governance:cycles` — 5/5 |

**RHP note:** Repository health **≥** baseline. PR #296 requires manual close: https://github.com/maikelimaadm-stack/PROJETOMG/pull/296

---

## 2. MDP Completion State (Evidence)

| Phase | Status | Evidence |
|-------|--------|----------|
| MDP-1 Entity Dictionary | ✅ Frozen | `mdp_entity`, G137, D-022 |
| MDP-2 Data Dictionary | ✅ Complete | `mdp_field`, D-023 |
| MDP-3 Relationship Dictionary | ✅ Complete | `mdp_relationship`, D-024 |
| MDP-4 Metadata Registry | ✅ Frozen | `mdp_registry_*`, G140, D-025 |
| MDP-4.5 Architecture Review | ✅ Complete | [IFM-1C-MDP-4.5-ARCHITECTURE-REPORT.md](./IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md) |
| MDP-5 Publish Engine | ✅ Complete | `mdp_compiled_bundle`, G142, D-026 |

**Transitional debt (documented, not blocking Studio start):**

- Foundation `*ConfigRegistry.js` still boot cache — not yet hydrated from CRB (`IFM-1C-MDP-5-VERSIONING-PUBLICATION.md` §Next)
- Parallel caches: `cadastro-modules.registry.json`, `*ModuleMetadata.js`
- Legacy `CadCpsCampo*` tables remain

---

## 3. Master Architecture L0–L7 Audit

### 3.1 Layer maturity snapshot

| Layer | 2035 role | Code today | Blocks Studio? |
|-------|-----------|------------|----------------|
| L0 Data & Infra | PostgreSQL, Redis, storage | ✅ PostgreSQL + Supabase storage | No |
| L1 Domain Modules | Thin config + business rules | ✅ 2 runtime (`empresas`, `cadcps`) | No |
| L2 Foundation Runtime | ModeloBase1 + engines V13–V20 | ✅ Frozen V10.2 | No — **hydration gap only** |
| L3 Platform Core | Auth, tenant, RBAC, events, deploy | ⚠️ Partial (~6.5/10 PMI) | **No for Layout Studio** |
| L4 MDP | Metadata SSOT + publish | ✅ Complete (D-026) | No |
| L5 MAK Studio | MDP authoring UI | ❌ Not started | **Next target** |
| L6 Platform Services | Marketplace, AI, Sync, Knowledge | ❌ Not started | No |
| L7 Experience | Web, Desktop, Mobile, Offline | ⚠️ Web only | No |

### 3.2 Platform Core component audit (mission list)

| Component | Layer | Exists today | Must precede Studio? | Justification |
|-----------|-------|--------------|----------------------|---------------|
| **Platform Core (L3)** | L3 | Partial | **No (full build)** | Auth, tenant, RBAC proven in production (`backend/src/modules/auth/`). Studio writes MDP via existing JWT APIs. |
| **Runtime Engine** | L2 | ✅ Foundation frozen | **No new platform** | L2 exists. Gap = CRB hydration (Program 1E), not a separate runtime product. |
| **Deployment Engine** | L3/L4 | ⚠️ MDP-5 publish + pins | **Parallel slice only** | `mdp_environment_pin`, `mdp_publish_log` exist; runtime reload not wired. Co-requisite with Studio 2.1. |
| **Event Bus** | L3 | ❌ TD-010 | **No** | Client V18–V20 events exist; server bus needed for **Workflow Studio server-side** and AI — post Layout Studio MVP (IFM 1B A5). |
| **Scheduler** | L3 | ❌ | **No** | AI/automation dependency; not Layout Studio. |
| **Notification Engine** | L3 | ❌ | **No** | Workflow `notification` step is client-side today (`makWorkflowBuiltinSteps.js`). |
| **Job Queue** | L3 | ❌ | **No** | Background processing for scale — post 1K tenants; not Studio gate. |
| **Background Workers** | L3 | ❌ | **No** | Same as job queue. |
| **Tenant Manager** | L3 | ✅ | N/A | `cliente_id` on all models; multi-tenant E2E proven. |
| **Session Manager** | L3 | ✅ | N/A | JWT + `tokenDenylist.js` + `sessionCache.js`. |
| **Runtime Manager** | L3/L4 | ⚠️ Partial | **Parallel slice** | Environment pins in MDP-5; full runtime manager = Program 1E. |
| **Cache Manager** | L2/L3 | ⚠️ Partial | **No** | Preferences cache + engine registries; CRB replaces boot cache in 1E. |
| **Package Loader** | L6 | ❌ | **No** | Marketplace dependency (Program 3). |
| **Extension Loader** | L6 | ❌ | **No** | Marketplace dependency. |
| **Integration Platform** | L6 | ❌ | **No** | Integration **Studio** is L5 sub-phase; platform connectors post Marketplace. |
| **Migration Platform** | L6/Ops | ❌ Spec only | **No** | Customer migration at scale — post Studio + MDP field completeness. |

**Master Architecture alignment:** §L5 states Studio prerequisite = **MDP-4 minimum** (introspection + registry). MDP-5 exceeds minimum. §L3 event bus marked **future** — not Studio gate.

---

## 4. Impact Analysis (MAK 2035 vectors)

| Vector | Studio-first impact | If Platform Core first |
|--------|---------------------|------------------------|
| **IA** | Introspect API ready (`GET /api/mdp/introspect`); agents need event bus later | Delays metadata authoring; IA still blocked on Studio surfaces |
| **Marketplace** | MDP-5 snapshots + CRB format ready; packaging UI is Program 3 | Over-engineering L3 before `.makpkg` authoring path exists |
| **Offline** | CRB snapshots (`mdp_snapshot` types) ready; Sync Platform is Program 6 | No offline benefit without Studio-generated definitions |
| **Mobile / Desktop** | Same compile output — Studio accelerates layout variants in MDP | Infrastructure without design surface yields no user value |
| **Internacionalização** | Labels from MDP-2 Data Dictionary; i18n infra = Program 1F post-MDP-2 | i18n still needs dictionary-driven labels from Studio edits |
| **Múltiplos Base Templates** | `base_template_id` in MDP-5 schema; Template Registry future | Templates configured via MDP — Studio path |
| **Migração de clientes** | Migration Platform post-Studio; empresas pilot sufficient | Premature without published definition workflow |
| **Integrações externas** | Public API / webhooks = L3 future; Integration Studio = L5 later | Integration Platform without MDP-authored connectors = empty |
| **Escalabilidade 1K+ clients** | Multi-tenant proven; horizontal scale = Redis/APM post-revenue | Event bus helps but does not unlock Studio or revenue path |

---

## 5. Strategic Decision (D-027)

### 5.1 Official program sequence (updated)

```
Program 2 — MAK Studio (P1)          ← primary next mission
    ∥ parallel co-requisite
Program 1E — Runtime Bridge (P1)   ← CRB hydration + deploy pin activation
    ↘ background (non-blocking)
IFM 1B — A1/A2 legacy promotion (P1)
IFM 1B — A5 Event Bus MVP (P2)     ← after Studio 2.1 Layout MVP
Program 3 — Marketplace (future)
Program 4 — AI Platform (future)
Program 6 — Sync / Offline / Mobile / Desktop (future)
```

### 5.2 What does NOT change

- Foundation L2 remains **frozen** — no structural UI in Studio mission
- MDP-1..4 schemas remain **frozen** (D-025)
- Constitution priority: Estabilidade → Arquitetura → **Preparação Plataforma (MDP ✅)** → **MAK Studio**

### 5.3 Roadmap officially altered?

**Yes — minor refinement only.** Insert Program 1E Runtime Bridge; clarify Platform Core full build is **parallel/deferred**, not Studio blocker.

---

## 6. Mandatory Certification (10 Questions)

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | MAK Studio continua sendo a próxima prioridade? | **SIM** | MDP-5 complete (D-026); Master Architecture §L5 prerequisite met; [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) |
| 2 | Platform Core deve anteceder o Studio? | **NÃO (completo)** | Auth/tenant/RBAC production-ready; event bus/deploy full = parallel/deferred |
| 3 | Runtime Engine deve existir antes do Studio? | **NÃO (novo)** | L2 Foundation exists; **Runtime Bridge (1E)** parallel — not new engine |
| 4 | Integration Platform deve anteceder o Studio? | **NÃO** | L6; Integration Studio = L5 sub-phase post Layout Studio |
| 5 | Migration Platform deve anteceder o Studio? | **NÃO** | PMI §5.18 spec-only; customer migration post published definitions |
| 6 | Ordem atual do roadmap continua a melhor para MAK 2035? | **SIM, com refinamento** | MDP → Studio → Ecosystem unchanged; + Program 1E parallel |
| 7 | Repositório permanece saudável após merge das PRs? | **SIM** | #302 merged; #296 obsolete (manual close pending) |
| 8 | Build, Lint, CI e Governança verdes? | **SIM** | §8 Validation — all pass, 5 cycles |
| 9 | Roadmap deve ser oficialmente alterado? | **SIM (menor)** | D-027 — add Program 1E; defer full L3 before Studio |
| 10 | Briefing da próxima fase aprovada preparado? | **SIM** | [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) + [IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md) |

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Studio preview ≠ production | Program 1E — same `mdpCompileService` for draft/publish; hydrate registries from CRB |
| Studio bypasses MDP | Governance gate — Studio writes only `/api/mdp/*` |
| Event bus debt blocks Workflow Studio | Schedule IFM 1B A5 after Layout Studio MVP (Phase 2.2+) |
| PR #296 confusion | Manual close; content superseded by #297–#302 |

---

## 8. Validation Evidence

Executed on `main` @ `cd3e6726` (2026-06-29):

| Command | Result |
|---------|--------|
| `npm run build` | ✅ Pass |
| `npm run lint` | ✅ Pass |
| `npm run verify:governance` | ✅ Pass (G31–G142) |
| `npm run verify:ci` | ✅ Pass |
| `npm run verify:governance:cycles` | ✅ 5/5 cycles |

---

## 9. Document Updates

| Document | Change |
|----------|--------|
| [ROADMAP.md](./ROADMAP.md) | Program 2 official; Program 1E added; IFM 1C marked complete |
| [CURRENT-STATE.md](./CURRENT-STATE.md) | Reassessment verified; next program |
| [DECISIONS.md](./DECISIONS.md) | D-027 |
| [PLATFORM-MATURITY-INDEX.md](./PLATFORM-MATURITY-INDEX.md) | MDP, Versionamento, Publicação scores updated |
| [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md) | Mission entry |
| [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) | D-027 reference |
| [IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md](./IFM-PHASE-1E-RUNTIME-BRIDGE-BRIEF.md) | **New** — parallel co-requisite |

---

*Mission complete — architecture and planning only; zero product code changes.*
