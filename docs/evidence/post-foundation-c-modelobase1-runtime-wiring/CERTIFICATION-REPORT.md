# Post-Foundation C — Certification Report — ModeloBase1 Runtime Wiring

**Slice:** Post-Foundation C — ModeloBase1 Runtime Wiring
**Branch:** `claude/post-foundation-c-modelobase1-runtime-wiring`
**Áreas:** ModeloBase1 · Cadastro de Empresa · Campos Personalizados · runtime v2 beta

## Nota sobre a observação "17/18 vs 25/25" do slice anterior

No gate do Direct Beta, `17` e `18` eram **números de seção de comentário** no código do gate (§17 = escopo autorizado, §18 = paths proibidos), enquanto `25/25` era a **contagem total de chamadas `gate()`** (a §1 sozinha expande em 11 checks de existência). Não havia inconsistência real — apenas subcontagem textual. Este slice numera as seções de forma alinhada ao total para evitar ambiguidade.

## Objetivo

Fazer o **engine do ModeloBase1 consumir `config.runtimeReadModel`** (o read model runtime v2 do Direct Beta) de forma segura, aditiva e reversível: detectar → validar → resolver → aplicar, com fallback total para o comportamento legado.

## Arquivos criados

| File | Papel |
|---|---|
| `src/ModeloBase1/runtime-read-model/errors.js` | Erro tipado + códigos MAK-MB1-RW-001..008 |
| `src/ModeloBase1/runtime-read-model/safety.js` | Helpers puros locais (isPlainObject, findUnsafeContent, hasUnmaskedSensitive, hasForbiddenReference, safeClone) — mantém ModeloBase1 desacoplado do runtime |
| `src/ModeloBase1/runtime-read-model/types.js` | Typedefs |
| `src/ModeloBase1/runtime-read-model/resolveModeloBase1RuntimeReadModel.js` | Detecta o read model no config (present/enabled/readModel) |
| `src/ModeloBase1/runtime-read-model/validateModeloBase1RuntimeReadModel.js` | Valida o descritor (contrato read-only/write-blocked) + valida o payload resolvido (pureza/máscara) |
| `src/ModeloBase1/runtime-read-model/applyModeloBase1RuntimeReadModel.js` | Orquestra detect→validate→resolve→apply, ou fallback seguro |
| `src/ModeloBase1/runtime-read-model/createModeloBase1RuntimeReadDiagnostics.js` | Diagnostics passivos (shapes/flags, sem dados sensíveis) |
| `src/ModeloBase1/runtime-read-model/modeloBase1RuntimeReadFallback.js` | Estado de fallback canônico + `isModeloBase1RuntimeReadFallback` |
| `src/ModeloBase1/runtime-read-model/useModeloBase1RuntimeReadModel.js` | Hook React que aplica com fallback (off = síncrono, sem async) |
| `src/runtime/__tests__/modelobase1-runtime-wiring.test.js` | 29 casos node --test (cobrindo os 36 cenários da spec) |
| `scripts/gates/g423-modelobase1-runtime-wiring.mjs` | Gate do slice (23 checks) |
| `docs/evidence/post-foundation-c-modelobase1-runtime-wiring/*` | 7 evidências |

## Arquivos modificados

| File | Alteração |
|---|---|
| `src/ModeloBase1/render/ModeloBase1CadastroPage.jsx` | Consome o read model via hook; bloqueia writes (`handleNew`/`handleDuplicate`/`handleRequestDelete`/`guardedHandleSubmit`) quando beta aplicado; banner read-only beta |
| `package.json` | Scripts `test:runtime:modelobase1-runtime-wiring` + `gate:g423-modelobase1-runtime-wiring` + append no `test:runtime` |

## Runtime Wiring

- **runtimeReadModel consumido:** sim — o engine detecta/valida/resolve/aplica `config.runtimeReadModel`.
- **flag off:** fallback byte-idêntico (sem write block, sem beta, sem async).
- **flag on:** aplica table/form/diagnostics do runtime v2 (read-only) e **bloqueia todas as escritas**.
- **fallback:** ausente / disabled / inválido / resolve falha / payload inseguro / writeGuard ausente → mantém a tela legada.
- **write real:** bloqueado (write guard do model + guard no page).
- **backend alterado:** Não. **Prisma alterado:** Não. **runtimeBridge alterado:** Não. **outras telas alteradas:** Não.

## Testes

| Item | Resultado |
|---|---|
| `test:runtime:modelobase1-runtime-wiring` | ✅ 29/29 |
| `test:runtime` | ✅ 1155/1155 |

## Gates

| Gate | Resultado |
|---|---|
| `gate:g423-modelobase1-runtime-wiring` (novo) | ✅ 23/23 |
| `gate:g423-modelobase1-direct-beta` | ✅ 25/25 |
| `gate:g423-empresas-readonly` | ✅ 19/19 |
| `gate:g423` (master) | ✅ 7/7 |
| `gate:modelo-base1` / `gate:paridade-empresas` / `gate:generator` | ✅ exit 0 |
| `gate:modelobase1-consolidation-v151` / `-visual-cert-v152` | ✅ 10/10 · 11/11 |

> `gate:paridade-visual` falha neste sandbox com `spawnSync /bin/sh ENOENT` (o ambiente não provê `/bin/sh` para `execSync`). Verificado: falha **idêntica em `origin/main` limpo** — é pré-existente e ambiental, não é regressão deste slice, e está fora do escopo autorizado (`scripts/gate-paridade-visual-promocao.mjs`).

## Lint / Build

- `lint`: ✅ exit 0
- `build`: ✅ exit 0

## Status

**PASS.**
