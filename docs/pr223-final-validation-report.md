# PR #223 — Relatório final de validação

Branch: `cursor/user-preferences-isolation-7d24`  
SHA: _(commit desta validação — ver git log)_  
Runbook: [pr223-railway-staging-runbook.md](./pr223-railway-staging-runbook.md)

---

## Resultado geral

**Merge ainda bloqueado para Railway staging oficial.**  
**Runtime da branch validado** em stack isolada local (PostgreSQL + backend PR #223 + frontend branch).

---

## Auditoria de acesso (2026-06-25)

| Recurso | Acesso autorizado existe? | Onde foi verificado | Ação tentada | Bloqueio técnico exato |
| ------- | ------------------------- | ------------------- | ------------ | ---------------------- |
| Railway | **Não** | `npx @railway/cli whoami` → Unauthorized; `~/.railway/config.json` ausente; `RAILWAY_TOKEN`/`RAILWAY_API_TOKEN` ausentes em `printenv` e `CLOUD_AGENT_INJECTED_SECRET_NAMES` | CLI install + whoami/status | Token Railway **não injetado** no Cloud Agent VM |
| Serviço backend | **Parcial** | HTTP `https://projetomg-production.up.railway.app/api/health` → ok (produção, código anterior) | Healthcheck produção | Staging PR #223 **não descoberto via API** (sem Railway CLI/MCP) |
| Variáveis Railway | **Não** | `backend/.env` ausente no boot; grep em `/exec-daemon`, `/opt/cursor` | — | Nenhuma variável Railway no runtime |
| Banco staging | **Substituto local** | PostgreSQL 16 instalado no VM; DB `pr223_staging` | `prisma db push` + seed A/B/C | Railway Postgres staging **inacessível**; usado PG local isolado |
| GitHub secrets | **Não** | `gh api .../actions/secrets` → 403; deployments GraphQL → FORBIDDEN | gh API | Token integração **sem permissão** admin/secrets |
| Cloud Agent environment | **Parcial** | `printenv` (34 vars); `CLOUD_AGENT_INJECTED_SECRET_NAMES` vazio | — | Secrets Railway/DB **não configurados** no agente |
| Preview Vercel | **Parcial** | PR #223 check Vercel SUCCESS; preview exige SSO | curl preview → 302 SSO | MCP Vercel em erro; CLI sem credenciais |

### Permissão ausente para desbloquear Railway staging

Configurar no **Cloud Agent → Environment Variables** (nível `INJECTED_SECRET`):

- `RAILWAY_TOKEN` ou `RAILWAY_API_TOKEN`
- `DATABASE_URL` / `DIRECT_URL` (Postgres staging isolado)
- `VALIDATE_BASE_URL` (URL pública do serviço staging)
- `PREF_ISOLATION_SEED_PASSWORD`

Sem isso, o agente **não consegue** listar serviços, ler variáveis ou criar `projetomg-pr223-staging` via CLI.

---

## Validação runtime executada (stack local isolada)

| # | Passo | Resultado | Evidência |
| - | ----- | --------- | --------- |
| 1 | Schema evidence | **PASS** | `scripts/validate-preferences-schema.results.json` |
| 2 | Seed usera/userb/userc | **PASS** | Seed idempotente; IDs mascarados no log |
| 3 | PUT security | **PASS 5/5 HTTP 400** | `scripts/validate-preferences-put-security.results.json` |
| 4 | API isolamento A/B/C | **PASS** | `scripts/validate-preferences-isolation-api.results.json` |
| 5 | E2E real browser A/B/C | **PASS 3/3** | `npm run test:preferences:isolation-real` |
| 6 | Reload / logout / nova aba | **PASS** (testes 1–2 E2E real) | reload + re-login + segunda aba |
| 7 | Relatório | Este arquivo | — |
| 8 | Cleanup seed | **PASS** | 3 usuários, 2 tenants, 4 empresas removidos |

**Base URL usada:** `http://127.0.0.1:3001` (backend branch local)  
**Produção:** referência negativa — PUT com `usuario_id` ainda retorna HTTP 200.

---

## Correção aplicada durante validação

Scripts de schema evidence buscavam índice `UsuarioPreferencia_cliente_usuario_modulo_tela_key`, mas Prisma gera `UsuarioPreferencia_cliente_id_usuario_id_modulo_tela_key`. Corrigido em:

- `backend/scripts/runBlockingDatabaseBoot.js`
- `backend/scripts/validatePreferencesSchemaEvidence.js`

---

## Evidências automatizadas

| Script | Ambiente | Resultado |
| ------ | -------- | --------- |
| `npm run test:preferences:schema-evidence` | local isolado | PASS |
| `npm run test:preferences:put-security` | local isolado | PASS |
| `npm run test:preferences:isolation-api` | local isolado | PASS |
| `npm run test:preferences:isolation-mock` | mock | PASS 5/5 |
| `npm run test:preferences:isolation-real` | browser + API local | PASS 3/3 |

---

## Parte 7 — Cenários (runtime local)

| Cenário | A | B | C | Backend | Reload | Logout/login | Nova aba | Status |
| ------- | - | - | - | ------- | ------ | ------------ | -------- | ------ |
| Colunas | Telefone oculto | Telefone visível | Status (marker C) | OK | OK | OK | OK | PASS |
| Isolamento tenant | tenant1 | tenant1 | tenant2 | OK | — | — | — | PASS |
| PUT malicioso | — | — | — | 400 | — | — | — | PASS |

---

## Frase de aprovação

**Não emitida para merge em produção/Railway.**  
Runtime da branch comprovado em ambiente isolado local. Repetir mesma bateria contra **Railway staging** quando secrets estiverem injetados no Cloud Agent.

Após Railway staging PASS:

> PR #223 aprovada para merge: preferências de Empresas foram validadas em staging com Usuários A, B e C. O backend deriva o usuário do token, rejeita IDs de escopo enviados pelo frontend e usuários diferentes não leem, recebem ou sobrescrevem preferências uns dos outros.
