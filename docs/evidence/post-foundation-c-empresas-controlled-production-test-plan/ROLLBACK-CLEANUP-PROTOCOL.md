# Rollback & Cleanup Protocol — Empresas

Protocolo obrigatório para qualquer teste que crie/altere dados (local/staging). **Produção não
participa de mutation.**

## Protocolo

1. Cada execução recebe um **`testRunId`** único.
2. Cada fixture criada é **registrada** (id capturado no run).
3. Nenhuma fixture pode usar **dado real**.
4. Cleanup ocorre **por IDs capturados** durante a execução.
5. Cleanup **nunca** usa filtro amplo (nada de "delete where razao_social like ...").
6. **DELETE sem IDs explícitos é proibido.**
7. Falha no cleanup gera status **BLOCKED** (o run não é considerado limpo).
8. Evidência registra os **IDs sintéticos** criados/removidos (sem secrets).
9. Snapshot de preferência é **restaurado** ao fim.
10. Tenant sintético permanece **isolado**.
11. Rollback **não** pode atingir registros fora do `testRunId`.
12. Produção **não** participa do protocolo de mutation.

## Fluxo de um run de escrita (local/staging)

```
open(testRunId)
  → snapshot(preferências do usuário sintético)
  → create/update/delete fixtures (IDs capturados)
  → asserts
  → cleanup(por IDs capturados)  ── falha → status=BLOCKED
  → restore(preferências)
close(testRunId) → evidence(IDs, cleanupStatus)
```

## Invariantes de segurança

- Todo DELETE/UPDATE exige **ID explícito** + **tenant scope** + **JWT/permission**.
- Nenhum comando destrutivo roda contra Railway/produção.
- Nenhum secret real aparece na evidência.
- `cleanupStatus != done` → o gate de cleanup futuro **falha**.
