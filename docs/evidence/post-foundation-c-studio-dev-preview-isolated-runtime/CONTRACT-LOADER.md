# Contract Loader

`createIsolatedRuntimeContractLoader({ implementationPlan })` extracts the upstream contract
references/digests the plan already carries — via pure property access, never a dynamic/remote
import, fetch, filesystem read, Prisma, backend, or window/document access
(`usedDynamicImport/usedFetch/usedFilesystem/usedPrisma/usedBackend/usedWindowOrDocument: false`).
