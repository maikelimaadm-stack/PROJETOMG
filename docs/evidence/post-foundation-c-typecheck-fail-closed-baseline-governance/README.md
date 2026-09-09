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

---

## Correção pós-auditoria — portabilidade por locale

A auditoria independente **bloqueou** o head `439dbd3f`, com o CI já verde (run #666).

A ordem da baseline era decidida por `String.prototype.localeCompare`, cuja collation
depende do locale do processo. Com o par real

```
A = "Property 'viewModeKey' does not exist on type '{}'."
B = "Property 'VISIBLE_KEY' does not exist on type '{}'."
```

`A.localeCompare(B)` vale **−1 em en-US** e **+1 em tr-TR**. Consequência medida em árvore
intocada: `LC_ALL=tr_TR.UTF-8 npm run typecheck:governance` reprovava com *"entries fora da
ordenação determinística"*, enquanto `en_US.UTF-8` aprovava.

Mesma classe de não-portabilidade do run #665 — lá pela raiz absoluta, aqui pela collation.
Fail-closed nos dois casos: nunca deixou regressão passar.

### O que a fatia passou a garantir

| garantia | como |
|---|---|
| ordem invariante por locale | `compareCodeUnits` / `compareEntries` — unidades de código UTF-16, fonte única consumida por captura, validação e comparação |
| absoluto é absoluto | detector genérico (POSIX, letra de unidade, UNC) no lugar da allowlist de raízes Unix, que não via `/usr`, `/workspaces`, `/builds`, `/github`, `/data`, `/app`, `/checkout` |
| raiz removida sem colisão | remoção apenas em fronteira de caminho; a raiz nua não vira string vazia |
| checkout atrás de symlink | `repositoryRootVariants` resolve também o `realpath` |
| falha sem causa não é sucesso | `tsc` com status ≠ 0 e zero diagnósticos parseados REPROVA |

A baseline foi regravada: **puramente reordenação** — 782 posições, zero entradas alteradas,
2365 / 477 / 1528 preservados, delta lógico 0/0/0/0.

Verificado em seis locales (`C`, `en_US`, `pt_BR`, `tr_TR`, `de_DE`, `sv_SE`): todos exit 0.
A prova de invariância é comportamental — o mesmo conjunto é ordenado em processos separados
sob `LC_ALL` distintos, e o teste confere antes que o ICU do filho de fato resolveu locales
diferentes, para não passar vazio.

**Lição registrada:** CI verde não prova portabilidade. O CI é uma máquina, um locale, uma
raiz. Determinismo entre execuções não é determinismo entre ambientes.

---

## Reauditoria final — falso negativo POSIX

O head `b6d7867c` já tinha o P1 de locale corrigido e o CI `#667` verde. Foi bloqueado
mesmo assim: a parte POSIX do detector exigia `/segmento/` com segmento ASCII, o que era
uma **allowlist de formato** no lugar da antiga allowlist de nomes.

Não detectava: `/foo.ts` · `"/foo.ts"` · `/tmp` · `'/package.json'` · `/ação/arquivo.ts`
· `/é/arquivo.ts` · `"/dados pessoais/arquivo.ts"`.

Como a mensagem compõe o fingerprint, um absoluto não reconhecido seria aceito pelo
parsing, pela validação e pela captura — e a baseline voltaria a depender da máquina.

**Correção:** a detecção passou a ser por **fronteira de token** — a barra que abre o
caminho está no início da string ou logo após espaço, aspa, parêntese, colchete, chave
ou `<`. Sem exigir segunda barra, sem exigir extensão, sem restringir alfabeto; `//servidor/…`
incluído. Relativos (`./`, `../`, `@/`, `A/B`, `src/a/b.js`) e URLs seguem fora.

**A baseline não mudou**: delta `0/0/0/0`, hash idêntico, 2365 / 477 / 1528. Zero das
1528 mensagens reais é marcada pelo detector novo.

**Lição acumulada:** três gerações do detector, três falhas da mesma família — allowlist
de nomes, depois allowlist de formato — e o CI verde em todas. Portabilidade se prova por
propriedade, não por enumeração de casos conhecidos.
