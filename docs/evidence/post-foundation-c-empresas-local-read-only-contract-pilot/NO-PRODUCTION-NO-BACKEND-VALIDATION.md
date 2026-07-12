# No-Production / No-Backend Validation

| Alvo | Estado | Garantia |
|---|---|---|
| endpoint real chamado | **não** | pilot não importa `EmpresaApi`/`apiClient`; sem `fetch` |
| Railway acessada | **não** | sem URL externa; sem `projetomg-production` |
| DATABASE_URL usada | **não** | gate verifica ausência de `DATABASE_URL` |
| API_URL produtiva | **não** | gate verifica ausência de `VITE_API_URL`/produção |
| JWT real usado | **não** | contextos são claims sintéticos, sem assinatura/secret |
| dado real lido | **não** | dataset 100% sintético (`MAK_TEST_...`) |
| mutation executada | **não** | mutation blocker + write methods throw |
| dado real alterado | **não** | read-only; `datasetChanged:false` |
| Prisma acessado | **não** | sem import de `prisma`/`/backend/` |
| fetch usado | **não** | sem `fetch(`/XHR/WebSocket |

## Enforcement

- **Testes** (89–104): imports do pilot sem apiClient/EmpresaApi/apis/backend/prisma; sem
  fetch/storage; React-free; produção Empresas/ModeloBase1/backend/Prisma/App/menu intocados.
- **Gate** `g423-empresas-local-read-only-contract-pilot`: mesmos checks + escopo autorizado
  git-diff + ausência de DATABASE_URL/API_URL produtiva.
