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
| **Enterprise Vision Compliance Audit** | [ENTERPRISE-VISION-COMPLIANCE-AUDIT.md](./ENTERPRISE-VISION-COMPLIANCE-AUDIT.md) | Program 3.8.5 audit suite | — |
| **Enterprise Platform Deep Audit** | [ENTERPRISE-PLATFORM-DEEP-AUDIT.md](./ENTERPRISE-PLATFORM-DEEP-AUDIT.md) | Program 3.8.6 audit suite (11 docs) | — |
| **Enterprise Vision Alignment (3.8.7)** | [ENTERPRISE-VISION-ALIGNMENT-AUDIT.md](./ENTERPRISE-VISION-ALIGNMENT-AUDIT.md) | D-072 | — |
| **Platform remediation** | [PLATFORM-REMEDIATION-REGISTER.md](./PLATFORM-REMEDIATION-REGISTER.md) | D-073 remediation suite | — |
| **Architecture debt** | [ARCHITECTURE-DEBT-REGISTER.md](./ARCHITECTURE-DEBT-REGISTER.md) | [TECHNICAL-DEBT-MASTER-REGISTER.md](./TECHNICAL-DEBT-MASTER-REGISTER.md) | — |
| **Code tech debt** | [TECH-DEBT.md](./TECH-DEBT.md) | — | — |

---

## Architecture (Permanent)

| Topic | SSOT | Derived / Reference |
|-------|------|---------------------|
| **Universal Meta Model (MMM)** | [docs/meta-model/README.md](../meta-model/README.md) | Topic docs 00–30; [GLOSSARY](../meta-model/GLOSSARY.md), [RULES](../meta-model/RULES.md), [DECISIONS](../meta-model/DECISIONS.md), [ROADMAP](../meta-model/ROADMAP.md) |
| **Layer topology** | [01-LAYERS.md](../platform-architecture/01-LAYERS.md) | [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) (**Reference — L0–L7 map**); [MAK-PLATFORM-EVOLUTION.md](../architecture/MAK-PLATFORM-EVOLUTION.md) |
| **Full platform architecture** | [docs/platform-architecture/README.md](../platform-architecture/README.md) | Topics 00–19; [DECISIONS](../platform-architecture/DECISIONS.md) (D-PA), [CONTRACTS](../platform-architecture/CONTRACTS.md), [18-FOUNDATION-ROADMAP](../platform-architecture/18-FOUNDATION-ROADMAP.md) |
| **Platform behavior** | [docs/platform-behavior/README.md](../platform-behavior/README.md) | Topics 01–25; [DECISIONS](../platform-behavior/DECISIONS.md) (D-PB), [16-UNIVERSAL-STATE-MACHINE](../platform-behavior/16-UNIVERSAL-STATE-MACHINE.md) |
| **Platform protocol (UEP)** | [docs/platform-protocol/README.md](../platform-protocol/README.md) | Topics 01–25; [23-UNIVERSAL-PROTOCOL-DECISIONS](../platform-protocol/23-UNIVERSAL-PROTOCOL-DECISIONS.md) (D-UP) |
| **Platform authoring (UAS)** | [docs/platform-authoring/README.md](../platform-authoring/README.md) | Topics 01–25; [DECISIONS](../platform-authoring/DECISIONS.md) (D-UA), [01-UNIVERSAL-AUTHORING-OVERVIEW](../platform-authoring/01-UNIVERSAL-AUTHORING-OVERVIEW.md) |
| **Runtime implementation plan** | [docs/runtime-implementation/README.md](../runtime-implementation/README.md) | Topics 01–12; [DECISIONS](../runtime-implementation/DECISIONS.md) (D-RI), [12-AUDITORIA-FINAL](../runtime-implementation/12-AUDITORIA-FINAL.md) |
| **Studio architecture** | [03-STUDIO.md](../platform-architecture/03-STUDIO.md) | [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) (**Reference — legacy Studio detail**) |
| **MDP specification** | [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) (**Reference — persistence substrate**) | [24-PERSISTENCE.md](../meta-model/24-PERSISTENCE.md) (**MMM SSOT**); [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) |
| **Business Intent authoring** | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | [MAK-BUSINESS-INTENT-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-ARCHITECTURE.md) (vision) |
| **Business Derivation** | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) | D-059 Intent Authoring (input SSOT) |
| **Business Intent Resolver** | [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) | D-063 Derivation (output infrastructure) |
| **Business Language** | [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](../architecture/MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) | D-059 Intent Authoring (downstream); Knowledge Vocabulary |
| **Enterprise Digital Organization** | [MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md](../architecture/MAK-ENTERPRISE-ORGANIZATION-ARCHITECTURE.md) | D-057 Business Object Model (root kind); D-060 Intelligence |
| **Business Computation** | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) | D-058 hooks; computation derivation facet |
| **Business Asset authoring principles** | [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) | Expert boundary · D-073 |
| **Business Operating Shell** | [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](../architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md) | VA-01 · Navigation model |
| **Product identity (FROZEN)** | [MAK-PRODUCT-IDENTITY-FREEZE.md](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) | [MAK-PRODUCT-IDENTITY.md](../architecture/MAK-PRODUCT-IDENTITY.md) | — |
| **Studio Computation** | [MAK-STUDIO-COMPUTATION-ARCHITECTURE.md](../architecture/MAK-STUDIO-COMPUTATION-ARCHITECTURE.md) | G302 implementation |
| **Runtime architecture** | [02-RUNTIME.md](../platform-architecture/02-RUNTIME.md) | [07-RENDER-ENGINE](../platform-architecture/07-RENDER-ENGINE.md), [08-ACTION-ENGINE](../platform-architecture/08-ACTION-ENGINE.md), [09-WORKFLOW-ENGINE](../platform-architecture/09-WORKFLOW-ENGINE.md) |
| **Foundation implementation sequence** | [18-FOUNDATION-ROADMAP.md](../platform-architecture/18-FOUNDATION-ROADMAP.md) | [PROGRAM-REGISTRY.md](./PROGRAM-REGISTRY.md) (**Derived — program IDs**); [meta-model/ROADMAP.md](../meta-model/ROADMAP.md) (**MMM subset**) |
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
| MDP as universal metadata SSOT (26 types) | [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) (metadata scope) | [docs/meta-model/](../meta-model/) (D-MMM-01, D-MMM-15) |

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
