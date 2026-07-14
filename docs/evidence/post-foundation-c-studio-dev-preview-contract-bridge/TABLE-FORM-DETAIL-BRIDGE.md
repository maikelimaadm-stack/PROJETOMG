# Table / Form / Detail Bridge Schemas

- **Table:** protected & tenant columns preserved and hidden (`visible: false`); row actions
  disabled; `dataFetched`, `componentCreated`, `mutationAllowed` are `false`.
- **Form:** protected fields become read-only `label`s; submit binding disabled; `realInput`,
  `componentCreated`, `mutationAllowed` are `false`.
- **Detail:** every field read-only `label`; `editable: false`; no mutation.
