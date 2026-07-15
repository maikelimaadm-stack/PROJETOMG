# Prototype Relink Prohibition Contract — `createPrototypeRelinkProhibitionContract`

Forbids any reuse of the old Studio prototype:

- `prototypeRelinkAllowed: false`, `prototypeImportAllowed: false`,
  `prototypeCopyAllowed: false`, `prototypeMoveAllowed: false`, `oldPrototypeImported: false`;
- `forbiddenPrototypePaths`: `src/studio/components/`, `src/studio/shell/`,
  `src/studio/designers/`, `src/studio/pages/`, `src/studio/navigation/`, `src/studio/dock/`,
  `src/studio/panels/`, `src/studio/editor/`.

No `.js` file in the subtree imports any forbidden prototype path; the verifier flags
`unsafe_prototype_relink` on any attempt.
