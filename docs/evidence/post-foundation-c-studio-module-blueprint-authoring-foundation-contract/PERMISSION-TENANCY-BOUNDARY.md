# Permission / Tenancy Boundary

Per the Fable 5 determination, permissions and tenancy do NOT yet authorize product exposure.

`createPermissionTenancyBoundaryContract()` declares: `permissionModelIntegrated:false`,
`tenantModelIntegrated:false`, `serverSideAuthorizationIntegrated:false`,
`clientSideAuthorizationSufficient:false`, `productExposureBlockedByPermissionTenancy:true`,
`requiresPermissionTenancyFoundation:true`, `authImported:false`, `readsTenantData:false`,
`resolvesPermissions:false`, `crossesTenantBoundary:false`, `bypassesPermission:false`,
`bypassesTenancy:false`.

This slice implements NO login, role, tenant, or backend, and imports no real auth. A
**Permission/Tenancy Foundation remains obligatory before any product exposure.**
