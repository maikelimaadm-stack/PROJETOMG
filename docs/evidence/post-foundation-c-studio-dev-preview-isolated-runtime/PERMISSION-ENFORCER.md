# Permission Enforcer

`createIsolatedRuntimePermissionEnforcer({ implementationPlan })` fails closed: `defaultDeny`,
`failClosed`, `tenantRequired`, `permissionRequired` are `true`; `adminBypass` is `false`. It grants
no real access (`grantsRealAccess: false`).
