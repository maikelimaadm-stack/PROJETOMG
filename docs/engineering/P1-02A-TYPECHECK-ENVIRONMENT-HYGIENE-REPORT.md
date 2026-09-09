# P1-02A — Typecheck Environment Hygiene & Debt Reclassification

**Base SHA:** `14de11106af834c1fd627c247490aac87c6452b3` (merge da PR #503)
**Data:** 2026-09-08
**Antecessora:** P1-02, parada em `P1_02_BASELINE_SCOPE_DRIFT`
**Sucessora:** P1-02B — fail-closed legacy typecheck baseline (NÃO implementada aqui)

---

## 1. Por que esta fatia existe

O wrapper `scripts/run-typecheck-governance.mjs` convertia **qualquer** erro do TypeScript
em sucesso, sob a justificativa de que se tratava de "TD-009 — documented shadcn/ui noise".

A P1-02 mediu a premissa antes de congelá-la numa baseline. A premissa é falsa.

---

## 2. Reprodução

```
npm run typecheck -- --pretty false     # tsc -p ./jsconfig.json --pretty false
exit 2
```

| métrica | valor |
|---|---|
| diagnósticos | 3745 |
| arquivos | 594 |
| em `src/shared/ui/**` | 316 em 44 arquivos (8,4%) |
| fora de `src/shared/ui/**` | 3429 em 550 arquivos (91,6%) |
| TS2307 de builtins Node | 593 |

Conferência de parsing: 3745 linhas com cabeçalho `arquivo(linha,coluna): error TSxxxx:`
e 3745 ocorrências de `error TS` no total; 903 linhas de continuação (mensagens multiline).
Idêntico ao relatório da P1-02 — sem drift.

---

## 3. Inventário de contextos

Os 594 arquivos diagnosticados:

| categoria | arquivos | diagnósticos | destino |
|---|---|---|---|
| **T** — testes (`src/runtime/__tests__/**`) | 114 | 1333 | excluído do escopo de produção |
| **G** — ferramentas Node (`scripts/gates/lib/*`) | 3 | 47 | sai por consequência (só entrava por importação dos testes) |
| **P/U** — produção e incertos | 477 | 2365 | **permanecem incluídos** |

### Classificação de incertos

Diretórios de nome sugestivo — `src/ModeloBase2/fuel-ui-sandbox/**`,
`src/runtime/preview/dev/**`, `src/studio/blueprint-engine/module-preview-sandbox/**` —
foram classificados **U**, não F. Vivem sob raízes de produção e são plausivelmente
alcançáveis pelas rotas de dev-preview da aplicação. Pela regra "qualquer U permanece
INCLUÍDO", nenhum deles foi excluído.

### Prova de propriedade da exclusão

| fato | verificação |
|---|---|
| Todo teste do repositório vive sob `src/runtime/__tests__/` | varredura de `src/**`: 116 arquivos, zero fora |
| Todos os 114 `.test.js` são executados | comparação com a lista nominal de `npm run test:runtime` → zero órfãos |
| Os 2 restantes são fixtures | `__tests__/fixtures/*.fixture.js`, importadas pelos testes |
| O dono roda no CI | step `Runtime tests` do workflow Foundation Governance |

Nenhuma exclusão sem dono. Nenhum teste criado para justificar exclusão.

---

## 4. Candidatos avaliados

| candidato | veredito |
|---|---|
| **A — `types: ["node"]` global** | **REJEITADO.** Poluiria o código browser com globals do Node, deixando `process`, `Buffer` e `require` passarem sem detecção em produção. Silenciaria os 593 TS2307 *inclusive* os 8 que estão em arquivos de produção reais — exatamente o que não se quer esconder |
| **B — config de produção dedicado** | **ESCOLHIDO.** `jsconfig.typecheck.json` estende o base, herda `types: []`, exclui uma única raiz comprovadamente de testes |
| **C — configs separados por contexto** | Rejeitado por ora: um config Node adicional reproduziria milhares de diagnósticos sem dono, sem valor de gate. Pode ser revisitado se o contexto Node ganhar enforcement próprio |

---

## 5. Configuração entregue

```jsonc
{
  "extends": "./jsconfig.json",
  "exclude": ["node_modules", "dist", "src/vite-plugins", "src/runtime/__tests__"]
}
```

`exclude` **não é mesclado** pelo TypeScript quando se usa `extends`: a lista substitui a do
base. Por isso as três entradas originais são repetidas. A única entrada nova é a raiz de
testes.

`compilerOptions` não é redeclarado — `types: []`, `checkJs: true` e o restante vêm do base
sem alteração.

---

## 6. Medição depois da higiene

| escopo | exit | diagnósticos | arquivos |
|---|---|---|---|
| ANTES (`jsconfig.json`) | 2 | 3745 | 594 |
| **PRODUÇÃO** (`jsconfig.typecheck.json`) | 2 | **2365** | **477** |
| LEGADO (`typecheck:legacy-all`) | 2 | 3745 | 594 |

Removidos do escopo de produção: **1380** = 1333 (testes) + 47 (ferramentas Node).

### Produção, por raiz

framework 488 · shared 402 · studio 393 · runtime 345 · bos 270 · intelligence 163 ·
modules 110 · ModeloBase1 82 · ModeloBase2 74 · apis 28 · main.jsx 4 · App.jsx 4 ·
integrations 2

### Produção, códigos dominantes

TS2339 1308 · TS2322 499 · TS2741 110 · TS2345 98 · TS2353 66 · TS2591 52 · TS2559 41 ·
TS2739 29 · TS2307 21 · TS2304 21

### Builtins Node que PERMANECEM em produção — finding, não ruído

8 diagnósticos em 7 arquivos:

```
src/runtime/core/completion/runtimeCompletion.js
src/runtime/core/context/createContext.js
src/runtime/core/crb/crbConstants.js
src/runtime/core/session/mockL1Auth.js
src/runtime/core/workflow/workflowEngine.js
src/studio/governance/architectureRules.js
src/studio/governance/dependencyGraph.js
```

Deliberadamente não ocultados. São código de produção referenciando builtins do Node.

---

## 7. Prova de que produção não foi escondida

Sentinela temporária, nunca commitada, em `src/runtime/__p1_02a_production_sentinel__.js`:

```js
/** @type {number} */
const P1_02A_PRODUCTION_SENTINEL = "P1_02A_PRODUCTION_SENTINEL";
```

- entrou no escopo (`--listFiles`);
- produziu `error TS2322: Type 'string' is not assignable to type 'number'`;
- a contagem do wrapper subiu de 2365 para **2366**;
- arquivo removido; ausente do diff.

---

## 8. Contextos excluídos continuam validados

| contexto | comando | resultado |
|---|---|---|
| `src/runtime/__tests__/**` | `npm run test:runtime` | 23615/23615 · 0 fail |
| gates Node | `npm run gate:g423` | PASS 7/7 |

Nada saiu da validação: apenas mudou de dono.

---

## 9. Dívida

- **TD-009** reduzida ao que de fato descreve: 316 diagnósticos em `src/shared/ui/**`.
  A evidência original foi mantida no registro, com a refutação datada ao lado.
- **TD-016** aberta para a dívida global de 2365 diagnósticos de produção, com owner P1-02B.

**Nenhuma baseline foi criada.** Isso é P1-02B.

---

## 10. Bloqueador conhecido

`scripts/run-typecheck-governance.mjs` continua com `process.exit(0)` diante de
diagnósticos. Classificação: **KNOWN_P1_02B_BLOCKER**.

O que mudou: a mensagem parou de mentir. Ela agora declara `LEGACY TYPECHECK DEBT —
permissive bridge pending P1-02B`, informa a contagem real e admite não ser fail-closed.

---

## 11. Contrato proposto para P1-02B — proposta, não implementação

- **Escopo da baseline:** apenas diagnósticos residuais de PRODUÇÃO (2365 hoje).
  Nunca testes, nunca ferramentas Node — esses têm dono executável próprio.
- **Fingerprint:** `path + código TS + mensagem normalizada + contagem de ocorrências`,
  como multiset por arquivo. Linha e coluna entram como evidência, não como autorização:
  em 2365 entradas, uma reformatação inocente invalidaria a baseline inteira sem que
  nenhum erro novo existisse.
- **Diagnóstico novo:** qualquer par (path, código, mensagem) ausente, ou contagem acima
  da registrada → FAIL.
- **Baseline stale:** diagnóstico registrado que desapareceu, ou tsc verde com baseline
  não vazia → FAIL, exigindo revisão consciente.
- **Fail-closed também para:** baseline ausente, malformada, duplicada, com path externo;
  erro de spawn; status null; saída não parseável; exceção interna.
- **Nunca:** auto-atualização da baseline, wildcard, allowlist por diretório,
  `continue-on-error`, `|| true`, bypass por env ou nome de branch.
- **CI:** o step de typecheck passa a reprovar. A inclusão do contract test de escopo no
  workflow pode ser decidida junto.

---

## 12. Limites desta fatia

- Nenhum arquivo de produção foi alterado. A dívida de 2365 diagnósticos permanece.
- `npm run typecheck` continua exit 2 — por desenho: mede a dívida real sem escondê-la.
- `gate:capabilities` já falhava na base intocada (G265, `gate:studio-sdk`). Falha
  **pré-existente**, reproduzida com as mudanças revertidas; o workflow do CI não executa
  esse agregado, e os 7 jobs de capability que ele executa estão verdes.
