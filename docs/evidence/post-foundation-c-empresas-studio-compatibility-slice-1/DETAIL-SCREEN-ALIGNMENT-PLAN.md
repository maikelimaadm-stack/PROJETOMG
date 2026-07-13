# DETAIL SCREEN ALIGNMENT PLAN

`createEmpresasDetailScreenAlignmentPlan()` — classificação `derive_from_form_readonly`
(caminho de menor risco).

- hasDedicatedDetailScreen: false · detailFromFormPossible: true · detailReadOnlyModePossible: true
- requiredFieldsForDetail: codempresa, razao_social, nome_fantasia, tipo_pessoa, cpf_cnpj, cidade, estado, status
- requiredPermissions: read · requiredStates: empty/loading/error
- createsDetailScreenNow: false · changesPagemp: false · changesModeloBase1CadastroPage: false
- recommendedFutureSlice: EMPRESAS STUDIO COMPATIBILITY SLICE 2

Regra: não criar detail agora; não alterar PAGEMP / ModeloBase1CadastroPage. Detail pode
ser derivado do form em modo read-only (caminho preferencial).
