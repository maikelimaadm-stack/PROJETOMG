# Permission / Tenancy Boundary

`createAuthoringRuntimePermissionTenancyBoundary()`: `permissionModelIntegrated:false`,
`tenantModelIntegrated:false`, `serverSideAuthorizationIntegrated:false`,
`clientSideAuthorizationSufficient:false`, `productExposureBlockedByPermissionTenancy:true`,
`requiresPermissionTenancyFoundation:true`, `authImported:false`, `realTenantUsed:false`,
`realEmpresaUsed:false`, `safeBecauseNotExposed:true`.

The synthetic/headless runtime can exist **without** a Permission/Tenancy Foundation precisely because
it is not exposed. A **Permission/Tenancy Foundation remains obligatory before any product exposure.**
No real auth/roles/tenant is imported or used.
