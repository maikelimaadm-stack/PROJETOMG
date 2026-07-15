# Dependency Injection Boundary Contract — `createDependencyInjectionBoundaryContract`

Requires explicit dependency injection and forbids implicit/global resolution:

- `dependencyInjectionRequired: true`;
- `implicitDependencyLookupAllowed: false`, `globalLookupAllowed: false`,
  `serviceLocatorAllowed: false`;
- `AppImportAllowed: false`, `routerImportAllowed: false`, `menuImportAllowed: false`.

A future integration must receive its dependencies explicitly; it may not import the App, router, or
menu, nor reach for a global/service-locator.
