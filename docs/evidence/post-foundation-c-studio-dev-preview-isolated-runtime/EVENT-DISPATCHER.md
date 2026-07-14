# Event Dispatcher

`createIsolatedRuntimeEventDispatcher()` is purely functional: it returns each of the 8 event kinds
(previewRequested … disposed) as a metadata descriptor marked allowed (read-side) or blocked
(renderBlocked/interactionBlocked/permissionDenied). There is NO real EventEmitter, NO listener, NO
external handler, NO mutation, NO network, NO storage.
