# Contrato da correção

Para todo consumidor histórico que analisa o diff vivo:

1. a aplicabilidade é decidida pela **boundary oficial**, nunca por heurística
   duplicada, nome de branch, variável de ambiente ou lista de caminhos;
2. quando o veredito é `non_studio_branch`, o estado é **asserido por inteiro**:

```js
assert.equal(r.notApplicable, true);
assert.equal(r.applicable, false);
assert.equal(r.activeSliceId, null);
assert.deepEqual(r.blockers, []);
assert.equal(r.safe, true);
```

3. só então a sentença de escopo próprio deixa de ser exigida;
4. tudo o que é universal — `forbidden`, `unknown`, `chronologicalViolation`,
   `safe` — continua sendo exigido em todos os estados.

## A porta é o veredito, nunca a lista vazia

Onde a consequência observável é "nenhuma slice resolve", a condição de entrada
é o veredito da boundary — e **não** `candidates.length === 0`.

Isso é deliberado. Um caminho Studio **não registrado** também produz zero
candidatos. Se a porta fosse a lista vazia, esse caminho entraria pela mesma
brecha e deixaria de falhar fechado. Com o veredito como porta, ele continua
produzindo `unknown_scope` + `no_active_slice_resolved`.

## Proibições respeitadas

Nenhum `test.skip`, `test.todo`, `.only`, `return` sem prova, `catch` vazio,
`continue-on-error`, `|| true`, `set +e`, checagem de `process.env.CI` ou
comparação por nome de branch.
