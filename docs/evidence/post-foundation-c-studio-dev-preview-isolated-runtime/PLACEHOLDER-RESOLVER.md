# Placeholder Resolver

`createIsolatedRuntimePlaceholderResolver(...)` resolves contractual placeholders into
metadata-only descriptors (kind + `resolvedTo`). Each is NEVER a real component: `isRealComponent`,
`importsComponent`, `referencesComponentPath`, `jsx`, `tsx`, `hasRealRenderFn` are all `false`.
`anyRealComponent` and `anyRealRenderFn` are `false`.
