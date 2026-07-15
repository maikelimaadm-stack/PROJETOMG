# Checkpoint Receipt — `createRouteMenuCheckpointReceipt`

Verifies the human/checkpoint authorization required before the runtime may mount.

- The only accepted value is `approved_for_isolated_route_menu_runtime`
  (`REQUIRED_CHECKPOINT_RECEIPT`).
- Any other string, `null`, or `undefined` → `approved: false`.

The feature gate, preflight, guard and mount adapter all consult this receipt; an
unapproved receipt fails the pipeline closed. The check is a pure string comparison —
it performs no I/O and cannot be satisfied implicitly.
