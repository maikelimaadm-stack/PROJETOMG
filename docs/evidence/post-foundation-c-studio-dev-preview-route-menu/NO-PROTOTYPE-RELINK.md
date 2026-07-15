# No Prototype Relink

The old Studio prototype (`src/studio/components`, `src/studio/shell`,
`src/studio/designers`, `src/studio/pages`, `src/studio/navigation`,
`src/studio/dock`, `src/studio/panels`, `src/studio/editor`) is **not** imported,
re-linked, or otherwise consumed by this slice.

- No `.js`/`.jsx` file in the subtree imports any `FORBIDDEN_PROTOTYPE_PATHS` path.
- The verifier flag `prototypeRelinked` must be `false` and the detection
  `unsafe_prototype_relink` must be clear.
- The gate scans every subtree file for prototype imports and fails on any match.

The dev-preview route/menu is a clean, isolated implementation built only on the
Post-Foundation C blueprint-engine chain — it does not resurrect the prototype.
