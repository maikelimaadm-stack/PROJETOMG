# Error Boundary

`createDevPreviewRuntimeShellErrorBoundary()` describes how a future shell WOULD contain errors:
failing closed, sanitized diagnostics, no secrets, no stack leak. It enumerates the known error
codes but catches nothing at runtime (`catchesRuntimeErrors: false`) — it is a contract, not a
handler. `failClosed`, `safeDiagnostics`, `noSecrets`, `noStackLeak` are all `true`.
