# Digest Equivalence (proven live in test + gate)

createDeterministicDigest(stableSerialize(bridgeDecisionCore)) === realBridgeDecision.bridgeDecisionDigest; and stableSerialize(core) === stableSerialize(decision − digest). Multi-seed. FNV internal identity only, not cryptographic.
