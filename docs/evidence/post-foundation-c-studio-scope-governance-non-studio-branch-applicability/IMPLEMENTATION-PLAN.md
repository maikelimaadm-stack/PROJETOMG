# Plano de implementação — Slice 46

## Sequência executada

1. **Preflight** — `main = a76fb5d7`, PR #500 OPEN+DRAFT, head `4ff7230d`, uma PR aberta.
2. **Revert do enforcement de CI** — `git revert --no-edit 4ff7230d`, sem reset, sem amend,
   sem force-push. O commit original e o revert permanecem no histórico: a descoberta é
   parte honesta da PR. Após o revert, o diff contra `main` ficou vazio.
3. **Auditoria de domínio** — extraídos os **177** padrões de autorização distintos das 45
   entradas existentes e confrontados com as raízes propostas. 176 cobertos pelas raízes;
   o restante (`^src/App.jsx$`) é forbidden e entra no domínio pela outra fonte. 177/177.
4. **Registry** — adicionado `STUDIO_GOVERNED_DOMAIN_PATTERNS` (dados puros) e a entrada 46.
5. **Guard** — adicionados `isStudioGovernedDomainPath` e `isNonStudioOnlyDiff`; o
   short-circuit foi inserido **apenas** nos dois boundaries.
6. **Matriz A–O** — medida por chamada real antes de qualquer edição de consumidor.
7. **Consumidores** — corrigidos apenas os que comprovadamente codificavam a suposição antiga.
8. **Teste + gate + evidência + wiring** desta fatia.
9. **Commit, push, validação pós-commit com o diff real.**

## Ordem semântica obrigatória nos boundaries

```
1. input inválido        → invalid_changed_paths      (fail-closed)
2. caller desconhecido   → unknown_caller_slice       (fail-closed)
3. diff vazio            → empty_branch_diff          (notApplicable)
4. diff non-Studio       → non_studio_branch          (notApplicable)   ← novo
5. qualquer outro caso   → núcleo cronológico, inalterado
```

O passo 4 vem **depois** de 1–3 e **antes** da eleição de fatia, porque uma branch
non-Studio legitimamente não tem fatia ativa: exigir uma seria exatamente o falso negativo
que esta fatia remove.
