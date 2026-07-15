# Route Guard — `createRouteGuard`

Gatekeeper between the feature gate and the mount. It permits an isolated route only
when:

- the dev-only feature gate is open;
- the environment is `development`;
- the frame is synthetic-data-only.

Otherwise it returns `allow: false` with a reason. The guard is consulted by the
mount request and mount adapter; a denied guard yields a `route_guard_denied` blocked
mount **without** calling the injected `rootFactory`. Pure and deterministic.
