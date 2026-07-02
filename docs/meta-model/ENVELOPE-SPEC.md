# MMM Universal Envelope — Specification Outline

**Status:** Official — Pre-4.02 outline (full JSON Schema in Program 4.02)  
**Version:** 0.9.0 (outline)  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.2 — alignment before PlatformSchema  
**Decision:** D-MMM-03  
**Owner:** Envelope contract; per-type payloads in topic docs + PlatformSchema registry

> **Rule:** This document defines the **envelope contract only**. Payload schemas are owned by [26-PLATFORM-SCHEMA.md](./26-PLATFORM-SCHEMA.md) and per-objectType schemas (4.02 deliverable).

---

## Objetivo

Eliminar ambiguidade do **envelope universal** antes da especificação formal JSON Schema no Program 4.02.

---

## Escopo

| In scope | Out of scope |
|----------|--------------|
| Envelope field definitions | Per-objectType payload fields |
| Validation order | API routing implementation |
| Lineage minimum structure | Database DDL |

---

## Envelope fields (canonical)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `objectId` | string (uuid) | ✓ | Stable cross-version identity (R-05) |
| `objectType` | string (enum) | ✓ | One of 227 taxonomy values |
| `tenantId` | string | ✓ | Tenant isolation |
| `scope` | object | ✓ | `{ applicationId?, moduleId?, companyId?, ouId? }` |
| `status` | enum | ✓ | Lifecycle status ([03-OBJECT-LIFECYCLE.md](./03-OBJECT-LIFECYCLE.md)) |
| `labels` | LabelSet[] | ✓ | i18n labels (R-06) |
| `lineage` | Lineage | ✓ | Provenance (R-07) |
| `payload` | object | ✓ | Typed by PlatformSchema for `objectType` |
| `dependencies` | object | | possess/use/reference/depend/inherit refs |
| `revision` | integer | ✓ | Optimistic concurrency |
| `createdAt` | datetime | ✓ | Audit |
| `updatedAt` | datetime | ✓ | Audit |
| `createdBy` | string | | User/service id |
| `updatedBy` | string | | User/service id |

### Lineage (minimum)

| Field | Required | Description |
|-------|----------|-------------|
| `source` | ✓ | `studio`, `business_language`, `ai`, `marketplace`, `import`, `system` |
| `sourceRef` | | intentId, packageId, aiCandidateId, etc. |
| `parentVersion` | | Prior definitionVersionId if forked |
| `templateRef` | | For inherit composition (R-15) |

### LabelSet

| Field | Required |
|-------|----------|
| `locale` | ✓ |
| `label` | ✓ |
| `description` | |

---

## Validation order

1. Parse envelope structure (envelope schema)
2. Validate `objectType` ∈ taxonomy ([02-OBJECT-TAXONOMY.md](./02-OBJECT-TAXONOMY.md))
3. Validate `status` transition if update
4. Validate `payload` against PlatformSchema[`objectType`]
5. Validate `dependencies` graph rules ([04-OBJECT-DEPENDENCIES.md](./04-OBJECT-DEPENDENCIES.md))

---

## Exclusions

| objectType | PlatformSchema in 4.02? | Reason |
|------------|---------------------------|--------|
| `record` | **No** | L0 data only (R-14); taxonomy reference for linkage |

**PlatformSchema count for 4.02: 226**

---

## Integrações

- API contract C-01 ([CONTRACTS.md](./CONTRACTS.md))
- Publish C-3 validate ([17-PUBLISH-PIPELINE.md](./17-PUBLISH-PIPELINE.md))
- Program 4.02: publish `mmm-envelope-v1.json` + 226 payload schemas

---

## Versionamento

| Version | Target |
|---------|--------|
| 0.9.0 | Outline (4.01.2) |
| 1.0.0 | Full JSON Schema (4.02) |

---

*End of document.*
