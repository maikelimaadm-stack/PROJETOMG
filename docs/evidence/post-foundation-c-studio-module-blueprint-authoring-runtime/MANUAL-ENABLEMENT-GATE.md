# Manual Enablement Gate

The runtime carries the manual gate: `manualGateRequired:true`,
`sourceCheckpoint: pre_module_blueprint_authoring_runtime_enterprise_checkpoint`,
`checkpointDecision: READY_FOR_MODULE_BLUEPRINT_AUTHORING_RUNTIME_SLICE`,
`currentSliceAuthorization: headless_authoring_runtime_only`.

`authorizesAuthoringRuntime:true` (this slice, headless only). Every other authorization is `false`:
UI, editor, persistence, filesystem writes, module generation, backend, Prisma, product exposure,
production, real data. No authorization is declared beyond this slice.
