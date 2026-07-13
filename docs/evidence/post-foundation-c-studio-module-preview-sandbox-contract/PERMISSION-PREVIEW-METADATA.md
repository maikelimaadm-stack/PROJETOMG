# Permission Preview Metadata

`createModulePreviewPermissionMetadata` — `default_deny_fail_closed`.

Invariantes: `defaultDeny:true`, `failClosed:true`, `tenantRequired:true`,
`permissionRequired:true`, `adminBypassesTenant:false`, `mutationPermissionsDefaultFalse:true`,
`productionRequiresFuturePolicy:true`, `createsRealPermission:false`.

Campos protegidos exigem permissão explícita (`fieldPermissions` com
`requiresExplicitPermission:true`, `visibleByDefault:false`). Row-level preserva tenant.
Somente `read` habilitada por padrão; create/update/delete/export/configure `deniedByDefault`.
