# Visual State Contract

`createDevPreviewVisualStateContract()` describes the 8 visual states
(idle/loading/empty/ready/blocked/error/validationError/permissionDenied) as metadata. The
`blocked`, `error` and `permissionDenied` states are terminal; `blocked` and `permissionDenied`
are blocking. No real runtime state, no React state, no hooks: `usesReactState`, `usesHooks`,
`usesRuntimeState` are all `false`.
