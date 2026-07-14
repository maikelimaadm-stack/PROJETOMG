# Permission Enforcement Plan

`createIsolatedRuntimePermissionEnforcementPlan({ runtimeShellContract })` inherits the shell's
permission boundary and fails closed: `defaultDeny`, `failClosed`, `tenantRequired`,
`permissionRequired` are `true`; `adminBypass` is `false`. It is a contract hint, not an
enforcement engine (`enforcementEngine: false`, `grantsAccess: false`).
