# HANDOFF DE CONTINUIDADE — MAK Gestão ERP (PROJETOMG)

> **Para que serve este arquivo:** memória portável da sessão de desenvolvimento.
> **Cole este arquivo INTEIRO** como primeira mensagem em qualquer assistente novo
> (ChatGPT, Claude, Claude Code, Cursor) para continuar o trabalho do ponto exato
> em que paramos, **sem depender de memória de chat**.
>
> **Regra de ouro do projeto:** a memória é o repositório (git + `docs/`), nunca o chat.
> Se algo aqui conflitar com o código/SSOT do repo, **o repositório vence** — reconfirme lendo os arquivos.

**Gerado em:** 2026-07-09
**Repo:** `maikelimaadm-stack/PROJETOMG`
**Versão:** `0.4.0-rc.2`
**Branch de trabalho desta sessão:** `claude/mak-erp-onboarding-900y7e`
**Branch `main` HEAD (na geração):** `50eec03` (Merge PR #394 — claude-code-guide)

---

## 0. PROMPT INICIAL (cole isto primeiro, depois cole o restante)

```
Você assume o projeto MAK Gestão ERP (maikelimaadm-stack/PROJETOMG).
FERRAMENTA: pode ser ChatGPT, Claude, Claude Code ou Cursor.

NÃO dependa de memória de chats anteriores. A única fonte de verdade é o repositório.

LEITURA OBRIGATÓRIA antes de qualquer código:
1. CLAUDE.md (raiz)
2. docs/ai/CLAUDE-CODE-GUIDE.md
3. docs/evidence/PROJECT-COMPLETE-HANDOFF.md
4. README_AI.md
5. AGENTS.md
6. docs/ai/skills/foundation-c-runtime.md (skill do slice atual)

ESTADO ATUAL:
- Programa: Foundation C — Runtime Bridge (src/runtime/)
- Slices C.1–C.4 mergeados; 66 testes runtime PASS; gates G423-01..08 PASS
- Próximo: C.5 — M20 Service Locator + M09 Permission Engine
- UI de produção usa runtime LEGADO (makBootstrap/runtimeBridge); o runtime NOVO
  (src/runtime/) chega até "Runtime Ready", sem render.

REGRAS INVIOLÁVEIS:
- 1 slice = 1 PR (não antecipar C.6+)
- Não alterar SSOT em docs/runtime-implementation/ (nem os outros 5 blocos)
- Fail-closed nas permissões; runtime nunca faz query MMM/Prisma direto (D-RI-13)
- Seguir padrão dos slices C.1–C.4 (errors MAK-L3-RUNTIME-*, node --test, gates g423-NN)
- Memória = git + docs/, nunca chat

Confirme que leu e diga qual slice vai implementar antes de codar.
```

---

## 1. ONDE ESTAMOS (snapshot)

| Dimensão | Estado |
|----------|--------|
| Produto | MAK Gestão — ERP metadata-driven, multi-tenant, evoluindo para EOS |
| Versão | `0.4.0-rc.2` |
| Programa ativo | **Foundation C — Runtime Bridge** (Program 4.05) |
| Último código mergeado (runtime) | **C.4** — Dependency Resolver + Router (PR #391) |
| **Próximo passo código** | **C.5** — M20 Service Locator + M09 Permission Engine |
| Testes runtime | **66/66 PASS** (`npm run test:runtime`) |
| Gates runtime | **G423-01 … G423-08 PASS** |
| Módulos ERP certificados | `empresas`, `cadcps` |
| Superfície primária UI | BOS home `/` |
| Foundation congelada | Enterprise V10.2.0 + Studio D-052 + MDP D-025/026 |

### Aviso de inconsistência doc vs código (importante)
Vários docs "clássicos" (`README_AI.md`, `docs/engineering/PROJECT-STATUS.md`) ainda dizem
**"C.1 next"** — estão **desatualizados**. A verdade operacional para Foundation C é:
`docs/evidence/PROJECT-COMPLETE-HANDOFF.md` + o código em `src/runtime/` + evidências
`docs/evidence/foundation-c*`. Estamos entrando em **C.5**.

---

## 2. STACK E ARQUITETURA (essencial)

- **Frontend:** React 18 + Vite 6 + TanStack Query + Tailwind/shadcn
- **Backend:** Fastify 5 + Prisma 6 + PostgreSQL (porta 3001)
- **Cadastro runtime (produção):** ModeloBase1 (motor UI) + `framework/mak` (frozen V10.2.0) + engines V13–V20
- **Runtime NOVO (Foundation C):** `src/runtime/` — Universal Runtime v2 consumindo CRB

### Duas runtimes coexistem HOJE
| Runtime | Path | Usado por |
|---------|------|-----------|
| v1 legado | `framework/mak/runtime/` + `src/modules/makBootstrap/runtimeBridge/` | UI de produção |
| v2 novo | `src/runtime/` | Testes + pipeline Foundation C (sem render ainda) |

Eliminação do v1 → **Foundation E** (só depois de G423 PASS).

### Pipeline runtime v2 (implementado até C.4)
```
Bootstrap → Context → Session(mock L1) → Registry → Loader
  → CRB (verify + hydrate V13–V20) → DependencyResolver (DAG) → Router → Runtime Ready
```
Orquestrador: `src/runtime/core/bootstrap/loadRuntimeBundle.js`

### Estágios RT-0 → RT-8
| RT | Nome | Status | Módulo |
|----|------|--------|--------|
| RT-0 | Bootstrap shell | ✅ | M01 |
| RT-1 | Load Pin | ✅ parcial | M03, M05 |
| RT-2 | Verify CRB | ✅ | M05, M06 |
| RT-3 | Hydrate | ✅ | M06, M04, M07, M08 |
| RT-4 | Session bind | ⏳ parcial | M03 |
| RT-5 | **Authorize** | ⏳ **é o C.5** | **M09** |
| RT-6 | Route match | ✅ sem guard | M08 |
| RT-7 | Render | ❌ C.8+ | M12 |
| RT-8 | Execute | ❌ C.11+ | M16 |

---

## 3. O QUE VAMOS FAZER AGORA — SLICE C.5 (DI + Permission)

**Missão:** implementar EXCLUSIVAMENTE o C.5. Não antecipar C.6+.

### M20 — Service Locator
- Container de DI (lifetimes singleton vs scoped)
- "Fiar" (wire) todos os serviços core M01–M08
- Substituir o **stub** em `src/runtime/infra/service-locator/`
- Done criteria (`08-DONE-CRITERIA.md`): singleton/scoped corretos; todos serviços resolvíveis pós-RT-3
- Gate: **G423-20** (`npm run gate:g423-20`) — *script ainda precisa ser criado*

### M09 — Permission Engine
- Matriz vinda do CRB: **deny > allow > default deny** (fail-closed)
- API: `can(action, resource, context)` e `filterVisible(...)` (esconde UI negada)
- Ligar o **`router.canActivate()` real** — hoje é stub que retorna sempre `true`
- (BE) middleware bloqueia antes do handler — conforme done criteria
- Done criteria: matriz deny>allow>default deny; `filterVisible`; BE middleware
- Gate: **G423-09** (`npm run gate:g423-09`) — *script ainda precisa ser criado*

### Critério de saída (Exit C.5)
- [ ] RT-5 bloqueia rota não autorizada (unauthorized route blocked)
- [ ] Regressão **G423-01..08** PASS
- [ ] **66+ testes** runtime PASS
- [ ] `docs/evidence/foundation-c5/CERTIFICATION-REPORT.md`
- [ ] `docs/evidence/foundation-c5/MODULE-DIAGRAMS.md` (Mermaid de M09 e M20)

### ⚠️ Pendências de tooling detectadas (criar no C.5)
No `package.json` atual existem apenas `gate:g423-01` … `gate:g423-08`.
**Não existem ainda** `gate:g423-09`, `gate:g423-20`, nem o master `gate:g423`,
nem os testes `test:runtime:c5`. Precisam ser adicionados neste slice:
- `scripts/gates/g423-09-permission.mjs` + script npm `gate:g423-09`
- `scripts/gates/g423-20-service-locator.mjs` + script npm `gate:g423-20`
- `src/runtime/__tests__/permission/…` e `…/service-locator/…` + entrada em `test:runtime`

---

## 4. PADRÃO DE CÓDIGO (copiar dos slices C.1–C.4)

```
src/runtime/core/<module>/
  <Module>Manager.js  (ou <module>.js)     # implementação
  errors.js                                 # códigos MAK-L3-RUNTIME-NNN
src/runtime/types/<module>.js               # tipos/contratos (JSDoc)
src/runtime/__tests__/<module>/<module>.test.js   # node --test
scripts/gates/g423-NN-<nome>.mjs            # gate do módulo
```

- Erros tipados no formato **`MAK-L3-RUNTIME-NNN`** (ver `core/crb/errors.js`, etc.)
- Testes com **`node --test`** (não vitest/jest) — ver `package.json` scripts `test:runtime*`
- Factory functions exportadas de `src/runtime/index.js` (ex.: `createRegistry`, `createRuntimeRouter`)
- **Fail-closed** nas permissões
- **Runtime nunca importa Prisma/consulta MMM DB** — só CRB via loader (D-RI-13)

### API pública atual (`src/runtime/index.js`)
`bootstrap`, `hydrate`, `hydrateWithBundle`, `destroy`, `loadRuntimeBundle`,
`createContext`, `createEmptyAccessScope`, `RuntimeContext`, `createRegistry`,
`REGISTRY_TYPES`, `createSessionManager`, `WebSessionManager`, `createMockL1Auth`,
`createLoader`, `createCrbLoader`, `createDependencyResolver`, `createRuntimeRouter`,
`captureRuntimeMetrics` (+ classes de erro por módulo).

### Fixture de teste
`src/runtime/__tests__/fixtures/empresas-crb.fixture.js`

---

## 5. REGRAS INVIOLÁVEIS (governança)

1. **1 slice = 1 PR** — não antecipar slices futuros dentro de C.5.
2. **Não alterar SSOT** — os 6 blocos são read-only:
   `docs/meta-model/`, `docs/platform-architecture/`, `docs/platform-behavior/`,
   `docs/platform-protocol/`, `docs/platform-authoring/`, `docs/runtime-implementation/`.
   **Só pode escrever** em `docs/evidence/foundation-cN/`.
3. **Sem decisão arquitetural nova**; sem engines paralelos.
4. **Fail-closed** nas permissões (deny > allow > default deny).
5. **Runtime não consulta MMM/Prisma direto** (D-RI-13) — CRB via loader.
6. **Memória = git + docs**, nunca chat.
7. Por slice: testes + gates (novo + regressão) + `CERTIFICATION-REPORT.md` + `MODULE-DIAGRAMS.md`.
8. Hierarquia em conflito: Constitution > README_AI > Master Architecture > DECISIONS > PROJECT-STATUS > ROADMAP > CURRENT-STATE > chat (nunca autoritativo).

### Decisões-chave (D-RI)
- D-RI-02: novo runtime em `src/runtime/`
- D-RI-09: slices C.1–C.24 (não Program IDs)
- D-RI-11: table+form primeiro; 9 view modes depois
- D-RI-13: runtime nunca query MMM DB direto
- D-RI-16: Global Architecture Certificate — código Foundation C autorizado

---

## 6. COMANDOS ESSENCIAIS

```bash
# Dev frontend (proxy p/ API Railway; auto-login maike/maike/123)
cp .env.local.example .env.local
npm install
npm run dev                 # http://127.0.0.1:5173

# Runtime (Foundation C)
npm run test:runtime        # 66 testes
npm run test:runtime:c4     # subset do último slice
npm run gate:g423-01        # … até gate:g423-08 (regressão)

# Qualidade / antes de PR
npm run lint
npm run build
npm run verify:governance   # build + lint + gates de governança/capabilities
npm run verify:ci           # mirror completo de CI

# Backend (stack local — requer backend/.env)
cd backend && npm run prisma:generate && npm run seed && npm run dev   # :3001
```

> Nota: `verify:governance`/`verify:ci` **não** incluem os gates `g423-*`; rode os gates
> do runtime separadamente ao trabalhar em `src/runtime/`.

---

## 7. PROCESSO DE ENTREGA (slice/PR)

1. Branch de trabalho: `claude/mak-erp-onboarding-900y7e`
   *(convenção histórica do repo é `cursor/foundation-c5-locator-permission-0b52`;
   nesta sessão estamos na branch `claude/...` acima).*
2. Baseline verde antes de codar: `npm run test:runtime` + `gate:g423-01..08`.
3. Implementar **somente** o escopo do slice (M20 + M09).
4. Testes + gates novos (G423-09, G423-20) + regressão (01–08) PASS.
5. Evidências: `docs/evidence/foundation-c5/CERTIFICATION-REPORT.md` + `MODULE-DIAGRAMS.md`.
6. `npm run lint` · commit · push · PR (draft) → CI verde.
7. Zero alteração de SSOT.

### Estrutura da CERTIFICATION-REPORT (seguir C.4)
Tabela obrigatória: arquivos modificados · linhas ~ · módulos · gates · testes ·
cobertura de contratos · decisões alteradas (Nenhuma) · débito criado · próximo slice ·
métricas de qualidade · conformidade SSOT.

---

## 8. MAPA RÁPIDO DE ARQUIVOS

### Onboarding / governança
- `CLAUDE.md`, `docs/ai/CLAUDE-CODE-GUIDE.md`, `docs/ai/skills/*.md`
- `README_AI.md`, `AGENTS.md`, `docs/constitution/00-MAK-CONSTITUTION.md`
- `docs/engineering/{PROJECT-STATUS,AI-STARTUP-GUIDE,CONTINUITY-PROTOCOL}.md`
- `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` (o handoff "mega", ~2000 linhas)

### SSOT runtime (LER, NÃO EDITAR)
- `docs/runtime-implementation/{README,10-DELIVERY-PLANNING,08-DONE-CRITERIA,03-INTERFACES,06-BOOTSTRAP-SEQUENCE,09-GATES}.md`

### Evidências (PODE escrever)
- `docs/evidence/foundation-c4/CERTIFICATION-REPORT.md` (último slice)
- `docs/evidence/foundation-c5/` (criar neste slice)

### Código-chave
- `src/runtime/index.js` — API pública
- `src/runtime/core/bootstrap/loadRuntimeBundle.js` — orquestrador do pipeline
- `src/runtime/core/{context,session,registry,loader,crb,dependency,router}/` — M02–M08
- `src/runtime/infra/service-locator/` — **M20 STUB (mexer no C.5)**
- `src/runtime/core/router/runtimeRouter.js` — `canActivate()` stub (ligar no C.5)
- `src/App.jsx` — rotas (BOS `/`, ERP `/CadastroEmpresas`, Studio `/studio*`)
- `package.json` — scripts `test:runtime`, `gate:g423-*`

---

## 9. GLOSSÁRIO CURTO

| Termo | Significado |
|-------|-------------|
| EOS | Enterprise Operating System (visão 2035) |
| BOS | Business Operating Shell — home `/` |
| CRB | Canonical Runtime Bundle (`mmm-crb-v1`) |
| UEP | Universal Execution Protocol (pipeline 5 estágios) |
| MDP | MAK Data Platform (metadata) |
| MMM | Universal Meta Model |
| RT-N | Estágio N do runtime lifecycle (0–8) |
| G423-NN | Sub-gate do módulo NN; G423 = gate master de Foundation C |
| AccessScope | Payload de auth L1 (tenant, permissions, companies) |
| Fail-closed | Default deny sem permissão explícita |
| SSOT | Single Source of Truth |
| Slice | Unidade de entrega C.N (1 PR) |

---

## 10. BACKLOG M01–M24 (referência)

| ID | Módulo | Status | Slice |
|----|--------|--------|-------|
| M01 | Bootstrap | ⏳ parcial | C.1/C.17 |
| M02 | Context | ✅ | C.1 |
| M03 | Session | ✅ | C.2 |
| M04 | Registry | ✅ | C.2 |
| M05 | Loader | ✅ | C.3 |
| M06 | CRB Loader | ✅ | C.3 |
| M07 | Dependency | ✅ | C.4 |
| M08 | Router | ✅ | C.4 |
| **M09** | **Permission** | ❌ | **C.5** |
| **M20** | **Service Locator** | ⏳ stub | **C.5** |
| M10 | Action | ❌ | C.6 |
| M11 | Workflow | ❌ | C.7 |
| M12 | Render | ❌ | C.8/C.17 |
| M13/M14 | Expression/Formula | ❌ | C.9 |
| M15 | Validation | ❌ | C.10 |
| M16 | Execution | ❌ | C.11 |
| M17 | State | ❌ | C.12 |
| M18 | Plugin | ❌ | C.13 |
| M19 | Connector | ❌ | C.14 |
| M21/M22 | Cache/Event Bus | ❌ | C.15 |
| M23 | Transaction | ❌ | C.16 |
| M24 | Observability | ⏳ stub | C.17 |

---

*Fim do handoff de continuidade. Após qualquer slice mergeado, atualize este arquivo
(ou gere um novo) para refletir o novo ponto de partida.*
