# Visual Tree Contract

`createDevPreviewVisualTreeContract({ bridge })` builds a logical tree: root container →
screens (list/form/detail) → sections → slots → component placeholders, with bindings,
permission hints and state hints — all metadata.

Protected fields bind to `VisualLabelPlaceholder` (read-only); normal fields to
`VisualInputPlaceholder`. `allPlaceholdersAllowed` proves no leaf references a placeholder
outside the allowed set. `react`, `jsx`, `tsx`, `dom`, `cssRuntime` are all `false`.
