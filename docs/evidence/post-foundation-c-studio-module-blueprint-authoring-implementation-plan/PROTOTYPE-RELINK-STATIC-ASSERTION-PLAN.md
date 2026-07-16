# Prototype Relink Static Assertion Plan

`createPrototypeRelinkStaticAssertionPlan()` plans a static assertion that the future runtime imports
none of the old Studio prototype paths. This slice relinks nothing.

Forbidden paths (also asserted by static import scans in the test + gate): `src/studio/components/`,
`src/studio/shell/`, `src/studio/designers/`, `src/studio/pages/`, `src/studio/navigation/`,
`src/studio/dock/`, `src/studio/panels/`, `src/studio/editor/`.

`prototypeRelinkAllowed:false`, `prototypeImportAllowed:false`, `prototypeCopyAllowed:false`,
`prototypeMoveAllowed:false`, `oldPrototypeImported:false`, `staticImportAssertionRequired:true`.
