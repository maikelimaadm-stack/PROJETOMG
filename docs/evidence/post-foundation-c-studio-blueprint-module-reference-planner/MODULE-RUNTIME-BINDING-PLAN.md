# Module Runtime Binding Plan

`createModuleRuntimeBindingPlan` planeja o binding de runtime.

- `genericModelRuntime` — kernel de contratos/safety/diagnostics (não ativa produção).
- `modeloBase1` — referência para cadastro (selecionado quando modelType=cadastro).
- `modeloBase2Experimental` — referência operacional apenas experimental
  (`productionAllowed:false`).
- `empresasMirror` — quando o source é `empresas`, `referenceOnly:true`.
- diagnostics passivo, fallback fail-closed, gates obrigatórios antes de qualquer ativação.

Regras: `activatesProduction:false`, `registersModule:false`,
`accessesPrismaDirectly:false`, `altersEmpresas:false`, `modeloBase2IsProduction:false`,
`sourceModuleReferenceOnly` verdadeiro quando source=empresas.
