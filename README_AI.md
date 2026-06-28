# README — AI & Agent Entry Point

**Status:** Official — Mandatory pre-flight for all AI agents and assisted development  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Complements:** [Constitution](./docs/constitution/00-MAK-CONSTITUTION.md) + [Permanent Governance Directive](./docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md)

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
| 6 | **Next Sprint** | `docs/engineering/NEXT-SPRINT.md` |

**If any document is outdated relative to the code, update it before proceeding.**

Operational commands: [`AGENTS.md`](./AGENTS.md)

---

## During Implementation — Four Perspectives

Every change must be analyzed under:

### 1. Architecture

Respect: Foundation · ModeloBase1 · SSOT · Metadata First · Promotion First · Domain vs Infrastructure · Backward Compatibility.

**No parallel solutions.**

→ [02-ARCHITECTURE-PRINCIPLES.md](./docs/constitution/02-ARCHITECTURE-PRINCIPLES.md) · [08-DO-NOT-DO-LIST.md](./docs/constitution/08-DO-NOT-DO-LIST.md)

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
| Foundation | Frozen V10.1.0 (2026-06-27) |
| Runtime modules | empresas, marcas, produtos, cadcps |
| New module creation | `npm run generate:module` only |
| Primary gate suite | `npm run verify:governance` |
| MAK Studio | Not implemented |
| Legacy layer | `src/framework/cadastro/` — do not extend |

---

## Document Hierarchy

```
README_AI.md                          ← you are here (AI entry)
docs/constitution/00-MAK-CONSTITUTION.md   ← highest authority
docs/constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md
docs/engineering/CURRENT-STATE.md     ← living platform state
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

*Last updated: 2026-06-28 — Mission 0.1 + Permanent Governance Directive*
