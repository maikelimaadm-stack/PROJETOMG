# Quality & Scalability Notes

## Quality

- **Determinism** — every part exposes a stable fnv1a digest; equal inputs yield equal digests.
- **Purity** — no I/O, no DOM, no network, no mutation, no persistence.
- **Fail-closed** — an invalid/missing/fallback App integration contract yields a safe fallback; the
  composer never throws.
- **Coverage** — ≥430 test scenarios and a ≥135-check gate.
- **Lint** — ESLint clean across the subtree and the test.

## Scalability

- Adding a new integration-planning concern = add a `create*Plan.js` part + wire it into the
  composer, manifest, and verifier; no App or product change is required.
- The plan-only shape keeps the whole subtree node-test-parseable and free of React/DOM.
- The manual enablement gate provides a single, auditable choke point for any future real
  integration.

## Next

The next step is the **enterprise checkpoint**, then the real implementation slice (see
`NEXT-SLICE-SPEC.md`), still gated.
