# No-Production / No-Mutation Validation

| Alvo | Estado | Garantia |
|---|---|---|
| endpoint real chamado | não | sem import de EmpresaApi/apiClient; sem fetch |
| Railway acessada | não | sem URL externa / projetomg-production |
| DATABASE_URL usada | não | gate + teste (comentários stripados) |
| API_URL produtiva | não | idem |
| JWT real usado | não | claims sintéticos, sem assinatura/secret |
| dado real lido | não | dataset 100% sintético (MAK_TEST_...) |
| mutation executada | não | mutation blocker + write methods throw; performance mutation:false |
| dado real alterado | não | read-only; datasetChanged:false |
| POST/PUT/PATCH/DELETE | não | ausência de `.post(`/`.put(`/`.patch(`/`.delete(` |
| Prisma acessado | não | sem import de prisma/backend |
| fetch usado | não | sem `fetch(`/XHR/WebSocket |
| tenant leakage | não | fuzz matrix leakageFound:false |
| permission bypass | não | permission matrix permissionBypassFound:false |

## productionUiGuard

A exceção sancionada permanece **limitada** a `src/modules/empresas/local-read-contract-pilot/`
(cobre `hardening/`). Não foi ampliada; nenhuma modificação necessária neste slice (o subtree do
hardening já estava coberto pelo prefixo existente, e não adiciona nenhum token de wiring de UI).

## Enforcement

Teste (168 cenários) + gate `g423-empresas-local-read-parity-hardening`.
