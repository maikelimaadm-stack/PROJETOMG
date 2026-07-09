# Post-Foundation C — Certification Report

**Slice:** Post-Foundation C — Shadow Pilot Empresas
**Branch:** `claude/post-foundation-c-shadow-pilot-empresas`
**Base:** `main` @ `afd97471` (post Shadow Mode merge)
**Gates:** G423-SHADOW-EMPRESAS (PASS 13/13) · G423-SHADOW (PASS 13/13) · G423 master (PASS 7/7) · G423-01–24 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/shadow/pilots/empresasShadowPilot.js` | `EmpresasShadowPilot` — `isEnabled()`, `createLegacySnapshot()`, `createRuntimeV2Input()`, `run()`, `getDiagnostics()`, `clear()`, `createEmpresasShadowPilot()`, `EMPRESAS_DEFAULT_DESCRIPTOR` |
| `src/runtime/shadow/pilots/errors.js` | `EmpresasShadowPilotError` (`MAK-L3-SHADOW-PILOT-001`..`002`) |
| `src/runtime/types/shadow-pilot.js` | JSDoc types (`EmpresasModuleDescriptor`, `EmpresasStructuralSnapshot`, `EmpresasShadowPilotReport`, `EmpresasShadowPilotDiagnostics`) |
| `src/runtime/__tests__/shadow/empresas-shadow-pilot.test.js` | 19 tests — opt-in default-off, run/skipped, deterministic snapshots, controlled comparison, diagnostics safety, masking, prototype-pollution guard, failure capture, no-UI/no-side-effect/no-backend/no-Prisma, module-decoupling, Observability + RuntimeShadowMode integration |
| `scripts/gates/g423-shadow-pilot-empresas.mjs` | Gate G423-SHADOW-EMPRESAS |
| `docs/evidence/post-foundation-c-shadow-pilot-empresas/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/post-foundation-c-shadow-pilot-empresas/MODULE-DIAGRAMS.md` | Mermaid — pilot position and flow |
| `docs/evidence/post-foundation-c-shadow-pilot-empresas/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/index.js` | Exports `createEmpresasShadowPilot`, `EmpresasShadowPilot`, `EmpresasShadowPilotError`. |
| `package.json` | Added `test:runtime:shadow:empresas`, `gate:g423-shadow-empresas`; appended the pilot test to the aggregated `test:runtime`. |

**Decisão sobre `test:runtime`:** o teste do piloto FOI incluído no `test:runtime` agregado (mesmo padrão de todos os slices anteriores). É um teste de runtime local e determinístico que roda em `node --test`, não quebra o padrão. O gate próprio `gate:g423-shadow-empresas` permanece separado (não faz parte do master `gate:g423`, que valida apenas a superfície Foundation C M01–M24).

**Nenhum arquivo de UI de produção** (`src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`) foi tocado — confirmado por `git diff` e pelo gate. **Nenhum arquivo SSOT** foi tocado. **O runtime legado** (`src/modules/makBootstrap/runtimeBridge/`) foi apenas lido para descoberta — nenhuma alteração.

**Decisão de desacoplamento (importante):** o piloto NÃO importa `src/modules/empresas/*` nem `src/App.jsx`. Importar a UI do módulo dentro de `src/runtime/` inverteria a camada (runtime→módulo). Em vez disso, o piloto embarca um descritor estrutural canônico e passivo do módulo Empresas (`EMPRESAS_DEFAULT_DESCRIPTOR`, espelhando os campos conhecidos de `EMP_FORM_FIELD_DEFS`), e aceita `input` do chamador para sobrescrever — um futuro hook passivo de UI poderia entregar os field defs reais sem que o runtime dependa do módulo. Isso é verificado por teste e pelo gate ("no import of production Empresas UI module / App.jsx").

---

## O que foi implementado

`EmpresasShadowPilot` é a primeira integração real, passiva e opt-in entre um módulo de produção (Empresas / CadastroEmpresas) e o runtime v2, via `RuntimeShadowMode`. Ele constrói um snapshot estrutural do módulo como o runtime **legado** o representa e como o runtime **v2** o normalizaria, compara os dois de forma determinística, roda um shadow pass para readiness, e registra diagnósticos — sem nunca renderizar UI, tocar dados reais, executar salvar/editar/excluir, ou invocar action/workflow/connector.

- **`isEnabled()`** — expõe a flag opt-in (`options.enabled` explícito, ou env `MAK_RUNTIME_V2_SHADOW_EMPRESAS === 'true'`, senão desligado).
- **`createLegacySnapshot(input)`** — snapshot estrutural com tipos crus (visão legado); determinístico (campos ordenados por id, chaves sensíveis mascaradas).
- **`createRuntimeV2Input(input)`** — snapshot estrutural com tipos canonicalizados (`tel→phone`, `cpf_cnpj→document`, `text→string`) — o drift de normalização que o piloto existe para revelar.
- **`run(input)`** — desligado retorna `{ skipped: true }` sem efeito; ligado constrói ambos os snapshots, compara via `RuntimeShadowMode.compareWithLegacy`, roda `runShadowPass` para readiness, e **captura qualquer falha do shadow/interno em `{ ok: false, error }`** em vez de propagá-la para a tela.
- **`getDiagnostics()`** — cópia profunda independente; mutar o retorno nunca afeta o estado interno.
- **`clear()`** — reseta buffer e contadores.

**Modelo de falha de duas camadas:** input com poluição de protótipo/profundidade ou opção inválida **lançam** `EmpresasShadowPilotError` (`MAK-L3-SHADOW-PILOT-001`/`002`); falha da execução do shadow (ex.: `compareWithLegacy` lança) é **capturada e retornada** no relatório, nunca propagada para a UI.

**Segurança:** mascaramento de dados sensíveis (`password`/`token`/`secret`/`apiKey`/`authorization`/`cookie`/`credential`), guarda contra poluição de protótipo em todos os inputs, limites (`MAX_INPUT_DEPTH=8`, `MAX_DIAGNOSTICS=500`), cópias profundas seguras.

## Feature flag / opt-in

- **Default desligado.** `MAK_RUNTIME_V2_SHADOW_EMPRESAS` só ativa quando exatamente `'true'`; `options.enabled` explícito tem precedência.
- **Quando desligado:** `run()` retorna `{ skipped: true }` sem construir snapshot, sem comparar, sem gravar diagnóstico, sem tocar o runtime legado — efeito zero (testado e verificado pelo gate).
- **Quando ligado:** apenas diagnóstico estrutural passivo.

## Integração

- **RuntimeShadowMode:** `run()` usa `compareWithLegacy` (comparação estrutural mascarada) e `runShadowPass` (readiness). Uma falha do shadow mode é capturada, nunca propagada.
- **Observability Engine (M24):** injetável — o shadow pass grava `shadow.pass`/`shadow.pass.duration_ms`; o piloto grava `captureError()` em falha. A ausência/falha do Observability nunca quebra o piloto.
- **Runtime Completion:** injetável — usado para readiness sem executar comportamento real.
- **Sem execução real:** Action/Workflow/Connector nunca são invocados (só presença inspecionada). Testado com engines falsos (contador de side effects = 0).

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:shadow:empresas` | ✅ 19/19 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 457/457 PASS (438 baseline + 19 novos) |
| `npm run lint` | ✅ PASS, exit 0 |
| `npm run build` | ✅ PASS, exit 0 |

## Gates

| Gate | Result |
|---|---|
| `gate:g423-shadow-empresas` (new — Empresas pilot) | ✅ PASS 13/13 |
| `gate:g423-shadow` (regression) | ✅ PASS 13/13 |
| `gate:g423` (Foundation C master) | ✅ PASS 7/7 |
| `gate:g423-01`..`gate:g423-24` | ✅ all PASS |

---

## SSOT alterado

**Nenhum.**

## UI de produção alterada

**Nenhuma.** `src/App.jsx` intocado.

## Runtime legado preservado

**Sim.** `runtimeBridge/` apenas lido para descoberta; a tela Empresas continua servida exclusivamente pelo runtime legado.

## D-RI-13

**Preservado.** `src/runtime/shadow/pilots/empresasShadowPilot.js` não importa Prisma/backend/MMM. Verificado por teste, pelo gate G423-SHADOW-EMPRESAS, e pelo master gate G423 (varredura de todo `src/runtime/`).

## Próximo passo

**Piloto shadow em table/form ou módulo piloto controlado** — evoluir o piloto para receber, via um hook 100% passivo e feature-flagged, os field defs reais do form/table de Empresas em runtime (sem controlar o render), aprofundando o diagnóstico de paridade legado↔v2. Recomendação documentada, não autorização.

---

## Enterprise Quality Addendum

- **Segurança/fail-safe:** PASS — input inválido/poluição de protótipo/opção inválida lançam `EmpresasShadowPilotError`; falha do shadow sempre capturada como dado, nunca propagada para a UI.
- **Determinismo:** PASS — `createLegacySnapshot`/`createRuntimeV2Input` ordenam campos por id e produzem o mesmo resultado para a mesma entrada; clock injetável; diagnósticos são cópias profundas seguras.
- **Opt-in/off switch:** PASS — desligado por padrão; `run()` desligado é no-op com zero diagnósticos; `clear()` disponível.
- **Sem side effects:** PASS — nunca renderiza UI, nunca executa salvar/editar/excluir, nunca invoca action/workflow/connector.
- **Dados sensíveis mascarados:** PASS — mascarados em snapshots e diagnósticos.
- **Runtime legado preservado:** PASS — nenhuma alteração em `runtimeBridge/`; tela Empresas inalterada.
- **Foundation C preservada:** PASS — master gate G423 e G423-01–24 verdes; 438 testes baseline intactos.
- **D-RI-13:** PASS — ver acima.
- **Débitos técnicos controlados:** integração visual de table/form real, uso dos field defs vivos em runtime, e reconciliação semântica profunda (além de estrutural) ficam explicitamente fora deste slice — documentados como trabalho futuro.
- **Arquivo complementar:** `docs/evidence/post-foundation-c-shadow-pilot-empresas/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice entrega o piloto shadow do módulo Empresas: integração real, passiva, opt-in e desligável entre o módulo Empresas, o RuntimeShadowMode, Observability e Runtime Completion, com snapshot estrutural determinístico legado vs v2, comparação mascarada, isolamento de falhas, e zero alteração de UI de produção, `src/App.jsx`, runtime legado, SSOT ou backend. 19 novos testes, 1 novo gate, zero regressão.
