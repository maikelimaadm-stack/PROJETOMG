# HANDOFF — Foundation C (Runtime) · Para novo chat

**Gerado:** 2026-07-08  
**Repo:** `maikelimaadm-stack/PROJETOMG`  
**Branch base:** `main`  
**Último slice mergeado:** **C.4** (PR #391)

> Copie este arquivo inteiro para o ChatGPT (ou outro agente) no início de um novo chat.  
> Ele contém contexto, regras, estado atual e próximo passo.

---

## 1. O que é este projeto

**MAK Gestão ERP** — React/Vite frontend (`/workspace`) + Fastify backend opcional (`/workspace/backend`).

Estamos implementando **Foundation C — Runtime Bridge** (Program 4.05): o novo runtime em `src/runtime/`, substituindo gradualmente `src/framework/mak/runtime/` (transicional até Foundation E).

**SSOT de implementação (NÃO alterar sem autorização):**
- `docs/runtime-implementation/` — backlog, ordem, interfaces, contratos, gates
- `docs/platform-architecture/`, `docs/platform-behavior/`, `docs/platform-protocol/`, `docs/meta-model/`
- Governança: `docs/constitution/`, `docs/engineering/CURRENT-STATE.md`, `README_AI.md`

**Regra permanente (desde C.4):**
- Cada slice = **1 PR apenas**
- Cada módulo novo = diagrama Mermaid em `docs/evidence/foundation-cN/MODULE-DIAGRAMS.md`
- Nenhuma alteração arquitetural; nenhuma decisão modificada; SSOT intacto (exceto evidências)

---

## 2. Onde paramos

| Slice | Módulos | Status | PR |
|-------|---------|--------|-----|
| C.0 | Docs runtime-implementation | ✅ mergeado | #386 |
| C.0.2 | SSOT remediation + certificado global | ✅ mergeado | #387 |
| **C.1** | M02 Context + M01 Bootstrap RT-0 | ✅ mergeado | #388 |
| **C.2** | M04 Registry + M03 Session | ✅ mergeado | #389 |
| **C.3** | M05 Loader + M06 CRB Loader | ✅ mergeado | #390 |
| **C.4** | M07 Dependency Resolver + M08 Router | ✅ mergeado | #391 |
| **C.5** | M20 Service Locator + M09 Permission | ⏳ **PRÓXIMO** | — |

**Pipeline atual (funciona em testes):**
```
Bootstrap → Context → Session → Registry → CRB Loader → Universal Loader
  → Dependency Resolver → Runtime Router → Runtime Ready
```

**Ainda NÃO existe:** Render, Action, Workflow, Permission real, Event Bus, Cache distribuído, execução de telas.

---

## 3. Próximo passo — C.5

**Missão:** implementar exclusivamente slice **C.5**.

| Módulo | O quê |
|--------|-------|
| **M20** | Service Locator — wire todos serviços core; singleton/scoped; substituir stub RT-0 |
| **M09** | Permission Engine — matriz CRB; deny > allow > default deny; `can()`, `filterVisible`; ligar `router.canActivate()` |

**Gates obrigatórios:** `G423-20`, `G423-09` + regressão `G423-01`–`08`  
**Branch sugerida:** `cursor/foundation-c5-locator-permission-0b52`  
**Exit SSOT:** rotas não autorizadas bloqueadas em RT-5

**Referências:**
- `docs/runtime-implementation/10-DELIVERY-PLANNING.md` § C.5
- `docs/runtime-implementation/08-DONE-CRITERIA.md` M09, M20
- `docs/runtime-implementation/09-GATES.md`

---

## 4. Estrutura de código (`src/runtime/`)

```
src/runtime/
├── index.js                    # API pública
├── types/                      # context, crb, loader, registry, session, dependency, router, metrics
├── core/
│   ├── bootstrap/              # M01 — bootstrap, hydrate, loadRuntimeBundle
│   ├── context/                # M02 — RuntimeContext imutável
│   ├── session/                # M03 — WebSessionManager + mock L1
│   ├── registry/               # M04 — RegistryManager (12 tipos, freeze pós-hydrate)
│   ├── loader/                 # M05 — LoaderManager (cache in-memory)
│   ├── crb/                    # M06 — CRBLoader verify/hydrate mmm-crb-v1
│   ├── dependency/             # M07 — DAG, ciclos, ordem topológica
│   └── router/                 # M08 — RuntimeRouter, match URL, navigation table
├── infra/
│   ├── service-locator/        # M20 STUB (vazio) — implementar em C.5
│   └── observability/          # tracer stub + runtimeMetrics
└── __tests__/                  # testes por módulo + integration
```

**Orquestrador principal:** `src/runtime/core/bootstrap/loadRuntimeBundle.js`  
**Fixture CRB testes:** `src/runtime/__tests__/fixtures/empresas-crb.fixture.js`

---

## 5. Módulos implementados (resumo)

| ID | Nome | Arquivo-chave | Gate |
|----|------|---------------|------|
| M01 | Bootstrap (RT-0 + hydrate RT-3) | `core/bootstrap/bootstrap.js` | G423-01 |
| M02 | Context | `core/context/RuntimeContext.js` | G423-02 |
| M03 | Session | `core/session/webSession.js` | G423-03 |
| M04 | Registry | `core/registry/registryManager.js` | G423-04 |
| M05 | Loader | `core/loader/loaderManager.js` | G423-05 |
| M06 | CRB Loader | `core/crb/crbLoader.js` | G423-06 |
| M07 | Dependency Resolver | `core/dependency/dependencyResolver.js` | G423-07 |
| M08 | Router | `core/router/runtimeRouter.js` | G423-08 |
| M09 | Permission | — | G423-09 ⏳ |
| M20 | Service Locator | `infra/service-locator/serviceLocator.js` (stub) | G423-20 ⏳ |

---

## 6. Comandos essenciais

```bash
# Dev frontend (sem backend local)
cp .env.local.example .env.local   # se faltar
npm run dev                        # http://127.0.0.1:5173

# Runtime — todos os testes (66)
npm run test:runtime

# Gates C.1–C.4
npm run gate:g423-01   # Bootstrap
npm run gate:g423-02   # Context
npm run gate:g423-03   # Session
npm run gate:g423-04   # Registry
npm run gate:g423-05   # Loader
npm run gate:g423-06   # CRB Loader
npm run gate:g423-07   # Dependency
npm run gate:g423-08   # Router

# Lint
npm run lint
```

---

## 7. Débito técnico conhecido

| Item | Slice que resolve |
|------|-------------------|
| Service Locator vazio (stub) | **C.5** |
| `router.canActivate()` sempre `true` | **C.5** (M09) |
| Mock L1 auth in-memory (sem Redis/JWT real) | C.15+ |
| Loader cache só in-memory (sem M21) | C.15 |
| `hydrate()` full RT-0→RT-8 | C.17 |
| Render/Action/Workflow/Execution | C.6–C.11 |
| Backend mirror `backend/src/runtime/` | futuro |

---

## 8. Métricas Runtime (`runtimeMetrics.js`)

Campos atuais em `captureRuntimeMetrics()`:
- `bootstrapMs`, `crbLoadMs`, `hydrationMs`
- `dependencyResolveMs`, `dagBuildMs`, `routeRegisterMs` (C.4+)
- `registryObjectCount`, `routeCount`, `dependencyCount`, `graphMaxDepth`
- `validationsExecuted`, `memoryUsageMb`, `testCount`

Cada slice deve reportar métricas no `CERTIFICATION-REPORT.md`.

---

## 9. Processo de entrega (padrão obrigatório)

Para cada slice C.N:

1. Branch: `cursor/foundation-cN-<nome>-0b52`
2. Implementar **somente** o escopo do slice
3. Testes completos em `src/runtime/__tests__/`
4. Gates novos + regressão dos anteriores
5. `docs/evidence/foundation-cN/CERTIFICATION-REPORT.md`
6. `docs/evidence/foundation-cN/MODULE-DIAGRAMS.md` (Mermaid)
7. PR draft → CI verde → merge
8. **Nenhuma** alteração em SSOT (exceto evidências)

**Relatório obrigatório (tabela):**
Arquivos modificados · Linhas · Módulos · Gates · Testes · Contratos · Decisões alteradas (Nenhuma) · Débito · Métricas · Próximo slice

---

## 10. Roadmap restante (após C.5)

| Slice | Módulos | Entrega |
|-------|---------|---------|
| C.5 | M20, M09 | DI + Permission |
| C.6 | M10 | Action Engine |
| C.7 | M11 | Workflow |
| C.8 | M12 table | Primeira tela CRB |
| C.9 | M13, M14 | Expression + Formula |
| C.10 | M15 | Validation |
| C.11 | M16 | Execution pipeline |
| C.12–C.16 | vários | State, Plugin, Connector, Cache, Transaction |
| **C.17** | M01, M24, M12 form | **RT-8 completo + gate master G423** |

---

## 11. Evidências por slice

```
docs/evidence/foundation-c1/CERTIFICATION-REPORT.md
docs/evidence/foundation-c2/CERTIFICATION-REPORT.md
docs/evidence/foundation-c3/CERTIFICATION-REPORT.md
docs/evidence/foundation-c4/CERTIFICATION-REPORT.md
docs/evidence/foundation-c4/MODULE-DIAGRAMS.md
```

---

## 12. Instrução para o novo agente (copiar como system/user prompt)

```
Você está continuando Foundation C (Runtime) no repo PROJETOMG.

ESTADO: C.1–C.4 mergeados em main. Runtime chega até "Runtime Ready" (sem render).

PRÓXIMO: Foundation C.5 — M20 Service Locator + M09 Permission Engine.
Gates: G423-20, G423-09 + regressão G423-01..08.

REGRAS:
- 1 slice por PR
- Não alterar SSOT nem decisões arquiteturais
- Seguir docs/runtime-implementation/*
- Ler README_AI.md e AGENTS.md antes de codar
- Entregar CERTIFICATION-REPORT + MODULE-DIAGRAMS (Mermaid)
- Atualizar runtimeMetrics

Leia docs/evidence/FOUNDATION-C-HANDOFF.md (este arquivo) para contexto completo.
```

---

## 13. Histórico git relevante (main)

```
66e172cf Merge PR #391 — C.4 Dependency + Router
2860092d Merge PR #390 — C.3 Loader + CRB
e630d9f9 Merge PR #389 — C.2 Session + Registry
608fce84 Merge PR #388 — C.1 Context + Bootstrap
ddac7627 C.0.2 SSOT remediation
5328df98 C.0 Runtime implementation plan
```

---

*Fim do handoff — Foundation C · Runtime Bridge*
