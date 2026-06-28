# 11 — Permanent Governance & Certification Directive

**Constitution document:** 11 of 11  
**Status:** Official — Complements Constitution  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Applies to:** All future MAK missions (human and AI)

---

## 1. Purpose

This directive establishes the **permanent operating procedure** for every mission after Constitution adoption. It is complementary to documents 00–10 and binding at the same level as [09-AI-RULES.md](./09-AI-RULES.md).

**Objective:** Build an enterprise platform sustainable for many years — not merely deliver features.

---

## 2. Before Any Implementation

Before altering any project file, **mandatory review**:

| Document | Path |
|----------|------|
| AI entry point | `/README_AI.md` |
| Constitution | `/docs/constitution/00-MAK-CONSTITUTION.md` |
| Current state | `/docs/engineering/CURRENT-STATE.md` |
| Roadmap | `/docs/engineering/ROADMAP.md` |
| Decisions | `/docs/engineering/DECISIONS.md` |
| Master Architecture | `/docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |
| Platform Language Standard | `/docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` |
| Platform Maturity Index | `/docs/engineering/PLATFORM-MATURITY-INDEX.md` |
| Platform Implementation Protocol | `/docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` |
| Next sprint | `/docs/engineering/NEXT-SPRINT.md` |

**Rule:** If any document is outdated relative to the code, **update it before proceeding** with implementation.

---

## 3. During Implementation — Four Perspectives

### 3.1 Architecture

Verify the implementation respects:

- **Foundation** — frozen structural layer ([03-FOUNDATION-RULES.md](./03-FOUNDATION-RULES.md))
- **ModeloBase1** — cadastro UI motor ([04-MODELOBASE1-RULES.md](./04-MODELOBASE1-RULES.md))
- **SSOT** — single source of truth for structural UI
- **Metadata First** — declare behavior; do not imperatively rebuild UI
- **Promotion First** — promote reusable code to Foundation ([07-PRINCIPLES-OF-PROMOTION.md](./07-PRINCIPLES-OF-PROMOTION.md))
- **Domain vs Infrastructure** — business rules in modules; structure in Foundation
- **Backward Compatibility** — Foundation changes must not break certified modules

**No parallel solutions may be created.** See [08-DO-NOT-DO-LIST.md](./08-DO-NOT-DO-LIST.md).

### 3.2 Quality

Execute continuously (scope-appropriate):

| Check | Command / action |
|-------|------------------|
| Build | `npm run build` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Gates | `npm run verify:governance` (or scoped gates) |
| Smoke test | Module/backend smoke scripts |
| Automated tests | E2E / unit as applicable |
| Visual comparison | When UI-affecting — paridade gates |
| Functional comparison | When behavior-affecting — module E2E |

**If regression is detected, stop the mission until corrected.**

### 3.3 Evolution

Every implementation must answer:

| Question | Expected default |
|----------|------------------|
| Prepares for MAK Studio? | Metadata-driven changes: YES; ad-hoc UI: NO |
| Prepares for Data Dictionary? | Extends CADCPS/metadata: YES |
| Prepares for IA? | API-boundary-respecting: YES; shadow integrations: NO |
| Prepares for Marketplace? | Modular, licensed: justify |
| Prepares for Versionamento? | Schema-version aware: justify |
| Prepares for Offline? | Not required today — justify if claiming YES |
| Prepares for Multi-tenant? | cliente_id / RBAC respected: YES |
| Prepares for future growth? | Generator/gates compatible: YES |

**Negative answers require technical justification** in mission report or ENGINEERING-JOURNAL.

### 3.4 Governance

At mission completion, update:

| Document | Condition |
|----------|-----------|
| `docs/engineering/CURRENT-STATE.md` | **Always** |
| `docs/engineering/ENGINEERING-JOURNAL.md` | **Always** |
| `docs/engineering/CAPABILITIES-REGISTRY.md` | Capability changes |
| `docs/engineering/ROADMAP.md` | Priority or phase shifts |
| `docs/engineering/TECH-DEBT.md` | New or resolved debt |
| `docs/engineering/DECISIONS.md` | Architectural decisions |
| `docs/engineering/NEXT-SPRINT.md` | Sprint scope changes |

---

## 4. Mandatory Certification (Mission Completion)

**No mission is complete** without answering all 10 items:

| # | Question | Answer format |
|---|----------|---------------|
| 1 | A arquitetura continua íntegra? | SIM / NÃO + justificativa |
| 2 | A Constituição continua válida? | SIM / NÃO + justificativa |
| 3 | Existe nova dívida técnica? | SIM / NÃO + justificativa |
| 4 | Existe duplicação estrutural? | SIM / NÃO + justificativa |
| 5 | Existe oportunidade de promoção para a Foundation? | SIM / NÃO + justificativa |
| 6 | Existe oportunidade de simplificação? | SIM / NÃO + justificativa |
| 7 | Existe código legado que agora pode ser removido? | SIM / NÃO + justificativa |
| 8 | O estado atual da plataforma foi atualizado? | SIM / NÃO + justificativa |
| 9 | A implementação prepara o próximo passo do roadmap? | SIM / NÃO + justificativa |
| 10 | Existe inconsistência entre documentação e código? | SIM / NÃO + justificativa |

Include this certification block in:

- PR description (implementation missions)
- ENGINEERING-JOURNAL entry (all missions)
- Mission final report to user

---

## 5. Certification Template (Copy-Paste)

```markdown
## Certificação Obrigatória — [Mission ID]

| # | Pergunta | Resposta | Justificativa |
|---|----------|----------|---------------|
| 1 | Arquitetura íntegra? | SIM/NÃO | |
| 2 | Constituição válida? | SIM/NÃO | |
| 3 | Nova dívida técnica? | SIM/NÃO | |
| 4 | Duplicação estrutural? | SIM/NÃO | |
| 5 | Oportunidade de promoção? | SIM/NÃO | |
| 6 | Oportunidade de simplificação? | SIM/NÃO | |
| 7 | Legado removível? | SIM/NÃO | |
| 8 | CURRENT-STATE atualizado? | SIM/NÃO | |
| 9 | Prepara próximo roadmap? | SIM/NÃO | |
| 10 | Inconsistência doc/código? | SIM/NÃO | |
```

---

## 6. Relationship to Constitution

| Document | Relationship |
|----------|--------------|
| 00–10 | Define **what** the rules are |
| **11 (this)** | Defines **how every mission operates** — certification template |
| **PIP** | Defines **10-phase implementation lifecycle** — [PLATFORM-IMPLEMENTATION-PROTOCOL.md](../engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md) |
| README_AI.md | Operational entry point implementing this directive + PIP Phase 1 (PIR) |
| docs/engineering/* | Living state updated per §3.4 |

Amendments to this directive follow the process in [00-MAK-CONSTITUTION.md §6](./00-MAK-CONSTITUTION.md#6-amendment-process).

---

## 7. Permanent Objective

> The goal is not merely to deliver functionality.  
> The goal is to build an **enterprise-sustainable platform** prepared to evolve for many years, maintaining architectural quality, governance, documentation, and expansion capacity.

---

*Return to: [00-MAK-CONSTITUTION.md](./00-MAK-CONSTITUTION.md)*
