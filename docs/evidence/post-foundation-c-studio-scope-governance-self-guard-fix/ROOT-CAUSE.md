# Root Cause

O gate de governança #463 introduziu um self-guard para provar que a PR de governança não
alterava caminhos proibidos:

```js
const forbidden = filterForbiddenScopePaths(files);
const outsideOwn = files.filter((f) => !OWN.some((re) => re.test(f)));
noForbiddenChange = forbidden.length === 0 && outsideOwn.length === 0;
```

`OWN` cobre os artifacts da própria governança + hosts wired. Porém `outsideOwn` NÃO
filtrava `known_later_studio_headless_artifact`. Rodando na branch de um slice posterior
(PR #462), os arquivos do Preview Sandbox (fonte + evidência) não estavam em `OWN` e não
eram tolerados → `outsideOwn` não-vazio → self-guard falhava.

Importante: `forbidden` estava vazio (nenhum caminho proibido). Era um **falso positivo
branch-relative** do self-guard, não uma falha de segurança nem defeito do Preview Sandbox.

## Por que não corrigir dentro da PR #462

Corrigir exigiria alterar um gate mergeado de outro slice (governança #463), o que está
fora do escopo autorizado da #462. A correção pertence a uma PR de governança própria —
esta.
