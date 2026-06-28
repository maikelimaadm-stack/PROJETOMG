# MAK Constitution

**Status:** Official — Highest Authority  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Mission:** 0.1 — Sistema Operacional do Projeto

---

## 1. Purpose

This document establishes the **permanent operating system** of the MAK Gestão platform. It is the single authoritative source for strategy, architecture, patterns, rules, and decisions that govern all future development.

The project **must not depend on chat memory**. Any AI agent, developer, or new session must be able to understand the platform by reading the official documentation in this repository.

---

## 2. Hierarchy of Authority

When documents or instructions conflict, resolve in this order:

| Priority | Source | Role |
|----------|--------|------|
| **1** | `/docs/constitution/*` | **This Constitution** — non-negotiable rules |
| **2** | `/README_AI.md` | AI/agent entry point — pre-flight checklist |
| **3** | `/docs/engineering/*` | Living state (CURRENT-STATE, ROADMAP, DECISIONS, etc.) |
| **4** | `scripts/governance-baseline.json` | Machine-enforced baseline (frozen exceptions, forbidden patterns) |
| **5** | CI gates (`scripts/gate-*.mjs`) | Automated verification of Constitution compliance |
| **6** | `/docs/FOUNDATION_GOVERNANCE.md` | Operational guide (subordinate to Constitution) |
| **7** | Capability catalogs (`docs/*_CATALOG.md`, `docs/*_INVENTORY.md`) | Reference for config engines |
| **8** | Module-local config and metadata | Domain-only definitions |
| **9** | Chat instructions, informal notes, external reports | **Not authoritative** |

If a chat instruction contradicts the Constitution, **the Constitution wins**.

---

## 3. Constitution Index

| Document | Subject |
|----------|---------|
| [01-VISION-AND-SCOPE.md](./01-VISION-AND-SCOPE.md) | Product vision, scope, long-term platform direction |
| [02-ARCHITECTURE-PRINCIPLES.md](./02-ARCHITECTURE-PRINCIPLES.md) | Layered architecture, metadata-first design, SSOT |
| [03-FOUNDATION-RULES.md](./03-FOUNDATION-RULES.md) | Frozen Foundation — what it is and how it evolves |
| [04-MODELOBASE1-RULES.md](./04-MODELOBASE1-RULES.md) | Cadastro motor rules, thin pages, config factory |
| [05-CODE-QUALITY-STANDARDS.md](./05-CODE-QUALITY-STANDARDS.md) | Lint, naming, structure, technical quality bar |
| [06-GOVERNANCE-AND-GATES.md](./06-GOVERNANCE-AND-GATES.md) | CI gates, verification commands, regression prevention |
| [07-PRINCIPLES-OF-PROMOTION.md](./07-PRINCIPLES-OF-PROMOTION.md) | Moving reusable code from domain to Foundation |
| [08-DO-NOT-DO-LIST.md](./08-DO-NOT-DO-LIST.md) | Explicit prohibitions |
| [09-AI-RULES.md](./09-AI-RULES.md) | Rules for AI-assisted development |
| [10-PLATFORM-BOUNDARIES.md](./10-PLATFORM-BOUNDARIES.md) | Layer boundaries, tenant model, future platforms |
| [11-PERMANENT-GOVERNANCE-DIRECTIVE.md](./11-PERMANENT-GOVERNANCE-DIRECTIVE.md) | Mission procedure, certification, doc updates |

### Engineering documents (living state)

Complementary to Constitution — updated every mission per doc 11:

| Document | Path |
|----------|------|
| Current State | `/docs/engineering/CURRENT-STATE.md` |
| Roadmap | `/docs/engineering/ROADMAP.md` |
| Decisions | `/docs/engineering/DECISIONS.md` |
| Next Sprint | `/docs/engineering/NEXT-SPRINT.md` |
| Engineering Journal | `/docs/engineering/ENGINEERING-JOURNAL.md` |
| Capabilities Registry | `/docs/engineering/CAPABILITIES-REGISTRY.md` |
| Tech Debt | `/docs/engineering/TECH-DEBT.md` |

Future missions may add engineering docs (e.g. MAK Studio spec) outside `/docs/constitution/`.

---

## 4. Platform Identity (Summary)

**MAK Gestão** is a metadata-driven, multi-tenant ERP platform built as:

- **Frontend:** React 18 + Vite + React Query + Tailwind/shadcn
- **Backend:** Fastify 5 + Prisma 6 + PostgreSQL
- **Cadastro runtime:** ModeloBase1 (UI motor) + framework/mak (runtime + config engines)
- **Module creation:** Official generator only (`npm run generate:module`)

Certified runtime cadastro modules (as of Constitution v1.0.0):

| moduleId | Role |
|----------|------|
| `empresas` | Reference module — domain overrides allowed |
| `marcas` | Minimal factory consumer |
| `produtos` | Minimal factory consumer |
| `cadcps` | Custom fields engine — formal structural exception |

Foundation status: **Frozen** (Enterprise V10.1.0, `frozenAt: 2026-06-27`).

---

## 5. Non-Negotiable Rules (Summary)

1. **New cadastro modules** are created exclusively via the official generator.
2. **Structural UI** (toolbar, table, form, search, dock, dialogs) lives only in ModeloBase1 / framework/mak.
3. **Domain modules** provide config, metadata, repositories, schemas, and business rules — not UI structure.
4. **Foundation changes** require backward compatibility and formal exception if breaking.
5. **Governance gates must pass** before merging changes that touch Foundation, modules, or generator templates.
6. **No chat-only decisions** — durable decisions are recorded in repository documentation.

Full detail: see documents 03–08 and 10.

---

## 6. Amendment Process

Amending the Constitution requires:

1. Written proposal in a PR describing the change and rationale.
2. Impact analysis on gates, modules, and Foundation.
3. Update to affected Constitution documents and, if needed, `governance-baseline.json`.
4. Passing `npm run verify:governance` (or scoped gate suite for partial changes).
5. Explicit version bump in this file (`Version:` header).

Emergency exceptions (production incidents) may bypass amendment temporarily but **must be documented within 48 hours** in a follow-up PR.

---

## 7. Relationship to Existing Docs

Legacy reports under `/docs/ENTERPRISE_*`, `/docs/auditoria/`, and PR-specific runbooks remain **historical evidence**. They do not override this Constitution.

AI/agent entry point: `/workspace/README_AI.md` (mandatory pre-flight).  
Operational commands: `/workspace/AGENTS.md` (subordinate to Constitution).

---

## 8. Verification

After any change claimed to align with the Constitution:

```bash
npm run verify:governance          # Full cycle: build + lint + certification + governance
npm run verify:governance:cycles   # 5 consecutive cycles (release-grade)
```

Individual gate suites: see [06-GOVERNANCE-AND-GATES.md](./06-GOVERNANCE-AND-GATES.md).

---

*This Constitution is the permanent memory of MAK Gestão. Read it first. Obey it always.*
