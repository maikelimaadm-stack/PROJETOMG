# Determinism

Determinism is a **blocking requirement**. The subtree contains NO `Date.now`, `new Date`,
`Math.random`, `crypto.randomUUID`, `randomUUID`, `performance.now`, `hrtime`, or locale/timezone-
dependent output. (`Math.imul` is used only for the fixed FNV-1a prime multiply — not a random source.)

- Ids, digests and sessions derive ONLY from explicit inputs (`seed`, operation inputs).
- `stableSerialize` produces key-sorted JSON so digests are key-order independent.
- `createDeterministicDigest` = FNV-1a over the stable serialization → `fnv1a-<8hex>`.
- Same input → same snapshot, revision, issues, digest and order. Replay of a full flow yields
  byte-identical session/receipt digests.
- The verifier (`verifyAuthoringRuntime`) statically scans embedded strings for the forbidden
  nondeterministic patterns and blocks; the gate scans the whole subtree (excluding the verifier's own
  detection regex).
