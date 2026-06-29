# README — AI & Agent Entry Point

**Status:** Official — Mandatory pre-flight for all AI agents and assisted development  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Complements:** [Constitution](./docs/constitution/00-MAK-CONSTITUTION.md) + [Permanent Governance Directive](./docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md) + [Implementation Protocol](./docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md)

---

## Purpose

This file is the **first document** any AI agent, cloud agent, or new developer session must read before touching the codebase.

The project does not depend on chat memory. All strategy, architecture, state, and decisions live in this repository.

---

## Pre-Implementation Checklist (Mandatory)

Before altering **any** file, read and verify:

| # | Document | Path |
|---|----------|------|
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

| Item | Value (verify in CURRENT-STATE.md) |
|------|-------------------------------------|
| Foundation | Frozen V10.2.0 (2026-06-28) |
| Runtime modules | empresas, cadcps (2 certified) |
| New module creation | `npm run generate:module` only |
| Primary gate suite | `npm run verify:governance` |
| MAK Studio | **Pre-Shell complete** (Foundation + UX Framework) — Shell 2.1 next |
| MAK DATA PLATFORM | Spec approved — not implemented (IFM 1C) |
| Master Architecture | v1.0.0 — `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |
| Platform Language Standard | v1.0.0 — `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` |
| Platform Maturity Index | v1.1.0 — `docs/engineering/PLATFORM-MATURITY-INDEX.md` |
| Implementation Protocol | v1.1.0 — includes RHP (D-019) |
| Legacy layer | `src/framework/cadastro/` — do not extend |

---

## Document Hierarchy

```
README_AI.md                          ← you are here (AI entry)
docs/constitution/00-MAK-CONSTITUTION.md   ← highest authority
docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md  ← definitive platform map
docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md  ← official nomenclature
docs/architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md  ← MDP definitive spec
docs/engineering/PLATFORM-MATURITY-INDEX.md  ← maturity dashboard
docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md  ← 10-phase mission lifecycle + RHP
docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md
docs/engineering/CURRENT-STATE.md      ← living platform state
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

*Last updated: 2026-06-28 — Program 0.7 Platform Implementation Protocol + PMI (D-016–D-019)*
