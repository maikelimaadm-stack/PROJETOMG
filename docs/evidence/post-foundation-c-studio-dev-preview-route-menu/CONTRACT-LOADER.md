# Contract Loader — `createRouteMenuContractLoader`

Validates and normalizes the upstream Route/Menu Contract into the shape the runtime
consumes. Verifies the contract `kind`, version alignment, isolated route paths and
component names.

- On a valid contract: `loaded: true` plus the normalized, frozen descriptor.
- On a missing/invalid/fallback contract: `loaded: false`, and the runtime composes
  its fallback path rather than throwing.

Loading is read-only and deterministic; it never mutates the input contract.
