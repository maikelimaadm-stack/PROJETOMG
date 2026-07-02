# Project Status

**Status:** Official — Single source of truth for project continuity  
**Version:** 1.0.0  
**Last updated:** 2026-06-30  
**Updated by:** Foundation B.5 — Platform Behavior Specification (D-PB-01+)  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); supersedes chat history

> **Rule:** Any AI or developer session must read this file (via [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md)) before starting work. Do not rely on prior chat context.

---

## Platform State

| Field | Value |
|-------|-------|
| **Architecture state** | **THREE PILLARS COMPLETE** — meta-model + platform-architecture + platform-behavior (B.5) |
| **Implementation phase** | **Foundation C authorized** (D-PB-21) — Runtime Bridge only |
| **Implementation authorized** | **Foundation C — Runtime Bridge** — [18-FOUNDATION-ROADMAP.md](../platform-architecture/18-FOUNDATION-ROADMAP.md) · [25-AUDIT-FINAL.md](../platform-behavior/25-AUDIT-FINAL.md) |
| **Platform architecture SSOT** | [docs/platform-architecture/README.md](../platform-architecture/README.md) |
| **Platform behavior SSOT** | [docs/platform-behavior/README.md](../platform-behavior/README.md) |
| **Primary user surface** | **BOS home (`/`)** — [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](../architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md) · validated in [11-BOS.md](../platform-architecture/11-BOS.md) |

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
| **Current architecture stage** | **PLATFORM ARCHITECTURE SSOT COMPLETE** (D-PA) — **Foundation C authorized** |

---

## Program Tracking

| Field | Value |
|-------|-------|
| **Current foundation** | **Foundation C — Runtime Bridge** (Program 4.05) |
| **Last completed mission (Behavior)** | **Foundation B.5** — Platform Behavior Specification (D-PB-01+) |
| **Last decision (Behavior)** | **D-PB-21** — Foundation C authorized after B.5 PASS |
| **Next official mission** | **Foundation C** — Universal CRB Runtime Bridge |

Full program registry: [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) · Foundation sequence: [18-FOUNDATION-ROADMAP.md](../platform-architecture/18-FOUNDATION-ROADMAP.md) · Behavior SSOT: [platform-behavior/](../platform-behavior/) · MMM roadmap: [meta-model/ROADMAP.md](../meta-model/ROADMAP.md)

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
| **3.6.8** Business Language Architecture (D-065) | ✅ |
| **3.6.9** Enterprise Digital Organization Architecture (D-066) | ✅ |
| **3.7** Business Intent Resolver Implementation (D-067, G305) | ✅ |
| **3.8** Business Computed Fields (D-068, G306) | ✅ |
| **3.8.5** Enterprise Vision Compliance Audit (D-069) | ✅ |
| **3.8.7** Enterprise Vision Alignment Audit (D-072) | ✅ |
| **Remediation** Platform Remediation Cycle 1 (D-073) | ✅ in progress |
| **3.27** Lifecycle Sync (D-093, G325) | ✅ |
| **4.00** Meta Model Foundation Audit | ✅ (audit) |
| **4.01** Meta Model Foundation Architecture | ✅ (docs) |
| **4.01.1** Meta Model Constitution | ✅ |
| **4.01.2** Alignment & Divergence Resolution | ✅ |
| **4.02** MMM Specification | ✅ |
| **4.03** MMM Persistence | ✅ |
| **4.04** MMM Publish Engine v2 | ✅ |
| **Foundation Architecture Audit** | ✅ — [platform-architecture/](../platform-architecture/) |
| **Foundation B.5 Platform Behavior** | ✅ — [platform-behavior/](../platform-behavior/) |
| **Próximo passo** | **Foundation C** — Runtime Bridge (Program 4.05) |

**Registries:** [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) · [GATE-REGISTRY.md](./GATE-REGISTRY.md) · [SSOT-REGISTRY.md](./SSOT-REGISTRY.md) · [meta-model/](../meta-model/)

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
| **Intent Resolver** | **G305** | ✅ **Program 3.7 — certified (D-067)** |
| **Business Computed Field** | **G306** | ✅ **Program 3.8 — certified (D-068)** |
| Business Computation impl | G303B | planned |

**Routes:** `/studio`, `/studio/prototype`, `/studio/empresas/layout`, `/studio/empresas/field`, `/studio/empresas/formula`

---

## Permanent Business Asset Rule (D-068)

| Rule | Status |
|------|--------|
| No new features developed for Studios | **Active** |
| All new capabilities = Business Assets | **Active** — Computed Field first |
| Studios edit assets only | **Active** |
| Runtime executes derived projections only | **Active** |
| Resolver derives assets only | **Active** |

Authoring principles: [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md)

---

## Key architecture documents

| # | Document |
|---|----------|
| 1 | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| 2 | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |
| 3 | [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) |
| 4 | [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](../architecture/MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) |
| 5 | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) |
| 6 | [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) |
| 7 | [MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md](../architecture/MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md) |
| 8 | **[docs/meta-model/README.md](../meta-model/README.md)** — **MMM SSOT (Program 4.xx mandatory)** |

---

*Position SSOT — update on every program completion. Do not duplicate in chat.*
