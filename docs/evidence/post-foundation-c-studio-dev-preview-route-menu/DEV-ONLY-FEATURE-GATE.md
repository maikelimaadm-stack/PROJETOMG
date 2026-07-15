# Dev-Only Feature Gate — `createDevOnlyFeatureGate`

The single authority that decides whether the isolated route/menu may open.

## Open condition

The gate returns `open: true` **only** when **all** hold:

- `enabled === true` (flag explicitly on — default is off);
- `environment === 'development'`;
- `checkpointReceipt === 'approved_for_isolated_route_menu_runtime'`.

Any other combination — production, staging, missing/unknown environment, disabled
flag, wrong/absent checkpoint — returns `open: false` with a reason code.

## Guarantees

- **Default-off:** with no arguments the gate is closed.
- **Fail-closed:** ambiguity resolves to closed.
- **Production/staging denied:** explicitly reported via `productionDenied` /
  `stagingDenied` reasons.
- Pure and deterministic; opening the gate performs no side effects.
