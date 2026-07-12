# API Adapter Contract

`createEmpresasReadOnlyApiAdapter({ repository|dataset })` — simula o contrato de leitura da
`EmpresaApi` **sem rede**.

## Operações

| Adapter | Espelha | Envelope |
|---|---|---|
| `listEmpresas(params, context)` | `EmpresaApi.listEmpresas` | `{ items, total, page, pageSize, totalPages, nextCursor }` |
| `getEmpresaById(id, context)` | `EmpresaApi.getEmpresa` | `{ item \| null }` |
| `countEmpresas(params, context)` | (derivado) | `{ total }` |
| `inspectResponseContract()` | — | declara o shape |

## Bloqueios

`createEmpresa`, `updateEmpresa`, `deleteEmpresa` → recusados (mutation blocker). Sem `fetch`, sem
URL externa, sem método diferente de GET-lógico, sem Railway.

## Base no contrato real

O envelope de `listEmpresas` foi copiado do arquivo real `src/apis/empresa/EmpresaApi.js` (não
alterado): `{ items, total, page, pageSize, totalPages, nextCursor }`.
