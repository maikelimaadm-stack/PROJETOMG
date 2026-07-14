# State Container

`createIsolatedRuntimeStateContainer(...)` is an ephemeral, in-memory, deterministic, serializable,
read-only output snapshot of the current lifecycle step + frame reference. No React state, no hooks,
no storage, no persistence (`reactState/hooks/storage/persistence: false`).
