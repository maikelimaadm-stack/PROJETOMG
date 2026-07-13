# Headless Preview Metadata

`createStudioHeadlessPreviewMetadata(normalized)` produz uma **descrição** pura e
serializável do que um preview futuro MOSTRARIA — sem renderizar nada, sem importar
React, sem fiar rota/menu.

Contém:
- `table.columns` — colunas (exclui campos `protectedField`), com `sortable`.
- `form.fields` — campos ordenados, com `required` e `order`.
- `detail.sections` — seções agrupando os campos.
- `requiredStates` — sempre `['empty','loading','error']`.

Invariantes: `rendered: false`, `isReactComponent: false`, `mutationSurface: false`.
Um preview é metadado read-only; nunca implica superfície de mutação. `previewDigest`
estável.
