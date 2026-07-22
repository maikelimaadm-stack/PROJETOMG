# B-RECOMPUTE-INPUT Analysis

Coverage (proven in #488) is NOT the same as the future runtime having the recomputation inputs in the envelope.

- required decision preimage fields: **32**
- envelope fields available for recompute: **3** (bridgeVersion, status, targetDescriptor)
- missing inputs: **29**
- envelope sufficient for recompute now: **false**

## Options (§13)
- **A** (selected: true): Envelope carries minimal additional preimage fields — Amend the future envelope-identity contract to carry the remaining 29 scalar/small decision-preimage fields (targetDescriptor, the single large field, is already carried). This lets the consumer recompute the full 32-field preimage and compare byte-for-byte.
- **B** (selected: false): Envelope carries the complete bridgeDecision core — Carry the entire 32-field decision core in the envelope. Correct but heavier than A and duplicates data the descriptor already contains.
- **C** (selected: false): Identity validated at the bridge-decision boundary — Verify the digest where the full decision object still exists (the bridge boundary) and emit the envelope as a post-verification provenance token. Valid, but the consumer then cannot INDEPENDENTLY recompute — it trusts the boundary. Recorded as the fallback architecture if amendment A is rejected.

- selected solution: **Option A**; documented alternative: Option C
- resolved by plan: **false**
- runtime implementation blocked: **true**

Rationale: Option A is selected as the required resolution and specified concretely (exact missing fields). But it depends on a future envelope-contract amendment that is NOT yet merged; until that amendment lands and is audited, recomputation inputs are incomplete, so runtime implementation remains blocked.

## Missing preimage fields (29)
- appTouched
- blockerCount
- certificationPerformed
- databaseRollbackRequired
- errorCount
- externalCleanupRequired
- filesystemCleanupRequired
- idempotent
- issueCount
- issues
- kind
- menuCreated
- mode
- moduleGenerated
- ok
- partialTargetDescriptor
- persisted
- previewMounted
- productExposed
- realDataRead
- replaySideEffectsAllowed
- rollbackByNonConsumption
- routeCreated
- sideEffects
- sourceMutated
- stageCount
- stages
- targetDescriptorCreated
- warningCount
