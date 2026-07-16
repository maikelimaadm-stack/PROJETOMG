# Permission / Tenancy Boundary Plan

Per Fable 5, permissions and tenancy do NOT yet authorize product exposure.

`createPermissionTenancyBoundaryPlan()`: `permissionModelIntegrated:false`,
`tenantModelIntegrated:false`, `serverSideAuthorizationIntegrated:false`,
`clientSideAuthorizationSufficient:false`, `productExposureBlockedByPermissionTenancy:true`,
`requiresPermissionTenancyFoundation:true`, `authImported:false`, `rolesImplemented:false`,
`tenantsImplemented:false`.

This slice implements NO login, role, tenant, or backend, and imports no real auth. A
**Permission/Tenancy Foundation remains obligatory before any product exposure.**
