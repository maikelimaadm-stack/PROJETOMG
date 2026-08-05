# Domínio versus autorização — a distinção central da Slice 46

## As duas perguntas

```
DOMÍNIO        "esta governança tem jurisdição sobre este caminho?"
AUTORIZAÇÃO    "esta fatia pode tocar este caminho?"
```

São independentes. Um caminho pode estar **no domínio** e não ser autorizado por ninguém —
e nesse caso continua reprovado, exatamente como antes. Domínio não abre porta nenhuma.

## Fonte do domínio

`STUDIO_GOVERNED_DOMAIN_PATTERNS` no registry, mais `FORBIDDEN_SCOPE_PATTERNS`:

```
^src/studio/
^src/runtime/
^scripts/gates/
^docs/evidence/
^package\.json$
^package-lock\.json$
+ todo caminho já coberto por FORBIDDEN_SCOPE_PATTERNS
```

São **raízes**, não listas de artefatos. Isso é deliberado e é a propriedade de segurança
inteira desta fatia.

## Por que NÃO derivar de `classifyStudioScopePath`

A derivação óbvia seria:

```js
classifyStudioScopePath(path) !== 'unknown_scope'   // ← INSEGURA, não usada
```

Ela falha exatamente no caso que mais importa. Um arquivo novo, ainda não registrado, sob
uma raiz Studio:

```
src/studio/unregistered-future-artifact.js
  classifyStudioScopePath        → 'unknown_scope'
  derivação insegura             → "não é nosso"  → non_studio_branch → PASSARIA
  isStudioGovernedDomainPath     → true           → julgado → reprovado por falta de
                                                     autorização  ← correto
```

Ou seja: a derivação pelo classificador transformaria "ainda não registrei este arquivo"
em "esta governança não se aplica", que é uma porta dos fundos silenciosa. As raízes fazem
a chamada oposta e correta — o arquivo está no domínio no instante em que existe.

Isto é verificado executavelmente em `DOM005`, `DOM006` e `D001` do teste desta fatia, e o
gate ainda varre a fonte para provar que a forma insegura não aparece em
`isStudioGovernedDomainPath`.

## Cobertura provada, não presumida

Os **177** padrões de autorização distintos das 45 entradas pré-existentes foram extraídos
e confrontados com as raízes: 176 cobertos diretamente, e o único restante (`^src/App.jsx$`)
é forbidden, portanto coberto pela segunda fonte. **177/177.**

Nenhuma fatia consegue autorizar um caminho que o domínio chamaria de território estrangeiro.
