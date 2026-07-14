# Action Preview Metadata

`createModulePreviewActionMetadata` — ações: read, create, update, delete, export,
configure, diagnostics.

- `read` metadata-only (mutation:false, allowedInPreview).
- create/update/delete: mutation:true, `enabledByDefault:false`, blocked em preview.
- export/configure: planned/disabled (futureSlice).
- delete nunca inicia habilitado; `anyMutationEnabled:false`; `anyActionCallsBackend:false`.
