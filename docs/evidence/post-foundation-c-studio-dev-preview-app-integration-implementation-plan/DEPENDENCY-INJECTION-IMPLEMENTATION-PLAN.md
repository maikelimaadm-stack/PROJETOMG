# Dependency Injection Implementation Plan — `createDependencyInjectionImplementationPlan`

Requires explicit dependency injection and forbids implicit/global resolution:
`dependencyInjectionRequired: true`; `implicitDependencyLookupAllowed: false`,
`globalLookupAllowed: false`, `serviceLocatorAllowed: false`; `AppImportAllowed: false`,
`routerImportAllowed: false`, `menuImportAllowed: false`.
