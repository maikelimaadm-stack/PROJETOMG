# Phase-by-Phase Plan

## PHASE_01_RUNTIME_CONFIG_AND_CAPABILITIES (order 1)
- objective: Declare the future runtime config, capability flags and version tuple reflected read-only from the merged contracts.
- futureFiles: runtimeConfig.js, runtimeCapabilities.js
- inputs: config | outputs: frozen runtime config, capability manifest
- dependencies: (none)
- issueCodes: RUNTIME_CONFIG_INVALID
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: every runtime flag defaults false; version tuple equals contract versions

## PHASE_02_SAFE_INPUT_NORMALIZATION (order 2)
- objective: Reuse the hardened bridge safe-normalization principles (cycle guard, depth cap, JSON-safe policy) before any envelope validation.
- futureFiles: normalizeEnvelopeInput.js
- inputs: raw envelope candidate | outputs: normalized value or issues
- dependencies: PHASE_01_RUNTIME_CONFIG_AND_CAPABILITIES
- issueCodes: RUNTIME_INPUT_CYCLE, RUNTIME_INPUT_TOO_DEEP, RUNTIME_INPUT_NON_JSON_SAFE, RUNTIME_INPUT_SPARSE_ARRAY, RUNTIME_INPUT_ACCESSOR, RUNTIME_INPUT_PROTOTYPE_POLLUTION
- failureMode: fail_closed_emergency_rejection | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no unbounded recursion; no prototype pollution; sanitized rejection

## PHASE_03_ENVELOPE_SHAPE_VALIDATION (order 3)
- objective: Validate the envelope against the real 17-field envelope shape with no invented fields and required-field presence.
- futureFiles: validateEnvelopeShape.js
- inputs: normalized envelope | outputs: shape issues
- dependencies: PHASE_02_SAFE_INPUT_NORMALIZATION
- issueCodes: RUNTIME_ENVELOPE_REQUIRED, RUNTIME_ENVELOPE_INVENTED_FIELD, RUNTIME_ENVELOPE_MISSING_REQUIRED_FIELD, RUNTIME_BRIDGE_DECISION_DIGEST_REQUIRED, RUNTIME_TARGET_DESCRIPTOR_REQUIRED
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: digest + descriptor required; no invented envelope field accepted

## PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE (order 4)
- objective: Reconstruct the decision digest preimage and recompute the FNV digest, comparing byte-for-byte against the carried bridgeDecisionDigest.
- futureFiles: recomputeAndValidateBridgeDecisionDigest.js, createDecisionDigest.js
- inputs: decision preimage (32 fields), carried bridgeDecisionDigest | outputs: digest match issues
- dependencies: PHASE_03_ENVELOPE_SHAPE_VALIDATION
- issueCodes: RUNTIME_DECISION_DIGEST_MISMATCH, RUNTIME_DIGEST_PREIMAGE_INCOMPLETE, RUNTIME_DIGEST_SYNTHESIS_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: digest recomputed only from complete preimage; no silent fallback

## PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION (order 5)
- objective: Prove the digest and descriptor come from the SAME real decision — reject cross-decision mixing, replacement and tampering.
- futureFiles: validateSameDecisionProvenance.js
- inputs: digest, descriptor | outputs: provenance issues
- dependencies: PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE
- issueCodes: RUNTIME_DECISION_DESCRIPTOR_MISMATCH, RUNTIME_CROSS_DECISION_MIX_FORBIDDEN, RUNTIME_DESCRIPTOR_REPLACEMENT_FORBIDDEN, RUNTIME_DIGEST_REPLACEMENT_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no cross-decision pair accepted; descriptor covered by digest

## PHASE_06_VERSION_TUPLE_VALIDATION (order 6)
- objective: Validate every source/target version against the exact real contract versions — unknown fails closed, no aggregate alias, no silent coercion.
- futureFiles: validateVersionTuple.js
- inputs: source/target versions | outputs: version issues
- dependencies: PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION
- issueCodes: RUNTIME_SOURCE_VERSION_MISMATCH, RUNTIME_VERSION_UNKNOWN, RUNTIME_AGGREGATED_VERSION_ALIAS_FORBIDDEN, RUNTIME_SILENT_VERSION_COERCION_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: exact version match required; no coercion

## PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION (order 7)
- objective: Assert synthetic/immutable/metadataOnly true and every security flag (previewMounted/routeCreated/menuCreated/productExposed/realDataAttached/moduleGenerated/persistenceAllowed) false.
- futureFiles: validateSyntheticBoundary.js, validateSecurityBoundary.js
- inputs: target descriptor | outputs: boundary issues
- dependencies: PHASE_06_VERSION_TUPLE_VALIDATION
- issueCodes: RUNTIME_NOT_SYNTHETIC, RUNTIME_SECURITY_FLAG_FORBIDDEN, RUNTIME_NOT_METADATA_ONLY
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: synthetic-only enforced; no security escalation

## PHASE_08_RESOURCE_LIMIT_ENFORCEMENT (order 8)
- objective: Enforce every real resource dimension with the stricter consumer limit, no silent truncation, no partial descriptor.
- futureFiles: enforceRuntimeResourceLimits.js
- inputs: candidate structure | outputs: limit issues
- dependencies: PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION
- issueCodes: RUNTIME_LIMIT_EXCEEDED, RUNTIME_UNKNOWN_RESOURCE_DIMENSION
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no silent truncation; no partial descriptor on overflow

## PHASE_09_EXTENSION_VALIDATION (order 9)
- objective: Validate optional extensions: namespaced, schema-bound, no override of canonical/security/version/digest capabilities.
- futureFiles: validateRuntimeExtensions.js
- inputs: extensions | outputs: extension issues
- dependencies: PHASE_08_RESOURCE_LIMIT_ENFORCEMENT
- issueCodes: RUNTIME_EXTENSION_UNNAMESPACED_FORBIDDEN, RUNTIME_EXTENSION_MISSING_SCHEMA, RUNTIME_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no extension enables product/mount/certification

## PHASE_10_MAPPING_CONTRACT_VALIDATION (order 10)
- objective: Validate the 12 real field mappings: known source fields, no invented target, allowed transforms, no default, lossless, no duplicate.
- futureFiles: validateMappingContract.js
- inputs: field mapping contract | outputs: mapping issues
- dependencies: PHASE_09_EXTENSION_VALIDATION
- issueCodes: RUNTIME_MAPPING_SOURCE_FIELD_MISSING, RUNTIME_MAPPING_TARGET_FIELD_INVENTED, RUNTIME_MAPPING_UNKNOWN_TRANSFORM, RUNTIME_MAPPING_DEFAULT_FORBIDDEN, RUNTIME_MAPPING_DUPLICATE_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no local divergent mapping list; lossless enforced

## PHASE_11_FIELD_MAPPING_EXECUTION (order 11)
- objective: Execute the 12 mappings in fixed order via clone semantics into the future sandbox descriptor fields — no default, no loss, no duplicate target.
- futureFiles: executeFieldMappings.js
- inputs: validated descriptor, mapping contract | outputs: mapped fields
- dependencies: PHASE_10_MAPPING_CONTRACT_VALIDATION
- issueCodes: RUNTIME_MAPPING_LOSSY_FORBIDDEN, RUNTIME_MAPPING_TARGET_COLLISION_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: deterministic order; no source mutation

## PHASE_12_SANDBOX_DESCRIPTOR_BUILD (order 12)
- objective: Build the metadata-only sandbox descriptor from the mapped fields, only after all blockers pass.
- futureFiles: createSandboxDescriptor.js
- inputs: mapped fields | outputs: sandbox descriptor (metadata-only)
- dependencies: PHASE_11_FIELD_MAPPING_EXECUTION
- issueCodes: RUNTIME_PARTIAL_DESCRIPTOR_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: descriptor only after green pipeline; immutable output

## PHASE_13_SANDBOX_DESCRIPTOR_VALIDATION (order 13)
- objective: Validate the built descriptor against the real future sandbox descriptor shape and security invariants.
- futureFiles: validateSandboxDescriptor.js
- inputs: sandbox descriptor | outputs: descriptor issues
- dependencies: PHASE_12_SANDBOX_DESCRIPTOR_BUILD
- issueCodes: RUNTIME_SANDBOX_DESCRIPTOR_SHAPE_INVALID, RUNTIME_SANDBOX_SECURITY_FLAG_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: descriptor validated true; no security escalation

## PHASE_14_CONSUMER_DECISION_BUILD (order 14)
- objective: Build the deterministic consumer decision with canonical serializer, decision digest, ordered issues and success/failure status.
- futureFiles: createConsumerDecision.js
- inputs: pipeline state | outputs: consumer decision + consumerDecisionDigest
- dependencies: PHASE_13_SANDBOX_DESCRIPTOR_VALIDATION
- issueCodes: RUNTIME_CONSUMER_DECISION_INVALID
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: deterministic digest; FNV internal identity only

## PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION (order 15)
- objective: Contain all failures atomically: null descriptor on blocker, no partial output, no source mutation, sanitized emergency rejection on unexpected exceptions.
- futureFiles: createFailureContainment.js, createEmergencyConsumerRejection.js
- inputs: error/blocker state | outputs: sanitized rejection
- dependencies: PHASE_14_CONSUMER_DECISION_BUILD
- issueCodes: RUNTIME_UNEXPECTED_EXECUTION_FAILURE
- failureMode: fail_closed_emergency_rejection | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: no partial descriptor; no secret/stack leak

## PHASE_16_REPLAY_IDEMPOTENCY_AND_DETERMINISM (order 16)
- objective: Guarantee same envelope + same config → same decision, same issue ordering, same descriptor, same digest, across instances; no ambient clock/random/locale/timezone.
- futureFiles: createReplayContract.js
- inputs: two identical runs | outputs: determinism proof
- dependencies: PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION
- issueCodes: RUNTIME_NONDETERMINISM_FORBIDDEN
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: deterministic across instances; no randomness/locale/timezone

## PHASE_17_MANIFEST_VERIFIER_READINESS (order 17)
- objective: Provide the runtime manifest (part digests + overall), fail-closed verifier, compatibility check and readiness decision.
- futureFiles: createRuntimeManifest.js, verifyRuntime.js, checkRuntimeCompatibility.js, createRuntimeDiagnostics.js, createRuntimeReadinessDecision.js
- inputs: runtime object | outputs: manifest, verification, readiness
- dependencies: PHASE_16_REPLAY_IDEMPOTENCY_AND_DETERMINISM
- issueCodes: RUNTIME_VERIFICATION_FAILED
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: deterministic manifest; verifier blocks premature runtime

## PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION (order 18)
- objective: Deliver the future runtime test (>= 900 asserts), gate (>= 280 checks), evidence and the manual pre-mount checkpoint.
- futureFiles: (test + gate + evidence — separate slice)
- inputs: runtime + manifest | outputs: certified runtime evidence
- dependencies: PHASE_17_MANIFEST_VERIFIER_READINESS
- issueCodes: (none)
- failureMode: fail_closed | sideEffectsAllowed: false | implementationStatus: planned
- rollback: rollback_by_non_consumption
- acceptance: manual checkpoint required before preview mount; no auto product exposure

