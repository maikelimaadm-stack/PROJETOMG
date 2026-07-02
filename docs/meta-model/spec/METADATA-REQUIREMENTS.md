# MMM Metadata Requirements

**Status:** Normative · **Version:** 1.0.0 · **Mission:** 4.02

---

## Envelope metadata (mandatory all objects)

| Field | Cardinality | Constraint |
|-------|-------------|------------|
| `objectId` | 1 | UUID stable forever (R-05) |
| `objectType` | 1 | Taxonomy enum |
| `tenantId` | 1 | Non-empty |
| `scope` | 1 | At least tenant scope |
| `status` | 1 | Lifecycle enum |
| `labels` | 1..n | ≥1 locale; platform default + tenant locales |
| `lineage.source` | 1 | Provenance enum |
| `revision` | 1 | Integer ≥1 |
| `createdAt` / `updatedAt` | 1 each | ISO-8601 |

---

## Payload metadata (mandatory all PlatformSchema types)

| Field | Required | Pattern |
|-------|----------|---------|
| `code` | ✓ | `^[a-z][a-z0-9_]*$`, unique within scope |

---

## Optional envelope fields

`dependencies`, `createdBy`, `updatedBy`, extended `lineage.*`

---

## Optional payload fields

`description`, `metadata.tags`, `metadata.documentationRef`

---

## Type-specific mandatory payload fields

Types with extensions beyond profile `code`:

| objectType | Additional required |
|------------|---------------------|
| `field` | `dataType` |
| `business_object` | `entityKindRef`, `persistenceMappingRef`, `primaryKeyFieldRef` |
| `permission` | `resourceType`, `resourceRef`, `action`, `effect` |
| `relationship` | `sourceBoRef`, `targetBoRef`, `cardinality` |
| `workflow` | `initialStepRef` |
| `compiled_bundle` | `crbVersion`, `contentHash`, `integrityHash` |
| `platform_schema` | `schemaVersion`, `jsonSchema` |
| `derivation_plan` | `steps` |
| `ai_candidate` | `candidateType`, `proposedPayload`, `humanReviewRequired=true` |
| `module_dependency` | `sourceModuleRef`, `targetModuleRef` |

All others: **`code` only** at v1 spec (extensions additive per R-19).

---

*End of document.*
