# PR #495 real diff validation

O diff REAL da PR #495 foi capturado read-only e congelado como fixture reproduzível, para que o teste não dependa da existência futura da branch remota.

```bash
git diff --name-only origin/main...origin/claude/post-foundation-c-studio-bridge-decision-core-envelope-builder
```

| campo | valor |
|---|---|
| base | `73d298e09fea349f9bc836555360d6adcb74655c` |
| head | `9634c3643541248d4b272813161b489b85fd8692` |
| caminhos | **90** |
| digest | `fnv1a-3d854e18` |
| fixture | `docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/PR495-CHANGED-PATHS.json` |

O digest é FNV-1a sobre a lista ordenada, recomputado no teste — se a fixture for editada, o digest deixa de bater.

## Provas

| prova | resultado |
|---|---|
| fatia ativa resolvida | `bridge-decision-core-envelope-builder` (ordinal único) |
| ordinal do Builder > ordinal dos nove chamadores | sim, para os nove |
| caminhos primary aceitos | sim |
| os dois caminhos de lifecycle aceitos por cross authorization | sim, ambos presentes no diff real e listados em `crossAuthorized` |
| caminhos proibidos | **0** |
| caminhos desconhecidos | **0** |
| violação cronológica | **0** |
| `allowed.length === pathCount` | sim (90) |
| nove chamadores retornam `safe` | sim |
| vinte e dois gates chamadores retornam `safe` | sim |

## Diff vazio não é prova

A fixture registra 90 caminhos e `baseSha !== headSha`; o teste assere ambos. Nenhuma ref foi movida, nenhum worktree sintético foi criado e a branch da #495 não foi alterada.
