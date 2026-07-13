# Module Field / Table / Form Plan

`createModuleFieldTableFormPlan` planeja campos, colunas de tabela e campos de formulário
a partir do blueprint, seguindo o contrato de campo canônico.

- `fields` — nome/tipo/label/required/unique/sortable/filterable/searchable/tenantScoped/
  protectedField, com `readOnlyDefault` para protegidos e `relationPreservesTenant` para relações.
- `tableColumns` — exclui campos protegidos.
- `formFields` — na ordem do blueprint, com `order` e `readOnly`.
- `groups`, `validations` (required), `protectedFields`, `tenantFields`,
  `filterable/searchable/sortableFields`, `customFieldsReference` (cadcps, referenceOnly).

Regras: campos inválidos marcam `hasInvalidField:true` (bloqueiam readiness); protected
default read-only; tenant preservado; `computedExecutesCode:false`; relation preserva
tenant; `generationAllowedNow:false`; `previewMetadataAllowedFuture:true`.
