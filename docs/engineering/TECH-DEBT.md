# TECH-DEBT — Register

**Status:** Living document  
**Last verified:** 2026-09-08 (P1-02A Typecheck Environment Hygiene)  
**Priority:** P0 (blocker) → P3 (cosmetic)

---

## Active Debt

### TD-001 — Produto table missing migration

| Field | Value |
|-------|-------|
| **Priority** | ~~P0~~ |
| **Area** | Database |
| **Status** | **Resolved / Obsolete** 2026-06-28 — `Produto` and `Marca` models removed (PR #285); module `produtos`/`marcas` deleted |
| **Evidence** | No `model Produto` in `schema.prisma`; migration `20260628120000_remove_marcas_produtos` |

---

### TD-002 — Backend registry out of sync

| Field | Value |
|-------|-------|
| **Priority** | ~~P1~~ |
| **Area** | Governance / registry |
| **Status** | **Resolved** 2026-06-28 — IFM 1A baseline recovery; FE/BE both list empresas + cadcps; G118 validates sync |
| **Evidence** | `config/cadastro-modules.registry.json` and `backend/config/cadastro-modules.registry.json` — 2 modules each |

---

### TD-003 — framework/cadastro legacy layer

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | Architecture |
| **Evidence** | ~61 files, ~11,127 LOC in `src/framework/cadastro/`; **82** imports from codebase |
| **Impact** | Blocks Low-Code abstraction; dual maintenance with cadastro-engine |
| **Roadmap** | A1 |
| **Status** | Open — promotion in progress |

---

### TD-004 — Empresas nomenclature in generic layer

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | ModeloBase1 / SSOT |
| **Evidence** | Props `empresas`, `isLoadingEmpresas` in `ModeloBase1CadastroPage.jsx`; CSS `mg-empresas-scope`; 44 files in framework/mak reference emp/Empresas |
| **Impact** | Cosmetic + cognitive coupling; confuses new module authors |
| **Roadmap** | A2 |
| **Status** | Open — documented exception in Constitution |

---

### TD-005 — Dual-path DDL deployment

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Database / DevOps |
| **Evidence** | `backend/scripts/ensureSchema.js` + `runBlockingDatabaseBoot.js` alongside Prisma migrate |
| **Impact** | Schema drift risk between environments |
| **Roadmap** | S4 |
| **Status** | Open |

---

### TD-006 — UI monoliths

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Frontend maintainability |
| **Evidence** | `MakCadastroTable.jsx` ~2,407 LOC; `ModeloBase1CadastroPage.jsx` ~1,518 LOC |
| **Impact** | Hard to test/decompose; performance risk on change |
| **Roadmap** | A3 |
| **Status** | Open |

---

### TD-007 — Dual design system CSS

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Frontend / UX |
| **Evidence** | shadcn (`shared/ui`) + MG prototype CSS ~281KB + ERP theme ~368KB |
| **Impact** | Bundle size; visual inconsistency risk |
| **Roadmap** | A4 (partial) |
| **Status** | Open |

---

### TD-008 — Frontend npm vulnerabilities

| Field | Value |
|-------|-------|
| **Priority** | ~~P1~~ |
| **Area** | Security / supply chain |
| **Status** | **Resolved** 2026-06-28 — IFM 1A-S3 |
| **Evidence** | `npm audit` — 0 vulnerabilities (was 15: 9 high); `package-lock.json` only |
| **Report** | [IFM-1A-S3-CERTIFICATION-REPORT.md](./IFM-1A-S3-CERTIFICATION-REPORT.md) |

---

### TD-009 — Typecheck noise (shadcn) — SUBSET de `src/shared/ui/**`

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Developer experience |
| **Evidence (original, 2026-06)** | `npm run typecheck` errors only in `src/shared/ui/*` |
| **Evidence (medida 2026-09-08, P1-02)** | **REFUTADA como descrição do todo.** Em `14de1110` o typecheck legado emitiu 3745 diagnósticos em 594 arquivos; apenas **316 em 44 arquivos** estavam em `src/shared/ui/**` — 8,4%. Os outros 3429 não pertencem a esta dívida |
| **Escopo corrigido** | TD-009 passa a designar **somente** o subconjunto `src/shared/ui/**`: 316 diagnósticos |
| **Impact** | O ruído em si é cosmético; o dano real foi o wrapper de governança atribuir **qualquer** falha a esta dívida e devolver 0 |
| **Roadmap** | Baseline exata em P1-02B |
| **Status** | Open — escopo corrigido em 2026-09-08 (P1-02A). O restante da dívida é TD-016 |

---

### TD-016 — Global legacy typecheck debt / permissive governance bridge

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Area** | CI / type safety |
| **Discovered** | 2026-09-08 — P1-02 parou com `P1_02_BASELINE_SCOPE_DRIFT` ao medir a premissa de TD-009 |
| **Evidence (pós-higiene, P1-02A)** | `npm run typecheck` (escopo de produção, `jsconfig.typecheck.json`): **2365 diagnósticos em 477 arquivos**. Inventário completo `npm run typecheck:legacy-all`: 3745 em 594 |
| **Áreas** | framework 488 · shared 402 (dos quais 316 são TD-009) · studio 393 · runtime 345 · bos 270 · intelligence 163 · modules 110 · ModeloBase1 82 · ModeloBase2 74 · apis 28 · App.jsx 4 · main.jsx 4 · integrations 2 |
| **Códigos dominantes** | TS2339 1308 · TS2322 499 · TS2741 110 · TS2345 98 · TS2353 66 |
| **Finding específico** | 8 diagnósticos de builtins Node permanecem em **7 arquivos de produção** (`src/runtime/core/{completion,context,crb,session,workflow}`, `src/studio/governance/{architectureRules,dependencyGraph}`). Deliberadamente NÃO ocultados |
| **Impact (até P1-02A)** | `typecheck:governance` era uma ponte permissiva: rodava o escopo de produção e devolvia 0. Um diagnóstico **novo** não reprovava o CI |
| **Contenção (P1-02B, 2026-09-09)** | ✅ A ponte foi removida. `typecheck:governance` compara contra `config/typecheck-production-baseline.json` — 1528 fingerprints, 2365 diagnósticos, 477 arquivos — e **reprova nos dois sentidos**: diagnóstico novo ou contagem maior (regressão), diagnóstico que sumiu ou contagem menor (baseline stale). O CI executa 3 steps após o Lint: escopo, contrato do enforcement, enforcement |
| **Fingerprint** | `caminho + código TS + mensagem normalizada` → contagem de ocorrências. Linha e coluna são evidência, não autorização: com 2365 diagnósticos vivos, uma reformatação inocente invalidaria a baseline inteira sem que nenhum erro novo existisse |
| **O que NÃO foi feito** | Nenhum dos 2365 diagnósticos foi corrigido. A dívida foi **congelada**, não paga. Congelar não é esconder: a baseline é legível, versionada, e só encolhe por decisão consciente (`npm run typecheck:baseline:capture -- --write`), nunca automaticamente |
| **Owner / remediation** | Aberto — reduzir os 2365 diagnósticos exige fatias de produto, uma raiz por vez, cada uma regravando a baseline no próprio commit. A contenção impede que a dívida CRESÇA; ela não a paga |
| **Status** | Open — **contida** desde 2026-09-09 (P1-02B). A regressão está bloqueada; o saldo permanece |

---

### TD-010 — No backend domain event bus

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Area** | Architecture / future Automation |
| **Evidence** | Events/Workflow engines client-side only |
| **Impact** | Blocks server-side automation, Audit hooks, IA actions |
| **Roadmap** | A5 |
| **Status** | Open — by design until Automation mission |

---

### TD-011 — Deprecated aliases and shims

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Code clarity |
| **Evidence** | 25+ `@deprecated` exports; Empresas* panel aliases; allowlisted legacy hooks |
| **Impact** | Confusion for new contributors |
| **Roadmap** | A4 |
| **Status** | Open |

---

### TD-012 — CADCPS flat backend file structure

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Backend consistency |
| **Evidence** | `repCps.js` / `svcCps.js` vs standard `repositories/` subfolder |
| **Impact** | Naming inconsistency only |
| **Roadmap** | — |
| **Status** | Open |

---

### TD-013 — V13–V20 capability gates not in CI

| Field | Value |
|-------|-------|
| **Priority** | ~~P1~~ |
| **Area** | Governance / CI |
| **Status** | **Resolved** 2026-06-28 — IFM 1D-1 |
| **Evidence** | `.github/workflows/foundation-governance.yml` — parallel matrix for G156–G261; `gate:capabilities` + extended `verify:governance` |
| **Report** | [IFM-1D-1-CERTIFICATION-REPORT.md](./IFM-1D-1-CERTIFICATION-REPORT.md) |

---

### TD-014 — Constitution doc headers inconsistent

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Documentation |
| **Evidence** | Docs 01–10 said "of 10" after doc 11 added — corrected in Mission 0.2 |
| **Impact** | Navigation confusion |
| **Roadmap** | — |
| **Status** | **Resolved** 2026-06-28 (Mission 0.2) |

---

### TD-015 — Subordinate docs may drift from code

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Area** | Documentation |
| **Evidence** | `docs/FOUNDATION_GOVERNANCE.md` and `/docs/ENTERPRISE_*` reports are subordinate to Constitution but not auto-synced |
| **Impact** | Risk of stale guidance if read without Constitution |
| **Roadmap** | — |
| **Status** | Open — Constitution §7 declares them historical/subordinate |

### TD-017 — Autorização forbidden de backend depende do marcador de branch

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-09 — P1-03, ao tornar verde a primeira correção de backend sob o catálogo de fatias |
| **O que é** | `FORBIDDEN_SCOPE_PATTERNS` inclui `/^backend\//`, então nenhuma fatia pode tocar backend sem declarar cada arquivo em `explicitlyAuthorizedForbiddenPatterns`. A Slice 50 é a segunda e última autorizadora do catálogo |
| **Por que é dívida** | A autorização vive na fatia, não no arquivo: depois do merge, o marcador da Slice 50 continua no catálogo e a autorização dos sete arquivos continua declarada. Uma fatia FUTURA que precise mexer nos mesmos arquivos terá de declará-los de novo, e o catálogo acumulará entradas de backend fatia a fatia |
| **Contenção atual** | A autorização é da FATIA ATIVA: sem o marcador de branch que elege a Slice 50, os mesmos caminhos voltam a ser recusados (provado por `G423-50-B07` e pelo teste `E004`). O LEDGER em `studio-scope-governance-chronological-migration.test.js` (S004/F002/F010) prende a lista de autorizadoras por identidade e cardinalidade — uma terceira não aparece em silêncio |
| **Correção estrutural pendente** | `isPathAuthorizedForStudioSlice` hoje considera primary + cross + shared, mas **não** `explicitlyAuthorizedForbiddenPatterns`, o que obriga a fatia a declarar os sete arquivos em DUAS listas. Unificar isso exigiria alterar `studioScopeGovernanceGuard.mjs` — o guard central, que P1-03 deliberadamente não toca |
| **Roadmap** | Reavaliar quando uma terceira fatia precisar autorizar caminho proibido, ou quando o guard central abrir para alteração |
| **Status** | Open — contida desde 2026-09-09 (P1-03) |

---

### TD-018 — `prisma:validate` falha por variável de ambiente ausente

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-09 — P1-03, na bateria de verificação |
| **O que é** | `npm run prisma:validate` sai **1** com `P1012`: `DIRECT_URL` não está definida |
| **Escopo** | Ambiental, não de schema. Reproduzido na base intocada via `git stash` — **pré-existente**, não regressão de P1-03. O schema foi validado com variáveis efêmeras, apenas em memória; `.env` não foi tocado e nenhuma credencial foi persistida |
| **Impacto** | O comando não pode ser usado como gate enquanto depender de uma variável que o ambiente de desenvolvimento não fornece |
| **Roadmap** | Ou o schema deixa de exigir `DIRECT_URL`, ou o comando passa a receber um valor sintético explícito. Nenhuma das duas cabe numa fatia de segurança de backend |
| **Status** | Open — pré-existente |

### TD-019 — Sync push não é transacional (batch não all-or-nothing)

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-10 — auditoria do arquiteto-chefe sobre a PR #506 (P1-03) |
| **O que é** | `pushSyncBatchBackend` executa três laços independentes com `await` — `upsertSyncState`, `createStorageAction`, `createBackupAction` — sem `$transaction`. Falha num item posterior deixa os anteriores persistidos |
| **Por que não foi corrigido aqui** | D-093 aceita o motor de sync mas **não exige** batch all-or-nothing. Transformar o sync inteiro em transação apenas para deixar uma tabela de certificação verde seria mudar produção para servir a um relatório |
| **Contenção** | A certificação foi corrigida para dizer a verdade: `Atômico: NÃO — batch não transacional`, `Race-safe: PARCIAL — depende das constraints por entidade`. O que P1-03 certifica como atômico é a decisão approve/reject, e apenas ela |
| **Roadmap** | Reavaliar se e quando um contrato exigir batch atômico; aí a correção é `$transaction` + testes de rollback por item |
| **Status** | Open — declarada, não mascarada |

---

### TD-020 — Papel aprovador do lifecycle é least-privilege, não contrato canônico

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-10 — auditoria do arquiteto-chefe sobre a PR #506 (P1-03) |
| **O que é** | D-092 e D-093 não nomeiam perfil aprovador; `lifecyclePersistenceContracts.js` e `approvalWorkflowEngine.js` não carregam papel. P1-03 fixou approve/reject em `["ADMIN"]` por least privilege, não por contrato |
| **Risco** | Se a operação real exigir que OPERADOR aprove, a regra atual bloqueia trabalho legítimo — de forma visível (403), nunca silenciosa |
| **Contenção** | A tabela vive em código (`LIFECYCLE_DECISION_ROLES`), o caso `RBAC-05` fixa a decisão, e ele falha no dia em que OPERADOR for admitido — forçando a revisão em vez de deixar a mudança passar despercebida |
| **Roadmap** | Promover a decisão a D-numbered quando houver definição de produto sobre quem aprova archive/expunge |
| **Status** | Open — decisão registrada, aguardando contrato |

### TD-021 — Não existe autoridade server-side de (owner, group, tenant) para o Lifecycle

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-10 — terceira auditoria do arquiteto-chefe sobre a PR #506 (P1-03) |
| **O que é** | O contrato do Lifecycle autoriza, por group, tenants diferentes do owner (`authorizedTenantIds`). O único lugar onde essa lista existe é o `localStorage` do navegador, escrito apenas pelos gates. O backend não tem tabela, repository nem relação (`Cliente` não tem grupo/holding) que prove "tenant T é autorizado no group G do owner O" |
| **Contenção (P1-03, OPÇÃO C)** | `authorizeLifecycleTenant` define a INTERFACE de autoridade; a de produção (`NO_LIFECYCLE_TENANT_AUTHORITY`) responde "não sei" e isso é recusa: push com `tenantId ≠ cliente_id` → `403 LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE`, nada gravado. `tenantId == cliente_id` (o caminho de produção atual) segue funcionando pela identidade autenticada. O caso multi-tenant está modelado e provado com autoridade injetada (TEN-01..04) |
| **Por que não foi criada uma tabela** | Não há fonte confiável para populá-la sem inventar fluxo de registro (quem registra um group scope? com que política?). Transformar ausência de autoridade em suposição seria pior que recusar |
| **Roadmap** | Quando o produto definir a origem do group scope (decisão de produto, D-numbered), implementar a autoridade persistida por trás da interface existente — sem tocar nas regras de `lifecycleTenant.js` |
| **Status** | **Open — BLOQUEADOR DE MERGE da PR #506** enquanto o arquiteto-chefe não decidir o destino |

---

### TD-022 — Migration do unique de LifecycleSyncState não aplicada em banco real nesta sessão

| Campo | Valor |
|---|---|
| **Discovered** | 2026-09-10 — P1-03 |
| **O que é** | `20260910130000_lifecycle_sync_state_tenant_scoped_unique` (DROP INDEX + CREATE UNIQUE INDEX) foi gerada por `prisma migrate diff` sem banco e validada por `prisma generate`/`validate`, mas não executada contra Postgres — não há `DATABASE_URL` de teste |
| **Risco** | Baixo: index swap sobre coluna `NOT NULL`, unique mais largo que o anterior (nenhuma linha existente pode violá-lo). Ainda assim, não medido |
| **Roadmap** | Aplicar em staging antes de produção; confirmar `prisma migrate status` |
| **Status** | Open |

---

## Resolved Debt

### TD-014 — Constitution doc headers inconsistent

Resolved 2026-06-28 — Mission 0.2 updated headers to "of 11".

---

## Register Protocol

1. New debt: add TD-0XX with evidence from code (not chat).
2. Resolved: move to Resolved section with date + PR reference.
3. Update CURRENT-STATE known inconsistencies when P0/P1 changes.

---

*Review at sprint start. Do not fix silently — track here first.*
