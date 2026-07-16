# Operation Executor Plan

`createOperationExecutorPlan()` plans future execution of ONLY the 16 allow-listed operations from the
foundation contract; unknown operations fail closed.

`operationExecutorImplemented:false`, `allowlistOnly:true`, `unknownOperationsFailClosed:true`,
`sideEffectsAllowed:false`, `persistenceAllowed:false`, `moduleWriteAllowed:false`. Every operation
descriptor is `implemented:false` with no side effects.
