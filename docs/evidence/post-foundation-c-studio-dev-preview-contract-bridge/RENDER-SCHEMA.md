# Render Schema

`createDevPreviewRenderSchema({ sandbox })` builds a logical screen tree
(areas → sections → slots) with field/action bindings and permission hints — all
metadata. Protected fields bind to `label`; normal fields to `input-placeholder`.
Action bindings are disabled. `componentImport`, `jsx`, `tsx`, `react`, `dom`, `css`
are all `false`.
