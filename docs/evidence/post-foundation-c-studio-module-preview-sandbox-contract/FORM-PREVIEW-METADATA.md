# Form Preview Metadata

`createModulePreviewFormMetadata` deriva campos de formulário do planner. create/update
(submitAction) ficam `enabled:false`; campos protegidos/tenant `readOnly:true`; computed
`computedExecutesCode:false`; relation preserva tenant; validações são metadata
(`networkUsed:false`).

Invariantes: `previewOnly:true`, `componentCreated:false`, `dataFetched:false`,
`mutationAllowed:false`. Estados: empty/loading/error/validationError.
