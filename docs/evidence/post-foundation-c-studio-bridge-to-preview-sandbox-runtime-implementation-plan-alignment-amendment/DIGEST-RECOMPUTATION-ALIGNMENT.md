# Digest Recomputation Alignment

- 1. validate Core Envelope v2 shape
- 2. extract bridgeDecisionDigest
- 3. extract bridgeDecisionCore
- 4. verify exact core field set
- 5. stableSerialize(bridgeDecisionCore)
- 6. createDeterministicDigest(bridgeDecisionCore)
- 7. compare exact digest
- 8. reject mismatch

required/available/missing/extra: 32/32/0/0
bRecomputeInputResolvedByPlan: true
