# Slice 47 — Studio Scope Governance Non-Studio Runtime Compatibility

## O problema, em uma frase

A Slice 46 criou o estado de aplicabilidade `non_studio_branch`. Os consumidores
escritos **antes** dela enumeram exaustivamente os estados legítimos de uma branch —
e nenhum deles conhecia o quarto estado. Uma branch cujo diff inteiro está fora do
território governado caía no ramo final e era obrigada a ser `empty_branch_diff`.

## Como isso apareceu

Na PR #502, uma branch que alterava **apenas**
`.github/workflows/foundation-governance.yml` fez o step `Runtime tests` do CI
ficar vermelho. A sentinela sintética daquela PR nunca chegou a rodar: a suíte
falhou antes dela.

Medição na reprodução controlada sobre `ca65b7c0`:

```
# tests    23544
# pass     23520
# fail        24
# skipped      0
```

Nenhuma das 24 falhas era defeito de produto. Todas eram asserções de
self-certification histórica aplicadas a uma branch que não constrói fatia alguma.

## O que esta fatia faz

Ensina os consumidores históricos a reconhecer o estado `non_studio_branch` —
e a **prová-lo positivamente**, nunca a ignorá-lo.

## O que esta fatia NÃO faz

- não altera `studioScopeGovernanceGuard.mjs`;
- não altera `isStudioGovernedDomainPath`;
- não move `.github/**` para dentro do território governado;
- não tira `backend/**` de `FORBIDDEN_SCOPE_PATTERNS`;
- não relaxa `unknown_scope`, `forbidden_scope` nem o núcleo;
- não toca produto, backend, Prisma, migrations ou UI.
