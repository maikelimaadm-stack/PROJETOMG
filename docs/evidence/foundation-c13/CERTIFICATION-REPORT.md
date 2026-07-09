# Foundation C.13 — Certification Report

**Slice:** C.13 — M18 Plugin Engine
**Branch:** `claude/foundation-c13-plugin-engine`
**Base:** `main` @ `1f1a9c2c` (post PR #403, C.12)
**Gates:** G423-18 (PASS) · G423-01–17 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/plugin/pluginEngine.js` | `PluginEngine` — `load()`, `unload()`, `resolve()`, `getExtensionPoint()`, `registerExtensionPoint()`, `registerHandler()`, `execute()`, `createPluginEngine()` |
| `src/runtime/core/plugin/errors.js` | `PluginError` (`MAK-L3-PLUGIN-001`..`009`) |
| `src/runtime/types/plugin.js` | JSDoc types (`IPluginEngine`, `PluginManifest`, `IPlugin`, `ExtensionPoint`, `PluginResult`) |
| `src/runtime/__tests__/plugin/plugin.test.js` | 24 tests — resolution, structural vs. business failures, capability/extension-point model, permission delegation, determinism, security, Service Locator |
| `scripts/gates/g423-18-plugin.mjs` | Gate G423-18 |
| `docs/evidence/foundation-c13/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c13/MODULE-DIAGRAMS.md` | Mermaid — M18 position and flow |
| `docs/evidence/foundation-c13/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds `PluginEngine` (wired to the registry + the already-resolved Permission Engine); returns it in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `pluginEngine` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createPluginEngine`, `PluginEngine`, `PluginError`. |
| `package.json` | Added `gate:g423-18`, `test:runtime:c13`; extended aggregated `test:runtime`. |
| `scripts/gates/g423-16-execution.mjs`, `scripts/gates/g423-17-state.mjs` | **Maintenance fix** (see below): narrowed obsolete "Plugin Engine doesn't exist" scope-creep guards. |
| `src/runtime/__tests__/execution/execution.test.js`, `src/runtime/__tests__/state/state.test.js` | Same maintenance fix, mirrored in the corresponding unit tests. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, or `src/studio/` was touched. The shared fixture (`empresas-crb.fixture.js`) was **not** modified — its existing `plugin-1`/`empresas_plugin` entry (already present since C.3) was sufficient for the integration test.

### Maintenance note (in-scope correction, third occurrence of this pattern — see C.8 and C.12)

`gate:g423-16` and `gate:g423-17` (plus their corresponding unit tests) each had a check asserting `core/plugin/` **does not exist** — a scope-creep guard valid only during C.11's/C.12's own authoring (to prove Execution/State Engine weren't anticipating M18). Now that M18 legitimately exists (this slice), those assertions are obsolete. Fixed identically to the C.8/C.12 precedent: narrowed to a permanently-valid condition — `executionEngine.js`/`stateEngine.js` themselves never reference `PluginEngine` — instead of asserting the directory can never exist. The `core/connector/` directory-absence checks in `gate:g423-17` were left untouched (Connector Engine, M19/C.14, still doesn't exist). No behavior change to `ExecutionEngine` or `StateEngine`.

---

## O que foi implementado

`PluginEngine` is a registry-driven, deterministic extension layer — it never executes arbitrary external code. A plugin's declarative manifest (resolved from the CRB `plugin` registry bucket, hydrated by M06 and keyed by `objectId` — no new registry type introduced) declares `capabilities` (a list of extension-point names it's allowed to use), an optional `permission` code, and an optional `enabled` flag. The actual behavior for a capability is always a **host-registered function** (`registerHandler(pluginId, capability, handler)`, mirroring M10's `ActionEngine.bind()`) — never loaded from the manifest, never `eval`'d, never dynamically imported.

**Two-tier failure model** (consistent with M10/M11/M16): structural/config conditions — unknown plugin (`MAK-L3-PLUGIN-002`), invalid manifest shape (`MAK-L3-PLUGIN-003`), unknown capability/extension point (`MAK-L3-PLUGIN-004`, meaning the host itself never declared this extension point) — **throw** a typed `PluginError`. Business/operational outcomes — disabled plugin, capability known but not permitted for this specific plugin, missing required engine dependency, permission denied, handler failure — are **returned** as a `PluginResult` (`{success, data?, error?}`), never thrown.

Public API: `load(manifest)` (SSOT-literal `IPluginEngine.load`, accepts an already-resolved manifest directly), `unload(pluginId)`, `getExtensionPoint(name)` / `registerExtensionPoint(name, metadata)`, plus the registry-driven ergonomic `resolve(pluginId)` (loads the manifest from the CRB `plugin` registry and delegates to `load()`) and `execute(pluginId, capability, payload, ctx)` (the full pipeline: resolve → enabled check → capability-permitted check → permission delegation to M09 → host-registered handler dispatch).

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IPluginEngine` | ✅ `load(manifest): Promise<IPlugin>`, `unload(pluginId): Promise<void>`, `getExtensionPoint(name): ExtensionPoint` |
| `08-DONE-CRITERIA.md` M18 — "Loads manifest without eval" | ✅ no `eval`/`new Function`/dynamic `import()` anywhere in `core/plugin/` (verified by test and gate, including a dynamic-behavioral check) |
| `08-DONE-CRITERIA.md` M18 — "Extension point registration works" | ✅ `registerExtensionPoint`/`getExtensionPoint`, tested explicitly (register, resolve, unknown-name throw) |
| `08-DONE-CRITERIA.md` M18 — "Invalid manifest rejected" | ✅ malformed manifest (empty `pluginId`, non-array `capabilities`, non-object) always throws `MAK-L3-PLUGIN-003` |
| `04-MODULE-CONTRACTS.md` RT-C-17 (Plugin → Connector) — "No eval; manifest-only (D-PA-23)" | ✅ preserved; Connector Engine (M19) not created in this slice |
| `06-BOOTSTRAP-SEQUENCE.md` step 3.4 — "M18 load plugin manifests (no eval)" | ✅ `resolve()`/`load()` are pure registry/data reads, zero code execution during load |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Reads only from the hydrated `IRegistry`; no Prisma/backend import |
| D-PA-23 (no eval/remote script for Plugin Engine, `04-MODULE-CONTRACTS.md` §6 Forbidden contracts) | ✅ verified by test and gate (static regex + a dynamic behavioral check that an unknown capability never silently executes) |

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c13` | ✅ 24/24 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 289/289 PASS (265 baseline C.1–C.12 + 24 novos) |
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
| `gate:g423-13` (regression) | ✅ PASS 9/9 |
| `gate:g423-14` (regression) | ✅ PASS 11/11 |
| `gate:g423-15` (regression) | ✅ PASS 11/11 |
| `gate:g423-16` (regression, fixed) | ✅ PASS 14/14 |
| `gate:g423-17` (regression, fixed) | ✅ PASS 14/14 |
| `gate:g423-18` (new — M18 Plugin) | ✅ PASS 15/15 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `IPluginEngine` implementado conforme `03-INTERFACES.md` (contrato pré-existente). O modelo capability/extension-point é uma decisão de implementação para satisfazer o contrato existente, não uma nova decisão arquitetural de SSOT.

## D-RI-13

**Preservado.** `core/plugin/pluginEngine.js` não importa Prisma, `@prisma/client`, nem qualquer caminho de `backend/`. Verificado por teste automatizado e pelo gate G423-18 (regex sobre o código-fonte).

## Próximo slice

**C.14 — M19 Connector Engine**, per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

---

## Enterprise Quality Addendum

- **Escalabilidade:** PASS/NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. Resolução de plugin O(1) (lookup direto no registry); resolução de capability O(1) (lookup em `Map`); custo por execução dominado pelo handler já registrado pelo host, não pelo Plugin Engine.
- **Segurança/fail-safe:** PASS — plugin inexistente, manifest inválido, e capability desconhecida sempre lançam `PluginError`; plugin desabilitado, capability não permitida, dependência ausente, e permissão negada sempre bloqueiam via resultado controlado, nunca silenciosamente.
- **Determinismo:** PASS — mesma entrada produz mesmo resultado (testado explicitamente); engine não cria side effects próprios além dos que o handler host-registrado decidir fazer.
- **Segurança contra código arbitrário:** PASS — sem `eval`, sem `new Function`, sem `import()` dinâmico de código de plugin, sem instalação de dependência, sem carregamento de pacote externo; verificado por teste (regex + strip de comentários JSDoc) e pelo gate (incluindo checagem dinâmica comportamental).
- **Códigos de erro:** PASS — 9 códigos (`MAK-L3-PLUGIN-001`..`009`), cobrindo desde erro de wiring até falha de handler.
- **Contratos C.1–C.12 preservados:** PASS — regressão G423-01–17 100% verde (incluindo as correções de manutenção documentadas nos gates 16/17, mesmo padrão já usado em C.8/C.12); fixture compartilhada não foi alterada.
- **D-RI-13:** PASS — ver acima.
- **Connector/Cache/Event Bus/Transaction fora do escopo:** PASS — nenhum diretório `core/connector/`, `core/cache/`, `core/event-bus/`, ou `core/transaction/` criado; nenhuma referência a essas engines no código-fonte; verificado por teste e pelo gate.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- **Débitos técnicos controlados:** carregamento real de plugins externos (pacotes de terceiros), marketplace/publicação de plugins, Plugin UI, e versionamento avançado de compatibilidade ficam explicitamente fora deste slice — documentados como trabalho futuro, não como lacuna silenciosa.
- **Arquivo complementar:** `docs/evidence/foundation-c13/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.13 entrega M18 Plugin Engine dentro do escopo: camada de extensão registry-driven e determinística, modelo de falha de duas camadas (estrutural=lança, negócio=retorna) consistente com o padrão já estabelecido em M10/M11/M16, delegação real ao Permission Engine, execução sempre via handler host-registrado (zero código externo arbitrário, zero eval/new Function/import dinâmico), 24 novos testes, 1 novo gate, zero regressão em G423-01–17/20 (com correções de manutenção documentadas nos próprios gates 16/17, no mesmo padrão já usado em C.8/C.12), zero mudança de SSOT, zero toque em UI de produção ou Studio, e nenhuma antecipação de C.14 (Connector Engine), Cache, Event Bus, ou Transaction Engine.
