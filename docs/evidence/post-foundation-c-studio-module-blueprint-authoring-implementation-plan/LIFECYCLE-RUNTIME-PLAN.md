# Lifecycle Runtime Plan

`createLifecycleRuntimePlan()` plans future execution of the 8 draft states (`empty`, `draft`,
`validation_pending`, `validation_failed`, `validated`, `preview_ready`, `handoff_ready`,
`discarded`), terminal = `discarded`.

Forbidden states never emitted: `published`, `production`, `registered`, `generated`, `deployed`,
`persisted`, `certified`. `productionStatesAllowed:false`, `selfCertificationAllowed:false`,
`emitsForbiddenState:false`, `drivesRealRuntime:false`, `lifecycleRuntimeImplemented:false`.
