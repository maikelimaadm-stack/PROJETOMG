# IFM 1C-MDP-3 — Relationship Dictionary Certification Report

**Mission ID:** IFM 1C-MDP-3  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Date:** 2026-06-29  
**Status:** Complete  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §5  
**Decision:** D-023 — MDP-3 Relationship Dictionary Schema

---

## 0. Executive Summary

**MDP-3 Relationship Dictionary** is implemented as the **official SSOT for all platform relationships**. Prisma graph for `EmpresaCadastro` is documented with physical FK relationships plus logical/computed dependency slots reserved for Workflow, AI, Dashboard, Pivot, Report, Permission, Layout, and Integration consumers.

---

## 1. Deliverables

### Prisma (D-023)

| Table | Status |
|-------|--------|
| `mdp_relationship` | ✅ Core relationship definitions |
| `mdp_relationship_label` | ✅ i18n labels |
| `mdp_relationship_field_binding` | ✅ Field ↔ relationship bindings |
| `mdp_relationship_audit` | ✅ Change history |

Migration: `backend/prisma/migrations/20260629120000_mdp3_relationship_dictionary/migration.sql`

### Enums

| Enum | Purpose |
|------|---------|
| `MdpRelationshipKind` | physical, logical, computed |
| `MdpRelationshipType` | one_to_one, one_to_many, many_to_many |
| `MdpRelationshipSemantics` | association, composition, aggregation, inheritance, dependency |
| `MdpRelationshipDependency` | restrict, cascade, set_null, optional |
| `MdpRelationshipDependencyClass` | data, workflow, automation, dashboard, pivot, report, permission, layout, ai_context, integration |

### API

| Route | Methods |
|-------|---------|
| `/api/mdp/relationships` | GET, POST |
| `/api/mdp/relationships/:id` | GET, PUT, DELETE |

### Seeds (EmpresaCadastro pilot)

| relationshipId | Kind | Enabled |
|----------------|------|---------|
| `EmpresaCadastro.cliente` | physical | ✅ |
| `EmpresaCadastro.cadastro_registros` | physical | ✅ |
| `EmpresaCadastro.anexos` | physical | ✅ |
| `EmpresaCadastro.permissoes` | physical | ✅ |
| `EmpresaCadastro.custom_fields` | logical | ✅ |
| `EmpresaCadastro.field_empresa_scopes` | logical | ❌ (reserved) |
| `EmpresaCadastro.workflow_dependencies` | logical | ❌ (reserved) |
| `EmpresaCadastro.ai_context` | computed | ❌ (reserved) |

### Field bindings

`bindMdpFieldRelationshipRefs.js` resolves `mdp_field.relation_entity` → `relationship_ref` + `mdp_relationship_field_binding`.

### Governance

| Gate | Check |
|------|-------|
| **G139** | Export ≥3 physical Empresas relationships + `/api/mdp/relationships` |

---

## 2. Validation Evidence

| Check | Result |
|-------|--------|
| Build | ✅ |
| Lint | ✅ |
| Typecheck (governance) | ✅ |
| verify:governance | ✅ (incl. G139) |
| verify:ci | ✅ |
| verify:governance:cycles | ✅ 5/5 |
| validate:mdp-relationships | ✅ SKIP without DATABASE_URL |

---

## 3. Certification Answers

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | Relationship Dictionary = SSOT oficial? | **SIM** | `mdp_relationship*` + API + G139 |
| 2 | Suporta físicos e lógicos? | **SIM** | `MdpRelationshipKind`: physical, logical, computed |
| 3 | Preparado para Workflow, IA, Dashboards, Pivot, Relatórios, Automações? | **SIM** | `MdpRelationshipDependencyClass` enum + reserved seeds (disabled v1) |
| 4 | Múltiplos Base Templates? | **SIM** | `base_template_id` on every relationship |
| 5 | Internacionalização? | **SIM** | `mdp_relationship_label` per locale |
| 6 | Marketplace e Offline sem refatoração? | **SIM** | Stable `relationship_id`, cardinality JSON, version FK |
| 7 | Build, Lint, CI, Governança verdes? | **SIM** | Validation §2 |
| 8 | Repositório saudável após merge PR #298? | **SIM** | PR #298 merged; main synced |
| 9 | Pronto para MDP-4? | **SIM** | Entity + Field + Relationship SSOT complete |
| 10 | Briefing MDP-4 preparado? | **SIM** | [IFM-1C-MDP-4-METADATA-REGISTRY.md](./IFM-1C-MDP-4-METADATA-REGISTRY.md) |

---

## 4. Out of Scope (Confirmed)

- MDP-4, MDP-5 implementation
- Studio UI, AI runtime, Marketplace, Offline

---

*Certified by IFM 1C-MDP-3 mission.*
