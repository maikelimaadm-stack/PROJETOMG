# Visual Screen Contract

`createDevPreviewVisualScreenContract({ bridge })` declares `list` / `form` / `detail`
screens (detail read-only) and the four state screens `empty` / `loading` / `error` /
`blocked`, each mapped to an ALLOWED state placeholder. Everything is metadata;
`componentCreated`, `react`, `dom`, `cssRuntime`, `routeCreated` are all `false`.
