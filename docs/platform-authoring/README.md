# MAK Platform Authoring — Documentation Hub

**Status:** Official SSOT — Universal Authoring Specification (UAS)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation B.7 — Universal Authoring Specification  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); consumed by future Studio and Runtime

> **Rule:** Foundation C (Runtime) **must not start** until [25-AUDITORIA-FINAL.md](./25-AUDITORIA-FINAL.md) certifies **PASS**. UAS is the **last documentation pillar** before heavy Runtime/Studio implementation.

---

## Five pillars

| Pillar | Path | Answers |
|--------|------|---------|
| What exists | [docs/meta-model/](../meta-model/) | Taxonomy, envelope, schemas |
| How built | [docs/platform-architecture/](../platform-architecture/) | Layers, components, topology |
| How behaves | [docs/platform-behavior/](../platform-behavior/) | Lifecycles, USM, operational rules |
| How executes | [docs/platform-protocol/](../platform-protocol/) | UEP messages, pipeline, contracts |
| How users create | [docs/platform-authoring/](./) | **UAS — authoring language, designers, wizards** |

---

## Document index

| # | Document | Topic |
|---|----------|-------|
| 01 | [UNIVERSAL-AUTHORING-OVERVIEW](./01-UNIVERSAL-AUTHORING-OVERVIEW.md) | Birth of a solution, creation order |
| 02 | [UNIVERSAL-AUTHORING-LANGUAGE](./02-UNIVERSAL-AUTHORING-LANGUAGE.md) | Official configuration language |
| 03 | [UNIVERSAL-PROPERTY-SYSTEM](./03-UNIVERSAL-PROPERTY-SYSTEM.md) | Properties, inheritance, defaults |
| 04 | [UNIVERSAL-DESIGNERS](./04-UNIVERSAL-DESIGNERS.md) | Full designer catalog |
| 05 | [UNIVERSAL-WIZARDS](./05-UNIVERSAL-WIZARDS.md) | System wizards (ERP, CRM, etc.) |
| 06 | [UNIVERSAL-CONFIGURATION-SYSTEM](./06-UNIVERSAL-CONFIGURATION-SYSTEM.md) | Zero-code configuration model |
| 07 | [UNIVERSAL-FORMULA-LANGUAGE](./07-UNIVERSAL-FORMULA-LANGUAGE.md) | Formula DSL |
| 08 | [UNIVERSAL-VALIDATION-LANGUAGE](./08-UNIVERSAL-VALIDATION-LANGUAGE.md) | Validation DSL |
| 09 | [UNIVERSAL-EXPRESSIONS](./09-UNIVERSAL-EXPRESSIONS.md) | Expression engine |
| 10 | [UNIVERSAL-DATA-BINDING](./10-UNIVERSAL-DATA-BINDING.md) | Screen ↔ data |
| 11 | [UNIVERSAL-ACTION-BINDING](./11-UNIVERSAL-ACTION-BINDING.md) | Button ↔ action |
| 12 | [UNIVERSAL-EVENT-BINDING](./12-UNIVERSAL-EVENT-BINDING.md) | Event wiring |
| 13 | [UNIVERSAL-WORKFLOW-BINDING](./13-UNIVERSAL-WORKFLOW-BINDING.md) | Workflow wiring |
| 14 | [UNIVERSAL-API-BINDING](./14-UNIVERSAL-API-BINDING.md) | External API binding |
| 15 | [UNIVERSAL-CONNECTORS](./15-UNIVERSAL-CONNECTORS.md) | Connector authoring |
| 16 | [UNIVERSAL-TEMPLATE-SYSTEM](./16-UNIVERSAL-TEMPLATE-SYSTEM.md) | Templates, packages, inheritance |
| 17 | [UNIVERSAL-APPLICATION-BUILDER](./17-UNIVERSAL-APPLICATION-BUILDER.md) | Full app without code |
| 18 | [UNIVERSAL-REVIEW-SYSTEM](./18-UNIVERSAL-REVIEW-SYSTEM.md) | Draft → publish |
| 19 | [UNIVERSAL-VERSIONING](./19-UNIVERSAL-VERSIONING.md) | Compare, diff, rollback |
| 20 | [UNIVERSAL-COLLABORATION](./20-UNIVERSAL-COLLABORATION.md) | Multi-user authoring |
| 21 | [UNIVERSAL-MARKETPLACE-AUTHORING](./21-UNIVERSAL-MARKETPLACE-AUTHORING.md) | Publish, sell, install |
| 22 | [AI-AUTHORING](./22-AI-AUTHORING.md) | AI-assisted path (bounded) |
| 23 | [MANUAL-AUTHORING](./23-MANUAL-AUTHORING.md) | Full manual path |
| 24 | [LOW-CODE-PHILOSOPHY](./24-LOW-CODE-PHILOSOPHY.md) | Permanent principles |
| 25 | [AUDITORIA-FINAL](./25-AUDITORIA-FINAL.md) | B.7 certification |

---

## Cross-cutting

| Document | Purpose |
|----------|---------|
| [DECISIONS.md](./DECISIONS.md) | D-UA-01 through D-UA-35 |
| [CONTRACTS.md](./CONTRACTS.md) | Authoring contracts |

---

## Authoring language version

**`mak-uas-v1`** — all authoring artifacts reference `"authoringVersion": "mak-uas-v1"`.

---

*End of document.*
