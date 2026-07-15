# Ownership / Rollback Contract — `createOwnershipRollbackContract`

- `owner: studio_dev_preview`; `productOwnership: false`;
- `rollbackByNonConsumption: true`, `rollbackByFlagOff: true`;
- `destructiveRollbackRequired: false`.

The dev preview owns the integration; the product does not. Rollback is achieved simply by not
consuming the contract or turning the flag off — no destructive rollback is ever required.
