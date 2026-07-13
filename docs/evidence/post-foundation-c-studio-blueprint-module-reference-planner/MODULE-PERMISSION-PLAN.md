# Module Permission Plan

`createModulePermissionPlan` planeja permissões com default-deny / fail-closed.

Actions: read, create, update, delete, export, configure, diagnostics, admin.
Levels: module, screen, field, row, tenant.

Regras: `defaultDeny:true`, `failClosed:true`, `permissionRequired:true`,
`tenantRequired:true`, `adminBypassesTenant:false`, `deleteEnabledByDefault:false`,
`mutationEnabledByDefault:false`, `fieldLevelVisibilityRequiredForProtected:true`,
`rowLevelAccessPreservesTenant:true`. Somente `read` inicia habilitada.
Nenhuma permissão real é criada (`createsRealPermission:false`, `plannedOnly:true`).
