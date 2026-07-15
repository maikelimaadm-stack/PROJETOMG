# Failure Containment Implementation Plan — `createFailureContainmentImplementationPlan`

Fail-closed; a dev-preview failure never propagates to the product: `failClosed: true`,
`failureContained: true`, `productAppFailurePropagationAllowed: false`,
`productRouterFailurePropagationAllowed: false`, `productMenuFailurePropagationAllowed: false`.
