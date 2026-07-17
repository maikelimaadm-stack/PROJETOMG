# Lifecycle Executor

States: `empty`, `draft`, `validation_pending`, `validation_failed`, `validated`, `preview_ready`,
`handoff_ready`, `discarded` (terminal).

Transitions: `empty→draft`, `draft→validation_pending`, `validation_pending→validation_failed|validated`,
`validated→preview_ready`, `preview_ready→handoff_ready`, any mutable state → `discarded`.

Rules: unknown transitions fail closed (`isLifecycleTransitionAllowed` returns false); `discarded` is
terminal; preview requires `validated`; candidate requires `validated`/`preview_ready`; no validation
skip. Forbidden states — `published`, `production`, `registered`, `generated`, `deployed`, `persisted`,
`certified` — are never targeted or emitted.
