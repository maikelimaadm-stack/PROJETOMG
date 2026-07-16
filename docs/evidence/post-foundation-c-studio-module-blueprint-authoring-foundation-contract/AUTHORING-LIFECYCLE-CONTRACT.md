# Authoring Lifecycle Contract

`createAuthoringLifecycleContract()` declares the canonical draft lifecycle as **metadata** (drives
no runtime).

States (8): `empty`, `draft`, `validation_pending`, `validation_failed`, `validated`,
`preview_ready`, `handoff_ready`, `discarded`.

Allowed transitions: `empty→draft`, `draft→validation_pending`,
`validation_pending→validation_failed|validated`, `validated→preview_ready`,
`preview_ready→handoff_ready`, any mutable state → `discarded`. `discarded` is terminal.

**Forbidden states** (never emitted): `published`, `production`, `registered`, `generated`,
`deployed`, `persisted`, `certified`. The contract never pretends to certify. No transition targets a
forbidden state. `drivesRuntime:false`, `emitsForbiddenState:false`.
