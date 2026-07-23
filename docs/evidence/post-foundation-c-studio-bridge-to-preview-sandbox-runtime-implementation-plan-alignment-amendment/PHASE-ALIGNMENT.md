# Phase Alignment

originalPhaseCount: 18
phase04ConsumesCore/Digest: true/true
reconstructionOf29MissingFieldsRemoved: true

- PHASE_02_SAFE_INPUT_NORMALIZATION: normalize BridgeDecisionCoreEnvelope v2 input (was v1)
- PHASE_03_ENVELOPE_SHAPE_VALIDATION: validate Core Envelope v2 shape (was v1 identity envelope)
- PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE: consume bridgeDecisionCore + bridgeDecisionDigest; recompute exactly (no 29-field reconstruction)
- PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION: atomic digest + core provenance
- PHASE_06_VERSION_TUPLE_VALIDATION: validate Core Envelope v2 version tuple
