# SSOT Registry — Document Ownership

**Status:** Official — Single owner per authoritative topic  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5C — Enterprise Architecture Remediation  
**Decision:** D-062

> **Rule:** Each topic has exactly **one SSOT document**. All other documents are **Derived**, **Reference**, **Historical**, or **Superseded** — see [DOCUMENT-CLASSIFICATION.md](./DOCUMENT-CLASSIFICATION.md).

---

## Classification legend

| Class | Meaning |
|-------|---------|
| **SSOT** | Authoritative — only source for decisions and continuity |
| **Derived** | Summarizes or operationalizes SSOT; must link upstream |
| **Reference** | Supporting detail; subordinate to SSOT |
| **Historical** | Point-in-time certification; not for continuity |
| **Deprecated** | Do not use for new work |
| **Superseded** | Replaced — see [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md) |

---

## Platform continuity (Engineering OS)

| Topic | SSOT | Derived | Historical / Deprecated |
|-------|------|---------|-------------------------|
| **Current project position** | [PROJECT-STATUS.md](./PROJECT-STATUS.md) | [README_AI.md](../../README_AI.md), [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md) | Chat history |
| **Platform technical state** | [CURRENT-STATE.md](./CURRENT-STATE.md) | [PLATFORM-MATURITY-INDEX.md](./PLATFORM-MATURITY-INDEX.md) | Old audit snapshots |
| **Program sequence** | [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) | [ROADMAP.md](./ROADMAP.md), [PROGRAM-SEQUENCE-VALIDATION.md](./PROGRAM-SEQUENCE-VALIDATION.md) | [NEXT-SPRINT.md](./NEXT-SPRINT.md) ⚠️ deprecated |
| **Decisions** | [DECISIONS.md](./DECISIONS.md) | [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md) | — |
| **Doc hierarchy index** | [DOCUMENT-MAP.md](./DOCUMENT-MAP.md) | — | — |
| **Gates** | [GATE-REGISTRY.md](./GATE-REGISTRY.md) | [RULE-DEPLOY-002.md](./RULE-DEPLOY-002.md) | Deploy docs citing old G303/G304 IDs |
| **Governance umbrella** | [GOVERNANCE-REGISTRY.md](./GOVERNANCE-REGISTRY.md) | — | — |
| **Architecture debt** | [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md) | [ARCHITECTURE-REMEDIATION-REPORT.md](./ARCHITECTURE-REMEDIATION-REPORT.md) | — |
| **Code tech debt** | [TECH-DEBT.md](./TECH-DEBT.md) | — | — |

---

## Architecture (Permanent)

| Topic | SSOT | Derived / Reference |
|-------|------|---------------------|
| **Layer topology** | [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) | [MAK-PLATFORM-EVOLUTION.md](../architecture/MAK-PLATFORM-EVOLUTION.md) |
| **Studio architecture** | [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) | Studio briefs, certification reports |
| **MDP specification** | [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) | [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) |
| **Business Intent authoring** | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | [MAK-BUSINESS-INTENT-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-ARCHITECTURE.md) (vision) |
| **Business Derivation** | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) | D-059 Intent Authoring (input SSOT) |
| **Business Computation** | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) | D-058 hooks; computation derivation facet |
| **Studio Computation** | [MAK-STUDIO-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) | G302 implementation |
| **Formula runtime unification** | [FORMULA-RUNTIME-UNIFICATION-PLAN.md](./FORMULA-RUNTIME-UNIFICATION-PLAN.md) | AD-P0-01/02 remediation |
| **Platform language** | [MAK-PLATFORM-LANGUAGE-STANDARD.md](../architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md) | — |
| **Engineering principles** | [MAK-ENGINEERING-PRINCIPLES.md](../architecture/MAK-ENGINEERING-PRINCIPLES.md) | D-029 audit report |

---

## Vision (non-binding for implementation)

| Topic | SSOT | Reference |
|-------|------|-----------|
| **EOS north star** | [MAK-2035-PLATFORM-VISION.md](../vision/MAK-2035-PLATFORM-VISION.md) | [MAK-2040-VISION-BACKLOG.md](../vision/MAK-2040-VISION-BACKLOG.md) |
| **Enterprise Intelligence (3.5A)** | [MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md](../architecture/MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) | 7 companion architecture docs (D-060) |
| **Business Objects / Capabilities** | Respective `MAK-*.md` in `docs/architecture/` | D-057 set |

---

## Superseded document topics

| Topic | Superseded | SSOT successor |
|-------|------------|----------------|
| Program 2.3.6 Computation Engine | [IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md](./IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md) | Program 3.0.5 + 3.1 ([PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md)) |
| Next sprint (MDP-4 era) | [NEXT-SPRINT.md](./NEXT-SPRINT.md) | [PROJECT-STATUS.md](./PROJECT-STATUS.md) |
| Deploy gate IDs G303/G304 | Historical deploy docs (pre-D-062) | [GATE-REGISTRY.md](./GATE-REGISTRY.md) G401/G402 |

Full traceability: [SUPERSESSION-REGISTER.md](./SUPERSESSION-REGISTER.md)

---

## Duplication elimination (D-062)

| Before | Issue | After |
|--------|-------|-------|
| ROADMAP + PROJECT-STATUS both declared "next mission" | Conflict (2.3.6 vs 3.5) | **PROJECT-STATUS** = next mission SSOT; **ROADMAP** = historical sequence + future phases (links to PROGRAM-REGISTRY) |
| PROJECT-STATUS gates table vs Program Tracking | Computed Fields vs Resolver | Unified: **Resolver first** per D-059 |
| README_AI vs PROJECT-STATUS | Drift risk | README_AI = derived summary; links to PROJECT-STATUS |
| CURRENT-STATE vs PROJECT-STATUS | Overlap on program status | CURRENT-STATE = technical detail; program position defers to PROJECT-STATUS |

---

*One owner per topic. When in doubt, `PROJECT-STATUS.md` wins for "what is next".*
