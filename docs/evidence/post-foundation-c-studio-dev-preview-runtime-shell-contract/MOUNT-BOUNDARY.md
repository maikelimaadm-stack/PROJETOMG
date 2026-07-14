# Mount Boundary

`createDevPreviewRuntimeShellMountBoundary()` declares which mount target kinds a future shell
WOULD accept (headless hosts: headlessPreviewHost, contractInspector, metadataSnapshotSink) and
which are permanently blocked (domNode, reactRoot, documentBody, iframe, routerOutlet,
menuContainer, productionShell, stagingShell). It mounts NOTHING: `mountCreated`, `domTouched`,
`reactMounted`, `cssInjected` are all `false`.
