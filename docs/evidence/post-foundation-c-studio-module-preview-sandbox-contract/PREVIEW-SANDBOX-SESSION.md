# Preview Sandbox Session

`createModulePreviewSandboxSession` produz uma sessão de metadata PURA (sem storage real,
sem localStorage/IndexedDB, sem fetch). `deterministicSeed` deriva dos digests de origem
(blueprint + planner), estável entre execuções.

Campos: sessionId, sandboxVersion, sourceBlueprintId, sourceBlueprintDigest,
sourcePlannerDigest, mode, createdFrom, previewScope, allowedPreviewKinds,
prohibitedEffects, expiresPolicy, deterministicSeed, diagnostics.

`allowedPreviewKinds` (9): table/form/detail/field/action/permission_metadata,
route_menu_blocked_metadata, persistence_blocked_metadata, runtime_binding_metadata.

`prohibitedEffects` (14): react_component_creation, ui_creation, route_creation,
menu_creation, module_generation, src_modules_write, backend_access, prisma_access,
production_access, staging_access, fetch, mutation, persistence_creation, rewrite_empresas.
