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

### 12.6 — Fingerprint dependente de máquina (encontrado pelo CI, run #665)

**A falha mais importante desta fatia, e a única que só o CI revelou.**

O primeiro run de CI reprovou no step 1. Causa: quatro diagnósticos `TS2694` embutem o
caminho **absoluto** do arquivo dentro do TEXTO da mensagem.

```
local:  Namespace '"/home/user/PROJETOMG/src/runtime/types/context"' has no exported member ...
CI:     Namespace '"/home/runner/work/PROJETOMG/PROJETOMG/src/runtime/types/context"' ...
```

Como a mensagem é parte do fingerprint, a baseline capturada numa máquina não valia noutra.
As contagens batiam — 2365/477 dos dois lados — mas 2 fingerprints liam como **novos** e 2
como **desaparecidos**. O enforcement acusou regressão onde nada havia mudado.

Isto não é um detalhe de ambiente: é uma falha do desenho do fingerprint que eu escrevi. A
baseline precisa ser determinística **entre máquinas**, não apenas entre execuções na mesma
máquina — e a verificação de determinismo que rodei localmente (duas capturas, delta
0/0/0/0) era incapaz de detectá-la.

Correção, em três camadas para que a classe não volte em silêncio:

1. `normalizeMessage(raw, root)` relativiza a raiz do repositório dentro do texto. Nada
   mais é apagado — aspas, tipos e números seguem intactos.
2. O **parsing** recusa a saída se alguma mensagem ainda retiver caminho absoluto depois da
   normalização, em vez de gravar um fingerprint dependente de máquina.
3. A **validação** rejeita uma baseline cuja mensagem contenha caminho absoluto.

O detector distingue absoluto de relativo: `./bosTypes.js`, `../../types/context.js` e
`@/styles/mg-prototype.css` aparecem em mensagens reais e continuam válidos. Coberto por T15.

Baseline regravada: 2365/477, 1528 fingerprints, **zero** caminhos absolutos.

### 12.5 — Byte NUL em código-fonte (corrigido antes de qualquer medição)

A primeira versão de `fingerprintOf` usou um separador NUL literal, gravado como byte de
controle no arquivo. Substituído por `JSON.stringify([path, code, message])`, que dispensa
separador e elimina qualquer colisão possível.

---

## 13. Limitação pré-existente registrada

`gate:capabilities` falha em G265 (`gate:studio-sdk`) e **já falhava na base intocada**.
Não foi causada nem corrigida aqui; o workflow do CI não executa esse agregado, e os 7 jobs
de capability que ele executa estão verdes. Owner: P1-04.

---

## 14. Correção pós-auditoria — o head 439dbd3f foi BLOQUEADO

O run #666 ficou verde e **mesmo assim a fatia tinha um defeito de portabilidade**. Este
registro existe para que isso não se perca: CI verde não é prova de portabilidade, porque
o CI é uma única máquina, com um único locale e uma única raiz.

### 14.1 O bloqueador — ordenação dependente de locale

A auditoria independente reprovou o head `439dbd3f`. Causa: `foldToEntries`,
`validateBaseline` e `compareToBaseline` ordenavam com `String.prototype.localeCompare`,
cuja collation depende do locale do processo.

Par real, medido com locale explícito — independe do que o SO tem instalado:

| locale | `A.localeCompare(B)` |
|---|---|
| en-US | **−1** |
| pt-BR | −1 |
| de-DE | −1 |
| sv-SE | −1 |
| **tr-TR** | **+1** |

```
A = "Property 'viewModeKey' does not exist on type '{}'."
B = "Property 'VISIBLE_KEY' does not exist on type '{}'."
```

Reprodução ponta a ponta, árvore intocada, antes da correção:

```
LC_ALL=en_US.UTF-8 npm run typecheck:governance   -> exit 0
LC_ALL=tr_TR.UTF-8 npm run typecheck:governance   -> exit 1
    [FAIL] baseline inválida (config/typecheck-production-baseline.json):
      - entries fora da ordenação determinística (path, code, message)
```

Dois impactos, e o segundo é o mais grave: uma máquina recusava baseline íntegra criada
noutra; e a **única via sancionada de manutenção** — `typecheck:baseline:capture --write` —
gravava, sob esse locale, uma ordem rejeitada em todo o resto. É a mesma classe de
não-portabilidade do run #665: lá pela raiz absoluta, aqui pela collation.

Como o #665, este defeito é **fail-closed**: nunca deixou regressão de tipos passar.

### 14.2 O que mudou

| # | correção | onde |
|---|---|---|
| P1 | `compareCodeUnits` / `compareEntries` — ordem por unidades de código UTF-16, sem locale, sem ICU. Fonte ÚNICA da ordem, consumida pelos três pontos | `scripts/lib/typecheckGovernance.mjs` |
| P2 | detector de caminho absoluto **genérico** — POSIX, letra de unidade e UNC — no lugar da allowlist de raízes Unix, que não via `/usr`, `/workspaces`, `/builds`, `/github`, `/data`, `/app`, `/checkout` | idem |
| P3 | variável morta `stale` removida | `scripts/run-typecheck-governance.mjs` |
| P3 | `status ≠ 0` com zero diagnósticos parseados passa a REPROVAR — falha sem causa identificada não é ausência de erros | biblioteca + wrapper |
| P3 | raiz removida SOMENTE em fronteira de caminho; a raiz nua deixa de virar string vazia, eliminando a colisão teórica | `normalizeMessage` |
| P3 | `repositoryRootVariants` resolve também o `realpath`, cobrindo checkout atrás de symlink | idem |
| P3 | redundância de proibidos de D001/B07b (slice 48) restaurada à cobertura original | teste e gate da slice 48 |

### 14.3 Regravação da baseline

Puramente reordenação. Nenhuma mudança lógica:

```
dry-run  : delta novos 0 · aumentados 0 · desaparecidos 0 · reduzidos 0
           hash idêntico antes e depois do dry-run
--write  : 2365 diagnósticos · 477 arquivos · 1528 fingerprints · 0 duplicados
diff     : 2959 linhas, 782 posições reordenadas
prova    : conjunto de (path, code, message, count, evidence) IDÊNTICO ao anterior —
           zero entradas só no antigo, zero só no novo
```

### 14.4 Verificação

```
LC_ALL=C            -> exit 0        LC_ALL=de_DE.UTF-8 -> exit 0
LC_ALL=en_US.UTF-8  -> exit 0        LC_ALL=sv_SE.UTF-8 -> exit 0
LC_ALL=pt_BR.UTF-8  -> exit 0        LC_ALL=tr_TR.UTF-8 -> exit 0   <-- era 1
```

A prova de invariância em `T10` é **comportamental**: ordena o mesmo conjunto em processos
separados sob `LC_ALL` distintos e exige o mesmo resultado. Ela verifica antes que o ICU
do filho realmente resolveu locales diferentes (`en-US` vs `tr-TR`), de modo que não possa
passar vazia caso o ambiente ignore a variável. A defesa estrutural em `T24` — proibir
`localeCompare` e `Intl.Collator` na biblioteca — é segunda camada, não a prova.

Matriz de fail-closed reexecutada contra o código corrigido, numa raiz diferente:
20 cenários de recusa + controle, todos corretos. Captura em raiz alternativa produz
baseline **byte a byte idêntica**.

### 14.5 Precisão da alegação

A formulação "independente de máquina" era ampla demais para o que estava provado. O que
esta fatia sustenta, e apenas isto:

- a **raiz do repositório** é relativizada em fronteira de caminho, incluindo o realpath;
- a **ordenação** é invariante por locale, por unidades de código;
- caminhos absolutos **remanescentes são recusados**, em vez de gravados;
- portanto a baseline é **portátil entre raízes e locales** sob o contrato certificado —
  o que é verificado por teste, não presumido.

---

## 15. Reauditoria final — falso negativo POSIX no detector

O head `b6d7867c` chegou à reauditoria com o P1 de locale **corrigido** e o CI `#667`
**verde**. Mesmo assim foi bloqueado: o P2 tinha um falso negativo que nenhum teste da
matriz cobria.

### 15.1 A lacuna

A parte POSIX do detector exigia `/segmento/`, com o segmento em `[A-Za-z0-9_.\-]+`.
Isso trocou a allowlist de **nomes** (`/home|/Users|/opt…`, a 1ª geração) por uma
allowlist de **formato** — igualmente incompleta.

Medido com a função real `hasAbsolutePathInMessage`, ANTES da correção:

| mensagem | detectado? | por quê |
|---|---|---|
| `/foo.ts` | **FALSE** | um único segmento — não há segunda barra |
| `"/foo.ts"` | **FALSE** | idem |
| `/tmp` | **FALSE** | idem |
| `'/package.json'` | **FALSE** | idem |
| `/ação/arquivo.ts` | **FALSE** | primeiro segmento não-ASCII |
| `/é/arquivo.ts` | **FALSE** | idem |
| `"/dados pessoais/arquivo.ts"` | **FALSE** | espaço dentro do segmento |
| `/usr/lib/.../lib.dom.d.ts` | TRUE | controle positivo, seguia correto |
| `./x`, `../x`, `@/x`, URLs | FALSE | controles negativos, seguiam corretos |

Um falso negativo aqui não é cosmético: a mensagem compõe o fingerprint
(`JSON.stringify([path, code, message])`), então um caminho absoluto não reconhecido
seria aceito pelo parsing, aceito pela validação, gravado pela captura — e a baseline
voltaria a depender da máquina, exatamente o que o run #665 ensinou a impedir.

### 15.2 O desenho corrigido

O que distingue absoluto de relativo não é o **nome** nem o **formato** do primeiro
segmento: é **onde a barra aparece**. Num caminho absoluto ela abre o token; num
relativo é sempre precedida por algo — `.`, `..`, `@`, um identificador, um esquema de
URL. A regra passou a ser de **fronteira de token**:

```
POSIX    (?<![^\s"'`([{<])\/{1,2}[^\s\/]
Windows  (?<![A-Za-z0-9])[A-Za-z]:[\\/]
UNC      \\\\[^\s\\]
```

Sem exigir segunda barra, sem exigir extensão, sem restringir alfabeto — e `//servidor/…`
(forma de rede) passa a ser coberto. Nenhuma das três formas depende de lista alguma.

### 15.3 Assimetria deliberada

Nenhum detector léxico separa `'/package.json'` de uma string de rota como `'/api/users'`
— as duas são idênticas na forma. A escolha aqui é consciente: este é um **backstop de
segurança**, e as consequências são assimétricas. Um falso positivo reprova o build de
modo visível e diagnosticável; um falso negativo grava, em silêncio, um fingerprint
dependente de máquina. Conferido contra as **1528 mensagens reais** da baseline: **zero**
são marcadas, logo a correção não introduz ruído no estado atual.

### 15.4 Consequências

- **A baseline NÃO foi regravada.** O dry-run confirmou delta `0/0/0/0` e o hash
  permaneceu `16dbcbc930f7ec48ec94219d84799bd1`. Nenhum diagnóstico real mudou.
- `T15` cobre agora os sete casos de falso negativo, `//servidor`, três mensagens com o
  caminho no meio do texto, e os negativos ganharam `http://`, `"x/y/z"`, `and/or` e
  `Veja / para detalhes.`.
- O fail-closed do parsing é provado: um diagnóstico com `/foo.ts`, `/ação/arquivo.ts`
  ou `/tmp` é **recusado**, e uma baseline que o carregasse é inválida.
- `capture-typecheck-production-baseline.mjs` ganhou a checagem explícita de
  `run.status === null`, espelhando o wrapper. Não há caminho realista até ela — `error`
  e `signal` já cobrem o caso na API do `spawnSync` —, mas esta ferramenta **escreve** o
  SSOT, e num script que escreve não se deve exigir do leitor que reconstrua a semântica
  do Node para concluir que o caso é inalcançável.

### 15.5 Lição acumulada

Três gerações do mesmo detector, três falhas da mesma família: **allowlist de nomes**,
depois **allowlist de formato**, e em ambos os casos o CI verde não viu nada. O CI é uma
máquina, um locale, uma raiz e uma matriz de testes. Portabilidade se prova por
propriedade — "absoluto é absoluto" —, não por enumeração de casos conhecidos.
