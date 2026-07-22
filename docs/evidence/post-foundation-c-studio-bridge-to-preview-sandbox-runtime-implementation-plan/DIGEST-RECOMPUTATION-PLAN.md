# Digest Recomputation Plan

Algorithm:
- 1. validate envelope shape
- 2. extract bridgeDecisionDigest
- 3. extract targetDescriptor
- 4. reconstruct expected bridgeDecision core from the envelope-supported source
- 5. stableSerialize canonical preimage
- 6. createDeterministicDigest (FNV-1a, internal identity only)
- 7. compare exact digest
- 8. reject mismatch

Digest helper: createDeterministicDigest (FNV-1a, key-sorted) — internal identity only, NOT cryptographic

implementationCannotProceedUntilDigestRecomputationInputsAreComplete: true
