# Persistence & Filesystem Prohibition

The runtime is strictly in-memory. Verified by static gate scans and capability flags:

- No `localStorage`/`sessionStorage`/`indexedDB` (storage).
- No `fs.`/`writeFile`/`writeFileSync`/`mkdir`/`appendFile` (filesystem writes).
- No database, no backend, no Prisma, no migration.
- `persistenceImplemented:false`, `storageUsed:false`, `filesystemWritesUsed:false`,
  `backendAccessed:false`, `prismaAccessed:false`.

Drafts, revisions and history exist only in the session object in memory; nothing is persisted.
