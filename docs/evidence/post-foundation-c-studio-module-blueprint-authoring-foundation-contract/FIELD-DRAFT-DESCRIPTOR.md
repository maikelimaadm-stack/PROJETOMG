# Field Draft Descriptor

`createFieldDraftDescriptor(...)` — metadata only. No DB, SQL, Prisma, column, or persistence.

Fields: `fieldId`, `fieldKey`, `label`, `description`, `dataKind` (one of
`text|number|boolean|date|select|reference|unknown`), `required`, `nullable`,
`defaultValueDescriptor`, `validationDescriptors`, `displayDescriptor`, `order` (non-negative),
`synthetic:true`, `canonical:false`, `columnCreated:false`, `persisted:false`, `realDataBound:false`,
`backendBound:false`, `fieldDraftDigest`.
