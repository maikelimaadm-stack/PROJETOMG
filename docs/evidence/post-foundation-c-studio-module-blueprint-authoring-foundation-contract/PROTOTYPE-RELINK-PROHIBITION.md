# Prototype Relink Prohibition

This authoring foundation is built fresh and NEVER imports, relinks, copies, moves, or reuses the old
Studio prototype.

Forbidden paths (enumerated in the contract and asserted by static import scans in the test + gate):
`src/studio/components/`, `src/studio/shell/`, `src/studio/designers/`, `src/studio/pages/`,
`src/studio/navigation/`, `src/studio/dock/`, `src/studio/panels/`, `src/studio/editor/`.

`createPrototypeRelinkProhibitionContract()`: `prototypeRelinkAllowed:false`,
`prototypeImportAllowed:false`, `prototypeCopyAllowed:false`, `prototypeMoveAllowed:false`,
`oldPrototypeImported:false`.
