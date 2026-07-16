# Rollback

Two independent, non-destructive rollback paths (`createAppIntegrationRollback`):

- **Flag-off** — set `MAK_STUDIO_DEV_PREVIEW` to anything other than `'true'` (or drop the
  checkpoint): `shouldMountStudioDevPreviewRoute()` returns false and the route disappears
  immediately.
- **Remove the additive block** — delete the three additive App.jsx additions (and, if desired, the
  subtree): structural, clean removal.

`rollbackByFlagOff:true`, `rollbackByRemovingAdditiveBlock:true`, `destructiveRollbackRequired:false`,
`dataMigrationRequired:false`, `additiveBlockOnly:true`, `reversibleByNonConsumption:true`.
