# No-Production / No-Mutation Validation

| Alvo | Estado | Garantia |
|---|---|---|
| endpoint real chamado | não | sem import de EmpresaApi/apiClient; sem fetch |
| Railway acessada | não | sem literal railway / URL externa |
| DATABASE_URL usada | não | gate + teste (comentários stripados) |
| API_URL produtiva | não | idem |
| staging acessado | não | sem URL de staging |
| JWT real usado | não | createdAt/claims sintéticos, sem secret |
| dado real lido | não | fixtures 100% sintéticas (MAK_TEST_...) |
| mutation executada | não | contrato read-only; mutation forbidden e nunca exposta |
| dado real alterado | não | fixtures imutáveis; fixturesMutated:false |
| Prisma acessado | não | sem import de prisma/backend |
| fetch usado | não | sem `fetch(`/XHR/WebSocket; sem POST/PUT/PATCH/DELETE |
| auto-consumo pela app | não | pacote nunca importado por código de produção |

## productionUiGuard

A exceção sancionada permanece **limitada** a `src/modules/empresas/local-read-contract-pilot/`
(cobre `certification/`). **Nenhuma** modificação foi necessária (o subtree já está coberto e não
adiciona wiring de UI).

## Enforcement

Teste (184 cenários) + gate `g423-empresas-local-read-contract-certification`.
