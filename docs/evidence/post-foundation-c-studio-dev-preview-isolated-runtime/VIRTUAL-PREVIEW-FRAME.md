# Virtual Preview Frame

`createIsolatedRuntimeVirtualFrame(...)` produces a pure JSON/metadata object describing what a
preview WOULD show: `frameId`, `frameVersion`, `sourceDigests`, `screenKind`, `sections`, `slots`,
`placeholders`, `syntheticRows`, `syntheticFields`, `blockedActions`, `permissionHints`, `state`,
`diagnostics`. It contains NO React element, NO JSX, NO DOM node, NO runtime CSS, NO route object,
NO menu object, NO module file (`reactElement/jsx/domNode/cssRuntime/routeObject/menuObject/moduleFile: false`).
