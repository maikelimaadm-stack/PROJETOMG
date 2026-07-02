# MAK Universal Meta Model (MMM) — Documentation Hub

**Status:** Official SSOT — Meta Model architecture  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.1 — Meta Model Constitution  
**Program:** 4.01.1 (documentation) · precedes 4.02+ (implementation)

> **Authority:** This folder is the **single source of truth** for the MAK Universal Meta Model. All Programs 4.xx implementations must conform to these documents. Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md) and [Product Identity Freeze](../architecture/MAK-PRODUCT-IDENTITY-FREEZE.md) (D-074).

---

## How to read this documentation

1. Start with [00-META-MODEL-OVERVIEW.md](./00-META-MODEL-OVERVIEW.md)
2. Read [GLOSSARY.md](./GLOSSARY.md) for terminology
3. Read [RULES.md](./RULES.md) and [DECISIONS.md](./DECISIONS.md) before any implementation
4. Deep-dive into topic documents as needed

**Design principle:** Each concept is documented **once**. Other documents link here — they do not duplicate content.

---

## Cross-cutting documents

| Document | Owner topic |
|----------|-------------|
| [GLOSSARY.md](./GLOSSARY.md) | Terminology |
| [RULES.md](./RULES.md) | Permanent rules, invariants, principles |
| [DECISIONS.md](./DECISIONS.md) | Architectural decisions D-MMM-xxx |
| [CONTRACTS.md](./CONTRACTS.md) | Inter-subsystem contracts |
| [ROADMAP.md](./ROADMAP.md) | Program 4.02 → 4.xx evolution (**MMM roadmap SSOT**) |
| [ATTENTION-POINTS.md](./ATTENTION-POINTS.md) | Known gaps summary |
| [DIVERGENCE-REGISTER.md](./DIVERGENCE-REGISTER.md) | **Alignment register (4.01.2)** |
| [ENVELOPE-SPEC.md](./ENVELOPE-SPEC.md) | Universal envelope outline (pre-4.02) |

---

## Architecture documents (00–30)

| # | Document | Single owner topic |
|---|----------|-------------------|
| 00 | [META-MODEL-OVERVIEW](./00-META-MODEL-OVERVIEW.md) | Platform-wide MMM introduction |
| 01 | [CORE-ARCHITECTURE](./01-CORE-ARCHITECTURE.md) | Layer model and principles |
| 02 | [OBJECT-TAXONOMY](./02-OBJECT-TAXONOMY.md) | 227 objectTypes (226 PlatformSchemas) |
| 03 | [OBJECT-LIFECYCLE](./03-OBJECT-LIFECYCLE.md) | States and operations |
| 04 | [OBJECT-DEPENDENCIES](./04-OBJECT-DEPENDENCIES.md) | Ownership and reference graph |
| 05 | [BUSINESS-OBJECTS](./05-BUSINESS-OBJECTS.md) | BusinessObject model |
| 06 | [FIELDS](./06-FIELDS.md) | Field model |
| 07 | [RELATIONSHIPS](./07-RELATIONSHIPS.md) | Relationship model |
| 08 | [PRESENTATION-LAYER](./08-PRESENTATION-LAYER.md) | Screens, layouts, views |
| 09 | [WORKFLOWS](./09-WORKFLOWS.md) | Workflow model |
| 10 | [AUTOMATIONS](./10-AUTOMATIONS.md) | Automation and triggers |
| 11 | [DASHBOARDS](./11-DASHBOARDS.md) | Dashboards and widgets |
| 12 | [REPORTS](./12-REPORTS.md) | Reports and queries |
| 13 | [PERMISSIONS](./13-PERMISSIONS.md) | RBAC/ABAC model |
| 14 | [APPLICATIONS](./14-APPLICATIONS.md) | Application topology |
| 15 | [MODULES](./15-MODULES.md) | Module model |
| 16 | [RUNTIME](./16-RUNTIME.md) | Runtime consumption |
| 17 | [PUBLISH-PIPELINE](./17-PUBLISH-PIPELINE.md) | Compile pipeline C-1→C-16 |
| 18 | [COMPILED-RUNTIME-BUNDLE](./18-COMPILED-RUNTIME-BUNDLE.md) | CRB specification |
| 19 | [MARKETPLACE](./19-MARKETPLACE.md) | .makpkg and distribution |
| 20 | [BUSINESS-LANGUAGE](./20-BUSINESS-LANGUAGE.md) | Business Language authoring |
| 21 | [INTENT-ENGINE](./21-INTENT-ENGINE.md) | Intent and derivation |
| 22 | [AI-GATEWAY](./22-AI-GATEWAY.md) | AI → AICandidate flow |
| 23 | [GENERIC-REPOSITORY](./23-GENERIC-REPOSITORY.md) | L0 data access adapters |
| 24 | [PERSISTENCE](./24-PERSISTENCE.md) | MMM storage substrate |
| 25 | [EVENT-BUS](./25-EVENT-BUS.md) | L3 event bus |
| 26 | [PLATFORM-SCHEMA](./26-PLATFORM-SCHEMA.md) | JSON Schema registry |
| 27 | [VERSIONING](./27-VERSIONING.md) | Version and pin model |
| 28 | [GOVERNANCE](./28-GOVERNANCE.md) | MMM governance and gates |
| 29 | [EXTENSION-POINTS](./29-EXTENSION-POINTS.md) | Extension model |
| 30 | [ROADMAP-INDEX](./30-ROADMAP-INDEX.md) | Pointer to ROADMAP.md |

---

## Relationship to legacy docs

| Legacy SSOT | MMM relationship |
|-------------|------------------|
| [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) | **Subsumed** as persistence substrate — see [24-PERSISTENCE.md](./24-PERSISTENCE.md) |
| [MAK-BUSINESS-INTENT-*](../architecture/) docs | **Integrated** — see [20](./20-BUSINESS-LANGUAGE.md), [21](./21-INTENT-ENGINE.md) |
| [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) | **Subordinate** — Studio edits MMM per these specs |

---

## Amendment process

Changes to MMM architecture require:

1. New D-MMM entry in [DECISIONS.md](./DECISIONS.md)
2. Update affected topic document(s) only
3. Update [GLOSSARY.md](./GLOSSARY.md) if new terms
4. Register in [GOVERNANCE-REGISTRY.md](../engineering/GOVERNANCE-REGISTRY.md)
