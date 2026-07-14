# Event Contract

`createDevPreviewRuntimeShellEventContract()` declares the 8 contractual events a future shell
WOULD emit/observe (previewRequested … permissionDenied) as metadata. There is NO real
EventEmitter, NO listener, NO handler, NO mutation: `usesEventEmitter`, `anyRealHandler`,
`anyRealListener`, `anyMutation` are all `false`.
