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

Preenchido a partir das execuções reais desta branch — ver §12 do relatório de PR.
