# Invariant Enforcement

`enforceAuthoringInvariants(draft)` enforces 14 structural invariants (fail-closed, no silent
auto-correction): unique field keys, non-negative field order, unique layout section ids, unique
relationship ids, known relationship endpoints, no production flags, no persistence/backend/Prisma
descriptors, no real-data references, no App/router/menu descriptors, no old-prototype references, no
self-certification, no module-generation authorization.

Violations produce deterministic `blocker`/`error` issues; the runtime never silently repairs invalid
data.
