# Resource Limit Coherence

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

Per-dimension source (runtime) vs bridge limit, with reason + issueCode:
| dimension | source (runtime) | bridge | issueCode |
| --- | --- | --- | --- |
| maxSourcePayloadBytes | 2000000 | 262144 | BRIDGE_SOURCE_PAYLOAD_TOO_LARGE |
| maxSourceFields | 250 | 200 | BRIDGE_SOURCE_FIELDS_TOO_MANY |
| maxSourceLayoutSections | 100 | 64 | BRIDGE_SOURCE_LAYOUT_SECTIONS_TOO_MANY |
| maxSourceRelationships | 250 | 128 | BRIDGE_SOURCE_RELATIONSHIPS_TOO_MANY |
| maxValidationIssues | 1000 | 512 | BRIDGE_VALIDATION_ISSUES_TOO_MANY |
| maxExtensions | (none) | 32 | BRIDGE_EXTENSIONS_TOO_MANY |
| maxStringLength | 10000 | 4096 | BRIDGE_STRING_TOO_LONG |

Bridge limits are intentionally stricter: `bridgeLimitsMayRejectRuntimeValidHandoff` = true, `stricterBridgeLimitsAreIntentional` = true, `sourceAcceptanceDoesNotGuaranteeBridgeAcceptance` = true, `limitMismatchIsNotSilent` = true, `limitExceededProducesDeterministicBlocker` = true, `partialTargetDescriptorAllowed` = false.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
