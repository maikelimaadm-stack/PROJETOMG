# Slice 48 — Typecheck Environment Hygiene Governance

## Por que esta fatia existe

A P1-02A separa os contextos de typecheck (browser/produção vs Node/testes) e, para isso,
precisa registrar quatro scripts em `package.json`.

`package.json` pertence a `STUDIO_GOVERNED_DOMAIN_PATTERNS`. Sua presença no diff impede o
curto-circuito `non_studio_branch` da Slice 46, o núcleo cronológico assume, e sem uma fatia
que assuma a propriedade do diff todos os caminhos viram `unknown_scope`.

Medição na PR #504, antes desta entrada existir:

```
COM package.json  → reason=no_active_slice_resolved  safe=false   (68 testes vermelhos)
SEM package.json  → reason=non_studio_branch         safe=true
SÓ  package.json  → reason=no_active_slice_resolved  safe=false
```

Esta fatia dá à branch a propriedade que faltava. **Não relaxa nada.**

## O que ela é

Governança de CI. Não é módulo, feature, backend, UI, Prisma ou migration.

## O que ela possui

| categoria | conteúdo |
|---|---|
| artefatos primários | o teste e o gate desta fatia, esta pasta, e os 10 artefatos que a P1-02A produz — um padrão ancorado por arquivo |
| marker de branch | **somente** esta pasta de evidência |
| governança compartilhada | `studioScopeGovernanceRegistry.mjs` e `package.json` — nada mais |
| cross-slice | **ZERO**. Nenhum artefato de outra fatia é tocado |
| forbidden autorizado | **ZERO** |

`package-lock.json` está deliberadamente ausente: não muda nesta fatia, e autorizar o que
não se toca é uma autorização vazia. O guard também está ausente: esta fatia não o altera.

## O que ela NÃO fez

Não alterou `studioScopeGovernanceGuard.mjs`, `productionUiGuard.mjs`, nenhuma entrada
1..47, nenhum arquivo de produção, backend, Prisma, migration ou workflow. Nenhuma
dependência. Nenhuma baseline de typecheck — isso é P1-02B.
