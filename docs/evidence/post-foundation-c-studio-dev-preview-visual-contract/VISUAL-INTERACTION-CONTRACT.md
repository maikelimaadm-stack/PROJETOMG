# Visual Interaction Contract

`createDevPreviewVisualInteractionContract()` describes 10 interaction kinds. Read-side
interactions (read/openDetail/filter/sort/paginate/cancel) are metadata; every mutating
interaction (blockedCreate/blockedUpdate/blockedDelete/blockedSubmit) is flagged `mutation:true`
and `blocked:true`. Every interaction is `enabled:false` with `hasRealHandler:false`;
`anyEnabled`, `anyMutationEnabled`, `anyRealHandler` are all `false`. Nothing executes.
