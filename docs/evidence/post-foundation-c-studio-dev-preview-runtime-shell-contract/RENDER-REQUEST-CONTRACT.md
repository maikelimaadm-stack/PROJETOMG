# Render Request Contract

`createDevPreviewRuntimeShellRenderRequestContract({ visualContract })` describes the shape of a
future render request — a deterministic `requestId` plus digests of the visual tree / screen /
placeholder registry / state / permissions. `renderAllowed` is permanently `false` with reason
`requires future explicit runtime implementation slice`. This slice authorizes no render.
