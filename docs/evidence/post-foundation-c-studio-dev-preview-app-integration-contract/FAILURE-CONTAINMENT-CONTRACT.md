# Failure Containment Contract — `createFailureContainmentContract`

Fail-closed; a dev-preview failure never propagates to the product:

- `failClosed: true`, `failureContained: true`;
- `productAppFailurePropagationAllowed: false`;
- `productRouterFailurePropagationAllowed: false`;
- `productMenuFailurePropagationAllowed: false`.

The contract specifies that a future integration must contain its own failures so the production
App, router, and menu are never affected.
