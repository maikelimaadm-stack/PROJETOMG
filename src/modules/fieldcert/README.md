# FieldCert — Módulo fictício V14

Módulo de **certificação** da Field Configuration Engine. Não aparece no menu nem no App.

- `fieldCertModuleMetadata.js` — formulário definido 100% por metadata (`MAK_FIELD_CERTIFICATION_CATALOG`)
- `fieldCertMakModule.js` — wire via `defineMakModule` + `buildMakDynamicFieldsFromMetadata`

Validação: `npm run gate:field-config-engine-v14`
