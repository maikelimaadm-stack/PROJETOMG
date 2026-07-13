# Field Preview Metadata

`createModulePreviewFieldMetadata` mapeia cada campo para um widget de preview seguindo o
contrato de campo canônico. Campos com type desconhecido ou nome vazio ficam `unsafe:true`
e `previewBlocked:true` (`hasUnsafeField` agrega).

Por campo: fieldName, label, type, required, protectedField, tenantScoped, readOnly
(protected → true), visibleInTable (protected → false), searchable/filterable/sortable,
validationMetadata, permissionMetadata (requiresPermission/requiresTenant),
previewWidgetKind, `computedExecutesCode:false`, `relationAccessesBackend:false`, risk.
