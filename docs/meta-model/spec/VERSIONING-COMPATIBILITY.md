# PlatformSchema Versioning & Compatibility

**Status:** Normative · **Version:** 1.0.0 · **Mission:** 4.02 · **Rules:** R-19, R-05

---

## Version identifiers

| Artifact | Version key | Format |
|----------|-------------|--------|
| Spec bundle | `mmm-spec-v1` | Major platform spec |
| Envelope | `envelopeVersion` | `mmm-envelope-v1` |
| Payload schema | `schemaVersion` in manifest | Semver per objectType |
| API | OpenAPI `mmm-api-v1` | `/api/mmm/v1` |
| CRB | `crbVersion` | `mmm-crb-v1` (separate — 4.04) |

---

## Compatibility rules

| Change type | Allowed | Action |
|-------------|---------|--------|
| Add optional payload property | ✓ | Minor semver bump |
| Add new objectType | ✓ | Additive taxonomy (R-19) |
| Add required payload property | ⚠ | Major semver + migration |
| Remove property | ✗ | Deprecate only; never remove |
| Rename property | ✗ | Add new + deprecate old |
| Change `objectId` | ✗ | Forbidden (R-05) |

---

## Deprecation

- Deprecated properties marked in schema `deprecated: true`
- Deprecated objectTypes remain in enum and manifest
- Publish accepts deprecated types until successorship defined

---

## objectId stability

Updates increment `revision`; `objectId` immutable. Fork creates new `objectId` with lineage.

---

*End of document.*
