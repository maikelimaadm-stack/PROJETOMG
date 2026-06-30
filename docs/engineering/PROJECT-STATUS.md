# Project Status

**Status:** Official — Single source of truth for project continuity  
**Version:** 1.0.0  
**Last updated:** 2026-06-30  
**Updated by:** Program 3.6.5 — Business Intent Resolver Architecture (D-064)  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); supersedes chat history

> **Rule:** Any AI or developer session must read this file (via [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md)) before starting work. Do not rely on prior chat context.

---

## Platform State

| Field | Value |
|-------|-------|
| **Architecture state** | **ARCHITECTURE CONSOLIDATED** (D-062) |
| **Consolidation baseline** | Program 3.5C complete — all P0 debt resolved |
| **Implementation authorized** | **Yes** — from consolidated baseline |

---

## Version & Release

| Field | Value |
|-------|-------|
| **Current version** | `0.4.0-rc.2` (`package.json`) |
| **Current release** | **`v0.4.0-RC2`** (pending owner tag) |
| **Current release candidate** | `v0.4.0-RC2` — Operational stabilization complete (Programs 2.3.X.0–X.4) |
| **Main branch HEAD** | Verify: `git rev-parse --short main` on latest pull |

---

## Foundation Status

| Layer | Status |
|-------|--------|
| **Enterprise Foundation** (`framework/mak`) | **Frozen** V10.2.0 (2026-06-28) |
| **MAK Studio Foundation** (Programs 2.0–2.3.5) | **Frozen** — Decision **D-052** |
| **MDP (1C)** | **Complete & frozen** — D-025, D-026 |
| **Runtime Bridge Phase 1** | **Complete** — D-030 |

**Foundation Freeze (Studio):** Frozen per **D-052** — Computation Engine certified (**G302**, Program 3.1).

**Governance rule (D-062):** All new D-xxx, G-xxx, Programs, and SSOT docs must register in [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) before merge.

---

## Architecture Level

| Field | Value |
|-------|-------|
| **Current architecture level** | **L5 Experience Authoring** + **L6 Vision documented** |
| **Master Architecture** | v1.0.0 — [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) |
| **Studio Architecture** | v1.15.0 — [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) |
| **Current architecture stage** | **ARCHITECTURE CONSOLIDATED** — Resolver Architecture defined (D-064); Intent Resolver **Implementation** next (3.7) |

---

## Program Tracking

| Field | Value |
|-------|-------|
| **Current program** | **Program 3 — Studio Intelligence** |
| **Last completed program** | **Program 3.6.5** — Business Intent Resolver Architecture (D-064, docs) |
| **Last certified implementation** | **Program 3.2** — Formula Builder (G303A) |
| **Last decision** | **D-064** — Business Intent Resolver Architecture |
| **Roadmap position** | **Program 3.7 — Business Intent Resolver Implementation** (G304) |
| **Next official mission** | **Program 3.7** — Business Intent Resolver Implementation (G304) · uses [Resolver Architecture](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) + [Derivation Architecture](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |

Full program registry: [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md)

---

## Documental Cycle (Programs 3.x)

| Item | Status |
|------|--------|
| **3.3** Business Computation (D-058) | ✅ |
| **3.4** Intent Authoring (D-059) | ✅ |
| **3.5A** Intelligence Vision (D-060) | ✅ |
| **3.5B** Consolidation Audit (D-061) | ✅ |
| **3.5C** Architecture Remediation (D-062) | ✅ |
| **3.6** Business Derivation Architecture (D-063) | ✅ |
| **3.6.5** Business Intent Resolver Architecture (D-064) | ✅ |
| **Próximo passo** | **Program 3.7** — Business Intent Resolver Implementation (G304) |

**Registries:** [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) · [GATE-REGISTRY.md](./GATE-REGISTRY.md) · [SSOT-REGISTRY.md](./SSOT-REGISTRY.md)

---

## Frozen Programs (do not re-implement)

Programs **2.0 through 2.3.5** and **2.3.X** are **complete and frozen** in `main`.

| Range | Scope |
|-------|-------|
| 2.0 – 2.3.5 | Studio SDK through Evaluation Engine |
| 2.3.X | Stabilization — RC-001, **G401/G402** deploy, hardening |
| 2.3.Y | Transition & continuity |

---

## Studio Status

| Component | Gate | Status |
|-----------|------|--------|
| Expression → Evaluation stack | G298–G301 | ✅ |
| **Computation Engine** | G302 | ✅ |
| **Formula Builder** | G303A | ✅ |
| **Intent Resolver** | **G304** | ⏳ **Program 3.7 — next implementation** |
| Business Computation impl | G303B | planned |

**Routes:** `/studio`, `/studio/prototype`, `/studio/empresas/layout`, `/studio/empresas/field`, `/studio/empresas/formula`

---

## Governance Status

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | Pass |
| Lint | `npm run lint` | Pass |
| Full governance | `npm run verify:governance` | Pass |
| CI mirror | `npm run verify:ci` | Pass |
| Stability cycles | `npm run verify:governance:cycles` | 5/5 pass |
| Deploy pipeline gates | **G401 + G402** | ✅ CI + RULE-DEPLOY-002 |

---

## Gates Reference

| Category | Range | Last active |
|----------|-------|-------------|
| Studio programs | G285–G303A | **G303A** |
| Deploy pipeline | **G401–G402** | **G402** |
| **Next expected** | Intent Resolver | **G304** (exclusive — D-062) |

SSOT: [GATE-REGISTRY.md](./GATE-REGISTRY.md)

---

## Mandatory Documentation Links

| Priority | Document | Path |
|----------|----------|------|
| 1 | AI entry | [README_AI.md](../../README_AI.md) |
| 2 | Project status | This file |
| 3 | Governance registry | [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) |
| 4 | Gate registry | [GATE-REGISTRY.md](./GATE-REGISTRY.md) |
| 5 | Remediation report | [ARCHITECTURE-REMEDIATION-REPORT.md](./ARCHITECTURE-REMEDIATION-REPORT.md) |
| 6 | Intent Authoring arch | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| 7 | **Business Derivation Architecture** | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |

---

*This document must be updated at the end of every mission that changes program status, version, release, or roadmap position.*
