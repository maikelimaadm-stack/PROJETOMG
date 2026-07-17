# Revision Engine

`nextRevision(current)` is deterministic and monotonic: revisions start at 0 and advance by exactly
`+1` for valid mutations. Negative/non-integer/regressing revisions fail closed to `null`. No in-place
canonical mutation, no history persistence — everything is in memory.

Operation receipts record `previousRevision`, `nextRevision`, `operationId`, `draftId`,
`snapshotDigestBefore`, `snapshotDigestAfter`, `status`. A rejected operation leaves the snapshot and
revision unchanged and emits a deterministic failure receipt.
