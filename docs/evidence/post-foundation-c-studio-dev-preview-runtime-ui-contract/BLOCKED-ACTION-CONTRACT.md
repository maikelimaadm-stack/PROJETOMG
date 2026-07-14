# Blocked Action Contract

`createRuntimeUiBlockedActionContract()` enumerates the 9 permanently blocked actions
(create, update, delete, submit, save, export, navigate, openRoute, registerModule). Every entry
is `blocked: true`; `allBlocked: true`, `anyAllowed: false`. Nothing executes.
