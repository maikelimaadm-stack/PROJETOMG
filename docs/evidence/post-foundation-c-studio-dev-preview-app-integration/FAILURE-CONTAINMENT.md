# Failure Containment

A preview failure is contained locally and never breaks the App. The route element is wrapped in the
App's existing `<Suspense fallback>` (loading + lazy-import failures) and the App-level
`GlobalErrorBoundary` (render errors), and the subtree adds `StudioDevPreviewLazyBoundary` +
`StudioDevPreviewFailureBoundary` + `StudioDevPreviewFallback` for a local safe fallback. The
`createFailureContainment` model asserts: `failClosed:true`, `failureContained:true`,
lazy-import/mount/isolated-runtime failures contained, `breaksApp:false`, `globalRedirect:false`,
`mutationOnFailure:false`, `productionStateChangedOnFailure:false`. (The boundaries are
React-import-free per the blueprint-engine React-free rule; render-error catching is the App's
`GlobalErrorBoundary`, and the local boundaries render the safe fallback for known/contained states.)
