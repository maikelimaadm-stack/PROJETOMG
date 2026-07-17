# Draft Snapshot

`createDraftSnapshot(options)` builds an **immutable (deep-frozen), deterministic** draft snapshot.
Metadata only, synthetic, non-canonical.

Fields: `draftId`, `draftVersion`, `draftName`, `draftLabel`, `draftDescription`, `moduleIntent`,
`schemaVersion`, `lifecycleState`, `revision`, `fields`, `layout`, `relationships`, `validation`,
`synthetic:true`, `canonical:false`, `certified:false`, `generated:false`, `registered:false`,
`discarded`, counts, `digest`.

Snapshots are deep-frozen (nested arrays/objects immutable), serializable (no functions), determinis-
tic (same input → same digest), and retain no external mutable reference (all inputs cloned).
