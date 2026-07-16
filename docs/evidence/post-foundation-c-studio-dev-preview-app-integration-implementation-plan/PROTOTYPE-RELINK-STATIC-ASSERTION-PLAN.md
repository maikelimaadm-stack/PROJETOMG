# Prototype Relink Static-Assertion Plan — `createPrototypeRelinkStaticAssertionPlan`

Plans a static assertion forbidding any reuse of the old Studio prototype:
`prototypeRelinkAllowed: false`, `prototypeImportAllowed: false`, `prototypeCopyAllowed: false`,
`prototypeMoveAllowed: false`, `oldPrototypeImported: false`, `staticAssertionPlanned: true`, and
enumerates the 8 forbidden prototype paths. The verifier flags `unsafe_prototype_relink` on any
attempt.
