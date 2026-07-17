# Safety & Diagnostics

## Safety
`createAuthoringRuntimeSafety()` aggregates ~35 forbidden-side-effect flags (all `false`) covering
certification, UI/editor/React/App, persistence/storage/filesystem/database, module generation/file
writes/registration, backend/Prisma/migration, fetch/network, real data, Empresas rewrite, prototype
relink, production/staging, canonical draft/candidate, self-certification, SSOT overwrite,
permission/tenant integration, nondeterministic source and input mutation. `anyForbiddenSideEffect`
is `false`; reversible by non-consumption.

## Diagnostics
`createAuthoringRuntimeDiagnostics({ session })` is passive and deterministic: session status, draft/
operation/revision counts, limits, validation summary, blocker count, readiness. No secrets, no envs,
no real data, no network, no storage.
