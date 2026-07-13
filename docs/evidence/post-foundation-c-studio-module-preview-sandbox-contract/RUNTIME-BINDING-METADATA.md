# Runtime Binding Metadata

`createModulePreviewRuntimeBindingMetadata` — descreve o binding sem criá-lo.

- genericModelRuntimeBinding (kernel; `activatesProduction:false`).
- modeloBase1Binding (cadastro reference; `productionAllowed:false`).
- modeloBase2ExperimentalBinding (operacional experimental; `productionAllowed:false`).
- empresasReferenceBinding (quando source=empresas; `referenceOnly:true`).

Invariantes: `bindingCreated:false`, `moduleRegistered:false`, `productionActivated:false`,
`prismaAccessed:false`, `rewriteEmpresas:false`, `modeloBase2IsProduction:false`.
