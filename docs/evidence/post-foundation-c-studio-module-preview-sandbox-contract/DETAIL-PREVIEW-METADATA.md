# Detail Preview Metadata

`createModulePreviewDetailMetadata` é read-only. Estratégias permitidas:
`derive_from_form_readonly` (padrão, espelha Empresas), `dedicated_detail_future`,
`blocked`. Estados: empty/loading/error/notFound/permissionDenied/tenantMismatch.

Invariantes: `readOnly:true`, `changesPagemp:false`,
`changesModeloBase1CadastroPage:false`, `componentCreated:false`, `routeCreated:false`,
`dataFetched:false`, `mutationAllowed:false`. Não cria tela real, não busca registro real.
