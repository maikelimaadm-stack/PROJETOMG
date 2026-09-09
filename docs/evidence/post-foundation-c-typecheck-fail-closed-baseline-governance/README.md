# Slice 49 — Typecheck Fail-Closed Baseline Governance

**Programa:** Post-Foundation C · governança de CI
**Missão:** P1-02B — Fail-Closed Legacy Typecheck Baseline
**Base:** `1aef37f5126846f3d2a53de7a727d78490c82b19` (merge da PR #504)
**Antecessora:** Slice 48 — Typecheck Environment Hygiene Governance (P1-02A)

---

## Por que esta fatia existe

A fatia 48 normalizou o **escopo** do typecheck: `jsconfig.typecheck.json` passou a
descrever produção, browser-safe, excluindo apenas `src/runtime/__tests__`, cujo dono
executável é `npm run test:runtime`.

O que ela deliberadamente **não** fez foi remover o bypass. O wrapper
`scripts/run-typecheck-governance.mjs` continuava devolvendo `0` diante de qualquer
diagnóstico, registrado como `KNOWN_P1_02B_BLOCKER`. Enquanto isso valesse, um erro de
tipo **novo** entrava na main sem que o CI reclamasse.

P1-02B fecha esse bloqueador.

---

## O que muda

| antes (P1-02A) | depois (P1-02B) |
|---|---|
| `typecheck:governance` devolve 0 sempre | reprova contra baseline exata |
| dívida relatada, não rastreada | 2365 diagnósticos congelados em SSOT versionada |
| 1 step de typecheck no CI, permissivo | 3 steps: escopo · contrato · enforcement |
| diagnóstico novo passa | diagnóstico novo quebra o CI |

**A dívida legada NÃO foi corrigida aqui.** Ela foi congelada e continua rastreada como
TD-016. Congelar não é esconder: a baseline é legível, versionada, e só encolhe por
decisão consciente registrada em commit.

---

## Artefatos

| arquivo | papel |
|---|---|
| `config/typecheck-production-baseline.json` | SSOT — 1528 fingerprints, 2365 diagnósticos, 477 arquivos |
| `scripts/lib/typecheckGovernance.mjs` | parsing, fingerprint, validação e comparação |
| `scripts/run-typecheck-governance.mjs` | enforcement fail-closed (era a ponte permissiva) |
| `scripts/capture-typecheck-production-baseline.mjs` | captura MANUAL, exige `--write` |
| `scripts/tests/typecheck-governance.test.mjs` | contrato T01–T25 |
| `src/runtime/__tests__/typecheck-fail-closed-baseline-governance.test.js` | governança da fatia |
| `scripts/gates/g423-typecheck-fail-closed-baseline-governance.mjs` | gate da fatia |

---

## O fingerprint

```
caminho relativo  +  código TS  +  mensagem normalizada  →  contagem de ocorrências
```

Linha e coluna **não** participam. Entram como `evidence` e são ignoradas pela comparação,
o que a própria bateria prova (T21). O motivo é mecânico: com 2365 diagnósticos vivos,
inserir um import deslocaria centenas de posições e invalidaria a baseline inteira sem que
nenhum erro novo existisse. Um enforcement que grita sem motivo é desligado — e um
enforcement desligado não protege nada.

O que a contagem preserva: duas ocorrências onde havia uma é regressão, e reprova.

---

## Os dois sentidos reprovam

| situação | veredito |
|---|---|
| diagnóstico ausente da baseline | FAIL — regressão |
| contagem maior que a registrada | FAIL — regressão |
| diagnóstico registrado que sumiu | FAIL — baseline stale |
| contagem menor que a registrada | FAIL — baseline stale |
| `tsc` verde com baseline não vazia | FAIL — baseline stale |
| baseline ausente, malformada, duplicada, com path absoluto ou fora do escopo | FAIL |
| spawn com erro, sinal, status nulo, saída não parseável | FAIL |
| exceção interna do enforcement | FAIL |

A dívida melhorar é boa notícia e **mesmo assim reprova**: uma baseline que encolhe sozinha
é uma baseline que ninguém revisou.

---

## Nunca

Auto-atualização da baseline · wildcard · allowlist por diretório · bypass por variável de
ambiente · bypass por nome de branch · tolerância numérica · `continue-on-error` · `|| true`
· `set +e` · skip/todo/only.

---

## Escopo desta fatia

- Zero arquivo de produto, backend, Prisma, migration ou `src/modules/**`
- Zero dependência nova; `package-lock.json` intocado
- `types: []` preservado — habilitar os globais do Node esconderia os 8 diagnósticos de
  builtins que continuam vermelhos em 7 arquivos de produção reais
- `studioScopeGovernanceGuard.mjs` não é tocado
- Os 2365 diagnósticos permanecem exatamente onde estavam
