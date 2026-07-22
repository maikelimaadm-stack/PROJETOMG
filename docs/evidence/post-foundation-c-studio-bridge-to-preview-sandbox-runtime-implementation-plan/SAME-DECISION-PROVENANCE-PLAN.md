# Same-Decision Provenance Plan

Threats and detection:
- digest A + descriptor B → recompute digest over descriptor-B preimage; mismatch vs digest A (`RUNTIME_DECISION_DESCRIPTOR_MISMATCH`)
- digest B + descriptor A → recompute digest over descriptor-A preimage; mismatch vs digest B (`RUNTIME_DECISION_DESCRIPTOR_MISMATCH`)
- descriptor tampered → digest no longer matches recomputed preimage (`RUNTIME_DECISION_DIGEST_MISMATCH`)
- digest tampered → carried digest differs from recomputed digest (`RUNTIME_DECISION_DIGEST_MISMATCH`)
- status mismatch → sourceBridgeDecisionStatus differs from decision status in preimage (`RUNTIME_SOURCE_VERSION_MISMATCH`)
- version mismatch → source version differs from exact contract version (`RUNTIME_SOURCE_VERSION_MISMATCH`)
- cross-decision mix → pair not atomic — digest and descriptor from different decisions (`RUNTIME_CROSS_DECISION_MIX_FORBIDDEN`)

Issue codes:
- RUNTIME_ENVELOPE_REQUIRED
- RUNTIME_BRIDGE_DECISION_DIGEST_REQUIRED
- RUNTIME_TARGET_DESCRIPTOR_REQUIRED
- RUNTIME_DECISION_DIGEST_MISMATCH
- RUNTIME_DECISION_DESCRIPTOR_MISMATCH
- RUNTIME_CROSS_DECISION_MIX_FORBIDDEN
- RUNTIME_SOURCE_VERSION_MISMATCH
