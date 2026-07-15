# Quality & Scalability Notes

## Quality

- **Determinism** — every part exposes a stable fnv1a digest; equal inputs yield equal digests.
- **Purity** — no I/O, no DOM, no network, no mutation, no persistence.
- **Fail-closed** — an invalid/missing/fallback route/menu runtime yields a safe fallback; the
  composer never throws.
- **Coverage** — ≥410 test scenarios and a ≥125-check gate.
- **Lint** — ESLint clean across the subtree and the test.

## Scalability

- Adding a new integration concern = add a `create*Contract.js` part + wire it into the composer,
  manifest, and verifier; no App or product change is required.
- The metadata-only shape keeps the whole subtree node-test-parseable and free of React/DOM.
- The manual enablement gate provides a single, auditable choke point for any future real
  integration.

## Next

App integration remains a separate, checkpoint-gated slice — the next step is the **implementation
plan** (see `NEXT-SLICE-SPEC.md`), still without touching the real App.
