# README — AI & Agent Entry Point

**Status:** Official — Mandatory pre-flight for all AI agents and assisted development  
**Version:** 1.1.0  
**Effective date:** 2026-06-30  
**Complements:** [Constitution](./docs/constitution/00-MAK-CONSTITUTION.md) + [Permanent Governance Directive](./docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md) + [Implementation Protocol](./docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md)

---

## Purpose

This file is the **first document** any AI agent, cloud agent, or new developer session must read before touching the codebase.

The project does not depend on chat memory. All strategy, architecture, state, and decisions live in this repository.

**New session?** Read [AI-STARTUP-GUIDE.md](./docs/engineering/AI-STARTUP-GUIDE.md) and [PROJECT-STATUS.md](./docs/engineering/PROJECT-STATUS.md) first.

---

## CURRENT PROJECT STATUS

| Field | Value |
|-------|-------|
| **Foundation** | **Frozen** — Enterprise V10.2.0 + Studio Foundation (D-052) |
| **Current Version** | `0.4.0-rc.2` |
| **Current Release** | `v0.4.0-RC2` (pending owner tag) |
| **Current Program** | Program 3 — Studio Intelligence |
| **Last Decision** | **D-059** — Business Intent Authoring Architecture |
| **Roadmap Position** | **Business Intent Resolver** — next implementation · then Business Computed Fields |
| **Current Architecture Stage** | L5 Studio Intelligence — Business Intent Authoring defined (D-059) |
| **Current Studio Stage** | Computation Engine ✅ · Formula Builder ✅ · Business Computation ✅ · Intent Authoring ✅ (docs) |
| **Next Official Mission** | **Business Intent Resolver** — implementation on Intent Authoring architecture |

### Mandatory Documents (continuity)

| # | Document | Path |
|---|----------|------|
| 1 | **Project Status (SSOT)** | [PROJECT-STATUS.md](./docs/engineering/PROJECT-STATUS.md) |
| 2 | **AI Startup Guide** | [AI-STARTUP-GUIDE.md](./docs/engineering/AI-STARTUP-GUIDE.md) |
| 3 | **Continuity Protocol** | [CONTINUITY-PROTOCOL.md](./docs/engineering/CONTINUITY-PROTOCOL.md) |
| 4 | **Document Map** | [DOCUMENT-MAP.md](./docs/engineering/DOCUMENT-MAP.md) |
| 5 | **Current State** | [CURRENT-STATE.md](./docs/engineering/CURRENT-STATE.md) |
| 6 | **Roadmap** | [ROADMAP.md](./docs/engineering/ROADMAP.md) |
| 7 | **Decisions** | [DECISIONS.md](./docs/engineering/DECISIONS.md) |
| 8 | **Business Intent Authoring Architecture** | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./docs/architecture/MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| 9 | **Business Computation Architecture** | [MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md](./docs/architecture/MAK-BUSINESS-COMPUTATION-ARCHITECTURE.md) |
| 10 | **Platform Vision (EOS)** | [MAK-2035-PLATFORM-VISION.md](./docs/vision/MAK-2035-PLATFORM-VISION.md) |

Full details: [PROJECT-STATUS.md](./docs/engineering/PROJECT-STATUS.md)

---

## Pre-Implementation Checklist (Mandatory)

Before altering **any** file, read and verify:

| # | Document | Path |
|---|----------|------|
| 0 | **Project Status (SSOT)** | `docs/engineering/PROJECT-STATUS.md` |
| 0b | **AI Startup Guide** | `docs/engineering/AI-STARTUP-GUIDE.md` |
| 1 | **This file** | `README_AI.md` |
| 2 | **Constitution** | `docs/constitution/00-MAK-CONSTITUTION.md` (+ relevant docs 01–11) |
| 3 | **Current State** | `docs/engineering/CURRENT-STATE.md` |
| 4 | **Roadmap** | `docs/engineering/ROADMAP.md` |
| 5 | **Decisions** | `docs/engineering/DECISIONS.md` |
| 6 | **Master Architecture** | `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |
| 7 | **Engineering Principles** | `docs/architecture/MAK-ENGINEERING-PRINCIPLES.md` |
| 8 | **MAK Studio Architecture** | `docs/architecture/MAK-STUDIO-ARCHITECTURE.md` |
| 8b | **MAK Studio UX Framework** | `docs/architecture/MAK-STUDIO-UX-FRAMEWORK.md` |
| 9 | **Platform Language Standard** | `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` |
| 10 | **MDP Architecture Spec** | `docs/architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md` |
| 11 | **Platform Maturity Index** | `docs/engineering/PLATFORM-MATURITY-INDEX.md` |
| 12 | **Implementation Protocol** | `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` |
| 13 | **Next Sprint** | `docs/engineering/NEXT-SPRINT.md` |
| 14 | **Doc certification** (after major doc changes) | `docs/engineering/DOCUMENTATION-CERTIFICATION.md` |

**If any document is outdated relative to the code, update it before proceeding.**

**All implementation missions must follow the [10-phase PIP lifecycle](./docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md), including [RHP start/end/post-merge](./docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md#10-repository-health-protocol-rhp) (D-019).**

Operational commands: [`AGENTS.md`](./AGENTS.md)

---

## During Implementation — Four Perspectives

Every change must be analyzed under:

### 1. Architecture

Respect: Foundation · ModeloBase1 · SSOT · Metadata First · Promotion First · Domain vs Infrastructure · Backward Compatibility.

**No parallel solutions.**

→ [MAK-ENGINEERING-PRINCIPLES.md](./docs/architecture/MAK-ENGINEERING-PRINCIPLES.md) (18 permanent principles, D-029) · [02-ARCHITECTURE-PRINCIPLES.md](./docs/constitution/02-ARCHITECTURE-PRINCIPLES.md) · [08-DO-NOT-DO-LIST.md](./docs/constitution/08-DO-NOT-DO-LIST.md)

### 2. Quality

Run continuously (scope-appropriate):

```bash
npm run build
npm run lint
npm run typecheck          # known shadcn noise in src/shared/ui/*
npm run verify:governance  # Foundation / module / generator changes
```

Plus smoke tests, automated tests, visual/functional comparison when UI-affected.

**Stop the mission on regression until fixed.**

→ [05-CODE-QUALITY-STANDARDS.md](./docs/constitution/05-CODE-QUALITY-STANDARDS.md) · [06-GOVERNANCE-AND-GATES.md](./docs/constitution/06-GOVERNANCE-AND-GATES.md)

### 3. Evolution

Every implementation must answer (justify if NO):

| Question |
|----------|
| Prepares for MAK Studio? |
| Prepares for Data Dictionary? |
| Prepares for IA? |
| Prepares for Marketplace? |
| Prepares for Versionamento? |
| Prepares for Offline? |
| Prepares for Multi-tenant? |
| Prepares for future growth? |

→ [01-VISION-AND-SCOPE.md](./docs/constitution/01-VISION-AND-SCOPE.md)

### 4. Governance

At mission end, update as applicable:

| Document | When |
|----------|------|
| `docs/engineering/CURRENT-STATE.md` | Always |
| `docs/engineering/ENGINEERING-JOURNAL.md` | Always |
| `docs/engineering/CAPABILITIES-REGISTRY.md` | Capability changes |
| `docs/engineering/ROADMAP.md` | Priority shifts |
| `docs/engineering/TECH-DEBT.md` | New or resolved debt |
| `docs/engineering/PLATFORM-MATURITY-INDEX.md` | Significant maturity change in any PMI area |
| `docs/engineering/DECISIONS.md` | Architectural decisions |
| `docs/engineering/NEXT-SPRINT.md` | Sprint boundary changes |

---

## Mandatory Certification (Mission Completion)

No mission is complete without answering **all 10 items** with **SIM or NÃO** and technical justification:

1. A arquitetura continua íntegra?
2. A Constituição continua válida?
3. Existe nova dívida técnica?
4. Existe duplicação estrutural?
5. Existe oportunidade de promoção para a Foundation?
6. Existe oportunidade de simplificação?
7. Existe código legado que agora pode ser removido?
8. O estado atual da plataforma foi atualizado?
9. A implementação prepara o próximo passo do roadmap?
10. Existe alguma inconsistência entre documentação e código?

Template: [11-PERMANENT-GOVERNANCE-DIRECTIVE.md § Certification](./docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md#4-mandatory-certification-mission-completion)

---

## Quick Reference — Platform State

> **Authoritative:** [PROJECT-STATUS.md](./docs/engineering/PROJECT-STATUS.md) — verify dates before acting.

| Item | Value |
|------|-------|
| Foundation | **Frozen** V10.2.0 + Studio Foundation (D-052) |
| Release | **`v0.4.0-RC1`** · package `0.4.0-rc.1` |
| Runtime modules | empresas, cadcps (2 certified) |
| New module creation | `npm run generate:module` only |
| Primary gate suite | `npm run verify:governance` |
| MAK Studio | **Foundation frozen** — Shell + Layout + Field ✅; **2.3.6 next** |
| MAK DATA PLATFORM | **Complete** (IFM 1C MDP-0→5) |
| Master Architecture | v1.0.0 |
| Platform Maturity Index | v1.3.0 (ERI 3.8/10) |
| Implementation Protocol | v1.2.0 — includes RHP (D-019) |
| Legacy layer | `src/framework/cadastro/` — do not extend |

---

## Document Hierarchy

```
README_AI.md                          ← you are here (AI entry)
docs/engineering/PROJECT-STATUS.md    ← current position SSOT
docs/engineering/AI-STARTUP-GUIDE.md  ← onboard any new session
docs/engineering/CONTINUITY-PROTOCOL.md
docs/engineering/DOCUMENT-MAP.md      ← L0–L7 doc hierarchy
docs/constitution/00-MAK-CONSTITUTION.md   ← highest authority
docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md  ← definitive platform map
docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md  ← official nomenclature
docs/architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md  ← MDP definitive spec
docs/engineering/PLATFORM-MATURITY-INDEX.md  ← maturity dashboard
docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md  ← 10-phase mission lifecycle + RHP
docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md
docs/engineering/CURRENT-STATE.md      ← living platform state (detail)
docs/engineering/ROADMAP.md
docs/engineering/DECISIONS.md
scripts/governance-baseline.json      ← machine-enforced rules
AGENTS.md                             ← dev commands
```

Chat history and external reports are **not authoritative**.

---

## Permanent Objective

> Delivering features is not enough. Every mission must strengthen enterprise sustainability: architectural quality, governance, documentation, and expansion capacity over many years.

---

*Last updated: 2026-06-30 — Program 2.3.Y Project Transition & Continuity (D-053)*
