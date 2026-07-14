# Data Boundary

`createIsolatedRuntimeDataBoundary()` sets `dataMode: synthetic_metadata_only`. `realDataRead`,
`realDataWrite`, `backendAccessed`, `prismaAccessed`, `fetchUsed`, `persistenceCreated`,
`mutationAllowed` are all `false`.
