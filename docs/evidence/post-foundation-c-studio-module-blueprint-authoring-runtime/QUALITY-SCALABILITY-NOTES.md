# Quality & Scalability Notes

- **Determinism**: FNV-1a digests over key-sorted serialization; replay yields byte-identical
  session/receipt digests; no clock/random/locale/timezone sources.
- **Immutability**: deep-frozen snapshots; inputs deep-cloned; previous snapshots never change; no
  external mutable reference retained.
- **Fail-closed**: unknown operations, invalid lifecycle transitions, revision regressions and every
  resource-limit excess are rejected with a deterministic issue code and no partial state — never a
  silent truncation.
- **Resource limits** (conservative defaults, configurable) bound snapshot memory growth
  (drafts/operations/revisions/fields/layout/relationships/validation-issues/string-length/serialized-
  bytes), addressing the Fable checkpoint's escalation risks.
- **Separation of concerns**: one responsibility per file. The operation catalog, lifecycle and
  validation pipeline are metadata-driven so growth is additive and gate-covered.
- **No new dependency**; no change to prior gates/tests, `productionUiGuard`, the governance guard, or
  the upstream authoring foundation/plan subtrees.
