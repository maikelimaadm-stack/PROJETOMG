# Permission Boundary

`createDevPreviewRuntimeShellPermissionBoundary({ visualContract })` inherits the visual
contract's permission hints and fails closed: `defaultDeny`, `failClosed`, `tenantRequired`,
`permissionRequired` are `true`; `adminBypass` is `false`. It is a contract hint, not an
enforcement engine (`enforcementEngine: false`, `grantsAccess: false`).
