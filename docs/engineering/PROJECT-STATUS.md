# Project Status

**Status:** Official — Single source of truth for project continuity  
**Version:** 1.0.0  
**Last updated:** 2026-06-30  
**Updated by:** Program 3.5A — Enterprise Intelligence Vision (D-060)  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); supersedes chat history

> **Rule:** Any AI or developer session must read this file (via [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md)) before starting work. Do not rely on prior chat context.

---

## Version & Release

| Field | Value |
|-------|-------|
| **Current version** | `0.4.0-rc.2` (`package.json`) |
| **Current release** | **`v0.4.0-RC2`** (pending owner tag on `36677dbf`) |
| **Current release candidate** | `v0.4.0-RC2` — Operational stabilization complete (Programs 2.3.X.0–X.4) |
| **Main branch HEAD** | Verify: `git rev-parse --short main` on latest pull · architecture merge **`2cdd5dda`** (PR #343) |

---

## Foundation Status

| Layer | Status |
|-------|--------|
| **Enterprise Foundation** (`framework/mak`) | **Frozen** V10.2.0 (2026-06-28) |
| **MAK Studio Foundation** (Programs 2.0–2.3.5) | **Frozen** — Decision **D-052** (2026-06-30) |
| **MDP (1C)** | **Complete & frozen** — D-025, D-026 |
| **Runtime Bridge Phase 1** | **Complete** — D-030 |

**Foundation Freeze (Studio):** No new Foundation layers until Program 2.3.6 (Computation Engine) is certified. See [D-052](./DECISIONS.md#d-052--studio-foundation-freeze-program-23x).

---

## Architecture Level

| Field | Value |
|-------|-------|
| **Current architecture level** | **L5 Experience Authoring** — MAK Studio operational (Shell + Layout + Field designers) |
| **Master Architecture** | v1.0.0 — [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) |
| **Studio Architecture** | v1.15.0 — [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) |
| **Current architecture stage** | L5 Studio Intelligence — Intent Resolver next · L6 Enterprise Intelligence Vision frozen (D-060) |

---

## Program Tracking

| Field | Value |
|-------|-------|
| **Current program** | **Program 3 — Studio Intelligence** |
| **Last completed program** | **Program 3.5A** — Enterprise Intelligence Vision (architecture only, D-060) |
| **Last certified implementation** | **Program 3.2** — Formula Builder (G303A) |
| **Last decision** | **D-060** — Enterprise Intelligence Vision |
| **Roadmap position** | **Unchanged** — Business Intent Resolver implementation next |
| **Next official mission** | **Program 3.5** — Business Intent Resolver (implementation) · then **Business Computed Fields** |

---

## Documental Cycle Closure (Programs 3.3 + 3.4)

| Item | Status |
|------|--------|
| **Program 3.3** — Business Computation Layer (D-058) | ✅ On `main` (PR #342) |
| **Program 3.4** — Business Intent Authoring (D-059) | ✅ On `main` (PR #343) |
| **PR #343** | ✅ Merged — referência definitiva do ciclo 3.3+3.4 |
| **PR #342** | ✅ Merged · **substituída por #343** para governança · branch removida |
| **Branches removidas** | `cursor/business-computation-layer-0b52` · `cursor/business-intent-authoring-0b52` |
| **PRs documentais pendentes (3.3/3.4)** | **Nenhuma** |
| **Próximo passo** | **Program 3.5** — Business Intent Resolver (implementação) |

**Visão Intelligence (3.5A) na `main` (após merge):** [MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md](../architecture/MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) · [DOCUMENT-MAP § L1b](./DOCUMENT-MAP.md#l1b--enterprise-intelligence-vision-program-35a-d-060)

**Arquitetura Studio (3.3+3.4):** [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) · [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md)

---

## Frozen Programs (do not re-implement)

Programs **2.0 through 2.3.5** and **2.3.X** are **complete and frozen** in `main`. Changes require explicit architectural review and new Decision record.

| Range | Scope |
|-------|-------|
| 2.0 – 2.0.9 | Studio SDK, Design System, Events, Governance, UX |
| 2.1A – 2.1B | Shell Prototype + Production |
| 2.2 – 2.2.7 | Layout Studio, Core, SOM, Editor |
| 2.3 – 2.3.5 | Field Studio, Expression, Dependency, Type System, Evaluation |
| 2.3.X | Operational stabilization — RC-001, G303/G304, platform hardening, production recovery |

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| **`main`** | Production truth — merge target; Railway/Vercel deploy from here |
| **`cursor/<mission>-579b`** | Feature/mission branches (Cloud Agent convention) |
| **Tags `v*`** | Release candidates and releases (`v0.4.0-RC1` current) |

**Rules:** Never commit directly to `main` without PR. One program per PR when possible. Run RHP before merge ([PIP §10](./PLATFORM-IMPLEMENTATION-PROTOCOL.md#10-repository-health-protocol-rhp)).

---

## Studio Status

| Component | Gate | Status |
|-----------|------|--------|
| SDK + Registries | G279–G284 area | ✅ |
| Design System | G285 area | ✅ |
| Event Architecture | — | ✅ |
| Shell Prototype | G286 | ✅ |
| Universal Components | G288 | ✅ |
| Domain Engine | G289 | ✅ |
| Contribution Engine | G290 | ✅ |
| Shell Production | G287 | ✅ |
| Layout Studio | G291 | ✅ |
| Core Engine | G293 | ✅ |
| Object Model (SOM) | G294 | ✅ |
| Editor Engine | G295 | ✅ |
| Field Studio | G296 | ✅ |
| Smart Authoring | G297 | ✅ |
| Expression Engine | G298 | ✅ |
| Dependency Engine | G299 | ✅ |
| Type System | G300 | ✅ |
| Evaluation Engine | G301 | ✅ |
| **Computation Engine** | G302 | ✅ |
| **Formula Builder** | G303A | ✅ |

**Routes:** `/studio`, `/studio/prototype`, `/studio/empresas/layout`, `/studio/empresas/field`, `/studio/empresas/formula`

---

## Runtime Status

| Component | Status |
|-----------|--------|
| **Backend (Railway)** | `https://projetomg-production.up.railway.app` — ✅ deploy green · MDP/CADCPS operational |
| **Frontend (Vercel)** | `https://projetomg.vercel.app` |
| **Runtime Bridge Phase 1** | ✅ CRB hydration (empresas pilot) — D-030 |
| **Runtime Bridge Phase 2** | Pending (environment pin → reload) |
| **Certified runtime modules** | `empresas`, `cadcps` |

---

## MDP Status

| Phase | Status |
|-------|--------|
| MDP-0 Architecture Spec | ✅ |
| MDP-1 Entity Dictionary | ✅ |
| MDP-2 Data Dictionary | ✅ |
| MDP-3 Relationship Dictionary | ✅ |
| MDP-4 Metadata Registry | ✅ Frozen |
| MDP-4.5 Architecture Review | ✅ |
| MDP-5 Versioning & Publication | ✅ — IFM 1C complete |

---

## Governance Status

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | Pass |
| Lint | `npm run lint` | Pass |
| Typecheck (governance) | `npm run typecheck:governance` | Pass |
| Full governance | `npm run verify:governance` | Pass |
| CI mirror | `npm run verify:ci` | Pass |
| Stability cycles | `npm run verify:governance:cycles` | 5/5 pass |
| CI workflow | `.github/workflows/foundation-governance.yml` | Green on `main` |
| Deploy pipeline gates | G303 + G304 | ✅ CI + RULE-DEPLOY-002 |

---

## Gates Reference

| Category | Range | Last gate |
|----------|-------|-----------|
| Foundation / module | G31–G142 | — |
| Config engines V13–V20 | G156–G261 | G261 |
| Studio architecture | G279–G284 | G284 |
| Studio programs | G285–G303A | **G303A** (Formula Builder) |
| **Next expected** | Business Computed Fields (impl) | Gate G303B planned |

Full gate scripts: `scripts/gate-*.mjs` · invoked via `npm run gate:capabilities`

---

## Repository Health (last verified 2026-06-30)

| Item | Status |
|------|--------|
| `main` synchronized | ✅ |
| Open PRs | #296 (obsolete), #307 (deferred/conflict) — close manually |
| Superseded Studio branches | Deleted from remote |
| Local stale branches | ~63 `cursor/*579b` — safe to prune locally |
| Working tree | Clean on `main` |

---

## Mandatory Documentation Links

| Priority | Document | Path |
|----------|----------|------|
| 1 | AI entry | [README_AI.md](../../README_AI.md) |
| 2 | Startup guide | [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md) |
| 3 | Continuity protocol | [CONTINUITY-PROTOCOL.md](./CONTINUITY-PROTOCOL.md) |
| 4 | Document map | [DOCUMENT-MAP.md](./DOCUMENT-MAP.md) |
| 5 | Living state | [CURRENT-STATE.md](./CURRENT-STATE.md) |
| 6 | Roadmap | [ROADMAP.md](./ROADMAP.md) |
| 7 | Decisions | [DECISIONS.md](./DECISIONS.md) |
| 8 | Constitution | [docs/constitution/](../constitution/) |
| 9 | Studio architecture | [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) |
| 10 | Vision backlog | [MAK-2040-VISION-BACKLOG.md](../vision/MAK-2040-VISION-BACKLOG.md) |
| 11 | Dev commands | [AGENTS.md](../../AGENTS.md) |

---

*This document must be updated at the end of every mission that changes program status, version, release, or roadmap position.*
