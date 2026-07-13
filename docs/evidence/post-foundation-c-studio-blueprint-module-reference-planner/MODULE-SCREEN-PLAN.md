# Module Screen Plan

`createModuleScreenPlan` planeja as telas: `table`, `form`, `detail`, além de filter
area, toolbar, actions, diagnostics area e um dashboard placeholder futuro.

Cada tela: `screenId`, `kind`, `purpose`, `generationAllowedNow:false`,
`generatesReactComponent:false`, `futureSlice`, `requiredStates:['empty','loading','error']`.

Regras: não gera React component; não altera `src/pages`/`src/components`/`src/App.jsx`;
não cria rota. Preview é futuro (sandbox/dev-only). `changesAppJsx:false`,
`createsRoute:false`.
