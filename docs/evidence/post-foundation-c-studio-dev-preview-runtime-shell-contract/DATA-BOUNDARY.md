# Data Boundary

`createDevPreviewRuntimeShellDataBoundary()` sets the shell's data mode to `metadata_only`:
`realDataRead`, `realDataWrite`, `fetchUsed`, `backendAccessed`, `prismaAccessed`,
`persistenceCreated` are all `false`. No real data crosses this boundary.
