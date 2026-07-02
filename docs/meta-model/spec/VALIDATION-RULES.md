# PlatformSchema Validation Rules

**Status:** Normative · **Version:** 1.0.0 · **Mission:** 4.02 · **Decision:** D-MMM-03, D-MMM-17

---

## Objetivo

Definir regras **obrigatórias** de validação para envelope + payload em API, Studio e Publish (C-3).

---

## Pipeline de validação (ordem fixa)

| Step | Name | Input | Fail code | Rules |
|------|------|-------|-----------|-------|
| V-1 | **Envelope structure** | Raw JSON | `ENVELOPE_INVALID` | `mmm-envelope-v1.schema.json` |
| V-2 | **ObjectType registry** | `objectType` | `UNKNOWN_OBJECT_TYPE` | ∈ manifest; `record` rejected for write |
| V-3 | **Tenant scope** | `tenantId`, auth | `TENANT_FORBIDDEN` | R-05 isolation |
| V-4 | **Lifecycle transition** | `status` delta | `INVALID_TRANSITION` | [03-OBJECT-LIFECYCLE.md](../03-OBJECT-LIFECYCLE.md) |
| V-5 | **Payload schema** | `payload` | `PAYLOAD_INVALID` | `schemas/types/{objectType}.schema.json` |
| V-6 | **Labels** | `labels[]` | `LABELS_REQUIRED` | ≥1 LabelSet; default locale (R-06) |
| V-7 | **Lineage** | `lineage` | `LINEAGE_REQUIRED` | `source` mandatory (R-07) |
| V-8 | **Dependencies** | `dependencies` | `DEPENDENCY_INVALID` | [04-OBJECT-DEPENDENCIES.md](../04-OBJECT-DEPENDENCIES.md) |
| V-9 | **Revision** | `revision` | `REVISION_CONFLICT` | Optimistic lock on update |
| V-10 | **Forbidden keys** | payload | `FORBIDDEN_FIELD` | `__proto__`, `constructor`, `prototype` |

---

## Regras semânticas (pós-schema, publish C-4)

| Rule ID | Condition | Error |
|---------|-----------|-------|
| S-01 | `business_object` without ≥1 field ref | `BO_REQUIRES_FIELD` |
| S-02 | `workflow` without `initialStepRef` | `WORKFLOW_NO_INITIAL` |
| S-03 | Cross-module ref without `module_dependency` | `MISSING_MODULE_DEPENDENCY` |
| S-04 | `ai_candidate` with `humanReviewRequired != true` | `AI_REVIEW_REQUIRED` |
| S-05 | Write to `published/active` without publish op | `DIRECT_PUBLISH_FORBIDDEN` |

---

## Obrigatório / opcional / proibido

### Envelope (all types)

| Field | Required | Prohibited on write |
|-------|----------|-------------------|
| `envelopeVersion` | ✓ | change from `mmm-envelope-v1` |
| `objectId` | ✓ create | change on update |
| `objectType` | ✓ | change after create |
| `tenantId` | ✓ | cross-tenant |
| `labels` | ✓ (≥1) | empty array |
| `lineage` | ✓ | missing `source` |
| `payload` | ✓ | untyped blob bypass |
| `status` | ✓ | `active` without publish path |

### Payload (all PlatformSchema types)

| Field | Required | Optional | Forbidden |
|-------|----------|----------|-----------|
| `code` | ✓ | | empty, uppercase start |
| `description` | | ✓ | |
| `metadata` | | ✓ | |
| Type-specific | per manifest | per manifest | see manifest |

Full per-type lists: [object-type-manifest.json](./object-type-manifest.json).

---

## Gate G421

Validates: 226 schema files exist, parse as JSON Schema draft 2020-12, manifest count match, envelope schema present.

---

*End of document.*
