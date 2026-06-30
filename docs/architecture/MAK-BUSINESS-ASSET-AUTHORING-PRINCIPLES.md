# MAK Business Asset Authoring Principles

**Status:** Official — Permanent architecture reference  
**Version:** 1.1.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8 — Business Computed Fields (Mission Brief SSOT)  
**Decision:** D-068  
**Authority:** This document is the **sole SSOT** for permanent Business Asset authoring principles. It **supersedes** any prior Program 3.8 complement instructions.

---

## Scope boundary

| In scope | Out of scope |
|----------|--------------|
| Permanent principles for all Business Assets | Code changes to Foundation, Runtime, Studio, Resolver, MDP |
| Authoring experience policies | Workflow, Automation, Dashboard, Report, Integration, Marketplace, AI Runtime, Decision Engine, Knowledge Engine **implementation** |
| Convergence rules for all entry paths | New structural architecture |

**Rule:** Principles registered here govern **all future implementation**. Where not yet implemented, register as **future extension** only.

---

## Official creation pipeline (immutable)

```
Business Language
      ↓
Business Intent
      ↓
Intent Resolver
      ↓
Business Capability Resolution
      ↓
Business Derivation
      ↓
Business Asset
      ↓
Technical Projection
      ↓
Runtime
```

No alternate path is permitted.

---

## BAAP-0 — Business Asset First

No resource belongs to a Studio. Every resource belongs to **business**.

| Layer | Role |
|-------|------|
| Studios | Edit Business Assets only |
| Runtime | Execute derived projections only |
| Resolver | Derive Business Assets only |

**Program 3.8 evidence:** `src/studio/business/` · G306 · `studioOwned: false` · `belongsToBusiness: true`

---

## BAAP-1 — Dual Authoring

**Mode Business First:** User describes business objective only; platform determines which Business Assets to use.

**Mode Expert:** User selects Business Asset type explicitly (Computed Field, Workflow, Automation, …).

Both modes converge on the **same pipeline**. Architecture never changes — only authoring experience.

**D-073 binding:** Expert Mode ≠ Platform Studio designers. See [EXPERT-MODE-AND-STUDIO-BOUNDARY.md](../engineering/EXPERT-MODE-AND-STUDIO-BOUNDARY.md).

| Asset type | Program 3.8 status |
|------------|-------------------|
| Computed Field | ✅ Implemented (G306) |
| Workflow, Automation, Dashboard, Report, Integration, IA, Indicator, Process, Document | Extension points only |

---

## BAAP-2 — User Choice

The platform never limits the user to one creation flow.

Entry paths: automatic suggestions · manual creation · reuse existing assets · Business Intent · Business Asset · Template · Capability · Marketplace.

All converge on the same architecture.

**Implementation status:** Infrastructure converges via Intent + Resolver; multi-entry UI — future extension.

---

## BAAP-3 — Progressive Disclosure

Present only complexity appropriate to user level (beginner / intermediate / expert).

Never expose at any level: Code · JSON · AST · SQL · Engines · MDP · Runtime · Foundation.

Architecture remains unique; experience varies.

**Implementation status:** Policy registered; tiered UI — future extension.

---

## BAAP-4 — Assisted Creation

Platform may suggest similar Business Assets, Workflows, Automations, Dashboards, Reports, Integrations, Templates, Capabilities, Marketplace packages.

Suggestions are **never mandatory**.

**Implementation status:** Explainability + reuse metadata (3.8); suggestion engine — future extension (D-060).

---

## BAAP-5 — Business Freedom

No AI or algorithm may force a decision or block a business choice.

Every recommendation must include: justificativa · benefícios · riscos · impacto · nível de confiança · origem.

User always has final decision.

**Implementation status:** Policy registered; recommendation contract — future extension.

---

## BAAP-6 — Human in Control

AI never replaces the user. AI explains, assists, recommends, organizes, identifies patterns/risks/opportunities.

Operational decision always belongs to the user.

Aligns with BD-10, BD-11 ([Business Derivation Architecture](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md)).

---

## BAAP-7 — Reusable Business Assets

Every Business Asset may be used in any compatible module.

Never belongs to: a screen · a Studio · a module.

Belongs exclusively to **business**.

**Program 3.8 evidence:** `reusable: true` · cross-entity policy · G306.

---

## BAAP-8 — Business Ownership

Every Business Asset belongs to the **organization** — never to user, AI, Studio, or module.

Assets may be: versioned · audited · reused · published · evolved · shared across organizational life.

**Program 3.8 evidence:** `businessComputedOwnership` · `ownerKind: organization` · audit trail.

---

## BAAP-9 — Technology Transparency

User never needs to know: AST · JSON · Code · SQL · Expression/Evaluation/Dependency/Computation Engine · Resolver · Runtime · Studio · Foundation.

**Program 3.8 evidence:** Business Language → Intent path; zero technical authoring surface in Business First mode. Expert/Studio boundary: [EXPERT-MODE-AND-STUDIO-BOUNDARY.md](../engineering/EXPERT-MODE-AND-STUDIO-BOUNDARY.md) (D-073).

---

## BAAP-10 — Explainable Platform

When any Business Asset is created automatically, platform must explain:

- por que foi criado
- qual problema resolve
- quais ativos foram reutilizados
- quais capacidades participaram
- quais regras participaram
- quais impactos existirão
- quais dependências serão afetadas
- qual resultado esperado

**Program 3.8 evidence:** `buildBusinessComputedExplainability` · G306.

---

## BAAP-11 — Explain Before Execute

Before executing any calculation, workflow, automation, dashboard, integration, or suggestion, platform must explain exactly what will be executed.

**Program 3.8 evidence:** `explainBeforeExecute` on Business Computed Field explainability report.

---

## BAAP-12 — Continuous Business Improvement

Platform continuously observes operations and may suggest: Computed Fields · Automations · Dashboards · Workflows · Integrations · Indicators · Reports · Processes · Rules · asset reuse.

Suggestions **never** applied automatically — always require user approval.

Permanent objective: increase operational capacity, reduce waste, simplify processes, preserve business knowledge.

**Implementation status:** Policy registered · observation loop — future extension (Process Mining, Evolution Engine, D-060).

---

## BAAP-13 — Zero Technical Authoring

User never creates technology. User creates **business knowledge only**.

All technical transformation belongs exclusively to the platform.

**Program 3.8 evidence:** Resolver derives Formula/Computation/AST; user describes business rule only.

---

## Future extensions (registered, not implemented)

| Extension | Owner |
|-----------|-------|
| Business First asset discovery | Intelligence / Resolver evolution |
| Expert Mode UI per asset type | Programs 3.9+ |
| Progressive Disclosure tiers | Studio UX programs |
| Assisted Creation engine | D-060 Intelligence |
| Continuous Improvement loop | Process Mining + Evolution Engine |
| Marketplace / Knowledge / Decision runtime | Extension points (G306) |

---

## Cross-references

| Document | Relationship |
|----------|--------------|
| [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) | Derivation infrastructure |
| [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) | Resolver exclusivity |
| [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | Intent SSOT |
| [MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md](./MAK-BUSINESS-LANGUAGE-ARCHITECTURE.md) | Business First surface |

---

*Registered D-068 — Program 3.8 Mission Brief. No structural architecture changes.*
