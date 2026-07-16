# Safety Contract

`createAuthoringSafetyContract()` aggregates the forbidden-side-effect flags and asserts none is set,
and that the foundation is reversible by non-consumption.

`anyForbiddenSideEffect:false`, `reversibleByNonConsumption:true`, `headless:true`,
`contractOnly:true`, `metadataOnly:true`. The `forbiddenFlags` map (all `false`) covers authoring
runtime/UI/editor/persistence, module generation/file writes/registration, draft self-certification,
certified-contract overwrite, publish, product exposure, menu/route, App touch, React import, DOM,
backend/Prisma/migration, fetch/storage/mutation/persistence, real data read/write, Empresas rewrite,
old prototype import, production/staging.
