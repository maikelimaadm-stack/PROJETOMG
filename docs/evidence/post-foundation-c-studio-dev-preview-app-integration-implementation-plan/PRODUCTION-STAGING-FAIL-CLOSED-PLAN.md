# Production / Staging Fail-Closed Plan — `createProductionStagingFailClosedPlan`

`productionDenied: true`, `stagingDenied: true`, `defaultOff: true`, `failClosed: true`. Production and
staging are denied by construction; the plan defaults off and fails closed. The verifier flags
`unsafe_production_staging_allowed` if either denial is inverted.
