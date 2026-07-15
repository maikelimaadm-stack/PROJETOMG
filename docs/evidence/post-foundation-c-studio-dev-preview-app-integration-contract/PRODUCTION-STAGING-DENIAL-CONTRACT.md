# Production / Staging Denial Contract — `createProductionStagingDenialContract`

- `productionDenied: true`, `stagingDenied: true`;
- `defaultOff: true`, `failClosed: true`.

Production and staging are denied by construction; the contract defaults off and fails closed. The
verifier flags `unsafe_production_staging_allowed` if either denial is ever inverted.
