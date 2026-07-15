# Session — `createRouteMenuSession`

Establishes the runtime session for the isolated route/menu. Reads identity and
version metadata from the upstream route/menu contract and exposes a deterministic
session descriptor (name, version, mode, environment label, readiness inputs).

- Pure: derives everything from inputs; no I/O, no globals.
- Deterministic: session digest is a stable fnv1a over the frozen descriptor.
- Fail-closed: an absent/invalid contract yields a fallback session flagged
  `sessionReady: false`.

The session never opens any gate on its own — gating is delegated to the dev-only
feature gate and route guard.
