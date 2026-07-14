# State Projection Contract

`createRuntimeUiStateProjectionContract({ frameMapping })` projects the states a future UI would
present (idle … permissionDenied) as metadata. No React state, no hooks, no storage, no
persistence, no DOM (`reactState/hooks/storage/persistence/dom: false`).
