# Intent Derivation Kind — SSOT

**Status:** Official — Parameter SSOT for Intent Resolver derivation kinds  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Platform Sanitization Cycle 1 (D-071)  
**Parent:** [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](../architecture/MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) §618–619

---

## Rule

Each `derivationKind` has **one canonical string** in `src/studio/intent/contracts/intentContracts.js`. The capability catalog **must list all kinds** a capability can produce.

---

## Implemented kinds (Program 3.7–3.8)

| Kind constant | String | Artifact | Program |
|---------------|--------|----------|---------|
| `DERIVATION_KIND_FORMULA` | `compute.formula` | Formula Document (projection) | 3.7 |
| `DERIVATION_KIND_COMPUTED_FIELD` | `compute.computed_field` | Business Computed Field | 3.8 |

Both belong to `capability.calculation` in [capabilityCatalog.js](../../src/studio/intent/catalog/capabilityCatalog.js).

---

## Extension kinds (not implemented)

Registered in `EXTENSION_DERIVATION_KINDS` — see [extensionPoints.js](../../src/studio/intent/resolver/extensionPoints.js). Do **not** add to capability catalog until Program authorizes implementation.

---

## Gate enforcement

G305 verifies capability catalog includes `compute.formula` and `compute.computed_field`.

---

*Resolved: PARAM-C03 (Program 3.8.6 audit).*
