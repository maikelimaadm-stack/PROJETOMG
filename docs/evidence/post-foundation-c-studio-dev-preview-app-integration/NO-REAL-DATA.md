# No Real Data

The preview consumes **synthetic data only**. The route element builds a synthetic snapshot and
renders the isolated host; nothing reads or writes real data. `syntheticDataOnly:true`;
`realDataRead:false`, `realDataWrite:false`, `mutationAllowed:false`, `persistenceCreated:false`.
No `realDataRead: true` / `realDataWrite: true` literal appears in the subtree; the verifier flags
any inversion, and the mount request is synthetic-only.
