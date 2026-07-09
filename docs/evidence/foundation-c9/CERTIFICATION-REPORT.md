# Foundation C.9 — Certification Report

**Slice:** C.9 — M13/M14 Expression + Formula Engine
**Branch:** `claude/foundation-c9-expression-formula`
**Base:** `main` @ `98d3808c` (post PR #399, C.8)
**Gates:** G423-13 (PASS) · G423-14 (PASS) · G423-01–12 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/expression/expressionEngine.js` | `ExpressionEngine` — tokenizer/parser/AST evaluator, `evaluate()`, `validate()`, `createExpressionEngine()` |
| `src/runtime/core/expression/errors.js` | `ExpressionError` (`MAK-L3-EXPRESSION-001`..`005`) |
| `src/runtime/types/expression.js` | JSDoc types (`IExpressionEngine`, `ValidationResult`) |
| `src/runtime/__tests__/expression/expression.test.js` | 18 tests — literals, operators, allowlist functions, sandbox guards, determinism, limits, no-eval |
| `src/runtime/core/formula/formulaEngine.js` | `FormulaEngine` — `compute()`, `computeBatch()`, `getDependencies()`, `createFormulaEngine()` |
| `src/runtime/core/formula/errors.js` | `FormulaError` (`MAK-L3-FORMULA-001`..`005`) |
| `src/runtime/types/formula.js` | JSDoc types (`IFormulaEngine`, `FormulaDefinition`) |
| `src/runtime/__tests__/formula/formula.test.js` | 18 tests — computation, dependency resolution, cycle detection, batch, Service Locator, D-RI-13 |
| `scripts/gates/g423-13-expression.mjs` | Gate G423-13 |
| `scripts/gates/g423-14-formula.mjs` | Gate G423-14 |
| `docs/evidence/foundation-c9/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c9/MODULE-DIAGRAMS.md` | Mermaid — M13/M14 position and flow |
| `docs/evidence/foundation-c9/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds `ExpressionEngine` and `FormulaEngine` (the latter wired to the former + hydrated registry) post-RT-7; returns both in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `expressionEngine` and `formulaEngine` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createExpressionEngine`, `ExpressionEngine`, `ExpressionError`, `createFormulaEngine`, `FormulaEngine`, `FormulaError`. |
| `src/runtime/__tests__/fixtures/empresas-crb.fixture.js` | The default `formula` entry (`full_name`) now carries `payload.expr`/`payload.dependsOn` (additive — no prior test asserted the old, expr-less shape). Added optional `overrides.formulaEntries`. |
| `package.json` | Added `gate:g423-13`, `gate:g423-14`, `test:runtime:c9`; extended aggregated `test:runtime`. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, or `src/studio/` was touched (verified via `git diff --name-only origin/main...HEAD`).

---

## O que foi implementado

**M13 — Expression Engine:** a hand-written recursive-descent tokenizer/parser/evaluator over a small, safe grammar (literals, dotted-path identifiers, arithmetic `+ - * /`, comparison `== != > >= < <=`, boolean `&& || !` with short-circuit, parenthesized grouping, and 5 allowlisted functions: `min`, `max`, `round`, `abs`, `coalesce`). Every identifier path segment is checked against a blocklist (`__proto__`, `constructor`, `prototype`, `globalThis`, `process`, etc.) at parse time, and property resolution uses `Object.prototype.hasOwnProperty.call` (never bracket-indexes into an object's prototype chain implicitly). No `eval`, no `new Function`, no dynamic code construction anywhere in the module — verified by both a dedicated test and the G423-13 gate (source regex). `evaluate()` throws `ExpressionError` on any problem; `validate()` never throws, returning `{valid, errors}`.

**M14 — Formula Engine:** reads named formula definitions from the CRB-hydrated registry (see integration note below) and computes them by delegating **all** expression evaluation to an injected/owned `ExpressionEngine` instance — zero reimplementation of parsing/evaluation logic. Formula-to-formula dependencies (`payload.dependsOn`) are resolved depth-first with a per-call `inProgress` set that detects cycles immediately (`MAK-L3-FORMULA-004`) and a shared `resolved` cache that guarantees deterministic, single-computation-per-formula results. `computeBatch()` computes several formulas sharing that cache. `getDependencies()` returns the declared dependency list.

**Integration note (registry, no new type introduced):** the CRB `formula` bucket already mapped to the `handler` `RegistryType` before this slice (`crbConstants.CRB_REGISTRY_MAP: { formula: 'handler', ... }`, pre-existing, unmodified). `FormulaEngine` reads `registry.resolve('handler', code)` — no new `RegistryType` was added to the 12-type enum defined in `03-INTERFACES.md` (SSOT), and no SSOT file was touched.

**Deliberate scope decision — G302 vs. new sandboxed engine:** `08-DONE-CRITERIA.md`/`04-MODULE-CONTRACTS.md` (RT-C-13) call for M13/M14 to be built as an *adapter over the frozen Studio G302 Computation Engine* (D-RI-10). That would require importing from `src/studio/computation/` — but this slice's explicit governing instructions prohibit touching Studio in any way. Given that direct conflict, this slice implements new, self-contained, fully sandboxed Expression/Formula engines inside `src/runtime/` instead of coupling runtime v2 to Studio. This is recorded here as a conscious, documented deviation, not a silent contract violation — full G302 adapter integration remains a tracked debt item (see Débitos técnicos below and `QUALITY-SCALABILITY-NOTES.md`).

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IExpressionEngine` | ✅ `evaluate(expr, bindings): unknown`, `validate(expr): ValidationResult` — both synchronous, per `§6` rule 3 ("sync only for pure evaluation — Expression/Formula") |
| `03-INTERFACES.md` — `IFormulaEngine` | ✅ `compute(formula, fieldValues): unknown`, `getDependencies(formula): string[]` — synchronous |
| `04-MODULE-CONTRACTS.md` RT-C-13 (Expression/Formula → Render/Validation) | ⚠️ Partial — "read-only evaluation; no side effects" fully honored; the "G302 frozen engine reuse" clause is **not** honored in this slice (see deviation note above; Studio is out of bounds per this slice's instructions) |
| `08-DONE-CRITERIA.md` M13 | ✅ Evaluates `{field}`-style bindings correctly (via dotted-path identifiers); invalid expression returns/throws a typed validation error. "Uses G302 adapter" criterion not met — documented deviation. |
| `08-DONE-CRITERIA.md` M14 | ✅ Computes dependent field values; `getDependencies` reflects the declared dependency graph |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Reads only from the hydrated `IRegistry`; no Prisma/backend import in either module |
| Sandbox / no dynamic code execution | ✅ No `eval`, no `new Function`, no global/prototype/constructor escape — enforced by parser-level blocklist + tests + gates |

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c9` | ✅ 36/36 PASS (18 Expression + 18 Formula) |
| `npm run test:runtime` (full aggregate) | ✅ 191/191 PASS (155 baseline C.1–C.8 + 36 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-01` (regression) | ✅ PASS 4/4 |
| `gate:g423-02` (regression) | ✅ PASS 4/4 |
| `gate:g423-03` (regression) | ✅ PASS 5/5 |
| `gate:g423-04` (regression) | ✅ PASS 5/5 |
| `gate:g423-05` (regression) | ✅ PASS 5/5 |
| `gate:g423-06` (regression) | ✅ PASS 5/5 |
| `gate:g423-07` (regression) | ✅ PASS 5/5 |
| `gate:g423-08` (regression) | ✅ PASS 5/5 |
| `gate:g423-09` (regression) | ✅ PASS 8/8 |
| `gate:g423-10` (regression) | ✅ PASS 7/7 |
| `gate:g423-11` (regression) | ✅ PASS 8/8 |
| `gate:g423-12` (regression) | ✅ PASS 9/9 |
| `gate:g423-13` (new — M13 Expression) | ✅ PASS 9/9 |
| `gate:g423-14` (new — M14 Formula) | ✅ PASS 11/11 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma decisão formal (D-RI-XX) foi criada ou alterada.** A única divergência é a não-adoção do adapter G302 nesta implementação, documentada explicitamente acima como decorrência direta da restrição "não tocar Studio" imposta a este slice — não uma mudança de arquitetura, e sim um adiamento explícito e rastreado.

## D-RI-13

**Preservado.** Nem `core/expression/expressionEngine.js` nem `core/formula/formulaEngine.js` importam Prisma, `@prisma/client`, ou qualquer caminho de `backend/`. Verificado por teste automatizado em ambos e pelos gates G423-13/G423-14 (regex sobre o código-fonte).

## Próximo slice

**C.10 — M15 Validation Engine** (regras sync/async, estágio 1 do UP-09), per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

---

## Enterprise Quality Addendum

- **Escalabilidade:** PASS/NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. Custo de avaliação de expressão é O(tamanho da expressão); custo de fórmula é O(número de dependências), com teto explícito de 32 dependências por fórmula.
- **Segurança/sandbox:** PASS — sem `eval`/`new Function`; blocklist de identificadores (`__proto__`, `constructor`, `prototype`, `globalThis`, `process`, etc.) checada em tempo de parse; funções restritas a uma allowlist de 5 nomes.
- **Determinismo:** PASS — mesma entrada sempre produz mesma saída (testado explicitamente em ambos os engines); nenhum efeito colateral, nenhuma chamada externa.
- **Códigos de erro:** PASS — 5 códigos `MAK-L3-EXPRESSION-NNN` + 5 códigos `MAK-L3-FORMULA-NNN`, cada um com causa distinta e testada.
- **Contratos C.1–C.8 preservados:** PASS — regressão G423-01–12 100% verde; todos os novos parâmetros de wiring são opcionais com default, sem quebra de assinatura pública existente.
- **D-RI-13:** PASS — ver acima.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- **Débitos técnicos controlados:** adapter G302 (D-RI-10) não implementado nesta iteração (Studio fora de escopo neste slice); sintaxe de expressão limitada ao mínimo especificado (sem arrays/objetos literais, sem operador ternário, sem indexação `[]`); cache/memoização de fórmulas fica para slice futuro se o volume justificar.
- **Arquivo complementar:** `docs/evidence/foundation-c9/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.9 entrega M13 Expression Engine e M14 Formula Engine dentro do escopo: avaliação segura e determinística sem `eval`/`new Function`, bloqueio de acesso a prototype/constructor/globais, Formula Engine delegando 100% da avaliação ao Expression Engine (zero duplicação), detecção de ciclos entre fórmulas, integração real com M20, 36 novos testes, 2 novos gates, zero regressão em G423-01–12/20, zero mudança de SSOT, zero toque em UI de produção ou Studio, e nenhuma antecipação de C.10 (Validation Engine), Studio ou Marketplace. A não-adoção do adapter G302 (D-RI-10) é documentada como decisão explícita, não como omissão.
