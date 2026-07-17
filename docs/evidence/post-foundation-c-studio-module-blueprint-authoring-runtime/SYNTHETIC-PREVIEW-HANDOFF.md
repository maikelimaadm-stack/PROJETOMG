# Synthetic Preview Handoff

`createSyntheticPreviewHandoff({ draft })` builds preview handoff **metadata** for a validated draft.
`handoffKind: synthetic_preview_candidate`, `synthetic:true`, `immutable:true`,
`compatibleWithPreviewSandbox:true`, `previewPayloadCreated` (only when validated), `previewMounted:false`,
`realDataAttached:false`, `routeCreated:false`, `menuCreated:false`, `productExposed:false`.

It requires a validated draft (fail-closed otherwise), mounts nothing, touches no App, creates no
route/menu, and attaches no real data. The payload is a synthetic, serializable snapshot compatible
with the Preview Sandbox.
