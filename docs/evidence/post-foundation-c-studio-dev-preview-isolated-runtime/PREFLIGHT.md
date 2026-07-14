# Preflight

`createIsolatedRuntimePreflight({ implementationPlan })` validates, as pure metadata, that the
checkpoint authorization + manual gate are present, that the implementation-plan / runtime-shell /
visual contract versions are compatible, and that dev-only / no-production / no-staging /
forbidden-flags-false invariants hold. It calls NO network, backend, Prisma, real environment, or
production (`usedNetwork/usedBackend/usedPrisma: false`). On any failed check `ok: false`, and the
composer returns a safe fallback.
