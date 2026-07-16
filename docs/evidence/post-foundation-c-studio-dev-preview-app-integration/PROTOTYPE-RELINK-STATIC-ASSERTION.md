# Prototype Relink — Static Assertion

Neither the new subtree, `src/App.jsx`, nor `src/studio/blueprint-engine/dev-preview-route-menu/`
imports any old Studio prototype path (`src/studio/components|shell|designers|pages|navigation|dock|
panels|editor`). The slice gate statically scans the imports of App.jsx and both subtrees and fails
on any such import. `FORBIDDEN_PROTOTYPE_PATHS` enumerates the 8 forbidden prefixes;
`capabilities.prototypeRelinked` is `false` and the verifier flags
`capability_prototypeRelinked_must_be_false` on inversion.
