# Discard & Rollback

`discardDraft` sets the draft to `discarded` (terminal). `discardAuthoringDraft` records:
`terminal:true`, `externalCleanupRequired:false`, `databaseRollbackRequired:false`,
`filesystemCleanupRequired:false`, `sideEffectsReversed:0`, `furtherMutableOperationsAllowed:false`.

Discard only releases in-memory session references — it deletes no files, touches no database/storage,
and performs no external rollback. Rollback is by non-consumption/flag-off, never destructive. After
discard, further mutable operations on the draft are rejected.
