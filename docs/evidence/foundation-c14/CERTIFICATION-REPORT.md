# Foundation C.14 — Certification Report

**Slice:** C.14 — M19 Connector Engine
**Branch:** `claude/foundation-c14-connector-engine`
**Base:** `main` @ `5f42c574` (post PR #404, C.13)
**Gates:** G423-19 (PASS) · G423-01–18 + G423-20 regression (PASS)

---

## Arquivos criados

| File | Role |
|---|---|
| `src/runtime/core/connector/connectorEngine.js` | `ConnectorEngine` — `invoke()`, `load()`, `unload()`, `resolve()`, `getOperation()`, `registerOperation()`, `registerAdapter()`, `createConnectorEngine()` |
| `src/runtime/core/connector/errors.js` | `ConnectorError` (`MAK-L3-CONNECTOR-001`..`010`) |
| `src/runtime/types/connector.js` | JSDoc types (`IConnectorEngine`, `ConnectorManifest`, `IConnector`, `ConnectorOperation`, `ConnectorRequest`, `ConnectorResponse`) |
| `src/runtime/__tests__/connector/connector.test.js` | 28 tests — resolution, structural vs. business failures, operation/adapter model, permission delegation, limits, prototype-pollution guard, redaction, determinism, security, Service Locator |
| `scripts/gates/g423-19-connector.mjs` | Gate G423-19 |
| `docs/evidence/foundation-c14/CERTIFICATION-REPORT.md` | This report |
| `docs/evidence/foundation-c14/MODULE-DIAGRAMS.md` | Mermaid — M19 position and flow |
| `docs/evidence/foundation-c14/QUALITY-SCALABILITY-NOTES.md` | Quality/scalability/security addendum |

## Arquivos modificados

| File | Change |
|---|---|
| `src/runtime/core/bootstrap/loadRuntimeBundle.js` | Builds `ConnectorEngine` (wired to the registry + the already-resolved Permission Engine); returns it in the pipeline result. |
| `src/runtime/core/bootstrap/bootstrap.js` | `hydrateWithBundle()` registers `connectorEngine` into `instance._serviceLocator`. |
| `src/runtime/index.js` | Exports `createConnectorEngine`, `ConnectorEngine`, `ConnectorError`. |
| `package.json` | Added `gate:g423-19`, `test:runtime:c14`; extended aggregated `test:runtime`. |
| `scripts/gates/g423-17-state.mjs`, `scripts/gates/g423-18-plugin.mjs` | **Maintenance fix** (see below): narrowed obsolete "Connector Engine doesn't exist" scope-creep guards. |
| `src/runtime/__tests__/state/state.test.js`, `src/runtime/__tests__/plugin/plugin.test.js` | Same maintenance fix, mirrored in the corresponding unit tests. |

No file inside `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/platform-authoring/`, or `docs/runtime-implementation/` was touched. No file inside `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, or `src/studio/` was touched. The shared fixture (`empresas-crb.fixture.js`) was **not** modified — its existing `int-1`/`http_connector` entry (already present since C.3, `objectType: 'integration'`) was sufficient.

### Maintenance note (in-scope correction, fourth occurrence of this pattern — see C.8, C.12, C.13)

`gate:g423-17` and `gate:g423-18` (plus their corresponding unit tests) each had a check asserting `core/connector/` **does not exist** — a scope-creep guard valid only during C.12's/C.13's own authoring. Now that M19 legitimately exists (this slice), those assertions are obsolete. Fixed identically to precedent: narrowed to a permanently-valid condition — `stateEngine.js`/`pluginEngine.js` themselves never reference `ConnectorEngine` — instead of asserting the directory can never exist. No behavior change to `StateEngine` or `PluginEngine`.

---

## O que foi implementado

`ConnectorEngine` is a registry-driven, deterministic, fail-safe integration layer — it never performs a real network call inside `core/connector/`. A connector's declarative manifest (resolved from the CRB `connector` registry bucket, hydrated by M06, keyed by `objectId`, `objectType: 'integration'` — no new registry type introduced) declares `operations` (a list of names it's allowed to invoke), an optional `permission` code, and an optional `enabled` flag. Actual invocation for an operation is always a **host-registered adapter function** (`registerAdapter(connectorId, operation, adapter)`, mirroring M18's `registerHandler`) — the adapter is the only place a real transport (HTTP/DB/message queue) may execute, and it lives outside this module entirely.

**Two-tier failure model** (consistent with M10/M11/M16/M18): structural/config conditions — unknown connector (`MAK-L3-CONNECTOR-002`), invalid manifest/argument shape (`MAK-L3-CONNECTOR-003`), unknown operation (`MAK-L3-CONNECTOR-004`, meaning the host itself never declared this operation), and payload/manifest/result exceeding safety limits or containing a prototype-pollution key (`MAK-L3-CONNECTOR-009`) — **throw** a typed `ConnectorError`. Business/operational outcomes — disabled connector, operation known but not permitted for this specific connector, missing required dependency, denied permission, adapter failure — are **returned** as a `ConnectorResponse` (`{success, data?, error?}`), never thrown.

**Security beyond C.13's baseline** (per this slice's explicit instruction — no unbounded limits this time): `MAX_CONNECTORS` (128 loaded at once), `MAX_OPERATIONS_PER_CONNECTOR` (64), `MAX_PAYLOAD_KEYS`/`MAX_RESULT_KEYS` (200/500, recursive), `MAX_PAYLOAD_DEPTH` (8), plus a prototype-pollution guard (`__proto__`/`constructor`/`prototype` rejected as object keys anywhere in payload or result) and automatic redaction of sensitive-looking result keys (`password`, `token`, `secret`, `api[-_]?key`, `authorization`, `credential` → `'[REDACTED]'`) before the response ever reaches the caller.

Public API: `invoke(connectorId, request, ctx)` (SSOT-literal `IConnectorEngine.invoke`, the full pipeline: resolve → enabled check → operation-permitted check → permission delegation to M09 → host-registered adapter dispatch → result-shape guard → redaction), plus `load(manifest)`/`unload(connectorId)`/`resolve(connectorId)` (registry-driven) and `registerOperation(name)`/`getOperation(name)` (the "Host Adapter Registry" of known operation names).

## Contratos implementados

| SSOT contract | Conformance |
|---|---|
| `03-INTERFACES.md` — `IConnectorEngine` | ✅ `invoke(connectorId, request: ConnectorRequest, ctx): Promise<ConnectorResponse>` |
| `04-MODULE-CONTRACTS.md` RT-C-17 (Plugin → Connector) — "No eval; manifest-only (D-PA-23)" | ✅ preserved; manifests are pure data, zero code execution during `load()`/`resolve()` |
| `04-MODULE-CONTRACTS.md` RT-C-18 (Connector → External systems) — "HTTP first; DB/message stub" | ⚠️ deliberately deferred — see deviation below |
| D-RI-13 (no direct MMM/Prisma query) | ✅ Reads only from the hydrated `IRegistry`; no Prisma/backend import |
| D-PA-23 (no eval/remote script) | ✅ verified by test and gate (static regex + dynamic behavioral check) |

### Deviação documentada

`08-DONE-CRITERIA.md` M19 lists "HTTP connector invoke with retry stub" and "Circuit breaker opens after threshold" as done-criteria. This slice's own explicit instructions (rules invioláveis) prohibit exactly that: no real external calls, no `fetch()` inside `core/connector/`, no real connector system, with retry/circuit-breaker explicitly named as out-of-scope debt in the required `QUALITY-SCALABILITY-NOTES.md` template. Followed the session's explicit instruction (as in every prior deviation — D-RI-10 in C.9, the USM-catalog deviation in C.12): `ConnectorEngine` implements the resolution/authorization/dispatch pipeline and the Host Adapter Registry; the actual HTTP transport, retry policy, and circuit breaker are **host-adapter concerns**, never implemented inside this module. Documented explicitly, not silently skipped.

---

## Testes executados

| Command | Result |
|---|---|
| `npm run test:runtime:c14` | ✅ 28/28 PASS |
| `npm run test:runtime` (full aggregate) | ✅ 317/317 PASS (289 baseline C.1–C.13 + 28 novos) |
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
| `gate:g423-16` (regression) | ✅ PASS 14/14 |
| `gate:g423-17` (regression, fixed) | ✅ PASS 14/14 |
| `gate:g423-18` (regression, fixed) | ✅ PASS 15/15 |
| `gate:g423-19` (new — M19 Connector) | ✅ PASS 15/15 |
| `gate:g423-20` (regression) | ✅ PASS 6/6 |

---

## SSOT alterado

**Nenhum.**

## Decisões arquiteturais alteradas

**Nenhuma.** `IConnectorEngine` implementado conforme `03-INTERFACES.md` (contrato pré-existente). A decisão de não implementar transporte HTTP real/retry/circuit-breaker dentro do core runtime é uma escolha de escopo explicitamente instruída para este slice, documentada acima, não uma mudança de decisão arquitetural de SSOT.

## D-RI-13

**Preservado.** `core/connector/connectorEngine.js` não importa Prisma, `@prisma/client`, nem qualquer caminho de `backend/`. Verificado por teste automatizado e pelo gate G423-19 (regex sobre o código-fonte).

## Próximo slice

**C.15 — M21/M22 Cache + Event Bus**, per `docs/runtime-implementation/10-DELIVERY-PLANNING.md`.

---

## Enterprise Quality Addendum

- **Escalabilidade:** PASS/NOTES — ver `QUALITY-SCALABILITY-NOTES.md`. Resolução de connector O(1); resolução de operation O(1); tetos explícitos em todas as dimensões (número de connectors, operations por connector, chaves/profundidade de payload e resultado).
- **Segurança/fail-safe:** PASS — connector inexistente, manifest inválido, e operation desconhecida sempre lançam `ConnectorError`; connector desabilitado, operation não permitida, dependência ausente, e permissão negada sempre bloqueiam via resultado controlado.
- **Determinismo:** PASS — mesma entrada produz mesmo resultado quando o adapter é determinístico (testado explicitamente).
- **Segurança contra chamada externa arbitrária:** PASS — sem `eval`, sem `new Function`, sem `import()` dinâmico, sem `fetch()` direto em `core/connector/`; toda invocação passa por um adapter host-registrado; verificado por teste (regex + strip de comentários) e pelo gate (incluindo checagem comportamental dinâmica).
- **Segurança contra segredos em runtime/evidência:** PASS — chaves sensíveis (`password`/`token`/`secret`/`api_key`/`authorization`/`credential`) são mascaradas automaticamente no resultado antes de retornar ao chamador; nenhum segredo real aparece em fixtures/evidências deste slice.
- **Códigos de erro:** PASS — 10 códigos (`MAK-L3-CONNECTOR-001`..`010`).
- **Contratos C.1–C.13 preservados:** PASS — regressão G423-01–18 100% verde (incluindo as correções de manutenção documentadas nos gates 17/18, mesmo padrão já usado em C.8/C.12/C.13); fixture compartilhada não foi alterada.
- **D-RI-13:** PASS — ver acima.
- **Cache/Event Bus/Transaction fora do escopo:** PASS — nenhum diretório `core/cache/`, `core/event-bus/`, ou `core/transaction/` criado; nenhuma referência a essas engines no código-fonte; verificado por teste e pelo gate.
- **UI de produção intocada:** PASS — `git diff` confirma zero mudança em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- **Débitos técnicos controlados:** adapters reais externos (HTTP/DB/mensageria), autenticação/segredos reais de conectores, retry/circuit breaker, cache/event bus, transações, e marketplace/publicação de conectores ficam explicitamente fora deste slice — documentados como trabalho futuro, não como lacuna silenciosa.
- **Arquivo complementar:** `docs/evidence/foundation-c14/QUALITY-SCALABILITY-NOTES.md`.

## Status

**PASS.** Slice C.14 entrega M19 Connector Engine dentro do escopo: camada de integração registry-driven, determinística e fail-safe, modelo de falha de duas camadas consistente com o padrão já estabelecido em M10/M11/M16/M18, execução sempre delegada a um adapter host-registrado (zero chamada externa arbitrária, zero eval/new Function/import dinâmico/fetch direto), limites explícitos e testados contra manifest/payload/resultado exagerados, guarda contra poluição de protótipo, redação automática de dados sensíveis, integração real com o Permission Engine, 28 novos testes, 1 novo gate, zero regressão em G423-01–18/20 (com correções de manutenção documentadas nos próprios gates 17/18), zero mudança de SSOT, zero toque em UI de produção ou Studio, e nenhuma antecipação de C.15 (Cache/Event Bus) ou Transaction Engine.
