# Quality & Scalability Notes

## Quality

- **Determinism** — every model exposes a stable fnv1a digest; equal inputs yield
  equal digests, verified by the test suite.
- **Purity** — no I/O, no DOM, no network, no mutation on import; the only mutation
  surface is the local navigation controller's in-memory state.
- **Fail-closed** — all gates default to closed and resolve ambiguity to blocked.
- **Coverage** — ≥430 test scenarios and a ≥135-check gate.
- **Lint** — ESLint clean across the subtree and the test.

## Scalability

- Adding a new isolated screen = add a `.jsx` sibling + a resolver case + a registry
  entry; no App or gate changes required.
- The DI mount adapter accepts any `rootFactory`, so the same runtime can host under
  a test harness, a Storybook-like shell, or a future dev host without modification.
- The descriptor-based host tree keeps the `.js` graph node-test-safe as the UI grows.

## Next

App integration remains a separate, checkpoint-gated slice (see `NEXT-SLICE-SPEC.md`).
