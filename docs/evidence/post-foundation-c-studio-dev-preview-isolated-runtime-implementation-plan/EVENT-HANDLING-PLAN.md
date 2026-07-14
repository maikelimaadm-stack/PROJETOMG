# Event Handling Plan

`createIsolatedRuntimeEventHandlingPlan()` declares the 8 events a future runtime WOULD handle
(previewRequested … disposed) as metadata. There is NO real EventEmitter, NO listener, NO
handler, NO mutation: `usesEventEmitter`, `anyRealHandler`, `anyRealListener`, `anyMutation` are
all `false`.
