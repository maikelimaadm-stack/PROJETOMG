# Immutability

- The runtime never mutates its inputs: `executeAuthoringOperation` deep-clones the input session
  (`normalizeAuthoringInput`) before any work and returns a NEW frozen session.
- Draft snapshots are **deep-frozen** — nested `fields`/`layout`/`relationships` arrays cannot be
  mutated (attempting `push` throws in strict mode).
- A previous snapshot never changes after a new operation; its digest stays stable.
- External mutation of the caller's input after a call does not affect the produced snapshot (inputs
  are cloned, not retained).
- Replay produces the same result. `verifyAuthoringOperationOutcome` detects input-session mutation and
  revision regression.
