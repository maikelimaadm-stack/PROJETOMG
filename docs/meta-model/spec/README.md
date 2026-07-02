# MMM Formal Specification — Program 4.02

**Status:** Official specification (normative)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.02 — MMM Specification  
**Decision:** D-MMM-17  
**Foundation SSOT:** [../README.md](../README.md) (architecture — do not duplicate)

> **Rule:** This folder contains **normative specification artifacts** for implementation Programs 4.03+. Architecture rationale remains in docs 00–30.

---

## Specification index

| Artifact | Path | Purpose |
|----------|------|---------|
| **Specification overview** | [SPECIFICATION-OVERVIEW.md](./SPECIFICATION-OVERVIEW.md) | Master 4.02 index |
| **Envelope JSON Schema** | [mmm-envelope-v1.schema.json](./mmm-envelope-v1.schema.json) | Universal envelope |
| **API contract (OpenAPI)** | [mmm-api-v1.openapi.yaml](./mmm-api-v1.openapi.yaml) | REST MMM API |
| **Object type manifest** | [object-type-manifest.json](./object-type-manifest.json) | 226 types registry |
| **Validation rules** | [VALIDATION-RULES.md](./VALIDATION-RULES.md) | PlatformSchema validation |
| **Metadata requirements** | [METADATA-REQUIREMENTS.md](./METADATA-REQUIREMENTS.md) | Envelope + payload metadata |
| **Versioning & compatibility** | [VERSIONING-COMPATIBILITY.md](./VERSIONING-COMPATIBILITY.md) | Schema semver rules |
| **Derivation kind map** | [DERIVATION-KIND-MAP.md](./DERIVATION-KIND-MAP.md) | 19 kinds ↔ objectTypes |
| **Schema definitions** | [schemas/_definitions.schema.json](./schemas/_definitions.schema.json) | Shared $defs |
| **Group profiles** | [schemas/profiles/](./schemas/profiles/) | 11 payload profiles A–K |
| **Payload schemas** | [schemas/types/](./schemas/types/) | 226 per-type JSON Schemas |

---

## Gate

| Gate | Validates |
|------|-----------|
| **G421** | 226 payload schemas + envelope + manifest completeness |

See [G421-SPEC.md](./G421-SPEC.md) and [GATE-REGISTRY.md](../../engineering/GATE-REGISTRY.md).

---

## Versioning

| Spec version | MMM spec bundle |
|--------------|-----------------|
| 1.0.0 | `mmm-spec-v1` (envelope-v1 + payload-v1) |

---

*End of document.*
