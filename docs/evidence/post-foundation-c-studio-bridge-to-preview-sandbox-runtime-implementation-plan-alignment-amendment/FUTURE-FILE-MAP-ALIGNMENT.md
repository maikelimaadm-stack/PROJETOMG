# Future File Map Alignment

originalFutureFileCount: 27
alignedFutureFileCount: 28
added: validateBridgeDecisionCore.js (exact core field-set completeness/extra validation before digest recompute)

- normalizeEnvelopeInput.js -> normalize Core Envelope v2
- validateEnvelopeShape.js -> validate Core Envelope v2 shape
- recomputeAndValidateBridgeDecisionDigest.js -> recompute digest over bridgeDecisionCore
- validateSameDecisionProvenance.js -> digest + core atomicity
