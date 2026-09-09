# P1-02B — Fail-Closed Legacy Typecheck Baseline

**Base SHA:** `1aef37f5126846f3d2a53de7a727d78490c82b19` (merge da PR #504)
**Data:** 2026-09-09
**Antecessora:** P1-02A — Typecheck Environment Hygiene & Debt Reclassification
**Fatia de governança:** Slice 49 — Typecheck Fail-Closed Baseline Governance

---

## 1. O bloqueador que esta fatia fecha

P1-02A entregou o escopo correto e **deliberadamente** não removeu o bypass:

> `scripts/run-typecheck-governance.mjs` continua com `process.exit(0)` diante de
> diagnósticos. Classificação: **KNOWN_P1_02B_BLOCKER**.
> — P1-02A-TYPECHECK-ENVIRONMENT-HYGIENE-REPORT.md §10

Enquanto isso valesse, o step de typecheck do CI não reprovava código novo. Um erro de tipo
introduzido hoje entraria na main em silêncio.

---

## 2. Reprodução na base

```
npm ci
npm run typecheck -- --pretty false      # tsc -p ./jsconfig.typecheck.json
exit 2
```

| métrica | valor | esperado por P1-02A | drift |
|---|---|---|---|
| diagnósticos | **2365** | 2365 | nenhum |
| arquivos | **477** | 477 | nenhum |

Conferência independente de parsing: 2365 linhas com cabeçalho
`arquivo(linha,coluna): error TSxxxx:` e 2365 ocorrências do token `error TS` no total.
Sem drift — a medição de P1-02A é reproduzível byte a byte.

---

## 3. O fingerprint

```
caminho relativo  +  código TS  +  mensagem normalizada  →  contagem de ocorrências
```

2365 diagnósticos dobram em **1528 fingerprints distintos**.

Linha e coluna **não** participam. São gravadas em `evidence` e provadamente ignoradas pela
comparação (T21 desloca a posição e exige que a comparação continue aprovando).

O motivo é mecânico, não estético: com 2365 diagnósticos vivos, inserir um import ou
quebrar uma linha longa deslocaria centenas de posições e invalidaria a baseline inteira
sem que nenhum erro novo existisse. Um enforcement que grita sem motivo é desligado, e um
enforcement desligado não protege nada.

O que a contagem preserva: **duas** ocorrências do mesmo (arquivo, código, mensagem) onde
havia **uma** é regressão, e reprova.

Normalização da mensagem: apenas colapso de espaço em branco. Nada de aspas, tipos ou
números é removido — a mensagem é parte da identidade do diagnóstico.

---

## 4. Os dois sentidos reprovam

| situação | veredito | classe |
|---|---|---|
| fingerprint ausente da baseline | FAIL | regressão |
| contagem maior que a registrada | FAIL | regressão |
| fingerprint registrado que sumiu | FAIL | baseline stale |
| contagem menor que a registrada | FAIL | baseline stale |
| `tsc` verde com baseline não vazia | FAIL | baseline stale |
| baseline ausente | FAIL | integridade |
| baseline malformada / não-JSON | FAIL | integridade |
| fingerprint duplicado | FAIL | integridade |
| caminho absoluto, com `..` ou com curinga | FAIL | integridade |
| caminho fora do escopo de produção (`src/runtime/__tests__/**`) | FAIL | integridade |
| caminho registrado cujo arquivo não existe | FAIL | integridade |
| entradas fora da ordenação determinística | FAIL | integridade |
| totais que não batem com a soma das contagens | FAIL | integridade |
| erro de spawn, sinal, status nulo | FAIL | execução |
| saída do `tsc` não integralmente parseável | FAIL | execução |
| exceção interna do enforcement | FAIL | execução |

A dívida **melhorar** é boa notícia e mesmo assim reprova. Uma baseline que encolhe sozinha
é uma baseline que ninguém revisou; a correção é consciente, manual e versionada.

---

## 5. Nunca

Auto-atualização da baseline · wildcard · allowlist por diretório · bypass por variável de
ambiente · bypass por nome de branch · tolerância numérica · `continue-on-error` · `|| true`
· `set +e` · skip/todo/only · `workflow_dispatch` como substituto do fluxo real.

O wrapper não lê `process.env`, não lê `process.argv`, não escreve arquivo algum e seu único
subprocesso é `npx tsc -p ./jsconfig.typecheck.json --pretty false`. Todas essas propriedades
são asseveradas estruturalmente — sobre o **código**, com os comentários removidos antes da
varredura, porque o arquivo cita o bypass removido para documentar que ele acabou.

---

## 6. O CI

O step único e permissivo — cujo nome, `Typecheck (governance audit — TD-009 baseline)`,
descrevia uma atribuição que a medição de P1-02A já havia refutado — foi substituído por três,
todos depois do `Lint`:

| # | step | comando | papel |
|---|---|---|---|
| 1 | Typecheck scope governance tests | `npm run test:typecheck-scope-governance` | o ESCOPO continua o que P1-02A definiu |
| 2 | Typecheck governance contract tests | `npm run test:typecheck-governance` | o ENFORCEMENT é testado antes de ser confiado |
| 3 | Typecheck (fail-closed legacy baseline) | `npm run typecheck:governance` | a dívida é comparada e **reprova** |

A ordem importa: não se confia num enforcement cujo contrato não foi verificado no mesmo run.

---

## 7. Prova negativa

Sentinela com erro de tipo real, **commitada** para que o diff de branch a enxergasse:

```js
// src/runtime/__p1_02b_typecheck_negative__.js
/** @type {number} */
export const P1_02B_TYPECHECK_NEGATIVE = "P1_02B_TYPECHECK_NEGATIVE";
```

Resultado registrado em §11. O commit foi desfeito com `git revert --no-edit` — história
preservada, sem reescrita, sem `reset`, sem `amend`, sem force-push.

---

## 8. Supersessão de asserções de P1-02A

Sete asserções escritas em P1-02A afirmavam o estado **daquela** fatia: a ponte permissiva
existia e declarada, e nenhuma baseline existia porque criá-la era escopo desta missão.

P1-02B entregou exatamente o que elas antecipavam. Tornaram-se falsas **por sucesso**, não
por regressão.

| asserção | afirmava | passou a afirmar |
|---|---|---|
| `W02` (scope suite) | saída anuncia ponte permissiva | saída declara dívida congelada + TD-016 |
| `W03` (scope suite) | `Diagnósticos contados: N` | medido e registrado coincidem exatamente |
| `W04` (scope suite) | `BYPASS CONHECIDO` presente, "ainda NÃO é fail-closed" | regime FAIL-CLOSED, exit 0 justificado pela comparação |
| `W05` (scope suite) | nenhuma baseline em `config/` | baseline existe, é única e respeita o escopo |
| `E004` (slice 48) | nenhuma baseline criada | baseline única, restrita a produção |
| `F012` (slice 48) | wrapper é blocker declarado | wrapper compara contra baseline |
| `G423-48-P05` / `P09` | idem, no gate | idem |

Nenhuma foi removida e nenhuma foi pulada: cada uma continua exigindo uma propriedade
positiva — agora a propriedade certa. **A evidência histórica mergeada permanece imutável;
a supersessão é declarada por esta fatia corretiva.**

---

## 9. Correções de cardinalidade

Crescer o catálogo de 48 para 49 torna falsas as asserções que congelam o tamanho exato.
Seis arquivos de três fatias anteriores (46, 47, 48) foram corrigidos, um padrão ancorado
por arquivo, sem curinga.

Uma delas — `B010c`, da fatia 48 — congelava o literal `48` e envelheceria de novo na
próxima fatia. Foi reescrita para ser **relativa ao catálogo vigente**, o mesmo padrão que
`A012` já adotara na fatia 47.

### O workflow deixou de ser um caminho sem dono

As fatias 46 e 47 usavam `.github/workflows/foundation-governance.yml` como exemplo
canônico de caminho **não governado e não registrado**. Esta fatia precisa editá-lo, e por
isso o declara como artefato próprio — o que muda sua classificação.

Nada foi enfraquecido:

- as asserções de classificação continuam existindo, agora sobre caminhos comprovadamente
  sem dono (`README.md`, `vite.config.js`);
- o novo estado do workflow é afirmado **positivamente**: dono único, de ordinal posterior,
  e ainda fora do domínio governado — que é o que faz a porta non-Studio funcionar;
- a recusa em diff misto continua provada, agora nos **dois sabores** que existem:
  não registrado → `unknown_scope`; registrado por fatia posterior →
  `unauthorized_foreign_slice_path` com o caminho em `chronologicalViolation`. O teste exige
  que ambos os sabores sejam exercidos, para que nenhum ramo apodreça sem ser visto.

---

## 10. Limites desta fatia

- **Nenhum dos 2365 diagnósticos foi corrigido.** A dívida foi congelada, não paga.
  TD-016 passa a *Open — contida*: a regressão está bloqueada, o saldo permanece.
- `npm run typecheck` continua exit 2, por desenho — mede a dívida real sem escondê-la.
- `types: []` preservado. Habilitar os globais do Node silenciaria também os 8 diagnósticos
  de builtins que continuam vermelhos em 7 arquivos de produção reais.
- Nenhum arquivo de produto, backend, Prisma ou migration foi tocado. Nenhuma dependência
  adicionada; `package-lock.json` intocado; `studioScopeGovernanceGuard.mjs` intocado.
- `gate:capabilities` já falhava na base intocada (G265, `gate:studio-sdk`). Falha
  **pré-existente**, não causada aqui; o workflow do CI não executa esse agregado.

---

## 11. Medições

Todas pós-commit, com o diff de branch real contra `origin/main`.

| bateria | resultado |
|---|---|
| `npm run build` | ✅ built in 10.89s |
| `npm run lint` | ✅ 0 erros |
| `npm run test:runtime` | ✅ **23712/23712** · 0 fail |
| `npm run gate:g423` | ✅ 7/7 (G423-01..G423-24 clean) |
| `npm run test:typecheck-scope-governance` | ✅ 30/30 |
| `npm run test:typecheck-governance` | ✅ **25/25** (T01–T25) |
| `npm run typecheck:governance` | ✅ exit 0 — 2365/477 medido = 2365/477 registrado |
| `gate:g423-typecheck-fail-closed-baseline-governance` | ✅ **55/55** |
| `gate:g423-typecheck-environment-hygiene-governance` | ✅ 49/49 |
| `gate:g423-studio-scope-governance-non-studio-runtime-compatibility` | ✅ 154/154 |
| `gate:g423-studio-scope-governance-non-studio-branch-applicability` | ✅ 137/137 |
| `npm run typecheck` | ⚠️ exit 2 — **por desenho**, mede a dívida sem escondê-la |

### Prova negativa — execução real

Sentinela commitada em `src/runtime/__p1_02b_typecheck_negative__.js` (commit `0639bfdf`):

```
[INFO] Medido agora: 2366 diagnósticos em 478 arquivos.
[INFO] Baseline:     2365 diagnósticos em 477 arquivos.

[FAIL] REGRESSÃO DE TIPOS: há diagnóstico de produção fora da baseline.
  NOVOS — não existiam na baseline (1):
    - src/runtime/__p1_02b_typecheck_negative__.js TS2322 x1
        Type 'string' is not assignable to type 'number'.

  Corrija o código. A baseline NÃO deve crescer para acomodar código novo.

[FAIL] Typecheck governance: REPROVADO (fail-closed).
exit 1
```

O contraste com P1-02A é exato: lá o wrapper também **contou** 2366 e ainda assim saiu 0.

Revertido com `git revert --no-edit` (commit `e681afc7`). Sem reset, sem amend, sem
force-push, sem reescrita. Os quatro commits permanecem visíveis na branch.

> Nota: o commit de revert carrega a mensagem padrão do git, sem os trailers de
> co-autoria. É consequência direta de `--no-edit` combinado com a proibição de `amend`.

---

## 12. FALHAS ENCONTRADAS E CORRIGIDAS

Registradas antes de qualquer correção, conforme a regra.

### 12.1 — Auto-falsificação por citação (3 ocorrências)

Três asserções de higiene procuravam um token proibido no arquivo inteiro e encontravam a
**própria documentação**, que cita o token justamente para declarar que ele foi removido.

| onde | procurava | encontrava |
|---|---|---|
| `T24` | `/BYPASS\|SKIP\|FORCE/` no wrapper | "O bypass ACABOU", "Não há bypass por variável de ambiente" |
| `T24` | contagem de `process.exit(0)` | o `exit(0)` citado no histórico de P1-02A |
| `S005` | `/governance audit/` no workflow | o comentário que documenta a substituição do step |

Correção: a varredura passou a ser **estrutural**, sobre o código com comentários removidos
(T24, com asserção de que a remoção tirou prosa sem levar código junto), e sobre os `- name:`
do workflow em vez do arquivo inteiro (S005). É a terceira vez que este padrão aparece no
programa — as duas anteriores foram a fatia 47 e o bloco W de P1-02A.

### 12.2 — O workflow deixou de ser caminho sem dono (4 checks)

Ver §9. Registrar o workflow como artefato da fatia 49 quebrou os fixtures das fatias 46 e 47,
que o usavam como exemplo canônico de caminho não governado **e não registrado**.

### 12.3 — Checks branch-relative de fatias anteriores (7 checks)

Encontrados **apenas** na medição pós-commit — antes do commit, `git diff origin/main...HEAD`
estava vazio e todos retornavam cedo, dando falso verde.

| check | fatia | afirmava |
|---|---|---|
| `E009` + gate homônimo | 46 | a branch não carrega o workflow do CI |
| `S004` | 47 | a branch não toca `.github/**` |
| `C001` + `G423-48-B01` | 48 | a branch resolve exatamente a Slice 48 |
| `D001` + `G423-48-B07` | 48 | a branch não toca `.github/**` |

São afirmações sobre a branch **própria** de cada fatia, escritas quando a PR delas estava
aberta. A correção dispensa o check apenas quando a fatia ativa é **estritamente posterior**,
e mesmo aí afirma o envelope inteiro; backend, Prisma, migration, produto e lockfile
continuam proibidos para toda branch, verificados nos dois lados.

### 12.4 — Asserção congelada em literal (1 check)

`B010c`, da fatia 48, exigia o literal `48` nos arquivos corrigidos e envelheceria de novo na
fatia seguinte. Reescrita para ser relativa ao catálogo vigente — o padrão que `A012` já
adotara na fatia 47.

### 12.5 — Byte NUL em código-fonte (corrigido antes de qualquer medição)

A primeira versão de `fingerprintOf` usou um separador NUL literal, gravado como byte de
controle no arquivo. Substituído por `JSON.stringify([path, code, message])`, que dispensa
separador e elimina qualquer colisão possível.

---

## 13. Limitação pré-existente registrada

`gate:capabilities` falha em G265 (`gate:studio-sdk`) e **já falhava na base intocada**.
Não foi causada nem corrigida aqui; o workflow do CI não executa esse agregado, e os 7 jobs
de capability que ele executa estão verdes. Owner: P1-04.
