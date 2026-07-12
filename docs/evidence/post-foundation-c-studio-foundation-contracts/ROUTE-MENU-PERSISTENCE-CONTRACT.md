# ROUTE/MENU & PERSISTENCE CONTRACT

## Route/Menu Blueprint

`routePlan` e `menuPlan` são **planos**, nunca registros.

Invariantes:

- `routeEnabledDefault: false`, `menuVisibleDefault: false`,
  `productionAllowedDefault: false`.
- `appJsxChanged: false`, `menuChanged: false`.
- **Nenhum módulo aparece no menu automaticamente**.
- **Nenhum módulo ganha rota produtiva automaticamente**.
- `futureRegistryRequired: true`, `flagRollbackRequired: true`.

## Persistence Boundary

Estados (8): `noPersistence` (default), `memoryOnly`, `localReadOnly`,
`localWriteDraft`, `stagingReadOnly`, `stagingWriteControlled`, `productionRead`,
`productionWriteControlled`.

Invariantes:

- Estado default: `noPersistence`.
- `schema`/`migration`/`prisma`/`backend`/`mutation` desligados por padrão.
- **Nenhum blueprint cria schema/migration automaticamente**.
- Dado real nunca é usado como fixture (`realDataAsFixture: false`).
- `productionWriteControlled` exige plano futuro explícito.

O estado `localReadOnly` referencia o gate certificado do piloto de leitura
Empresas como precedente.
