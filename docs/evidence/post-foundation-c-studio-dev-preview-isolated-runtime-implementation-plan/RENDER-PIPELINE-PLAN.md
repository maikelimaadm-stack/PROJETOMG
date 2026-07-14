# Render Pipeline Plan

`createIsolatedRuntimeRenderPipelinePlan()` describes the ordered steps a future runtime WOULD
take (validateContracts → normalizeVisualTree → resolvePlaceholders → prepareRenderRequest →
blockRealRender → emitDiagnostics). No step is implemented. Real render is permanently blocked:
`renderImplemented: false`, `renderAllowed: false`, reason `future isolated runtime
implementation slice required`.
